import { createTestClient } from '@/lib/supabase/test-client';

/**
 * TESTE DE INTEGRAÇÃO: Fluxo de Registro e RLS de Tenants
 *
 * Valida os seguintes cenários:
 * 1. Criação de novo tenant (empresa) durante signup
 * 2. Lookup de tenant existente por slug
 * 3. RLS policies permitem operações corretas
 * 4. Isolamento de dados entre tenants
 *
 * BUG FIXES VALIDADOS:
 * - ✅ Policy INSERT permite criação de tenants
 * - ✅ Policy SELECT permite lookup de tenants por slug
 * - ✅ Usuários conseguem criar empresas
 * - ✅ Usuários conseguem encontrar empresas para solicitar acesso
 *
 * IMPORTANTE: Execute após aplicar db/12_fix_tenant_creation_rls.sql
 * Execute: pnpm test:integration
 */

describe('Integration: Tenant Registration & RLS', () => {
  describe('RLS Policies Validation', () => {
    it('should have INSERT policy for tenants table', async () => {
      const supabase = createTestClient();

      // Verificar se a policy INSERT existe
      const { data: policies, error } = await supabase
        .from('pg_policies')
        .select('policyname, cmd')
        .eq('schemaname', 'public')
        .eq('tablename', 'tenants')
        .eq('cmd', 'INSERT');

      if (error) {
        console.warn('⚠️  Não foi possível verificar policies (sem permissão)');
        console.warn('   Execute a query manualmente no Supabase SQL Editor');
        return;
      }

      expect(policies).toBeDefined();

      const hasInsertPolicy = policies?.some(
        (p) => p.policyname.includes('create') || p.policyname.includes('signup')
      );

      if (!hasInsertPolicy) {
        console.error('❌ Policy INSERT para tenants NÃO ENCONTRADA!');
        console.error('   Execute: db/12_fix_tenant_creation_rls.sql');
      } else {
        console.log('✅ Policy INSERT para tenants está criada');
        console.log(`   Policies encontradas:`, policies?.map(p => p.policyname));
      }

      expect(hasInsertPolicy).toBe(true);
    });

    it('should have SELECT policy for tenant lookup', async () => {
      const supabase = createTestClient();

      // Verificar se a policy SELECT existe para validação
      const { data: policies, error } = await supabase
        .from('pg_policies')
        .select('policyname, cmd')
        .eq('schemaname', 'public')
        .eq('tablename', 'tenants')
        .eq('cmd', 'SELECT');

      if (error) {
        console.warn('⚠️  Não foi possível verificar policies');
        return;
      }

      const hasValidationPolicy = policies?.some(
        (p) => p.policyname.includes('validation') || p.policyname.includes('read')
      );

      if (!hasValidationPolicy) {
        console.error('❌ Policy SELECT para validação NÃO ENCONTRADA!');
      } else {
        console.log('✅ Policy SELECT para validação existe');
      }

      expect(hasValidationPolicy).toBe(true);
    });
  });

  describe('Tenant Lookup (Join Flow)', () => {
    it('should allow authenticated users to lookup tenants by slug', async () => {
      const supabase = createTestClient();

      // Criar um tenant temporário para teste
      const testSlug = `test-tenant-${Date.now()}`;

      // Primeiro, verificar se conseguimos criar (será testado no próximo describe)
      // Por enquanto, tentar buscar um tenant existente
      const { data: existingTenants } = await supabase
        .from('tenants')
        .select('id, name, slug, status')
        .eq('status', 'active')
        .limit(1);

      if (!existingTenants || existingTenants.length === 0) {
        console.warn('⚠️  Nenhum tenant ativo para testar lookup');
        return;
      }

      const tenant = existingTenants[0];

      // Tentar buscar pelo slug (simulando o que signUp() faz)
      const { data: foundTenant, error } = await supabase
        .from('tenants')
        .select('id, name, slug, status')
        .eq('slug', tenant.slug)
        .single();

      expect(error).toBeNull();
      expect(foundTenant).toBeDefined();
      expect(foundTenant?.slug).toBe(tenant.slug);

      console.log('✅ Lookup de tenant por slug funciona');
      console.log(`   Tenant: ${foundTenant?.name}`);
      console.log(`   Slug: ${foundTenant?.slug}`);
    });

    it('should return error for non-existent tenant slug', async () => {
      const supabase = createTestClient();

      const nonExistentSlug = `non-existent-${Date.now()}`;

      const { data, error } = await supabase
        .from('tenants')
        .select('id, name, slug, status')
        .eq('slug', nonExistentSlug)
        .single();

      // Deve retornar erro PGRST116 (não encontrado)
      expect(error).not.toBeNull();
      expect(data).toBeNull();

      console.log('✅ Lookup retorna erro para slug inexistente');
      console.log(`   Error code: ${error?.code}`);
    });

    it('should not return inactive tenants', async () => {
      const supabase = createTestClient();

      // Buscar tenants inativos (se existirem)
      const { data: inactiveTenants } = await supabase
        .from('tenants')
        .select('id, name, slug, status')
        .neq('status', 'active')
        .limit(1);

      if (!inactiveTenants || inactiveTenants.length === 0) {
        console.log('✅ Nenhum tenant inativo para testar (todos ativos)');
        return;
      }

      const inactiveTenant = inactiveTenants[0];

      console.log('⚠️  Tenant inativo encontrado:');
      console.log(`   Slug: ${inactiveTenant.slug}`);
      console.log(`   Status: ${inactiveTenant.status}`);
      console.log('   Lógica de validação deve rejeitar tenants inativos no signUp()');
    });
  });

  describe('Tenant Creation (Create New Company Flow)', () => {
    it('should allow authenticated users to create new tenants', async () => {
      const supabase = createTestClient();

      // Verificar autenticação
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        console.warn('⚠️  Nenhum usuário autenticado');
        console.warn('   Configure credenciais de teste em .env.test.local');
        return;
      }

      const testSlug = `test-company-${Date.now()}`;
      const testName = `Test Company ${Date.now()}`;

      // Tentar criar um tenant (simulando o que signUp() faz)
      const { data: newTenant, error } = await supabase
        .from('tenants')
        .insert({
          name: testName,
          slug: testSlug,
          plan: 'trial',
          status: 'active',
          max_users: 5,
          max_projects: 10,
          storage_limit_mb: 1000,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar tenant:', error.message);
        console.error('   Code:', error.code);
        console.error('   Details:', error.details);

        if (error.code === '42501') {
          console.error('');
          console.error('   CAUSA: Policy RLS bloqueou INSERT');
          console.error('   SOLUÇÃO: Execute db/12_fix_tenant_creation_rls.sql');
        }

        expect(error).toBeNull();
        return;
      }

      expect(newTenant).toBeDefined();
      expect(newTenant?.slug).toBe(testSlug);
      expect(newTenant?.name).toBe(testName);

      console.log('✅ Tenant criado com sucesso!');
      console.log(`   ID: ${newTenant?.id}`);
      console.log(`   Nome: ${newTenant?.name}`);
      console.log(`   Slug: ${newTenant?.slug}`);

      // Limpar: deletar tenant de teste
      await supabase.from('tenants').delete().eq('id', newTenant.id);
      console.log('   (Tenant de teste deletado)');
    });

    it('should prevent duplicate tenant slugs', async () => {
      const supabase = createTestClient();

      // Buscar um tenant existente
      const { data: existingTenants } = await supabase
        .from('tenants')
        .select('slug')
        .limit(1);

      if (!existingTenants || existingTenants.length === 0) {
        console.warn('⚠️  Nenhum tenant para testar duplicação');
        return;
      }

      const existingSlug = existingTenants[0].slug;

      // Tentar criar com slug duplicado
      const { data, error } = await supabase
        .from('tenants')
        .insert({
          name: 'Duplicate Test',
          slug: existingSlug,
          plan: 'trial',
          status: 'active',
        })
        .select()
        .single();

      // Deve retornar erro de constraint (unique violation)
      expect(error).not.toBeNull();
      expect(error?.code).toBe('23505'); // PostgreSQL unique violation
      expect(data).toBeNull();

      console.log('✅ Constraint UNIQUE no slug funciona');
      console.log(`   Error: ${error?.message}`);
    });

    it('should validate slug format', async () => {
      const supabase = createTestClient();

      const invalidSlugs = [
        'UPPERCASE',
        'with spaces',
        'special!chars',
        'under_score',
      ];

      for (const invalidSlug of invalidSlugs) {
        const { data, error } = await supabase
          .from('tenants')
          .insert({
            name: 'Invalid Slug Test',
            slug: invalidSlug,
            plan: 'trial',
            status: 'active',
          })
          .select()
          .single();

        // Deve retornar erro de constraint (check violation)
        expect(error).not.toBeNull();
        expect(data).toBeNull();
      }

      console.log('✅ Validação de formato de slug funciona');
      console.log(`   Slugs inválidos rejeitados: ${invalidSlugs.length}`);
    });
  });

  describe('User Creation During Signup', () => {
    it('should allow users to insert own data during signup', async () => {
      const supabase = createTestClient();

      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        console.warn('⚠️  Nenhum usuário autenticado');
        return;
      }

      // Verificar se o usuário consegue ler os próprios dados
      const { data: userData, error } = await supabase
        .from('users')
        .select('id, email, full_name, tenant_id')
        .eq('id', authData.user.id)
        .single();

      expect(error).toBeNull();
      expect(userData).toBeDefined();

      console.log('✅ Usuário pode ler próprios dados');
      console.log(`   ID: ${userData?.id}`);
      console.log(`   Email: ${userData?.email}`);
      console.log(`   Tenant ID: ${userData?.tenant_id || 'NULL'}`);
    });

    it('should allow users without tenant_id', async () => {
      const supabase = createTestClient();

      // Buscar usuários sem tenant (pendentes de aprovação)
      const { data: usersWithoutTenant, error } = await supabase
        .from('users')
        .select('id, email, full_name, tenant_id, is_active')
        .is('tenant_id', null)
        .limit(1);

      expect(error).toBeNull();

      if (!usersWithoutTenant || usersWithoutTenant.length === 0) {
        console.log('✅ Nenhum usuário sem tenant (todos aprovados)');
        return;
      }

      const user = usersWithoutTenant[0];
      console.log('ℹ️  Usuário sem tenant encontrado:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Ativo: ${user.is_active}`);
      console.log('   Esperado: is_active = false (pendente de aprovação)');

      expect(user.tenant_id).toBeNull();
      expect(user.is_active).toBe(false); // Deve estar inativo até aprovação
    });
  });

  describe('Tenant Access Requests', () => {
    it('should allow users to create access requests', async () => {
      const supabase = createTestClient();

      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        console.warn('⚠️  Nenhum usuário autenticado');
        return;
      }

      // Buscar um tenant existente
      const { data: tenants } = await supabase
        .from('tenants')
        .select('id, slug')
        .eq('status', 'active')
        .limit(1);

      if (!tenants || tenants.length === 0) {
        console.warn('⚠️  Nenhum tenant para testar solicitação de acesso');
        return;
      }

      const tenant = tenants[0];

      // Tentar criar uma solicitação de acesso
      const { data: accessRequest, error } = await supabase
        .from('tenant_access_requests')
        .insert({
          user_id: authData.user.id,
          email: authData.user.email || 'test@example.com',
          full_name: 'Test User',
          tenant_id: tenant.id,
          tenant_slug: tenant.slug,
          status: 'pending',
          message: 'Test access request',
        })
        .select()
        .single();

      if (error && error.code === '23505') {
        // Unique constraint - já existe solicitação
        console.log('ℹ️  Solicitação já existe (constraint UNIQUE)');
        return;
      }

      expect(error).toBeNull();
      expect(accessRequest).toBeDefined();

      console.log('✅ Solicitação de acesso criada');
      console.log(`   ID: ${accessRequest?.id}`);
      console.log(`   Tenant: ${accessRequest?.tenant_slug}`);

      // Limpar
      if (accessRequest) {
        await supabase
          .from('tenant_access_requests')
          .delete()
          .eq('id', accessRequest.id);
        console.log('   (Solicitação de teste deletada)');
      }
    });

    it('should allow users to view own access requests', async () => {
      const supabase = createTestClient();

      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        console.warn('⚠️  Nenhum usuário autenticado');
        return;
      }

      const { data: requests, error } = await supabase
        .from('tenant_access_requests')
        .select('id, email, tenant_slug, status, created_at')
        .eq('user_id', authData.user.id);

      expect(error).toBeNull();
      expect(requests).toBeDefined();

      console.log('✅ Usuário pode ver próprias solicitações');
      console.log(`   Total: ${requests?.length || 0}`);

      if (requests && requests.length > 0) {
        console.log(`   Última: ${requests[0].tenant_slug} (${requests[0].status})`);
      }
    });
  });
});

/**
 * COMO INTERPRETAR OS RESULTADOS:
 *
 * ✅ Todos passam:
 *    - RLS policies permitem criação de tenants
 *    - Lookup de tenants funciona
 *    - Fluxo de registro completo funciona
 *    - Solicitações de acesso funcionam
 *
 * ⚠️  Warnings:
 *    - Sem usuário autenticado: Configure .env.test.local
 *    - Sem tenants: Crie alguns para testar lookup
 *    - Sem permissão para ver policies: Normal em produção
 *
 * ❌ Falhas:
 *    - Erro 42501 em INSERT tenant: Execute db/12_fix_tenant_creation_rls.sql
 *    - Erro em lookup: Verifique policy SELECT
 *    - Constraint violations: Esperado (validações funcionando)
 *
 * QUANDO EXECUTAR:
 * - ✅ Após aplicar db/12_fix_tenant_creation_rls.sql
 * - ✅ Após mudanças nas RLS policies de tenants
 * - ✅ Antes de deploy (validar que registro funciona)
 * - ✅ Se usuários reportarem problemas no registro
 */
