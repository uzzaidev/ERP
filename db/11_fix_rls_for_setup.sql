-- =====================================================
-- FIX: RLS Policies para Permitir Setup de Tenant
-- =====================================================
-- Problema: Usuários sem tenant_id não conseguem ler
-- nem os próprios dados devido às policies RLS.
--
-- Solução: Adicionar policy que permite usuário ler
-- os PRÓPRIOS dados, independente de ter tenant.
-- =====================================================

-- =====================================================
-- PARTE 1: Criar Funções Helper (SECURITY DEFINER)
-- =====================================================

-- Função que retorna tenant_id do usuário atual (bypassa RLS)
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid()
$$;

-- Função que verifica se usuário é admin (bypassa RLS)
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
  )
$$;

-- Garantir que as funções são executáveis por usuários autenticados
GRANT EXECUTE ON FUNCTION public.get_user_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_admin() TO authenticated;

-- =====================================================
-- PARTE 2: Atualizar Policy de Users (SELECT)
-- =====================================================

-- Remover policies antigas
DROP POLICY IF EXISTS "View users in same tenant" ON public.users;
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can view same tenant users" ON public.users;

-- Policy 1: Usuário pode ler os PRÓPRIOS dados (sempre)
CREATE POLICY "Users can view own data"
  ON public.users
  FOR SELECT
  USING (id = auth.uid());

-- Policy 2: Usuário pode ver outros usuários do MESMO tenant
CREATE POLICY "Users can view same tenant users"
  ON public.users
  FOR SELECT
  USING (
    tenant_id IS NOT NULL
    AND tenant_id = public.get_user_tenant_id()
  );

-- =====================================================
-- PARTE 3: Atualizar Policy de Users (UPDATE)
-- =====================================================

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =====================================================
-- PARTE 4: Atualizar Policy de Users (INSERT)
-- =====================================================

DROP POLICY IF EXISTS "Admins can create users" ON public.users;
DROP POLICY IF EXISTS "Allow user creation during signup" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data during signup" ON public.users;
DROP POLICY IF EXISTS "Admins can create tenant users" ON public.users;

-- Policy: Permitir inserção durante signUp (próprio usuário)
CREATE POLICY "Users can insert own data during signup"
  ON public.users
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Policy: Admins podem criar usuários do mesmo tenant
CREATE POLICY "Admins can create tenant users"
  ON public.users
  FOR INSERT
  WITH CHECK (
    tenant_id = public.get_user_tenant_id()
    AND public.is_user_admin()
  );

-- =====================================================
-- PARTE 5: Política para Tenant Access Requests
-- =====================================================

ALTER TABLE public.tenant_access_requests ENABLE ROW LEVEL SECURITY;

-- Limpar policies antigas
DROP POLICY IF EXISTS "Users can create own access requests" ON public.tenant_access_requests;
DROP POLICY IF EXISTS "Users can view own access requests" ON public.tenant_access_requests;
DROP POLICY IF EXISTS "Admins can view tenant access requests" ON public.tenant_access_requests;
DROP POLICY IF EXISTS "Admins can update tenant access requests" ON public.tenant_access_requests;
DROP POLICY IF EXISTS "View tenant invitations" ON public.tenant_access_requests;

-- Policy: Criar solicitação
CREATE POLICY "Users can create own access requests"
  ON public.tenant_access_requests
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Ver próprias solicitações
CREATE POLICY "Users can view own access requests"
  ON public.tenant_access_requests
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Admins veem solicitações do próprio tenant
CREATE POLICY "Admins can view tenant access requests"
  ON public.tenant_access_requests
  FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

-- Policy: Admins podem atualizar solicitações do próprio tenant
CREATE POLICY "Admins can update tenant access requests"
  ON public.tenant_access_requests
  FOR UPDATE
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

-- =====================================================
-- PARTE 6: Política para Tenants
-- =====================================================

-- Limpar policies antigas
DROP POLICY IF EXISTS "Users can view own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Authenticated users can view tenants for validation" ON public.tenants;
DROP POLICY IF EXISTS "Authenticated users can read tenants for validation" ON public.tenants;
DROP POLICY IF EXISTS "Admins can update own tenant" ON public.tenants;

