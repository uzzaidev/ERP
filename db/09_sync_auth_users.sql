-- =====================================================
-- Sincronização entre auth.users e public.users
-- =====================================================
-- Este script gerencia a sincronização entre:
-- • auth.users (schema Auth do Supabase)
-- • public.users (schema customizado do ERP)
-- =====================================================

-- =====================================================
-- PARTE 0: VERIFICAÇÃO DO SCHEMA
-- =====================================================

-- Verificar quais colunas existem na tabela users
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- =====================================================
-- PARTE 0.1: ADICIONAR COLUNA role_name (SE NECESSÁRIO)
-- =====================================================
-- Se a coluna role_name não existir e você quiser usar o modelo simplificado
-- (em vez do modelo complexo users -> user_roles -> roles), execute:
/*
DO $$
BEGIN
    -- Verificar se a coluna já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'role_name'
    ) THEN
        -- Adicionar coluna role_name
        ALTER TABLE public.users ADD COLUMN role_name VARCHAR(50) DEFAULT 'member';

        -- Adicionar índice
        CREATE INDEX idx_users_role_name ON public.users(role_name);

        RAISE NOTICE 'Coluna role_name adicionada à tabela users';
    ELSE
        RAISE NOTICE 'Coluna role_name já existe';
    END IF;
END $$;
*/

-- =====================================================
-- PARTE 1: DIAGNÓSTICO
-- =====================================================

-- 1.1. Ver todos os usuários no auth.users
SELECT
    au.id,
    au.email,
    au.created_at,
    au.raw_user_meta_data->>'name' as name,
    au.confirmed_at,
    au.last_sign_in_at
FROM auth.users au
ORDER BY au.created_at DESC;

-- 1.2. Ver todos os usuários no public.users (versão compatível)
SELECT
    pu.id,
    pu.email,
    pu.full_name,
    pu.tenant_id,
    pu.is_active,
    pu.created_at,
    t.name as tenant_name,
    t.slug as tenant_slug
FROM public.users pu
LEFT JOIN public.tenants t ON pu.tenant_id = t.id
ORDER BY pu.created_at DESC;

-- 1.3. USUÁRIOS ÓRFÃOS: Existem em auth.users mas NÃO em public.users
-- Estes são usuários que foram criados no Auth mas não completaram o registro
SELECT
    au.id,
    au.email,
    au.created_at,
    au.raw_user_meta_data->>'name' as name,
    'ÓRFÃO - Existe apenas em auth.users' as status
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ORDER BY au.created_at DESC;

-- 1.4. USUÁRIOS INCONSISTENTES: Existem em public.users mas NÃO em auth.users
-- (Isso não deveria acontecer, mas verificamos por segurança)
SELECT
    pu.id,
    pu.email,
    pu.created_at,
    'INCONSISTENTE - Existe apenas em public.users' as status
FROM public.users pu
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users au WHERE au.id = pu.id
)
ORDER BY pu.created_at DESC;

-- =====================================================
-- PARTE 2: MIGRAÇÃO/SINCRONIZAÇÃO
-- =====================================================

-- OPÇÃO 2.1: Migrar usuários órfãos do auth.users para public.users
-- Cria registros em public.users para usuários que existem apenas no auth
-- Os usuários ficarão SEM tenant_id (precisam passar por /setup-tenant)

-- VERSÃO SEM role_name (compatível com schema original)
/*
INSERT INTO public.users (
    id,
    email,
    full_name,
    tenant_id,
    is_active,
    email_verified,
    password_hash,
    created_at,
    updated_at
)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)) as full_name,
    NULL as tenant_id,  -- Sem tenant - middleware vai redirecionar para /setup-tenant
    false as is_active,  -- Inativo - precisa configurar tenant
    CASE WHEN au.confirmed_at IS NOT NULL THEN true ELSE false END as email_verified,
    '' as password_hash,  -- Senha já está em auth.users
    au.created_at,
    NOW() as updated_at
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
);
*/

