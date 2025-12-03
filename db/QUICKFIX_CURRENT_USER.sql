-- =====================================================
-- QUICK FIX: Corrigir Usuário Atual
-- =====================================================
-- Use este script para corrigir RAPIDAMENTE o seu
-- usuário atual que não consegue acessar o sistema.
--
-- INSTRUÇÕES:
-- 1. Copie todo este arquivo
-- 2. Cole no Supabase SQL Editor
-- 3. Execute (Run)
-- 4. Faça logout e login novamente
-- =====================================================

-- =====================================================
-- DIAGNÓSTICO RÁPIDO
-- =====================================================

-- Ver seu usuário no auth
SELECT
    'SEU USUÁRIO EM AUTH.USERS:' as info,
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 1;

-- Ver seu usuário no public.users
SELECT
    'SEU USUÁRIO EM PUBLIC.USERS:' as info,
    u.id,
    u.email,
    u.full_name,
    u.tenant_id,
    u.is_active,
    t.name as tenant_name,
    t.slug as tenant_slug
FROM public.users u
LEFT JOIN public.tenants t ON u.tenant_id = t.id
ORDER BY u.created_at DESC
LIMIT 1;

-- Ver suas roles
SELECT
    'SUAS ROLES:' as info,
    u.email,
    r.name as role_name,
    r.display_name,
    ur.tenant_id,
    t.name as tenant_name
FROM public.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.roles r ON ur.role_id = r.id
LEFT JOIN public.tenants t ON ur.tenant_id = t.id
ORDER BY u.created_at DESC
LIMIT 5;

-- =====================================================
-- CORREÇÃO AUTOMÁTICA
-- =====================================================

-- 1. Garantir que roles existem
INSERT INTO public.roles (name, display_name, is_system_role)
VALUES
    ('admin', 'Administrador', true),
    ('gestor', 'Gestor', true),
    ('member', 'Membro', true)
ON CONFLICT (name) DO NOTHING;

-- 2. Sincronizar usuários órfãos (auth → public)
INSERT INTO public.users (id, email, full_name, tenant_id, is_active, email_verified)
SELECT
    au.id,
    au.email,
    COALESCE(
        au.raw_user_meta_data->>'name',
        au.raw_user_meta_data->>'full_name',
        split_part(au.email, '@', 1)
    ) as full_name,
    NULL as tenant_id,
    false as is_active,
    (au.email_confirmed_at IS NOT NULL) as email_verified
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- 3. Para usuários com tenant mas sem role, atribuir role admin
-- (assumindo que você é o primeiro usuário do seu tenant)
DO $$
DECLARE
    v_user record;
    v_admin_role_id UUID;
BEGIN
    -- Pegar role admin
    SELECT id INTO v_admin_role_id
    FROM public.roles
    WHERE name = 'admin';

    -- Para cada usuário com tenant mas sem role
    FOR v_user IN
        SELECT DISTINCT u.id, u.tenant_id
        FROM public.users u
        WHERE u.tenant_id IS NOT NULL
            AND u.is_active = true
            AND NOT EXISTS (
                SELECT 1 FROM public.user_roles ur
                WHERE ur.user_id = u.id AND ur.tenant_id = u.tenant_id
            )
    LOOP
        -- Atribuir role admin
        INSERT INTO public.user_roles (user_id, role_id, tenant_id, assigned_by)
        VALUES (v_user.id, v_admin_role_id, v_user.tenant_id, v_user.id)
        ON CONFLICT (user_id, role_id, tenant_id) DO NOTHING;

        RAISE NOTICE 'Role admin atribuída para usuário %', v_user.id;
    END LOOP;
END $$;

-- 4. Ativar usuários que têm tenant
UPDATE public.users
SET is_active = true
WHERE tenant_id IS NOT NULL
    AND is_active = false;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar situação final
SELECT
    'SITUAÇÃO FINAL:' as info,
    u.email,
    u.full_name,
    u.tenant_id IS NOT NULL as has_tenant,
    u.is_active,
    t.name as tenant_name,
    t.slug as tenant_slug,
    r.name as role_name,
    r.display_name as role_display
FROM public.users u
LEFT JOIN public.tenants t ON u.tenant_id = t.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id AND ur.tenant_id = u.tenant_id
LEFT JOIN public.roles r ON ur.role_id = r.id
ORDER BY u.created_at DESC
LIMIT 5;

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================
-- Se tudo estiver correto, você deve ver:
-- ✅ has_tenant: true
-- ✅ is_active: true
-- ✅ tenant_name: Nome da sua empresa
-- ✅ role_name: admin
--
-- Se ainda houver problemas, veja o próximo bloco.
-- =====================================================

