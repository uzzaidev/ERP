-- =====================================================
-- Migration: Legacy Users Without Tenant
-- =====================================================
-- This migration handles users who were created before
-- the multi-tenant system was implemented.
--
-- IMPORTANTE: Esta migração é OPCIONAL
--
-- OPÇÕES:
-- 1. Deixar como está - O middleware vai redirecionar para /setup-tenant
-- 2. Criar tenant padrão - Descomente a seção abaixo
-- 3. Migração manual - Use os SELECTs para identificar e migrar caso a caso
-- =====================================================

-- Verificar usuários legados (sem tenant_id)
-- Execute este SELECT para ver quantos usuários precisam migração
SELECT
    u.id,
    u.email,
    u.full_name,
    u.created_at,
    u.is_active
FROM users u
WHERE u.tenant_id IS NULL
ORDER BY u.created_at DESC;

-- =====================================================
-- OPÇÃO 1: Criar tenant padrão para cada usuário legado
-- =====================================================
-- Descomente o bloco abaixo se quiser criar automaticamente
-- um tenant para cada usuário legado
/*
DO $$
DECLARE
    legacy_user RECORD;
    new_tenant_id UUID;
    tenant_name VARCHAR(255);
BEGIN
    -- Iterar sobre usuários sem tenant
    FOR legacy_user IN
        SELECT id, email, full_name
        FROM users
        WHERE tenant_id IS NULL
    LOOP
        -- Gerar nome do tenant baseado no nome ou email do usuário
        tenant_name := COALESCE(
            legacy_user.full_name,
            split_part(legacy_user.email, '@', 1)
        ) || ' - Empresa';

        -- Criar tenant para o usuário
        INSERT INTO tenants (
            name,
            slug,
            plan,
            status,
            max_users,
            max_projects,
            storage_limit_mb
        ) VALUES (
            tenant_name,
            lower(replace(replace(legacy_user.email, '@', '-'), '.', '-')) || '-' || substr(md5(random()::text), 1, 6),
            'trial',
            'active',
            5,
            10,
            1000
        ) RETURNING id INTO new_tenant_id;

        -- Vincular usuário ao tenant como admin
        UPDATE users
        SET
            tenant_id = new_tenant_id,
            role_name = 'admin',
            is_active = true,
            updated_at = NOW()
        WHERE id = legacy_user.id;

        RAISE NOTICE 'Migrated user % to tenant %', legacy_user.email, new_tenant_id;
    END LOOP;
END $$;
*/

-- =====================================================
-- OPÇÃO 2: Criar um único tenant compartilhado
-- =====================================================
-- Use esta opção se todos os usuários legados pertencem
-- à mesma empresa
/*
DO $$
DECLARE
    shared_tenant_id UUID;
BEGIN
    -- Criar tenant compartilhado
    INSERT INTO tenants (
        name,
        slug,
        plan,
        status,
        max_users,
        max_projects,
        storage_limit_mb
    ) VALUES (
        'Empresa Legada',
        'empresa-legada',
        'trial',
        'active',
        50, -- Mais usuários para suportar todos os legados
        100,
        5000
    ) RETURNING id INTO shared_tenant_id;

    -- Vincular todos os usuários legados ao tenant compartilhado
    UPDATE users
    SET
        tenant_id = shared_tenant_id,
        role_name = 'user', -- Ou 'admin' se quiser que todos sejam admins
        is_active = true,
        updated_at = NOW()
    WHERE tenant_id IS NULL;

    RAISE NOTICE 'All legacy users migrated to shared tenant %', shared_tenant_id;
END $$;
*/

-- =====================================================
-- OPÇÃO 3: Desativar usuários legados
-- =====================================================
-- Use esta opção se quiser forçar usuários legados
-- a passar pelo fluxo de /setup-tenant
/*
UPDATE users
SET
    is_active = false,
    updated_at = NOW()
WHERE tenant_id IS NULL;
*/

-- =====================================================
-- Verificação pós-migração
-- =====================================================
-- Execute após migração para verificar status
SELECT
    COUNT(*) as total_users,
    COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END) as users_with_tenant,
    COUNT(CASE WHEN tenant_id IS NULL THEN 1 END) as users_without_tenant,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
    COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_users
FROM users;

-- =====================================================
-- RECOMENDAÇÃO
-- =====================================================
-- Se você não tem certeza de qual opção usar:
-- 1. NÃO execute nenhuma migração agora
-- 2. Deixe o middleware redirecionar para /setup-tenant
-- 3. Usuários legados criarão seu próprio tenant ou
--    solicitarão acesso a um existente
-- 4. Isso garante que cada usuário escolha sua própria configuração
-- =====================================================