-- VERSÃO COM role_name (se você executou PARTE 0.1)
/*
INSERT INTO public.users (
    id,
    email,
    full_name,
    tenant_id,
    role_name,
    is_active,
    email_verified,
    password_hash,
    created_at,
    updated_at
)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)) as full_name,
    NULL as tenant_id,  -- Sem tenant - middleware vai redirecionar para /setup-tenant
    'member' as role_name,
    false as is_active,  -- Inativo - precisa configurar tenant
    CASE WHEN au.confirmed_at IS NOT NULL THEN true ELSE false END as email_verified,
    '' as password_hash,  -- Senha já está em auth.users
    au.created_at,
    NOW() as updated_at
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
);
*/

-- OPÇÃO 2.2: Criar tenant compartilhado "Usuários Legados" e vincular todos
-- Útil se você quer que todos os usuários órfãos compartilhem um tenant

-- VERSÃO SEM role_name
/*
DO $$
DECLARE
    legacy_tenant_id UUID;
BEGIN
    -- Verificar se já existe tenant "Usuários Legados"
    SELECT id INTO legacy_tenant_id
    FROM public.tenants
    WHERE slug = 'usuarios-legados'
    LIMIT 1;

    -- Se não existir, criar
    IF legacy_tenant_id IS NULL THEN
        INSERT INTO public.tenants (
            name,
            slug,
            plan,
            status,
            max_users,
            max_projects,
            storage_limit_mb
        ) VALUES (
            'Usuários Legados',
            'usuarios-legados',
            'trial',
            'active',
            100,
            50,
            5000
        ) RETURNING id INTO legacy_tenant_id;

        RAISE NOTICE 'Tenant "Usuários Legados" criado com ID: %', legacy_tenant_id;
    ELSE
        RAISE NOTICE 'Tenant "Usuários Legados" já existe com ID: %', legacy_tenant_id;
    END IF;

    -- Migrar usuários órfãos para public.users vinculados ao tenant legado
    INSERT INTO public.users (
        id,
        email,
        full_name,
        tenant_id,
        is_active,
        email_verified,
        password_hash,
        created_at,
        updated_at
    )
    SELECT
        au.id,
        au.email,
        COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
        legacy_tenant_id,
        true,  -- Ativar todos
        CASE WHEN au.confirmed_at IS NOT NULL THEN true ELSE false END,
        '',  -- Senha já está em auth.users
        au.created_at,
        NOW()
    FROM auth.users au
    WHERE NOT EXISTS (
        SELECT 1 FROM public.users pu WHERE pu.id = au.id
    );

    RAISE NOTICE 'Usuários órfãos migrados para o tenant legado';
END $$;
*/

-- =====================================================
-- PARTE 3: EXCLUSÃO DE USUÁRIOS
-- =====================================================

-- ATENÇÃO: Deletar usuários do auth.users é uma operação IRREVERSÍVEL
-- O usuário não conseguirá mais fazer login e perderá acesso permanentemente

-- OPÇÃO 3.1: Deletar um usuário específico do auth.users
-- Substitua 'USER_ID_AQUI' pelo ID do usuário
/*
DELETE FROM auth.users
WHERE id = 'USER_ID_AQUI';
*/

-- OPÇÃO 3.2: Deletar TODOS os usuários órfãos do auth.users
-- USE COM EXTREMO CUIDADO - Isso remove permanentemente todos os usuários
-- que não têm registro em public.users
/*
DELETE FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
);
*/

-- OPÇÃO 3.3: Deletar usuários órfãos criados há mais de X dias
-- Exemplo: deletar usuários criados há mais de 30 dias que nunca completaram registro
/*
DELETE FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
AND au.created_at < NOW() - INTERVAL '30 days';
*/

-- =====================================================
-- PARTE 4: TRIGGER AUTOMÁTICO (RECOMENDADO)
-- =====================================================

-- Criar trigger que automaticamente deleta usuário do auth.users
-- quando deletado do public.users
-- IMPORTANTE: Isso mantém a integridade referencial

