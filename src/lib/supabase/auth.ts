import { createClient } from './client';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Registra novo usuário no Supabase Auth
 * Apenas cria a conta - tenant setup é feito depois no /setup-tenant
 */
export async function signUp(data: SignUpData) {
  const supabase = createClient();
  const { email, password, name } = data;

  // Criar usuário no Auth
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
    return { data: null, error: authError };
  }

  if (!authData.user) {
    return { data: null, error: new Error('Falha ao criar usuário') };
  }

  // Criar registro na tabela users (sem tenant)
  // IMPORTANTE: Isso só funciona se o usuário tiver sessão ativa
  // Se email confirmation estiver habilitado, isso pode falhar
  // Nesse caso, o registro em 'users' será criado no /setup-tenant
  const { error: userError } = await supabase.from('users').insert({
    id: authData.user.id,
    tenant_id: null, // Sem tenant até setup
    email,
    full_name: name,
    is_active: false, // Inativo até vincular a um tenant
    email_verified: false,
  });

  // Se falhar (RLS blocking), não é problema - será criado no setup-tenant
  if (userError) {
    console.log('User record creation deferred to setup-tenant:', userError.message);
  }

  return { data: authData, error: null };
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
  // IMPORTANTE: Usar maybeSingle() para não dar erro se usuário não existir na tabela users
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
    .maybeSingle();

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
    redirectTo: `${window.location.origin}/redefinir-senha`,
  });
  return { error };
}

/**
 * Reenvia email de confirmação para usuários não confirmados
 */
export async function resendConfirmationEmail(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });
  return { error };
}