-- =====================================================
-- CORREÇÃO MANUAL (SE AINDA NÃO FUNCIONAR)
-- =====================================================

-- Se o script automático não resolver, descomente e
-- modifique o bloco abaixo com seus dados:

/*
DO $$
DECLARE
    v_user_id UUID;
    v_tenant_id UUID;
    v_admin_role_id UUID;
BEGIN
    -- ⚠️ MODIFIQUE AQUI: Coloque seu email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'SEU-EMAIL@EXEMPLO.COM';  -- ← MUDE AQUI

    -- ⚠️ MODIFIQUE AQUI: Coloque o slug do seu tenant
    SELECT id INTO v_tenant_id
    FROM public.tenants
    WHERE slug = 'seu-tenant-slug';  -- ← MUDE AQUI
    -- OU se souber o ID do tenant:
    -- v_tenant_id := 'uuid-do-tenant'::UUID;

    -- Pegar role admin
    SELECT id INTO v_admin_role_id
    FROM public.roles
    WHERE name = 'admin';

    -- Verificar se encontrou dados
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado! Verifique o email.';
    END IF;

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Tenant não encontrado! Verifique o slug.';
    END IF;

    IF v_admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Role admin não encontrada!';
    END IF;

    -- 1. Criar/Atualizar usuário em public.users
    INSERT INTO public.users (id, email, full_name, tenant_id, is_active, email_verified)
    SELECT
        au.id,
        au.email,
        COALESCE(
            au.raw_user_meta_data->>'name',
            au.raw_user_meta_data->>'full_name',
            split_part(au.email, '@', 1)
        ),
        v_tenant_id,
        true,
        (au.email_confirmed_at IS NOT NULL)
    FROM auth.users au
    WHERE au.id = v_user_id
    ON CONFLICT (id) DO UPDATE SET
        tenant_id = v_tenant_id,
        is_active = true;

    -- 2. Atribuir role admin
    INSERT INTO public.user_roles (user_id, role_id, tenant_id, assigned_by)
    VALUES (v_user_id, v_admin_role_id, v_tenant_id, v_user_id)
    ON CONFLICT (user_id, role_id, tenant_id) DO NOTHING;

    -- 3. Verificar resultado
    RAISE NOTICE '✅ Usuário % corrigido com sucesso!', v_user_id;
    RAISE NOTICE '   Tenant: %', v_tenant_id;
    RAISE NOTICE '   Role: admin';

    -- 4. Mostrar dados finais
    RAISE NOTICE '';
    RAISE NOTICE '📋 Dados finais do usuário:';

    PERFORM
        RAISE NOTICE '   Email: %', u.email
    FROM public.users u
    WHERE u.id = v_user_id;

END $$;

-- Verificar dados após correção manual
SELECT
    'VERIFICAÇÃO PÓS-CORREÇÃO:' as info,
    u.email,
    u.tenant_id,
    t.name as tenant_name,
    u.is_active,
    r.name as role_name
FROM public.users u
LEFT JOIN public.tenants t ON u.tenant_id = t.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.roles r ON ur.role_id = r.id
WHERE u.email = 'SEU-EMAIL@EXEMPLO.COM';  -- ← MUDE AQUI
*/

-- =====================================================
-- PRÓXIMOS PASSOS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Script de correção executado!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Verifique os resultados acima:';
    RAISE NOTICE '   1. Seu usuário deve ter tenant_id preenchido';
    RAISE NOTICE '   2. is_active deve ser true';
    RAISE NOTICE '   3. Deve ter role "admin"';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 PRÓXIMOS PASSOS:';
    RAISE NOTICE '   1. Faça LOGOUT do sistema';
    RAISE NOTICE '   2. Feche todas as abas do navegador';
    RAISE NOTICE '   3. Abra o sistema novamente';
    RAISE NOTICE '   4. Faça LOGIN';
    RAISE NOTICE '   5. Tente acessar o dashboard';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  SE AINDA NÃO FUNCIONAR:';
    RAISE NOTICE '   • Execute a parte de CORREÇÃO MANUAL (descomente e modifique)';
    RAISE NOTICE '   • Ou execute o script completo: db/12_fix_user_data.sql';
    RAISE NOTICE '';
END $$;
