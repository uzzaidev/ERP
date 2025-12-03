import { createClient } from './client';

export interface SignUpData {
  email: string;
  password: string;
  name: string;

  // Tenant setup
  tenantMode: 'create' | 'join';

  // Se criar novo tenant
  companyName?: string;

  // Se solicitar acesso a tenant existente
  tenantSlug?: string;
  accessMessage?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Registra novo usuário no Supabase Auth
 * Opções:
 * 1. Criar novo tenant (tenantMode: 'create')
 * 2. Solicitar acesso a tenant existente (tenantMode: 'join')
 */
export async function signUp(data: SignUpData) {
  const supabase = createClient();
  const { email, password, name, tenantMode, companyName, tenantSlug, accessMessage } = data;

  // 1. Criar usuário no Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (authError) {
    return { data: null, error: authError, mode: null };
  }

  if (!authData.user) {
    return { data: null, error: new Error('User creation failed'), mode: null };
  }

  try {
    if (tenantMode === 'create') {
      // Modo 1: Criar novo tenant
      const tenantSlugGenerated = companyName
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `empresa-${Date.now()}`;

      // Criar tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: companyName || name,
          slug: tenantSlugGenerated,
          plan: 'trial',
          status: 'active',
          max_users: 5,
          max_projects: 10,
          storage_limit_mb: 1000,
        })
        .select()
        .single();

      if (tenantError) {
        console.error('Error creating tenant:', tenantError);
        return { data: null, error: tenantError, mode: 'create' };
      }

      // Criar usuário vinculado ao tenant como admin
      const { error: userError } = await supabase.from('users').insert({
        id: authData.user.id,
        tenant_id: tenant.id,
        email,
        full_name: name,
        role_name: 'admin', // Primeiro usuário é admin
        is_active: true,
        email_verified: false,
      });

      if (userError) {
        console.error('Error creating user record:', userError);
        return { data: null, error: userError, mode: 'create' };
      }

      return { data: { ...authData, tenant }, error: null, mode: 'create' };

    } else {
      // Modo 2: Solicitar acesso a tenant existente

      // Verificar se tenant existe
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id, name, slug, status')
        .eq('slug', tenantSlug)
        .single();

      if (tenantError || !tenant) {
        return {
          data: null,
          error: new Error('Empresa não encontrada. Verifique o código/slug.'),
          mode: 'join'
        };
      }

      if (tenant.status !== 'active') {
        return {
          data: null,
          error: new Error('Esta empresa não está aceitando novos membros.'),
          mode: 'join'
        };
      }

      // Criar usuário SEM tenant (ficará NULL até aprovação)
      const { error: userError } = await supabase.from('users').insert({
        id: authData.user.id,
        tenant_id: null, // Sem tenant até aprovação
        email,
        full_name: name,
        role_name: 'member',
        is_active: false, // Inativo até aprovação
        email_verified: false,
      });

      if (userError) {
        console.error('Error creating user record:', userError);
        return { data: null, error: userError, mode: 'join' };
      }

      // Criar solicitação de acesso
      const { error: requestError } = await supabase
        .from('tenant_access_requests')
        .insert({
          user_id: authData.user.id,
          email,
          full_name: name,
          tenant_id: tenant.id,
          tenant_slug: tenant.slug,
          status: 'pending',
          message: accessMessage,
        });

      if (requestError) {
        console.error('Error creating access request:', requestError);
        return { data: null, error: requestError, mode: 'join' };
      }

      return { data: { ...authData, tenant, pending: true }, error: null, mode: 'join' };
    }
  } catch (err) {
    console.error('Signup error:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Erro ao criar conta'),
      mode: tenantMode
    };
  }
}

/**
 * Login do usuário
 */
export async function signIn({ email, password }: SignInData) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Logout do usuário
 */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Obtém sessão atual
 */
export async function getSession() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  return { data: data.session, error };
}

/**
 * Obtém usuário atual com tenant context
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { user: null, error };
  }

  // Buscar dados completos da tabela users com tenant
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select(`
      *,
      tenant:tenants(
        id,
        name,
        slug,
        plan,
        status,
        max_users,
        max_projects
      )
    `)
    .eq('id', user.id)
    .single();

  return { user: userData, error: userError };
}

/**
 * Atualiza senha do usuário
 */
export async function updatePassword(newPassword: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { error };
}

/**
 * Envia email de recuperação de senha
 */
export async function resetPassword(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback`,
  });
  return { error };
}
