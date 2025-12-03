# Schema Definitivo de Usuários - Arquitetura Enterprise

## 🎯 Decisão Arquitetural

Após análise profunda, a arquitetura escolhida é:

### ✅ **auth.users (Supabase) = Fonte da Verdade**

**Por quê?**
- ✅ Gerenciado pelo Supabase (testado, seguro, confiável)
- ✅ Reset de senha, 2FA, OAuth já funcionam
- ✅ Não duplicamos dados de autenticação
- ✅ **Padrão enterprise**: auth separado de dados de negócio

### 📊 Arquitetura Completa

```sql
┌─────────────────────────────────────────────────┐
│  auth.users (FONTE DA VERDADE - Supabase)      │
│  • id (PK)                                      │
│  • email                                        │
│  • encrypted_password                           │
│  • confirmed_at                                 │
│  • raw_user_meta_data (JSONB)                  │
└─────────────────────────────────────────────────┘
                    ↓ (id)
┌─────────────────────────────────────────────────┐
│  public.users (DADOS DE NEGÓCIO)                │
│  • id (PK, FK → auth.users.id)                  │
│  • tenant_id (FK → tenants.id)                  │
│  • email                                        │
│  • full_name                                    │
│  • avatar_url                                   │
│  • phone                                        │
│  • is_active                                    │
│  • email_verified                               │
│  • last_login                                   │
└─────────────────────────────────────────────────┘
                    ↓ (user_id)
┌─────────────────────────────────────────────────┐
│  public.user_roles (JUNCTION TABLE)             │
│  • id (PK)                                      │
│  • user_id (FK → users.id)                      │
│  • role_id (FK → roles.id)                      │
│  • tenant_id (FK → tenants.id)                  │
│  • assigned_at                                  │
│  • assigned_by (FK → users.id)                  │
│  UNIQUE(user_id, role_id, tenant_id)            │
└─────────────────────────────────────────────────┘
                    ↓ (role_id)
┌─────────────────────────────────────────────────┐
│  public.roles (DEFINIÇÃO DE ROLES)              │
│  • id (PK)                                      │
│  • name (admin, gestor, financeiro, ...)        │
│  • display_name                                 │
│  • description                                  │
│  • is_system_role                               │
└─────────────────────────────────────────────────┘
                    ↓ (role_id)
┌─────────────────────────────────────────────────┐
│  public.role_permissions (JUNCTION TABLE)       │
│  • id (PK)                                      │
│  • role_id (FK → roles.id)                      │
│  • permission_id (FK → permissions.id)          │
└─────────────────────────────────────────────────┘
                    ↓ (permission_id)
┌─────────────────────────────────────────────────┐
│  public.permissions (PERMISSÕES GRANULARES)     │
│  • id (PK)                                      │
│  • code (projects.view, finance.edit, ...)      │
│  • module (projects, finance, users, ...)       │
│  • action (view, create, edit, delete)          │
│  • display_name                                 │
└─────────────────────────────────────────────────┘
```

---

## 🏆 Vantagens Desta Arquitetura

### 1. Segurança Máxima
- ✅ Autenticação isolada em schema `auth` (Supabase)
- ✅ Dados de negócio isolados por tenant (RLS)
- ✅ Senhas nunca expostas (apenas em auth.users)

### 2. Flexibilidade Total
- ✅ Usuário pode ter **múltiplos roles** em um tenant
- ✅ Mesmo usuário pode ter **roles diferentes** em tenants diferentes
- ✅ Permissões granulares (projects.view, finance.edit, etc.)

### 3. Escalabilidade
- ✅ Adicionar novos roles: só INSERT em `roles`
- ✅ Adicionar novas permissões: só INSERT em `permissions`
- ✅ Customizar por cliente: diferentes role_permissions por tenant (futuro)

### 4. Profissional e Auditável
- ✅ Quem atribuiu role (assigned_by)
- ✅ Quando foi atribuído (assigned_at)
- ✅ Histórico completo de permissões

---

## 🛠️ O Que o Script Faz

### db/10_fix_users_schema.sql

**PARTE 1: Backup de Segurança**
```sql
CREATE TABLE users_backup AS SELECT * FROM public.users;
```

