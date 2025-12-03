-- =====================================================
-- DIAGNÓSTICO: Loop "Precisa vincular" vs "Já vinculado"
-- =====================================================
-- Este script vai mostrar EXATAMENTE o estado do seu
-- usuário e o que está causando o loop.
-- =====================================================

-- 1. Ver todos os usuários e seu estado completo
SELECT
    '=== TODOS OS USU\u00c1RIOS ===' as info,
    u.id,
    u.email,
    u.full_name,
    u.tenant_id,
    u.is_active,
    u.email_verified,
    t.name as tenant_name,
    t.slug as tenant_slug,
    t.status as tenant_status,
    CASE
        WHEN u.tenant_id IS NULL THEN '❌ SEM TENANT'
        WHEN u.is_active = false THEN '⚠️  TEM TENANT MAS INATIVO'
        WHEN u.tenant_id IS NOT NULL AND u.is_active = true THEN '✅ OK'
        ELSE '❓ DESCONHECIDO'
    END as diagnostico
FROM public.users u
LEFT JOIN public.tenants t ON u.tenant_id = t.id
ORDER BY u.created_at DESC;

-- 2. Ver roles do usuário
SELECT
    '=== ROLES DOS USU\u00c1RIOS ===' as info,
    u.email,
    r.name as role_name,
    ur.tenant_id as role_tenant_id,
    t.name as role_tenant_name,
    CASE
        WHEN ur.user_id IS NULL THEN '❌ SEM ROLE'
        WHEN ur.tenant_id IS NULL THEN '⚠️  ROLE SEM TENANT'
        ELSE '✅ ROLE OK'
    END as role_status
FROM public.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.roles r ON ur.role_id = r.id
LEFT JOIN public.tenants t ON ur.tenant_id = t.id
ORDER BY u.created_at DESC;

-- 3. Identificar o problema específico
SELECT
    '=== IDENTIFICAR PROBLEMA ===' as info,
    u.email,
    CASE
        WHEN u.tenant_id IS NULL THEN
            '🔴 PROBLEMA: Usuário NÃO tem tenant_id (tenant_id = NULL)'
        WHEN u.is_active = false THEN
            '🟡 PROBLEMA: Usuário TEM tenant_id mas is_active = false'
        WHEN u.tenant_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id
        ) THEN
            '🟠 PROBLEMA: Usuário TEM tenant_id mas NÃO tem role atribuída'
        WHEN u.tenant_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = u.id AND ur.tenant_id = u.tenant_id
        ) THEN
            '🟣 PROBLEMA: Usuário tem role mas tenant_id da role não bate'
        ELSE
            '✅ Usuário parece estar OK'
    END as problema,
    u.tenant_id as user_tenant_id,
    u.is_active,
    (SELECT COUNT(*) FROM public.user_roles WHERE user_id = u.id) as total_roles,
    (SELECT COUNT(*) FROM public.user_roles WHERE user_id = u.id AND tenant_id = u.tenant_id) as roles_corretas
FROM public.users u
ORDER BY u.created_at DESC;

-- 4. Ver política RLS que pode estar bloqueando
SELECT
    '=== POL\u00cdTICAS RLS ATIVAS ===' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as operacao,
    qual as condicao_using,
    with_check as condicao_with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('users', 'user_roles', 'tenants')
ORDER BY tablename, cmd;

-- =====================================================
-- ANÁLISE DO LOOP
-- =====================================================

DO $$
DECLARE
    v_user record;
    v_problem TEXT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== ANÁLISE DETALHADA ===';
    RAISE NOTICE '';

    FOR v_user IN
        SELECT
            u.id,
            u.email,
            u.tenant_id,
            u.is_active,
            t.name as tenant_name,
            (SELECT COUNT(*) FROM public.user_roles ur WHERE ur.user_id = u.id) as role_count
        FROM public.users u
        LEFT JOIN public.tenants t ON u.tenant_id = t.id
        ORDER BY u.created_at DESC
        LIMIT 5
    LOOP
        RAISE NOTICE '👤 Usuário: %', v_user.email;
        RAISE NOTICE '   ID: %', v_user.id;

        -- Verificar tenant_id
        IF v_user.tenant_id IS NULL THEN
            v_problem := 'tenant_id = NULL';
            RAISE NOTICE '   ❌ Problema: %', v_problem;
            RAISE NOTICE '   📋 O que acontece:';
            RAISE NOTICE '      • RequireTenantSetup detecta "sem tenant"';
            RAISE NOTICE '      • Redireciona para /setup-tenant';
            RAISE NOTICE '      • Página setup-tenant verifica tenant_id';
            RAISE NOTICE '      • Como é NULL, permite criar/vincular ✅';
        ELSIF v_user.is_active = false THEN
            v_problem := 'tenant_id OK mas is_active = false';
            RAISE NOTICE '   ⚠️  Problema: %', v_problem;
            RAISE NOTICE '   📋 O que acontece:';
            RAISE NOTICE '      • RequireTenantSetup detecta "inativo"';
            RAISE NOTICE '      • Redireciona para /setup-tenant';
            RAISE NOTICE '      • Página setup-tenant verifica tenant_id';
            RAISE NOTICE '      • Como tenant_id NÃO é NULL, diz "já vinculado" ❌';
            RAISE NOTICE '   🔧 SOLUÇÃO: Ativar o usuário!';
        ELSIF v_user.role_count = 0 THEN
            v_problem := 'tenant_id OK, is_active OK, mas SEM ROLE';
            RAISE NOTICE '   🟠 Problema: %', v_problem;
            RAISE NOTICE '   📋 O que acontece:';
            RAISE NOTICE '      • RequireTenantSetup pode passar (se só checa tenant)';
            RAISE NOTICE '      • Mas sistema pode falhar depois por falta de role';
            RAISE NOTICE '   🔧 SOLUÇÃO: Atribuir role!';
        ELSE
            RAISE NOTICE '   ✅ Parece OK';
            RAISE NOTICE '      • tenant_id: %', v_user.tenant_id;
            RAISE NOTICE '      • is_active: %', v_user.is_active;
            RAISE NOTICE '      • roles: %', v_user.role_count;
        END IF;

        RAISE NOTICE '';
    END LOOP;
END $$;

-- =====================================================
-- CONCLUSÃO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== COMO INTERPRETAR OS RESULTADOS ===';
    RAISE NOTICE '';
    RAISE NOTICE '🔴 tenant_id = NULL';
    RAISE NOTICE '   • Sistema: "Precisa vincular"';
    RAISE NOTICE '   • Página setup: Permite vincular ✅';
    RAISE NOTICE '   • LOOP: NÃO';
    RAISE NOTICE '';
    RAISE NOTICE '🟡 tenant_id OK mas is_active = false';
    RAISE NOTICE '   • Sistema: "Precisa vincular" (por causa do is_active)';
    RAISE NOTICE '   • Página setup: "Já está vinculado" ❌';
    RAISE NOTICE '   • LOOP: SIM! ← ESTE É O SEU PROBLEMA!';
    RAISE NOTICE '';
    RAISE NOTICE '🟠 tenant_id OK, is_active OK, mas sem role';
    RAISE NOTICE '   • Sistema: Pode passar mas falhar depois';
    RAISE NOTICE '   • LOOP: PARCIAL';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tudo OK';
    RAISE NOTICE '   • Sem problemas';
    RAISE NOTICE '';
END $$;
