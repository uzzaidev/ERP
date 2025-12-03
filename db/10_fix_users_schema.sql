-- =====================================================
-- FIX: Schema Definitivo de Usuários (Enterprise-grade)
-- =====================================================
-- Arquitetura:
-- 1. auth.users (Supabase) = FONTE DA VERDADE para autenticação
-- 2. public.users = Dados de negócio (FK para auth.users)
-- 3. public.roles = Definição de roles
-- 4. public.user_roles = Junction table (usuário x role x tenant)
-- 5. public.permissions = Permissões granulares
-- 6. public.role_permissions = Permissões por role
-- =====================================================

-- =====================================================
-- PARTE 1: BACKUP (SEGURANÇA)
-- =====================================================

-- Criar tabela de backup dos dados atuais
CREATE TABLE IF NOT EXISTS users_backup AS
SELECT * FROM public.users;

-- Verificar backup
SELECT COUNT(*) as total_backed_up FROM users_backup;

-- =====================================================
-- PARTE 2: CORRIGIR SCHEMA DA TABELA USERS
-- =====================================================

-- Remover constraint de tenant_id NOT NULL temporariamente
-- (para permitir usuários sem tenant durante migração)
ALTER TABLE public.users
    ALTER COLUMN tenant_id DROP NOT NULL;

-- Remover password_hash (senha está em auth.users)
ALTER TABLE public.users
    DROP COLUMN IF EXISTS password_hash CASCADE;

-- Adicionar campos que podem estar faltando
DO $$
BEGIN
    -- avatar_url
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.users ADD COLUMN avatar_url TEXT;
    END IF;

    -- phone
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.users ADD COLUMN phone VARCHAR(20);
    END IF;

    -- last_login
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'last_login'
    ) THEN
        ALTER TABLE public.users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Adicionar comment na tabela
COMMENT ON TABLE public.users IS 'Dados de negócio dos usuários. FK para auth.users (mesma PK). Isolado por tenant.';

-- =====================================================
-- PARTE 3: GARANTIR TABELAS DE ROLES E PERMISSÕES
-- =====================================================

-- Criar tabela roles se não existir
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela permissions se não existir
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela role_permissions se não existir
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- Criar tabela user_roles se não existir
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES public.users(id),
    UNIQUE(user_id, role_id, tenant_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_tenant_id ON public.user_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);

-- =====================================================
-- PARTE 4: POPULAR ROLES E PERMISSIONS PADRÃO
-- =====================================================

-- Inserir roles padrão (se não existirem)
INSERT INTO public.roles (name, display_name, description, is_system_role)
VALUES
    ('admin', 'Administrador', 'Acesso total ao sistema', true),
    ('gestor', 'Gestor', 'Gerencia projetos e equipes', true),
    ('financeiro', 'Financeiro', 'Acesso ao módulo financeiro', true),
    ('vendas', 'Vendas', 'Acesso ao módulo de vendas', true),
    ('member', 'Membro', 'Acesso básico ao sistema', true)
ON CONFLICT (name) DO NOTHING;

