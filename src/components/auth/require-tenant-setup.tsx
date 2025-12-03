"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Componente que verifica se o usuário tem tenant configurado
 * Se não tiver, redireciona para /setup-tenant
 * Use este componente em layouts de páginas protegidas
 */
export function RequireTenantSetup({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function checkTenantSetup() {
    try {
      const supabase = createClient();

      // Verificar se está autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/login');
        return;
      }

      // Buscar dados do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, tenant_id, is_active')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error checking user:', userError);
        setErrorMessage(`Erro ao buscar dados: ${userError.message || 'Erro desconhecido'}`);
        setHasError(true);
        setIsChecking(false);
        return;
      }

      // Se não tem tenant ou não está ativo, redirecionar
      if (!userData || !userData.tenant_id || !userData.is_active) {
        console.log('User needs tenant setup, redirecting...');
        router.push('/setup-tenant');
        return;
      }

      // Tudo OK
      setIsChecking(false);
    } catch (error) {
      console.error('Error in tenant setup check:', error);
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      setErrorMessage(`Erro na verificação: ${message}`);
      setHasError(true);
      setIsChecking(false);
    }
  }

    // Só executar se isChecking for true
    if (isChecking) {
      checkTenantSetup();
    }
  }, [router, isChecking]);

  // Mostrar loading enquanto verifica
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent mb-4"></div>
          <p className="text-slate-400">Verificando configuração...</p>
        </div>
      </div>
    );
  }

  // Mostrar erro se houver
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="text-center max-w-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Erro de Verificação</h2>

          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-4">
            <p className="text-red-400 text-sm font-mono">
              {errorMessage}
            </p>
          </div>

          <p className="text-slate-400 mb-6">
            Possíveis soluções:
          </p>

          <div className="space-y-3 mb-6">
            <div className="text-left bg-slate-900/50 rounded-lg p-4 border border-slate-800">
              <h3 className="text-emerald-400 font-semibold mb-2">1. Executar Script SQL</h3>
              <p className="text-slate-400 text-sm mb-2">
                O problema pode ser causado por políticas RLS. Execute no Supabase:
              </p>
              <code className="block bg-slate-950 p-2 rounded text-xs text-emerald-400 overflow-x-auto">
                \i db/11_fix_rls_for_setup.sql
              </code>
            </div>

            <div className="text-left bg-slate-900/50 rounded-lg p-4 border border-slate-800">
              <h3 className="text-blue-400 font-semibold mb-2">2. Fazer Logout e Login</h3>
              <p className="text-slate-400 text-sm">
                As vezes ajuda limpar a sessão e tentar novamente.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setHasError(false);
                setIsChecking(true);
                setErrorMessage('');
              }}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Tentar Novamente
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              Ir para Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar filhos se tudo estiver OK
  return <>{children}</>;
}
