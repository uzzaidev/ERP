import { createClient } from './client';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'manager' | 'member';
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Registra novo usuário no Supabase Auth
 * e cria registro na tabela users
 */
export async function signUp({ email, password, name, role = 'member' }: SignUpData) {
  const supabase = createClient();

  // 1. Criar usuário no Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      },
    },
  });

  if (authError) {
    return { data: null, error: authError };
  }

  // 2. Criar registro na tabela users
  if (authData.user) {
    const { error: userError } = await supabase.from('users').insert({
      id: authData.user.id,
      email,
      full_name: name,
      is_active: true,
    });

    if (userError) {
      console.error('Error creating user record:', userError);
      // Usuário criado no Auth mas não na tabela - pode ser resolvido depois
    }
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
