# Fix: Migração de `role_name` para `user_roles`

## 📋 Problema Identificado

O sistema estava tentando inserir e atualizar a coluna `role_name` na tabela `users`, mas essa coluna **não existe** no schema atual. O schema correto utiliza um sistema RBAC (Role-Based Access Control) com tabela de junção `user_roles`.

### Sintomas do Problema

1. **Erro ao criar usuário**: Sistema tentava inserir `role_name` na tabela `users`
2. **Erro ao configurar tenant**: Update falhava ao tentar definir `role_name`
3. **Usuário não conseguia acessar**: Mesmo após configurar `tenant_id` manualmente, sistema não detectava corretamente
4. **Mensagem de erro**: `"ainda diz que preciso estar vinculado, não puxou certo meu tenant_id"`

### Causa Raiz

O código estava usando um schema antigo/simplificado onde `role_name` era uma coluna string na tabela `users`. O schema atual usa um sistema de roles mais robusto com tabelas separadas:

```sql
-- Schema ANTIGO (simplificado) ❌
users (
  id,
  email,
  full_name,
  tenant_id,
  role_name VARCHAR  -- REMOVIDO
)

-- Schema ATUAL (RBAC) ✅
users (
  id,
  email,
  full_name,
  tenant_id,
  is_active,
  email_verified
)

roles (
  id,
  name,           -- 'admin', 'gestor', 'member'
  display_name,
  is_system_role
)

user_roles (
  user_id,
  role_id,
  tenant_id,
  assigned_by,
  assigned_at
)
```

## 🔧 Arquivos Corrigidos

### 1. `src/lib/supabase/auth.ts`

**Problema**: Inseria `role_name` ao criar usuário

**Correção - Modo Create (criar novo tenant)**:
```typescript
// ❌ ANTES
const { error: userError } = await supabase.from('users').insert({
  id: authData.user.id,
  tenant_id: tenant.id,
  email,
  full_name: name,
  role_name: 'admin', // ❌ Coluna não existe
  is_active: true,
  email_verified: false,
});

// ✅ DEPOIS
const { error: userError } = await supabase.from('users').insert({
  id: authData.user.id,
  tenant_id: tenant.id,
  email,
  full_name: name,
  is_active: true,
  email_verified: false,
});

// Atribuir role de admin ao primeiro usuário
const { data: adminRole } = await supabase
  .from('roles')
  .select('id')
  .eq('name', 'admin')
  .single();

if (adminRole) {
  await supabase.from('user_roles').insert({
    user_id: authData.user.id,
    role_id: adminRole.id,
    tenant_id: tenant.id,
    assigned_by: authData.user.id, // Self-assigned
  });
}
```

**Correção - Modo Join (solicitar acesso)**:
```typescript
// ❌ ANTES
const { error: userError } = await supabase.from('users').insert({
  id: authData.user.id,
  tenant_id: null,
  email,
  full_name: name,
  role_name: 'member', // ❌ Coluna não existe
  is_active: false,
  email_verified: false,
});

// ✅ DEPOIS
const { error: userError } = await supabase.from('users').insert({
  id: authData.user.id,
  tenant_id: null, // Sem tenant até aprovação
  email,
  full_name: name,
  is_active: false,
  email_verified: false,
});
// Note: Role será atribuída quando o admin aprovar a solicitação
```

### 2. `src/app/(public)/setup-tenant/page.tsx`

**Problema**: Atualizava `role_name` ao vincular usuário ao tenant

**Correção**:
```typescript
// ❌ ANTES
const { error: updateError } = await supabase
  .from('users')
  .update({
    tenant_id: tenant.id,
    role_name: 'admin', // ❌ Coluna não existe
    is_active: true,
  })
  .eq('id', user.id);

// ✅ DEPOIS
const { error: updateError } = await supabase
  .from('users')
  .update({
    tenant_id: tenant.id,
    is_active: true,
  })
  .eq('id', user.id);

// Atribuir role de admin ao usuário
const { data: adminRole } = await supabase
  .from('roles')
  .select('id')
  .eq('name', 'admin')
  .single();

if (adminRole) {
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({
      user_id: user.id,
      role_id: adminRole.id,
      tenant_id: tenant.id,
      assigned_by: user.id, // Self-assigned
    });

  if (roleError) {
    console.error('Error assigning role:', roleError);
    // Continue anyway, user is linked to tenant
  }
}
```

### 3. Arquivos Não Modificados (Já Corretos)

Estes arquivos **não precisaram** de correção pois já estavam usando o sistema correto:

- ✅ `src/app/api/invitations/accept/route.ts` - Já usa `user_roles` (linha 94-103)
- ✅ `src/app/api/tenants/invitations/route.ts` - Armazena `role_name` apenas em `tenant_invitations` (para display), mas usa `role_id` para atribuição real

## 📦 Script SQL de Correção

Criado `db/12_fix_user_data.sql` que:

### Parte 1: Diagnóstico
- Verifica usuários em `auth.users` e `public.users`
- Identifica órfãos (usuários em auth mas não em public)
- Lista usuários sem tenant
- Mostra roles atribuídas
- Identifica usuários com tenant mas sem role

### Parte 2: Correção Automática
1. **Sincroniza órfãos**: Cria registros em `public.users` para usuários que existem apenas em `auth.users`
2. **Atribui role admin**: Para usuários que são donos de tenant (primeiro usuário do tenant)
3. **Atribui role member**: Para usuários que têm tenant mas não têm role

### Parte 3: Verificação
- Mostra situação final após correções
- Lista problemas restantes

### Parte 4: Correção Manual
- Template SQL para corrigir usuário específico
- Útil para casos especiais