**PARTE 2: Corrige Schema de users**
- Remove `password_hash` (duplicado, senha está em auth.users)
- Remove `NOT NULL` de `tenant_id` (permite usuários pendentes)
- Adiciona campos: `avatar_url`, `phone`, `last_login`

**PARTE 3: Cria Tabelas de RBAC**
- `roles` - Definição de roles (admin, gestor, etc.)
- `permissions` - Permissões granulares
- `role_permissions` - Quais permissões cada role tem
- `user_roles` - Quais roles cada usuário tem por tenant

**PARTE 4: Popula Roles e Permissions Padrão**
```sql
Roles: admin, gestor, financeiro, vendas, member
Permissions: projects.*, tasks.*, finance.*, users.*, settings.*
```

**PARTE 5: Sincroniza Usuários de auth.users**
```sql
-- Migra usuários órfãos de auth.users → public.users
INSERT INTO public.users (id, email, full_name, ...)
SELECT au.id, au.email, ...
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE id = au.id);
```

**PARTE 6: Migra role_name Antigo**
```sql
-- Se existir coluna role_name, migra para user_roles
-- Depois REMOVE a coluna role_name
```

**PARTE 7: Triggers de Sincronização**
- Deletar de `public.users` → deleta de `auth.users`
- Auto-atualizar `updated_at`

**PARTE 8: Funções Helper**
```sql
-- get_user_roles(user_id, tenant_id)
-- user_has_permission(user_id, tenant_id, 'projects.view')
-- user_has_role(user_id, tenant_id, 'admin')
-- assign_role_to_user(user_id, tenant_id, 'gestor')
-- remove_role_from_user(user_id, tenant_id, 'member')
```

**PARTE 9: RLS Policies**
- Isolamento por tenant
- Roles e permissions visíveis globalmente

**PARTE 10: Verificação**
- Contagem de registros
- Verificação de órfãos

---

## 📝 Como Executar

### Passo 1: Backup Manual
```bash
# Faça backup do Supabase antes
pg_dump $DATABASE_URL > backup_before_fix.sql
```

### Passo 2: Executar Script
```bash
# No Supabase SQL Editor ou psql
\i db/10_fix_users_schema.sql
```

**O script é IDEMPOTENTE**: pode ser executado múltiplas vezes sem problemas.

### Passo 3: Verificar Resultado
```sql
-- Ver estatísticas
SELECT * FROM (
    SELECT 'auth.users' as tabela, COUNT(*) as total FROM auth.users
    UNION ALL
    SELECT 'public.users', COUNT(*) FROM public.users
    UNION ALL
    SELECT 'public.roles', COUNT(*) FROM public.roles
    UNION ALL
    SELECT 'public.user_roles', COUNT(*) FROM public.user_roles
) t;
```

---

## 🔧 Atualizações Necessárias no Código

### 1. Atualizar signUp() - src/lib/supabase/auth.ts

**ANTES:**
```typescript
await supabase.from('users').insert({
  id: authData.user.id,
  tenant_id: tenant.id,
  role_name: 'admin',  // ❌ REMOVER
  is_active: true
});
```

**DEPOIS:**
```typescript
// 1. Criar usuário
await supabase.from('users').insert({
  id: authData.user.id,
  tenant_id: tenant.id,
  is_active: true
});

// 2. Atribuir role via RPC
await supabase.rpc('assign_role_to_user', {
  user_id_param: authData.user.id,
  tenant_id_param: tenant.id,
  role_name_param: 'admin'
});
```

### 2. Verificar Permissões

**ANTES:**
```typescript
const { data: user } = await supabase
  .from('users')
  .select('role_name')
  .single();

if (user.role_name !== 'admin') {
  // ❌ REMOVER
}
```

**DEPOIS:**
```typescript
const { data: hasPermission } = await supabase.rpc('user_has_permission', {
  user_id_param: userId,
  tenant_id_param: tenantId,
  permission_code_param: 'users.edit'
});

if (!hasPermission) {
  throw new Error('Sem permissão');
}
```

### 3. Obter Roles do Usuário

