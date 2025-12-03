-- =====================================================
-- CORREÇÃO IMEDIATA: Loop "Precisa vincular" vs "Já vinculado"
-- =====================================================
-- PROBLEMA: Usuário tem tenant_id mas is_active = false
-- CAUSA: RequireTenantSetup redireciona por causa do is_active
--        Página setup-tenant vê tenant_id e diz "já vinculado"
--        LOOP!
--
-- SOLUÇÃO: Ativar usuários que têm tenant configurado
-- =====================================================

-- 1. DIAGNÓSTICO: Ver o problema
SELECT
    '🔍 DIAGNÓSTICO:' as info,
    u.email,
    u.tenant_id IS NOT NULL as tem_tenant,
    u.is_active as esta_ativo,
    t.name as nome_tenant,
    CASE
        WHEN u.tenant_id IS NOT NULL AND u.is_active = false THEN
            '🔴 ESTE É O PROBLEMA! (tem tenant mas inativo)'
        WHEN u.tenant_id IS NULL THEN
            '🟡 Sem tenant (normal)'
        ELSE
            '✅ OK'
    END as status
FROM public.users u
LEFT JOIN public.tenants t ON u.tenant_id = t.id
ORDER BY u.created_at DESC;

-- 2. CORREÇÃO: Ativar usuários com tenant
UPDATE public.users
SET is_active = true
WHERE tenant_id IS NOT NULL
    AND is_active = false;

-- 3. GARANTIR que roles existem
INSERT INTO public.roles (name, display_name, is_system_role)
VALUES
    ('admin', 'Administrador', true),
    ('gestor', 'Gestor', true),
    ('member', 'Membro', true)
ON CONFLICT (name) DO NOTHING;

-- 4. ATRIBUIR role admin para usuários com tenant mas sem role
DO $$
DECLARE
    v_user record;
    v_admin_role_id UUID;
BEGIN
    -- Pegar role admin
    SELECT id INTO v_admin_role_id
    FROM public.roles
    WHERE name = 'admin';

    IF v_admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Role admin não encontrada!';
    END IF;

    -- Para cada usuário com tenant mas sem role
    FOR v_user IN
        SELECT u.id, u.tenant_id, u.email
        FROM public.users u
        WHERE u.tenant_id IS NOT NULL
            AND NOT EXISTS (
                SELECT 1 FROM public.user_roles ur
                WHERE ur.user_id = u.id AND ur.tenant_id = u.tenant_id
            )
    LOOP
        -- Atribuir role admin
        INSERT INTO public.user_roles (user_id, role_id, tenant_id, assigned_by)
        VALUES (v_user.id, v_admin_role_id, v_user.tenant_id, v_user.id)
        ON CONFLICT (user_id, role_id, tenant_id) DO NOTHING;

        RAISE NOTICE '✅ Role admin atribuída para: %', v_user.email;
    END LOOP;
END $$;

-- 5. VERIFICAÇÃO FINAL
SELECT
    '✅ VERIFICAÇÃO FINAL:' as info,
    u.email,
    u.tenant_id IS NOT NULL as tem_tenant,
    u.is_active as esta_ativo,
    t.name as nome_tenant,
    r.name as role_name,
    CASE
        WHEN u.tenant_id IS NOT NULL AND u.is_active = true AND r.name IS NOT NULL THEN
            '✅ TUDO OK! Pode fazer login'
        WHEN u.tenant_id IS NOT NULL AND u.is_active = false THEN
            '❌ Ainda inativo'
        WHEN u.tenant_id IS NOT NULL AND r.name IS NULL THEN
            '⚠️  Ativo mas sem role'
        ELSE
            '🟡 Sem tenant'
    END as status_final
FROM public.users u
LEFT JOIN public.tenants t ON u.tenant_id = t.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id AND ur.tenant_id = u.tenant_id
LEFT JOIN public.roles r ON ur.role_id = r.id
ORDER BY u.created_at DESC;

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '======================================';
    RAISE NOTICE '✅ CORREÇÃO CONCLUÍDA!';
    RAISE NOTICE '======================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 O que foi feito:';
    RAISE NOTICE '   1. Ativados usuários com tenant_id';
    RAISE NOTICE '   2. Atribuídas roles faltantes';
    RAISE NOTICE '   3. Verificado estado final';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 PRÓXIMOS PASSOS:';
    RAISE NOTICE '   1. Verifique a tabela acima';
    RAISE NOTICE '   2. Procure por "✅ TUDO OK"';
    RAISE NOTICE '   3. Faça LOGOUT do sistema';
    RAISE NOTICE '   4. Feche o navegador';
    RAISE NOTICE '   5. Faça LOGIN novamente';
    RAISE NOTICE '   6. Tente acessar o dashboard';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  SE AINDA NÃO FUNCIONAR:';
    RAISE NOTICE '   • Execute: db/DIAGNOSE_USER_LOOP.sql';
    RAISE NOTICE '   • Verifique as políticas RLS';
    RAISE NOTICE '   • Entre em contato para debug adicional';
    RAISE NOTICE '';
END $$;
