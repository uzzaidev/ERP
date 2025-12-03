# Sincronização entre auth.users e public.users

## 🎯 Problema

No Supabase, temos **duas tabelas de usuários** em schemas diferentes:

### 1. `auth.users` (Schema Auth - Supabase)
```sql
auth.users {
  id: UUID
  email: VARCHAR
  encrypted_password: VARCHAR
  email_confirmed_at: TIMESTAMP
  raw_user_meta_data: JSONB
  -- Gerenciada pelo Supabase Auth
}
```

**Características:**
- Gerenciada automaticamente pelo Supabase
- Criada via `supabase.auth.signUp()`
- Contém credenciais de autenticação
- **Não pode ter campos customizados**

### 2. `public.users` (Schema Public - Nosso ERP)
```sql
public.users {
  id: UUID  -- MESMO ID do auth.users
  email: VARCHAR
  full_name: VARCHAR
  tenant_id: UUID  -- Vinculação multi-tenant
  role_name: VARCHAR
  is_active: BOOLEAN
  -- Customizada para nosso negócio
}
```

**Características:**
- Tabela customizada do ERP
- Criada manualmente via `supabase.from('users').insert()`
- Contém dados de negócio (tenant, role, etc.)
- **Permite qualquer campo customizado**

---

## 🔄 Como Funciona o Fluxo Atual

### Registro Normal (2 etapas)

```typescript
// src/lib/supabase/auth.ts - signUp()

// ETAPA 1: Criar no auth.users
const { data: authData } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { name } }
});
// ✅ Usuário criado em auth.users

// ETAPA 2: Criar no public.users
const { error } = await supabase.from('users').insert({
  id: authData.user.id,  // ← MESMO ID
  email,
  full_name: name,
  tenant_id: tenantId,
  role_name: 'admin',
  is_active: true
});
// ✅ Usuário criado em public.users
```

### ⚠️ Problema: Usuários Órfãos

Se a **ETAPA 2 falhar**, ficamos com:
- ✅ Usuário em `auth.users` (pode fazer login)
- ❌ Usuário **NÃO** em `public.users` (não tem tenant/role)
- 💥 Sistema quebra ao tentar buscar dados

**Causas comuns:**
- Erro de rede entre as duas operações
- Constraint violation em `public.users`
- Falta de permissão RLS
- Erro de código na aplicação

---

## 🛠️ Soluções

### Solução 1: Diagnóstico e Migração Manual

Use o script `db/09_sync_auth_users.sql`:

```sql
-- 1. Ver usuários órfãos
SELECT au.id, au.email, au.created_at
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
);

-- 2. Migrar órfãos SEM tenant (recomendado)
INSERT INTO public.users (id, email, full_name, tenant_id, is_active)
SELECT au.id, au.email, au.raw_user_meta_data->>'name', NULL, false
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
);
-- Usuários passarão por /setup-tenant no próximo login

-- 3. OU migrar órfãos COM tenant compartilhado
-- (Ver OPÇÃO 2.2 no script)
```

### Solução 2: Deletar Usuários Órfãos

```sql
-- Deletar um usuário específico
DELETE FROM auth.users WHERE id = 'uuid-aqui';

-- Deletar órfãos antigos (mais de 30 dias)
DELETE FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
AND au.created_at < NOW() - INTERVAL '30 days';
```

### Solução 3: Trigger Automático (Recomendado)

Instalar trigger que mantém sincronização:

```sql
-- Trigger que deleta do auth quando deleta do public
CREATE OR REPLACE FUNCTION public.delete_auth_user_on_public_user_delete()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM auth.users WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_delete_auth_user
    AFTER DELETE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.delete_auth_user_on_public_user_delete();
```

**Benefício:**
- Quando deletar de `public.users`, automaticamente deleta de `auth.users`
- Mantém consistência entre schemas

### Solução 4: Função de Limpeza Automática

```sql
-- Criar função RPC
CREATE OR REPLACE FUNCTION public.cleanup_orphan_auth_users(days_old INTEGER)
RETURNS TABLE (deleted_count INTEGER, user_ids UUID[])
-- Ver código completo em db/09_sync_auth_users.sql
```