-- 4.1. Função que deleta do auth quando deleta do public
CREATE OR REPLACE FUNCTION public.delete_auth_user_on_public_user_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Deletar do auth.users quando deletar do public.users
    DELETE FROM auth.users WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.2. Trigger que executa a função
DROP TRIGGER IF EXISTS trigger_delete_auth_user ON public.users;

CREATE TRIGGER trigger_delete_auth_user
    AFTER DELETE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.delete_auth_user_on_public_user_delete();

-- =====================================================
-- PARTE 5: FUNÇÃO RPC PARA LIMPEZA AUTOMÁTICA
-- =====================================================

-- Criar função que pode ser chamada via API para limpar usuários órfãos
CREATE OR REPLACE FUNCTION public.cleanup_orphan_auth_users(days_old INTEGER DEFAULT 7)
RETURNS TABLE (
    deleted_count INTEGER,
    user_ids UUID[]
) AS $$
DECLARE
    deleted_ids UUID[];
    deleted_total INTEGER;
BEGIN
    -- Deletar usuários órfãos mais antigos que X dias
    WITH deleted AS (
        DELETE FROM auth.users au
        WHERE NOT EXISTS (
            SELECT 1 FROM public.users pu WHERE pu.id = au.id
        )
        AND au.created_at < NOW() - (days_old || ' days')::INTERVAL
        RETURNING au.id
    )
    SELECT array_agg(id), COUNT(*) INTO deleted_ids, deleted_total FROM deleted;

    RETURN QUERY SELECT deleted_total, deleted_ids;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exemplo de uso:
-- SELECT * FROM public.cleanup_orphan_auth_users(30);  -- Deleta órfãos com mais de 30 dias

-- =====================================================
-- PARTE 6: POLÍTICAS RLS PARA FUNÇÃO
-- =====================================================

-- Permitir apenas admins executarem a função de limpeza
-- (Ajuste conforme sua política de segurança)
/*
GRANT EXECUTE ON FUNCTION public.cleanup_orphan_auth_users TO authenticated;

-- Ou apenas para serviço/admin:
REVOKE EXECUTE ON FUNCTION public.cleanup_orphan_auth_users FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_orphan_auth_users TO service_role;
*/

-- =====================================================
-- PARTE 7: VERIFICAÇÃO FINAL
-- =====================================================

-- Após executar a migração, verificar se está tudo sincronizado
SELECT
    (SELECT COUNT(*) FROM auth.users) as total_auth_users,
    (SELECT COUNT(*) FROM public.users) as total_public_users,
    (SELECT COUNT(*) FROM auth.users au WHERE NOT EXISTS (
        SELECT 1 FROM public.users pu WHERE pu.id = au.id
    )) as orphan_auth_users,
    (SELECT COUNT(*) FROM public.users pu WHERE NOT EXISTS (
        SELECT 1 FROM auth.users au WHERE au.id = pu.id
    )) as orphan_public_users;

-- =====================================================
-- RECOMENDAÇÕES
-- =====================================================
/*
1. VERIFICAR SCHEMA PRIMEIRO:
   Execute PARTE 0 para ver quais colunas existem

2. ADICIONAR role_name (OPCIONAL):
   Se quiser usar modelo simplificado, execute PARTE 0.1

3. DIAGNÓSTICO:
   Execute as queries da PARTE 1 para entender a situação atual

4. MIGRAÇÃO SEGURA:
   - OPÇÃO 2.1: Migrar órfãos SEM tenant (recomendado)
     → Usuários passarão por /setup-tenant
   - OPÇÃO 2.2: Migrar órfãos COM tenant compartilhado
     → Todos vinculados a "Usuários Legados"

5. LIMPEZA CUIDADOSA:
   - Use OPÇÃO 3.3 para deletar apenas órfãos antigos
   - NUNCA use OPÇÃO 3.2 sem backup

6. AUTOMAÇÃO:
   - Instale o TRIGGER (PARTE 4) para manter sincronizado
   - Use a função RPC (PARTE 5) para limpeza periódica
*/

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