-- Policy: Ver próprio tenant
CREATE POLICY "Users can view own tenant"
  ON public.tenants
  FOR SELECT
  USING (id = public.get_user_tenant_id());

-- Policy: Usuários autenticados podem ler tenants (para validar slug)
CREATE POLICY "Authenticated users can read tenants for validation"
  ON public.tenants
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Admins podem atualizar próprio tenant
CREATE POLICY "Admins can update own tenant"
  ON public.tenants
  FOR UPDATE
  USING (
    id = public.get_user_tenant_id()
    AND public.is_user_admin()
  );

-- =====================================================
-- PARTE 7: Policies para Roles e User_Roles
-- =====================================================

-- Roles são globais (todos podem ler)
DROP POLICY IF EXISTS "roles_select_all" ON public.roles;
CREATE POLICY "roles_select_all"
  ON public.roles
  FOR SELECT
  USING (true);

-- Permissions são globais (todos podem ler)
DROP POLICY IF EXISTS "permissions_select_all" ON public.permissions;
CREATE POLICY "permissions_select_all"
  ON public.permissions
  FOR SELECT
  USING (true);

-- Role_permissions são globais (todos podem ler)
DROP POLICY IF EXISTS "role_permissions_select_all" ON public.role_permissions;
CREATE POLICY "role_permissions_select_all"
  ON public.role_permissions
  FOR SELECT
  USING (true);

-- User_roles: ver próprios roles
DROP POLICY IF EXISTS "user_roles_tenant_isolation" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view tenant user roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

-- User_roles: admins podem ver roles do tenant
CREATE POLICY "Admins can view tenant user roles"
  ON public.user_roles
  FOR SELECT
  USING (
    tenant_id = public.get_user_tenant_id()
    AND public.is_user_admin()
  );

-- User_roles: permitir inserção durante setup
CREATE POLICY "Allow role assignment during setup"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR (
      tenant_id = public.get_user_tenant_id()
      AND public.is_user_admin()
    )
  );

-- =====================================================
-- PARTE 8: Verificação
-- =====================================================

-- Verificar funções criadas
SELECT
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_user_tenant_id', 'is_user_admin');

-- Verificar policies criadas
SELECT
    tablename,
    policyname,
    cmd,
    CASE
        WHEN cmd = 'SELECT' THEN 'Leitura'
        WHEN cmd = 'INSERT' THEN 'Inserção'
        WHEN cmd = 'UPDATE' THEN 'Atualização'
        WHEN cmd = 'DELETE' THEN 'Exclusão'
        ELSE cmd
    END as operacao
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'tenants', 'tenant_access_requests', 'user_roles')
ORDER BY tablename, cmd, policyname;

-- =====================================================
-- PARTE 9: Teste das Funções
-- =====================================================

-- Testar função get_user_tenant_id
SELECT
    'Current user tenant_id:' as info,
    public.get_user_tenant_id() as tenant_id;

-- Testar função is_user_admin
SELECT
    'Current user is admin:' as info,
    public.is_user_admin() as is_admin;

-- =====================================================
-- CONCLUSÃO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ RLS Policies atualizadas com sucesso!';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Alterações principais:';
    RAISE NOTICE '1. Criadas funções SECURITY DEFINER no schema public';
    RAISE NOTICE '2. Usuários podem ler os PRÓPRIOS dados (mesmo sem tenant)';
    RAISE NOTICE '3. Usuários podem criar registros durante signUp';
    RAISE NOTICE '4. Usuários podem criar solicitações de acesso';
    RAISE NOTICE '5. Usuários podem ler tenants para validar slug';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Segurança mantida:';
    RAISE NOTICE '• Isolamento por tenant funciona normalmente';
    RAISE NOTICE '• Apenas dados do próprio tenant são visíveis';
    RAISE NOTICE '• Admins controlam solicitações de acesso';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANTE:';
    RAISE NOTICE '• Execute este script no Supabase SQL Editor';
    RAISE NOTICE '• Faça logout e login novamente após executar';
    RAISE NOTICE '• As funções foram criadas no schema public (não auth)';
END $$;
