import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase simplificado para testes de integração
 * Não depende de cookies do Next.js
 */
export function createTestClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}