**Uso:**
```typescript
// Chamar via API
const { data } = await supabase.rpc('cleanup_orphan_auth_users', {
  days_old: 30
});
console.log(`Deletados ${data.deleted_count} usuários órfãos`);
```

---

## 🔒 Melhorando o Fluxo de Registro

### Problema Atual: Sem Rollback

Se a ETAPA 2 falhar, o usuário fica órfão em `auth.users`.

### Solução: Rollback Manual

Modificar `signUp()` para fazer rollback se falhar:

```typescript
// src/lib/supabase/auth.ts

export async function signUp(data: SignUpData) {
  const supabase = createClient();

  // ETAPA 1: Criar no auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password
  });

  if (authError || !authData.user) {
    return { error: authError };
  }

  try {
    // ETAPA 2: Criar tenant (se necessário)
    const tenant = await createTenant(/*...*/);

    // ETAPA 3: Criar no public.users
    const { error: userError } = await supabase.from('users').insert({
      id: authData.user.id,
      tenant_id: tenant.id,
      // ...
    });

    if (userError) {
      // ❌ FALHOU - Fazer rollback
      console.error('Failed to create public.users, rolling back auth.user');

      // Deletar do auth.users
      await supabase.auth.admin.deleteUser(authData.user.id);

      return { error: userError };
    }

    // ✅ SUCESSO - Ambas as tabelas criadas
    return { data: authData };

  } catch (error) {
    // ❌ ERRO GERAL - Rollback
    console.error('Signup error, rolling back');
    await supabase.auth.admin.deleteUser(authData.user.id);
    return { error };
  }
}
```

### ⚠️ Limitação

`supabase.auth.admin.deleteUser()` requer **service_role key** (não disponível no client).

**Alternativas:**
1. Criar API route `/api/auth/rollback-user`
2. Usar Edge Function do Supabase
3. Aceitar usuários órfãos e migrar periodicamente

---

## 📊 Monitoramento

### Query de Status

```sql
SELECT
    (SELECT COUNT(*) FROM auth.users) as total_auth,
    (SELECT COUNT(*) FROM public.users) as total_public,
    (SELECT COUNT(*) FROM auth.users au
     WHERE NOT EXISTS (
         SELECT 1 FROM public.users pu WHERE pu.id = au.id
     )) as orphans;
```

**Resultado esperado:**
```
total_auth | total_public | orphans
-----------+--------------+---------
    150    |     150      |    0
```

### Script de Monitoramento Semanal

```bash
#!/bin/bash
# monitor-users.sh

psql $DATABASE_URL << EOF
SELECT
    'Usuários órfãos detectados: ' || COUNT(*) as status
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
);
EOF
```

---

## 🎯 Recomendações

### 1. Executar Diagnóstico
```bash
# No Supabase SQL Editor
\i db/09_sync_auth_users.sql
# Executar queries da PARTE 1 (Diagnóstico)
```

### 2. Migrar Usuários Órfãos Existentes
```sql
-- Opção A: Sem tenant (recomendado)
-- Executar OPÇÃO 2.1 do script

-- Opção B: Com tenant compartilhado
-- Executar OPÇÃO 2.2 do script
```

### 3. Instalar Trigger de Sincronização
```sql
-- Executar PARTE 4 do script
-- Garante que deletar de public.users também deleta de auth.users
```

### 4. Configurar Limpeza Automática
```sql
-- Instalar função RPC (PARTE 5)
-- Agendar cron job semanal:
SELECT * FROM cleanup_orphan_auth_users(30);
```

### 5. Monitorar Periodicamente
```bash
# Adicionar ao CI/CD ou cron
./scripts/monitor-users.sh
```

---

## 📁 Arquivos Relacionados

- `db/09_sync_auth_users.sql` - Script completo de sincronização
- `src/lib/supabase/auth.ts` - Lógica de registro atual
- `src/middleware.ts` - Detecta usuários sem tenant
- `db/01_users_and_auth.sql` - Schema inicial

---

## 🔗 Links Úteis

- [Supabase Auth Schema](https://supabase.com/docs/guides/auth/managing-user-data)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

---

## ✍️ Changelog

### 2025-12-02 - v1.0
- Criado script de sincronização completo
- Documentação de diagnóstico e migração
- Trigger automático de sincronização
- Função RPC de limpeza

---

**Autor:** Claude Code
**Data:** 2025-12-02