-- Inserir permissões padrão
INSERT INTO public.permissions (code, module, action, display_name, description)
VALUES
    -- Projetos
    ('projects.view', 'projects', 'view', 'Ver Projetos', 'Visualizar lista de projetos'),
    ('projects.create', 'projects', 'create', 'Criar Projetos', 'Criar novos projetos'),
    ('projects.edit', 'projects', 'edit', 'Editar Projetos', 'Editar projetos existentes'),
    ('projects.delete', 'projects', 'delete', 'Deletar Projetos', 'Deletar projetos'),

    -- Tarefas
    ('tasks.view', 'tasks', 'view', 'Ver Tarefas', 'Visualizar tarefas'),
    ('tasks.create', 'tasks', 'create', 'Criar Tarefas', 'Criar novas tarefas'),
    ('tasks.edit', 'tasks', 'edit', 'Editar Tarefas', 'Editar tarefas'),
    ('tasks.delete', 'tasks', 'delete', 'Deletar Tarefas', 'Deletar tarefas'),

    -- Financeiro
    ('finance.view', 'finance', 'view', 'Ver Financeiro', 'Visualizar dados financeiros'),
    ('finance.create', 'finance', 'create', 'Criar Transações', 'Criar transações financeiras'),
    ('finance.edit', 'finance', 'edit', 'Editar Financeiro', 'Editar dados financeiros'),
    ('finance.delete', 'finance', 'delete', 'Deletar Financeiro', 'Deletar transações'),

    -- Usuários
    ('users.view', 'users', 'view', 'Ver Usuários', 'Visualizar lista de usuários'),
    ('users.invite', 'users', 'invite', 'Convidar Usuários', 'Enviar convites'),
    ('users.edit', 'users', 'edit', 'Editar Usuários', 'Editar dados de usuários'),
    ('users.delete', 'users', 'delete', 'Deletar Usuários', 'Remover usuários'),

    -- Configurações
    ('settings.view', 'settings', 'view', 'Ver Configurações', 'Visualizar configurações'),
    ('settings.edit', 'settings', 'edit', 'Editar Configurações', 'Modificar configurações do tenant')
ON CONFLICT (code) DO NOTHING;

-- Associar permissões aos roles
DO $$
DECLARE
    admin_role_id UUID;
    gestor_role_id UUID;
    financeiro_role_id UUID;
    vendas_role_id UUID;
    member_role_id UUID;
BEGIN
    -- Obter IDs dos roles
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
    SELECT id INTO gestor_role_id FROM public.roles WHERE name = 'gestor';
    SELECT id INTO financeiro_role_id FROM public.roles WHERE name = 'financeiro';
    SELECT id INTO vendas_role_id FROM public.roles WHERE name = 'vendas';
    SELECT id INTO member_role_id FROM public.roles WHERE name = 'member';

    -- Admin tem todas as permissões
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT admin_role_id, id FROM public.permissions
    ON CONFLICT DO NOTHING;

    -- Gestor: projetos e tarefas completo
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT gestor_role_id, id FROM public.permissions
    WHERE code LIKE 'projects.%' OR code LIKE 'tasks.%' OR code = 'users.view'
    ON CONFLICT DO NOTHING;

    -- Financeiro: finance completo + view projetos
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT financeiro_role_id, id FROM public.permissions
    WHERE code LIKE 'finance.%' OR code = 'projects.view' OR code = 'tasks.view'
    ON CONFLICT DO NOTHING;

    -- Vendas: view finance + view projetos
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT vendas_role_id, id FROM public.permissions
    WHERE code IN ('finance.view', 'projects.view', 'tasks.view')
    ON CONFLICT DO NOTHING;

    -- Member: apenas view em projetos e tarefas
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT member_role_id, id FROM public.permissions
    WHERE code IN ('projects.view', 'tasks.view')
    ON CONFLICT DO NOTHING;
END $$;

-- =====================================================
-- PARTE 5: SINCRONIZAR USUÁRIOS DE auth.users
-- =====================================================

-- Migrar usuários de auth.users que não estão em public.users
INSERT INTO public.users (
    id,
    email,
    full_name,
    tenant_id,
    is_active,
    email_verified,
    created_at,
    updated_at
)
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
    CASE WHEN au.confirmed_at IS NOT NULL THEN true ELSE false END as email_verified,
    au.created_at,
    NOW() as updated_at
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PARTE 6: MIGRAR ROLES EXISTENTES (SE HOUVER role_name)
-- =====================================================

-- Se a coluna role_name existir, migrar para user_roles
DO $$
DECLARE
    has_role_name BOOLEAN;
    admin_role_id UUID;
    member_role_id UUID;
