-- =====================================================
-- FIX: Diagnóstico e Correção de Dados do Usuário
-- =====================================================
-- Este script ajuda a diagnosticar e corrigir problemas
-- com usuários que não conseguem acessar o sistema
-- mesmo após configurar tenant_id manualmente.
-- =====================================================

-- =====================================================
-- PARTE 1: Diagnóstico
-- =====================================================

-- 1.1 Verificar usuários em auth.users
SELECT
    'Usuários em auth.users' as info,
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 1.2 Verificar usuários em public.users
SELECT
    'Usuários em public.users' as info,
    id,
    email,
    full_name,
    tenant_id,
    is_active,
    email_verified,
    created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 5;

-- 1.3 Verificar órfãos (em auth mas não em public)
SELECT
    'Órfãos (em auth.users mas não em public.users)' as info,
    au.id,
    au.email,
    au.created_at
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
);

-- 1.4 Verificar usuários sem tenant
SELECT
    'Usuários sem tenant' as info,
    u.id,
    u.email,
    u.full_name,
    u.is_active
FROM public.users u
WHERE u.tenant_id IS NULL;

-- 1.5 Verificar roles atribuídas aos usuários
SELECT
    'Roles dos usuários' as info,
    u.email,
    u.full_name,
    r.name as role_name,
    r.display_name,
    ur.tenant_id,
    ur.created_at
FROM public.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.roles r ON ur.role_id = r.id
ORDER BY u.created_at DESC;

-- 1.6 Verificar usuários com tenant mas sem role
SELECT
    'Usuários com tenant mas sem role' as info,
    u.id,
    u.email,
    u.full_name,
    u.tenant_id,
    t.name as tenant_name
FROM public.users u
JOIN public.tenants t ON u.tenant_id = t.id
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id
);

-- =====================================================
-- PARTE 2: Correção Automática
-- =====================================================

-- 2.1 Sincronizar órfãos (criar em public.users)
INSERT INTO public.users (id, email, full_name, tenant_id, is_active, email_verified)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)) as full_name,
    NULL as tenant_id, -- Sem tenant até configurar
    false as is_active, -- Inativo até configurar tenant
    (au.email_confirmed_at IS NOT NULL) as email_verified
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- 2.2 Atribuir role 'admin' para usuários que são donos do tenant
-- (usuários que criaram o tenant devem ser admin)
WITH tenant_owners AS (
    SELECT DISTINCT
        t.id as tenant_id,
        u.id as user_id
    FROM public.tenants t
    JOIN public.users u ON u.tenant_id = t.id
    WHERE NOT EXISTS (
        -- Verificar se já não tem ninguém com role neste tenant
        SELECT 1 FROM public.user_roles ur WHERE ur.tenant_id = t.id
    )
    AND u.is_active = true
    ORDER BY u.created_at ASC
)
INSERT INTO public.user_roles (user_id, role_id, tenant_id, assigned_by)
SELECT
    to_.user_id,
    r.id as role_id,
    to_.tenant_id,
    to_.user_id as assigned_by -- Self-assigned
FROM tenant_owners to_
CROSS JOIN public.roles r
WHERE r.name = 'admin'
ON CONFLICT (user_id, role_id, tenant_id) DO NOTHING;

-- 2.3 Para usuários que têm tenant mas não têm role, atribuir 'member'
INSERT INTO public.user_roles (user_id, role_id, tenant_id, assigned_by)
SELECT DISTINCT
    u.id as user_id,
    r.id as role_id,
    u.tenant_id,
    u.id as assigned_by -- Self-assigned
FROM public.users u
CROSS JOIN public.roles r
WHERE u.tenant_id IS NOT NULL
    AND r.name = 'member'
    AND NOT EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = u.id AND ur.tenant_id = u.tenant_id
    )
ON CONFLICT (user_id, role_id, tenant_id) DO NOTHING;

-- =====================================================
-- PARTE 3: Verificação Pós-Correção
-- =====================================================

-- 3.1 Verificar situação após correção
SELECT
    'Situação Final' as info,
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
ORDER BY u.created_at DESC;

-- 3.2 Verificar se ainda há problemas
SELECT
    'Problemas Restantes' as info,
    COUNT(*) FILTER (WHERE u.tenant_id IS NULL) as users_without_tenant,
    COUNT(*) FILTER (WHERE u.tenant_id IS NOT NULL AND ur.user_id IS NULL) as users_without_role,
    COUNT(*) FILTER (WHERE u.tenant_id IS NOT NULL AND u.is_active = false) as inactive_users
FROM public.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id AND ur.tenant_id = u.tenant_id;

-- =====================================================
-- PARTE 4: Correção Manual (Se Necessário)
-- =====================================================

-- 4.1 Para corrigir um usuário específico, substitua os valores:
/*
-- Substitua 'seu-email@exemplo.com' pelo email do usuário
-- Substitua 'seu-tenant-id' pelo ID do tenant

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

    -- Buscar tenant por slug ou ID
    SELECT id INTO v_tenant_id
    FROM public.tenants
    WHERE slug = 'seu-tenant-slug'; -- ou WHERE id = 'seu-tenant-id'

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
*/

-- =====================================================
-- PARTE 5: Limpar Dados Inconsistentes
-- =====================================================

-- 5.1 Remover roles duplicadas
DELETE FROM public.user_roles ur1
WHERE EXISTS (
    SELECT 1 FROM public.user_roles ur2
    WHERE ur2.user_id = ur1.user_id
        AND ur2.role_id = ur1.role_id
        AND ur2.tenant_id = ur1.tenant_id
        AND ur2.created_at < ur1.created_at
);

-- 5.2 Remover roles órfãs (tenant_id não existe)
DELETE FROM public.user_roles ur
WHERE NOT EXISTS (
    SELECT 1 FROM public.tenants t WHERE t.id = ur.tenant_id
);

-- 5.3 Remover roles de usuários sem tenant
DELETE FROM public.user_roles ur
WHERE NOT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = ur.user_id AND u.tenant_id = ur.tenant_id
);

-- =====================================================
-- CONCLUSÃO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Script de diagnóstico e correção concluído!';
    RAISE NOTICE '';
    RAISE NOTICE '📝 O que foi feito:';
    RAISE NOTICE '1. Diagnóstico completo dos usuários';
    RAISE NOTICE '2. Sincronização de órfãos (auth → public)';
    RAISE NOTICE '3. Atribuição automática de roles';
    RAISE NOTICE '4. Limpeza de dados inconsistentes';
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Próximos passos:';
    RAISE NOTICE '• Verifique os resultados das queries acima';
    RAISE NOTICE '• Se necessário, use a Parte 4 para correção manual';
    RAISE NOTICE '• Faça logout e login novamente no sistema';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANTE:';
    RAISE NOTICE '• Execute este script no Supabase SQL Editor';
    RAISE NOTICE '• Revise os dados antes de aplicar em produção';
END $$;