```typescript
const { data: roles } = await supabase.rpc('get_user_roles', {
  user_id_param: userId,
  tenant_id_param: tenantId
});

// roles = [{ role_id: '...', role_name: 'admin', role_display_name: 'Administrador' }]
```

### 4. Verificar se É Admin

```typescript
const { data: isAdmin } = await supabase.rpc('user_has_role', {
  user_id_param: userId,
  tenant_id_param: tenantId,
  role_name_param: 'admin'
});

if (isAdmin) {
  // Usuário é admin
}
```

---

## 📊 Exemplo de Uso Completo

### Cenário: Usuário com múltiplos roles

```typescript
// João é admin no Tenant A e membro no Tenant B

// Tenant A (empresa-alpha)
await supabase.rpc('assign_role_to_user', {
  user_id_param: joaoId,
  tenant_id_param: tenantAlphaId,
  role_name_param: 'admin'
});

// Tenant B (empresa-beta)
await supabase.rpc('assign_role_to_user', {
  user_id_param: joaoId,
  tenant_id_param: tenantBetaId,
  role_name_param: 'member'
});

// Verificar permissões no Tenant A
const canEditUsersInAlpha = await supabase.rpc('user_has_permission', {
  user_id_param: joaoId,
  tenant_id_param: tenantAlphaId,
  permission_code_param: 'users.edit'
});
// → true (porque é admin)

// Verificar permissões no Tenant B
const canEditUsersInBeta = await supabase.rpc('user_has_permission', {
  user_id_param: joaoId,
  tenant_id_param: tenantBetaId,
  permission_code_param: 'users.edit'
});
// → false (porque é apenas member)
```

---

## 🔒 Segurança e RLS

### Isolamento por Tenant

```sql
-- Policy em public.users
CREATE POLICY users_tenant_isolation ON public.users
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

**Como funciona:**
1. Frontend seta `app.current_tenant_id` via `getTenantContext()`
2. RLS automaticamente filtra queries por tenant
3. Usuário **nunca** vê dados de outro tenant

### Roles e Permissions Globais

```sql
-- Roles são globais (não isolados por tenant)
CREATE POLICY roles_select_all ON public.roles
    FOR SELECT USING (true);
```

**Por quê?**
- Roles são os mesmos em todos os tenants (admin, gestor, etc.)
- Apenas a **atribuição** (user_roles) é isolada por tenant

---

## 🎯 Resumo das Mudanças

| Item | Antes | Depois |
|------|-------|--------|
| **Autenticação** | Duplicada (auth + public) | auth.users = verdade |
| **Senha** | password_hash em public.users | Apenas em auth.users |
| **Roles** | role_name (string) | user_roles (tabela) |
| **Permissões** | Não existiam | Granulares (RBAC) |
| **Múltiplos roles** | ❌ Impossível | ✅ Suportado |
| **Sincronização** | Manual | Automática (triggers) |
| **Funções helper** | ❌ Não existiam | ✅ RPC functions |

---

## ✅ Próximos Passos

1. **Executar Script**
   ```bash
   \i db/10_fix_users_schema.sql
   ```

2. **Atualizar Código TypeScript**
   - Remover `role_name` de todos os inserts
   - Usar `assign_role_to_user()` RPC
   - Usar `user_has_permission()` para checks

3. **Testar Fluxos**
   - Registro de novo usuário
   - Aprovação de solicitações
   - Verificação de permissões
   - Admin dashboard

4. **Migrar Usuários Existentes**
   - Script já migra automaticamente
   - Verificar se todos têm roles atribuídos

5. **Documentar para Time**
   - Como atribuir roles
   - Como verificar permissões
   - Tabela de roles e permissions

---

## 📚 Referências

- **Script:** `db/10_fix_users_schema.sql`
- **Arquitetura:** Este documento
- **Sincronização:** `docs/5. Supabase/AUTH_USERS_SYNC.md`
- **Multi-tenant:** `docs/1. Arquitetura/MULTI_TENANT_ARCHITECTURE.md`

---

**Autor:** Claude Code
**Data:** 2025-12-02
**Versão:** 1.0 - Arquitetura Enterprise Definitiva