### Parte 5: Limpeza
- Remove roles duplicadas
- Remove roles órfãs (tenant não existe)
- Remove roles de usuários sem tenant

## 🎯 Como Usar

### Para Novos Usuários
Não é necessário fazer nada! O código já está corrigido e novos usuários serão criados corretamente.

### Para Usuários Existentes (Afetados pelo Bug)

1. **Execute o script de diagnóstico e correção**:
   ```sql
   \i db/12_fix_user_data.sql
   ```

2. **Ou execute apenas no Supabase SQL Editor**: Copie e cole o conteúdo do arquivo

3. **Faça logout e login novamente** no sistema

4. **Verifique se o acesso foi restaurado**

### Correção Manual de Usuário Específico

Se o script automático não resolver, use este template:

```sql
DO $$
DECLARE
    v_user_id UUID;
    v_tenant_id UUID;
    v_role_id UUID;
BEGIN
    -- Buscar usuário por email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'seu-email@exemplo.com';

    -- Buscar tenant por slug
    SELECT id INTO v_tenant_id
    FROM public.tenants
    WHERE slug = 'seu-tenant-slug';

    -- Buscar role admin
    SELECT id INTO v_role_id
    FROM public.roles
    WHERE name = 'admin';

    -- Atualizar usuário
    UPDATE public.users
    SET
        tenant_id = v_tenant_id,
        is_active = true
    WHERE id = v_user_id;

    -- Atribuir role
    INSERT INTO public.user_roles (user_id, role_id, tenant_id, assigned_by)
    VALUES (v_user_id, v_role_id, v_tenant_id, v_user_id)
    ON CONFLICT (user_id, role_id, tenant_id) DO NOTHING;

    RAISE NOTICE 'Usuário % atualizado com sucesso!', v_user_id;
END $$;
```

## 🔍 Verificação

Para verificar se um usuário está configurado corretamente:

```sql
SELECT
    u.email,
    u.full_name,
    u.tenant_id,
    t.name as tenant_name,
    u.is_active,
    r.name as role_name,
    r.display_name
FROM public.users u
LEFT JOIN public.tenants t ON u.tenant_id = t.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id AND ur.tenant_id = u.tenant_id
LEFT JOIN public.roles r ON ur.role_id = r.id
WHERE u.email = 'seu-email@exemplo.com';
```

**Resultado esperado para usuário correto**:
```
email              | tenant_id | is_active | role_name | tenant_name
-------------------|-----------|-----------|-----------|-------------
user@example.com   | uuid...   | true      | admin     | Minha Empresa
```

## 📚 Contexto Adicional

### Sistema RBAC Implementado

O sistema agora usa um RBAC completo com:

1. **Roles Padrão** (system roles):
   - `admin` - Administrador do tenant
   - `gestor` - Gestor de projetos
   - `member` - Membro padrão

2. **Permissions**: Cada role pode ter múltiplas permissões

3. **user_roles**: Tabela de junção que relaciona:
   - Usuário
   - Role
   - Tenant (isolamento multi-tenant)
   - Quem atribuiu a role
   - Quando foi atribuída

### Vantagens do Sistema RBAC

✅ **Flexibilidade**: Múltiplas roles por usuário
✅ **Auditoria**: Sabe quem atribuiu cada role e quando
✅ **Multi-tenant**: Usuário pode ter roles diferentes em tenants diferentes
✅ **Permissions**: Sistema de permissões granular
✅ **Padrão da indústria**: Implementação enterprise-grade

### Desvantagens do Sistema Antigo (role_name)

❌ **Inflexível**: Apenas uma role por usuário
❌ **Sem auditoria**: Não sabe quem atribuiu ou quando
❌ **Sem permissions**: Lógica de permissões espalhada no código
❌ **Não escalável**: Difícil adicionar novas roles ou permissions

## 🚀 Próximos Passos

1. ✅ **Código corrigido**: Novos usuários usarão o sistema correto
2. ✅ **Script de correção**: Usuários existentes podem ser corrigidos
3. ⏭️ **Migração de dados antigos**: Se houver dados em produção com `role_name`
4. ⏭️ **Remover coluna role_name**: Se ainda existir no schema (via migration)

## 📝 Resumo das Mudanças

| Arquivo | Mudança | Status |
|---------|---------|--------|
| `src/lib/supabase/auth.ts` | Removido `role_name`, adicionado insert em `user_roles` | ✅ Corrigido |
| `src/app/(public)/setup-tenant/page.tsx` | Removido `role_name`, adicionado insert em `user_roles` | ✅ Corrigido |
| `src/app/api/invitations/accept/route.ts` | Já estava correto | ✅ OK |
| `src/app/api/tenants/invitations/route.ts` | Já estava correto | ✅ OK |
| `db/12_fix_user_data.sql` | Script de correção criado | ✅ Novo |

## 🆘 Troubleshooting

### Problema: Usuário não consegue acessar após correção

1. **Verifique RLS Policies**: Execute `db/11_fix_rls_for_setup.sql`
2. **Verifique dados**: Use queries de verificação acima
3. **Limpe cache**: Faça logout e login novamente
4. **Verifique funções SECURITY DEFINER**: Devem estar em `public` schema

### Problema: Erro "permission denied for schema auth"

- **Solução**: Use funções em `public` schema, não `auth`
- **Verificar**: Script `11_fix_rls_for_setup.sql` já faz isso corretamente

### Problema: "infinite recursion detected in policy"

- **Solução**: Use funções SECURITY DEFINER que bypassam RLS
- **Verificar**: Script `11_fix_rls_for_setup.sql` já implementa isso

---

**Data**: 2025-01-XX
**Versão**: 1.0
**Status**: ✅ Implementado e Testado
