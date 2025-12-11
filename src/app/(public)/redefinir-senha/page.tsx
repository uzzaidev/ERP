"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { updatePassword } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/client";

function RedefinirSenhaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    // Verificar se há um token de recuperação válido
    const checkToken = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      // Verificar se há parâmetros de recovery token
      const accessToken = searchParams.get('access_token');
      const type = searchParams.get('type');

      if (type === 'recovery' || session?.user) {
        setIsValidToken(true);
      } else if (!accessToken && !session) {
        setError("Link inválido ou expirado. Solicite uma nova recuperação de senha.");
        setIsValidToken(false);
      }

      setValidating(false);
    };

    checkToken();
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    // Validações
    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await updatePassword(password);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);

      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        router.push("/login?message=Senha redefinida com sucesso! Faça login.");
      }, 3000);
    } catch {
      setError("Erro ao redefinir senha. Tente novamente.");
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-slate-400">Verificando link...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken && !validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="w-full max-w-md">
          <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-400 mb-2">Link Inválido ou Expirado</h3>
                <p className="text-sm text-red-400/80">
                  {error || "O link de recuperação de senha é inválido ou já foi utilizado."}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-red-500/30">
              <Link
                href="/esqueci-senha"
                className="inline-block text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Solicitar novo link de recuperação
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#040C14] via-[#0A1628] to-[#0F1F33] items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl font-bold text-white mb-4">ERP UzzAI</h1>
          <p className="text-xl text-slate-300 mb-6">Sistema ERP unificado com IA</p>
          <p className="text-slate-400">Defina uma nova senha segura para sua conta</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-950 p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">Redefinir Senha</h2>
            <p className="text-sm text-slate-400">Digite sua nova senha</p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-red-500/10 border border-red-500/50 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-lg bg-emerald-500/10 border border-emerald-500/50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-emerald-400 mb-1">
                    Senha redefinida com sucesso!
                  </p>
                  <p className="text-xs text-emerald-400/80">
                    Redirecionando para o login...
                  </p>
                </div>
              </div>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Mínimo 6 caracteres"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Digite a senha novamente"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 font-semibold text-white shadow-lg shadow-emerald-900/50 transition-all hover:shadow-xl hover:shadow-emerald-900/60 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Redefinindo...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Redefinir Senha
                  </>
                )}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-8 text-center">
              <Link href="/login" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
                Voltar para o login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-600" />
            <p className="text-slate-400">Carregando...</p>
          </div>
        </div>
      }
    >
      <RedefinirSenhaContent />
    </Suspense>
  );
}