BEGIN
    -- Verificar se role_name existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role_name'
    ) INTO has_role_name;

    IF has_role_name THEN
        -- Obter IDs dos roles
        SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
        SELECT id INTO member_role_id FROM public.roles WHERE name = 'member';

        -- Migrar usuários com role_name para user_roles
        INSERT INTO public.user_roles (user_id, role_id, tenant_id, assigned_at)
        SELECT
            u.id,
            CASE
                WHEN u.role_name = 'admin' THEN admin_role_id
                WHEN u.role_name = 'gestor' THEN (SELECT id FROM public.roles WHERE name = 'gestor')
                WHEN u.role_name = 'financeiro' THEN (SELECT id FROM public.roles WHERE name = 'financeiro')
                WHEN u.role_name = 'vendas' THEN (SELECT id FROM public.roles WHERE name = 'vendas')
                ELSE member_role_id
            END as role_id,
            u.tenant_id,
            NOW()
        FROM public.users u
        WHERE u.tenant_id IS NOT NULL
          AND u.role_name IS NOT NULL
        ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Roles migrados de role_name para user_roles';

        -- Remover coluna role_name (agora obsoleta)
        ALTER TABLE public.users DROP COLUMN role_name;
        RAISE NOTICE 'Coluna role_name removida (agora usa user_roles)';
    END IF;
END $$;

-- =====================================================
-- PARTE 7: TRIGGERS DE SINCRONIZAÇÃO
-- =====================================================

-- 7.1. Trigger: Deletar de public.users quando deletar de auth.users
-- (Isso mantém consistência se admin deletar usuário pelo Supabase Dashboard)
CREATE OR REPLACE FUNCTION public.sync_delete_public_user_on_auth_delete()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.users WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_delete_public_user ON auth.users;

-- Nota: Este trigger requer permissão SECURITY DEFINER e acesso ao schema auth
-- Pode precisar ser criado pelo superuser do Supabase
/*
CREATE TRIGGER trigger_sync_delete_public_user
    AFTER DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_delete_public_user_on_auth_delete();
*/

-- 7.2. Trigger: Deletar de auth.users quando deletar de public.users
CREATE OR REPLACE FUNCTION public.sync_delete_auth_user_on_public_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Deletar do auth.users quando deletar do public.users
    DELETE FROM auth.users WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_delete_auth_user ON public.users;

CREATE TRIGGER trigger_sync_delete_auth_user
    AFTER DELETE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_delete_auth_user_on_public_delete();

-- 7.3. Trigger: Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON public.users;

CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PARTE 8: FUNÇÕES HELPER
-- =====================================================

