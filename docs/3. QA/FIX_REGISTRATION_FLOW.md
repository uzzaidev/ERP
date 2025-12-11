# CORREÇÃO: Fluxo de Registro e Autenticação

**Data**: 2025-12-11
**Status**: ✅ CORREÇÕES IMPLEMENTADAS - AGUARDANDO APLICAÇÃO SQL

---

## 🔴 Problemas Identificados

### 1. Usuários no Auth mas não em `public.users`

**Sintoma**: Usuários conseguem criar conta (existem no Supabase Auth) mas não conseguem fazer login.

**Erro**: `"Erro ao buscar dados: cannot coerce the result to a single JSON object"`

**Causa**:
- RLS policies bloqueavam INSERT na tabela `users` durante o registro
- Policy antiga exigia `tenant_id != null` E `is_admin = true`
- Novos usuários não têm tenant ainda, então o INSERT falhava
- Usuário ficava "preso" no Auth sem registro em `public.users`

### 2. Loop Infinito no Setup

**Sintoma**: Usuários sem tenant não conseguem completar o setup.

**Causa**:
- Middleware redirecionava para `/setup-tenant`
- Setup tentava criar registro em `users`
- RLS bloqueava novamente
- Usuário ficava preso no loop

### 3. Erros em Múltiplos Pontos

Código usava `.single()` que falha quando não há resultado:
- `middleware.ts` - verificação de tenant
- `auth.ts` - getCurrentUser()
- `tenant.ts` - getTenantContext()

---

## ✅ Correções Implementadas

### 1. **Correções de Código** (✅ JÁ APLICADAS)

#### `src/middleware.ts`
- Alterado `.single()` → `.maybeSingle()`
- Adicionada verificação de `userError`
- Redirecionamento melhorado para `/setup-tenant`

#### `src/lib/supabase/auth.ts`
- `getCurrentUser()` usa `.maybeSingle()`
- Tratamento de erro melhorado

#### `src/lib/supabase/tenant.ts`
- `getTenantContext()` usa `.maybeSingle()`
- `checkTenantLimits()` usa `.maybeSingle()`
- Mensagens de erro mais descritivas

#### `src/app/(public)/login/page.tsx`
- Detecção de email não confirmado
- Botão de reenvio de email de confirmação
- Feedback visual melhorado

### 2. **Correções de Database** (⚠️ PENDENTE - EXECUTAR SQL)

**Arquivo**: `db/11_fix_rls_for_setup.sql`

Este script:
- ✅ Cria funções helper `SECURITY DEFINER` no schema `public`
- ✅ Remove policies antigas que bloqueavam
- ✅ Cria policies corretas para permitir self-registration
- ✅ Permite usuários lerem próprios dados (mesmo sem tenant)
- ✅ Permite criação de tenants e solicitações de acesso

---

## 🚀 PRÓXIMOS PASSOS

### Passo 1: Aplicar Correções SQL ⚠️ OBRIGATÓRIO

1. Acesse o **Supabase Dashboard**:
   - https://app.supabase.com
   - Selecione seu projeto

2. Vá em **SQL Editor**

3. Copie o conteúdo de `db/11_fix_rls_for_setup.sql`

4. Cole no editor e clique em **RUN**

5. Aguarde a mensagem de sucesso:
   ```
   ✅ RLS Policies atualizadas com sucesso!
   ```

6. Verifique as policies criadas no final do script

### Passo 2: Corrigir Usuários Existentes

Para usuários que já estão "presos" (existem no Auth mas não em `public.users`):

#### Opção A: Recriar Registros Manualmente (Recomendado)

Execute este SQL no Supabase SQL Editor:

```sql
-- Buscar usuários no Auth que não existem em public.users
SELECT
  au.id,
  au.email,
  au.raw_user_meta_data->>'name' as name,
  au.email_confirmed_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Para cada usuário encontrado, criar registro em public.users:
INSERT INTO public.users (id, email, full_name, tenant_id, is_active, email_verified)
VALUES (
  'USER_ID_AQUI',
  'user@email.com',
  'Nome do Usuario',
  NULL,  -- tenant será configurado no /setup-tenant
  false,
  true   -- ou false se email_confirmed_at for NULL
);
```

#### Opção B: Pedir para Usuários Fazerem Logout/Login

Após aplicar o SQL fix:
1. Usuários fazem logout
2. Fazem login novamente
3. Serão redirecionados para `/setup-tenant`
4. Completam o setup (criar empresa ou solicitar acesso)

### Passo 3: Testar Fluxo Completo

#### Teste 1: Novo Registro
1. Criar conta em `/registro`
2. Confirmar email
3. Fazer login
4. Deve redirecionar para `/setup-tenant`
5. Criar empresa ou solicitar acesso
6. Deve acessar dashboard

#### Teste 2: Usuário Sem Tenant
1. Fazer login com usuário que tem Auth mas não tem tenant
2. Deve redirecionar para `/setup-tenant`
3. Completar setup
4. Deve acessar dashboard

