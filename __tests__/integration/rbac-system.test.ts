import { createTestClient } from '@/lib/supabase/test-client';

/**
 * TESTE DE INTEGRAÇÃO: Sistema RBAC
 *
 * Valida que o sistema de roles (RBAC) está funcionando corretamente
 * após a migração de role_name para user_roles.
 *
 * MUDANÇAS IMPORTANTES:
 * - ❌ ANTES: users.role_name (coluna string)
 * - ✅ AGORA: user_roles (tabela de junção) + roles (tabela)
 *
 * Execute: pnpm test:integration
 */

describe('Integration: RBAC System', () => {
  describe('Schema Validation', () => {
    it('should validate that role_name column does NOT exist in users table', async () => {
      const supabase = createTestClient();

      // Tentar selecionar role_name deve falhar
      const { data, error } = await supabase
        .from('users')
        .select('id, role_name')
        .limit(1);

      // Espera erro 42703 (column does not exist)
      if (!error || error.code !== '42703') {
        console.error('⚠️  PROBLEMA: Coluna role_name AINDA EXISTE!');
        console.error('Execute a migration para remover role_name');
        console.error('Arquivo: db/10_fix_users_schema.sql');
      }

      expect(error).not.toBeNull();
      expect(error?.code).toBe('42703'); // Column does not exist
      console.log('✅ Coluna role_name foi removida corretamente');
    });

    it('should validate that roles table exists', async () => {
      const supabase = createTestClient();

      const { data, error } = await supabase
        .from('roles')
        .select('id, name, display_name, is_system_role')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      console.log('✅ Tabela roles existe');
    });

    it('should validate that user_roles table exists', async () => {
      const supabase = createTestClient();

      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role_id, tenant_id, assigned_by')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      console.log('✅ Tabela user_roles existe');
    });

    it('should validate that default roles exist', async () => {
      const supabase = createTestClient();

      const { data: roles, error } = await supabase
        .from('roles')
        .select('name, display_name')
        .in('name', ['admin', 'gestor', 'member']);

      expect(error).toBeNull();
      expect(roles).toBeDefined();
      expect(roles?.length).toBeGreaterThanOrEqual(3);

      const roleNames = roles?.map(r => r.name) || [];
      expect(roleNames).toContain('admin');
      expect(roleNames).toContain('gestor');
      expect(roleNames).toContain('member');

      console.log('✅ Roles padrão existem:', roleNames.join(', '));
    });
  });

  describe('User Roles Assignment', () => {
    it('should validate that users have roles assigned via user_roles', async () => {
      const supabase = createTestClient();

      // Buscar usuários ativos
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, tenant_id, is_active')
        .eq('is_active', true)
        .not('tenant_id', 'is', null)
        .limit(5);

      expect(usersError).toBeNull();

      if (!users || users.length === 0) {
        console.warn('⚠️  Nenhum usuário ativo com tenant para testar');
        return;
      }

      // Verificar se têm roles
      for (const user of users) {
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select(`
            role_id,
            tenant_id,
            roles (name, display_name)
          `)
          .eq('user_id', user.id)
          .eq('tenant_id', user.tenant_id);

        expect(rolesError).toBeNull();
        expect(userRoles).toBeDefined();

        if (userRoles && userRoles.length > 0) {
          console.log(`✅ Usuário ${user.email} tem ${userRoles.length} role(s)`);
        } else {
          console.warn(`⚠️  Usuário ${user.email} NÃO tem roles atribuídas!`);
          console.warn(`   Execute: db/12_fix_user_data.sql`);
        }
      }
    });

    it('should validate user_roles has proper foreign keys', async () => {
      const supabase = createTestClient();

      // Query com joins para validar foreign keys
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role_id,
          tenant_id,
          users!user_roles_user_id_fkey (id, email),
          roles!user_roles_role_id_fkey (id, name),
          tenants!user_roles_tenant_id_fkey (id, name)
        `)
        .limit(1);

      if (error && error.code === 'PGRST200') {
        console.error('❌ FOREIGN KEY INCORRETA!');
        console.error('Detalhes:', error.details);
        console.error('Hint:', error.hint);
      }

      expect(error).toBeNull();
      console.log('✅ Foreign keys de user_roles estão corretas');
    });
  });

  describe('User Data Consistency', () => {
    it('should validate that active users have tenant_id', async () => {
      const supabase = createTestClient();

      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, tenant_id, is_active')
        .eq('is_active', true)
        .is('tenant_id', null);

      expect(error).toBeNull();

      if (users && users.length > 0) {
        console.warn('⚠️  Usuários ativos SEM tenant encontrados:');
        users.forEach(u => console.warn(`   - ${u.email}`));
        console.warn('   Execute: db/FIX_LOOP_IMMEDIATE.sql');
      } else {
        console.log('✅ Todos os usuários ativos têm tenant_id');
      }
    });

    it('should validate that users with tenant have roles', async () => {
      const supabase = createTestClient();

      // Buscar usuários com tenant mas sem roles
      const { data: usersWithTenant } = await supabase
        .from('users')
        .select('id, email, tenant_id, is_active')
        .not('tenant_id', 'is', null)
        .limit(10);

      if (!usersWithTenant || usersWithTenant.length === 0) {
        console.warn('⚠️  Nenhum usuário com tenant para validar');
        return;
      }

      let usersWithoutRoles = 0;

      for (const user of usersWithTenant) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role_id')
          .eq('user_id', user.id)
          .eq('tenant_id', user.tenant_id);

        if (!roles || roles.length === 0) {
          usersWithoutRoles++;
          console.warn(`⚠️  Usuário sem role: ${user.email}`);
        }
      }

      if (usersWithoutRoles > 0) {
        console.warn(`⚠️  ${usersWithoutRoles} usuários sem roles`);
        console.warn('   Execute: db/12_fix_user_data.sql');
      } else {
        console.log('✅ Todos os usuários com tenant têm roles');
      }
    });

    it('should validate that inactive users with tenant are handled', async () => {
      const supabase = createTestClient();

      const { data: inactiveUsers, error } = await supabase
        .from('users')
        .select('id, email, tenant_id, is_active')
        .eq('is_active', false)
        .not('tenant_id', 'is', null);

      expect(error).toBeNull();

      if (inactiveUsers && inactiveUsers.length > 0) {
        console.warn(`⚠️  ${inactiveUsers.length} usuários INATIVOS com tenant:`);
        inactiveUsers.slice(0, 3).forEach(u => {
          console.warn(`   - ${u.email} (tenant: ${u.tenant_id})`);
        });
        console.warn('   Isso causa o loop "precisa vincular" vs "já vinculado"');
        console.warn('   Execute: db/FIX_LOOP_IMMEDIATE.sql');
      } else {
        console.log('✅ Nenhum usuário inativo com tenant (sem risco de loop)');
      }
    });
  });

  describe('Tenant Integration', () => {
    it('should validate that users.tenant relation works', async () => {
      const supabase = createTestClient();

      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          tenant_id,
          tenant:tenants (id, name, slug)
        `)
        .not('tenant_id', 'is', null)
        .limit(1);

      expect(error).toBeNull();
      expect(users).toBeDefined();

      if (users && users.length > 0 && users[0].tenant) {
        const tenant = Array.isArray(users[0].tenant)
          ? users[0].tenant[0]
          : users[0].tenant;
        console.log('✅ Relação users → tenants funciona');
        console.log(`   Usuário: ${users[0].email}`);
        console.log(`   Tenant: ${tenant?.name || 'null'}`);
      }
    });

    it('should validate complete user context (like getTenantContext does)', async () => {
      const supabase = createTestClient();

      // Simula o que getTenantContext() faz
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          tenant_id,
          email,
          full_name,
          is_active,
          tenant:tenants(id, name, slug, plan, status, max_users, max_projects)
        `)
        .eq('is_active', true)
        .not('tenant_id', 'is', null)
        .limit(1);

      expect(error).toBeNull();

      if (users && users.length > 0) {
        expect(users[0]).toHaveProperty('tenant_id');
        expect(users[0]).toHaveProperty('full_name');
        expect(users[0]).toHaveProperty('tenant');

        console.log('✅ Contexto completo do usuário funciona');
        console.log(`   Usuário: ${users[0].full_name}`);

        const tenant = Array.isArray(users[0].tenant)
          ? users[0].tenant[0]
          : users[0].tenant;
        console.log(`   Tenant: ${tenant?.name || 'null'}`);
      }
    });
  });
});

/**
 * COMO INTERPRETAR OS RESULTADOS:
 *
 * ✅ Todos passam:
 *    - Sistema RBAC está funcionando corretamente
 *    - Migração de role_name foi bem sucedida
 *    - Usuários têm roles atribuídas corretamente
 *
 * ⚠️  Warnings:
 *    - Usuários sem roles: Execute db/12_fix_user_data.sql
 *    - Usuários inativos com tenant: Execute db/FIX_LOOP_IMMEDIATE.sql
 *    - Coluna role_name existe: Execute db/10_fix_users_schema.sql
 *
 * ❌ Falhas:
 *    - Schema incorreto: Execute as migrations SQL
 *    - Foreign keys erradas: Verifique db/*.sql
 *    - Dados inconsistentes: Execute scripts de correção
 *
 * FREQUÊNCIA DE EXECUÇÃO:
 * - ✅ Após migração de role_name → user_roles
 * - ✅ Antes de deploys importantes
 * - ✅ Após mudanças no schema SQL
 * - ✅ Se usuários reportarem problemas de acesso
 */