-- 8.1. Obter roles de um usuário
CREATE OR REPLACE FUNCTION public.get_user_roles(user_id_param UUID, tenant_id_param UUID)
RETURNS TABLE (
    role_id UUID,
    role_name VARCHAR,
    role_display_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.name,
        r.display_name
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_id_param
      AND ur.tenant_id = tenant_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8.2. Verificar se usuário tem permissão
CREATE OR REPLACE FUNCTION public.user_has_permission(
    user_id_param UUID,
    tenant_id_param UUID,
    permission_code_param VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = user_id_param
          AND ur.tenant_id = tenant_id_param
          AND p.code = permission_code_param
    ) INTO has_permission;

    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8.3. Verificar se usuário tem role
CREATE OR REPLACE FUNCTION public.user_has_role(
    user_id_param UUID,
    tenant_id_param UUID,
    role_name_param VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    has_role BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = user_id_param
          AND ur.tenant_id = tenant_id_param
          AND r.name = role_name_param
    ) INTO has_role;

    RETURN has_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8.4. Atribuir role a usuário
CREATE OR REPLACE FUNCTION public.assign_role_to_user(
    user_id_param UUID,
    tenant_id_param UUID,
    role_name_param VARCHAR,
    assigned_by_param UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    role_id_var UUID;
    user_role_id UUID;
BEGIN
    -- Obter role_id
    SELECT id INTO role_id_var
    FROM public.roles
    WHERE name = role_name_param;

    IF role_id_var IS NULL THEN
        RAISE EXCEPTION 'Role % não encontrado', role_name_param;
    END IF;

    -- Inserir user_role
    INSERT INTO public.user_roles (user_id, role_id, tenant_id, assigned_by)
    VALUES (user_id_param, role_id_var, tenant_id_param, assigned_by_param)
    ON CONFLICT (user_id, role_id, tenant_id) DO NOTHING
    RETURNING id INTO user_role_id;

    RETURN user_role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8.5. Remover role de usuário
CREATE OR REPLACE FUNCTION public.remove_role_from_user(
    user_id_param UUID,
    tenant_id_param UUID,
    role_name_param VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    role_id_var UUID;
    deleted_count INTEGER;
BEGIN
    -- Obter role_id
    SELECT id INTO role_id_var
    FROM public.roles
    WHERE name = role_name_param;

    IF role_id_var IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Deletar user_role
    DELETE FROM public.user_roles
    WHERE user_id = user_id_param
      AND role_id = role_id_var
      AND tenant_id = tenant_id_param;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PARTE 9: ATUALIZAR RLS POLICIES
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Policy para users: ver apenas do próprio tenant
DROP POLICY IF EXISTS users_tenant_isolation ON public.users;
CREATE POLICY users_tenant_isolation ON public.users
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- Policy para user_roles: ver apenas do próprio tenant
DROP POLICY IF EXISTS user_roles_tenant_isolation ON public.user_roles;
CREATE POLICY user_roles_tenant_isolation ON public.user_roles
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- Policy para roles: todos podem ver (são globais)
DROP POLICY IF EXISTS roles_select_all ON public.roles;
CREATE POLICY roles_select_all ON public.roles
    FOR SELECT
    USING (true);

-- Policy para permissions: todos podem ver (são globais)
DROP POLICY IF EXISTS permissions_select_all ON public.permissions;
CREATE POLICY permissions_select_all ON public.permissions
    FOR SELECT
    USING (true);

-- Policy para role_permissions: todos podem ver (são globais)
DROP POLICY IF EXISTS role_permissions_select_all ON public.role_permissions;
CREATE POLICY role_permissions_select_all ON public.role_permissions
    FOR SELECT
    USING (true);

-- =====================================================
-- PARTE 10: VERIFICAÇÃO FINAL
-- =====================================================

-- Ver estatísticas
SELECT
    'auth.users' as tabela,
    COUNT(*) as total
FROM auth.users
UNION ALL
SELECT
    'public.users' as tabela,
    COUNT(*) as total
FROM public.users
UNION ALL
SELECT
    'public.roles' as tabela,
    COUNT(*) as total
FROM public.roles
UNION ALL
SELECT
    'public.user_roles' as tabela,
    COUNT(*) as total
FROM public.user_roles
UNION ALL
SELECT
    'public.permissions' as tabela,
    COUNT(*) as total
FROM public.permissions;

-- Ver usuários órfãos (deveria ser 0)
SELECT
    'Usuários órfãos em auth.users' as status,
    COUNT(*) as total
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
UNION ALL
SELECT
    'Usuários órfãos em public.users' as status,
    COUNT(*) as total
FROM public.users pu
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users au WHERE au.id = pu.id
);

-- =====================================================
-- CONCLUÍDO
-- =====================================================

-- Mensagem final
DO $$
BEGIN
    RAISE NOTICE '✅ Schema de usuários corrigido com sucesso!';
    RAISE NOTICE '📊 Sistema RBAC completo instalado';
    RAISE NOTICE '🔄 Sincronização auth.users ↔ public.users ativa';
    RAISE NOTICE '🔒 RLS policies aplicadas';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Próximos passos:';
    RAISE NOTICE '1. Atualizar código TypeScript para usar user_roles';
    RAISE NOTICE '2. Testar funções: get_user_roles(), user_has_permission()';
    RAISE NOTICE '3. Remover referências a role_name no código';
END $$;