#### Teste 3: Email Não Confirmado
1. Tentar login sem confirmar email
2. Deve mostrar mensagem de erro
3. Deve aparecer botão "Reenviar email"
4. Clicar no botão
5. Deve mostrar mensagem de sucesso

---

## 📋 Checklist de Validação

- [ ] Script SQL `11_fix_rls_for_setup.sql` executado no Supabase
- [ ] Policies verificadas (query de verificação no final do script)
- [ ] Usuários "presos" corrigidos (Opção A ou B)
- [ ] Teste 1: Novo registro ✅
- [ ] Teste 2: Usuário sem tenant ✅
- [ ] Teste 3: Email não confirmado ✅
- [ ] Deploy do código para produção

---

## 🔒 Segurança Mantida

Mesmo com as correções, a segurança multi-tenant está preservada:

✅ **Isolamento por tenant continua funcionando**
- Usuários só veem dados do próprio tenant
- RLS policies verificam `tenant_id` em todas as queries
- Cross-tenant queries são bloqueadas

✅ **Controle de acesso mantido**
- Apenas admins podem criar usuários no tenant
- Usuários só podem ler/editar próprios dados
- Solicitações de acesso precisam aprovação de admin

✅ **Self-registration segura**
- Usuários só podem criar registro com `id = auth.uid()`
- Não podem criar registros de outros usuários
- Tenant é atribuído apenas no setup controlado

---

## 📊 Fluxo Correto Após Correções

```
1. REGISTRO (/registro)
   └─> Cria no Auth ✅
   └─> Cria em public.users (tenant_id = null) ✅
   └─> Envia email de confirmação ✅

2. CONFIRMAÇÃO DE EMAIL
   └─> Usuário clica no link do email ✅
   └─> Email é verificado ✅

3. LOGIN (/login)
   └─> Verifica credenciais ✅
   └─> Middleware verifica tenant ❌
   └─> Redireciona para /setup-tenant ✅

4. SETUP TENANT (/setup-tenant)
   ├─> OPÇÃO A: Criar Empresa
   │   └─> Cria tenant ✅
   │   └─> Vincula usuário (tenant_id) ✅
   │   └─> Atribui role admin ✅
   │   └─> Redireciona para /dashboard ✅
   │
   └─> OPÇÃO B: Solicitar Acesso
       └─> Cria solicitação ✅
       └─> Aguarda aprovação de admin ⏳
       └─> Admin aprova ✅
       └─> Usuário vinculado ao tenant ✅
       └─> Próximo login → /dashboard ✅
```

---

## ⚠️ IMPORTANTE

**ANTES DE FAZER DEPLOY:**

1. ✅ Execute o script SQL no Supabase
2. ✅ Verifique que as policies foram criadas
3. ✅ Teste localmente com novo registro
4. ✅ Corrija usuários existentes
5. ✅ Faça backup do banco (Supabase tem backups automáticos)
6. ✅ Deploy do código

**APÓS O DEPLOY:**

1. Monitore logs de erro
2. Verifique se novos registros funcionam
3. Confirme que usuários existentes conseguem logar
4. Teste fluxo completo end-to-end

---

## 🆘 Troubleshooting

### "Email not confirmed" mesmo após confirmar

**Solução**: Verificar `email_confirmed_at` no Supabase Auth:
```sql
SELECT id, email, email_confirmed_at
FROM auth.users
WHERE email = 'user@email.com';
```

### "Tenant not configured" em loop

**Solução**: Verificar registro em `public.users`:
```sql
SELECT id, email, tenant_id, is_active
FROM public.users
WHERE id = 'USER_ID';
```

Se não existir, criar conforme Passo 2 Opção A.

### RLS bloqueia mesmo após aplicar SQL

**Solução**:
1. Fazer logout completo
2. Limpar cookies/local storage
3. Fazer login novamente
4. Verificar funções helper:
   ```sql
   SELECT * FROM information_schema.routines
   WHERE routine_schema = 'public'
   AND routine_name IN ('get_user_tenant_id', 'is_user_admin');
   ```

---

## 📚 Arquivos Modificados

### Código (já aplicado)
- `src/middleware.ts`
- `src/lib/supabase/auth.ts`
- `src/lib/supabase/tenant.ts`
- `src/app/(public)/login/page.tsx`

### Database (pendente)
- `db/11_fix_rls_for_setup.sql` ⚠️ **EXECUTAR NO SUPABASE**

---

## ✅ Status Final

- [x] Problemas identificados
- [x] Correções de código implementadas
- [ ] Script SQL executado no Supabase ⚠️
- [ ] Usuários existentes corrigidos ⚠️
- [ ] Testes validados ⚠️
- [ ] Deploy para produção ⚠️

**Próxima ação**: Executar `db/11_fix_rls_for_setup.sql` no Supabase SQL Editor
