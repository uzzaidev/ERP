"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { signIn, resendConfirmationEmail } from "@/lib/supabase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setShowResendEmail(false);
    setResendSuccess(false);
    setLoading(true);

    try {
      const { data, error: authError } = await signIn({ email, password });

      if (authError) {
        // Detectar se o email não foi confirmado
        if (authError.message.includes("Email not confirmed")) {
          setError("Email ainda não confirmado. Por favor, verifique sua caixa de entrada.");
          setShowResendEmail(true);
        } else if (authError.message === "Invalid login credentials") {
          setError("Email ou senha incorretos");
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (data) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Erro ao fazer login. Tente novamente.");
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    setError("");

    try {
      const { error: resendError } = await resendConfirmationEmail(email);

      if (resendError) {
        setError(`Erro ao reenviar email: ${resendError.message}`);
      } else {
        setResendSuccess(true);
        setError("");
      }
    } catch {
      setError("Erro ao reenviar email. Tente novamente.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#040C14] via-[#0A1628] to-[#0F1F33] items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl font-bold text-white mb-4">ERP UzzAI</h1>
          <p className="text-xl text-slate-300 mb-6">Sistema ERP unificado com IA</p>
          <p className="text-slate-400">Gestao completa e inteligente para sua empresa</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-950 p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">Bem-vindo</h2>
            <p className="text-sm text-slate-400">Entre com suas credenciais</p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-red-500/10 border border-red-500/50 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {resendSuccess && (
            <div className="mb-5 rounded-lg bg-emerald-500/10 border border-emerald-500/50 p-4 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-400">
                Email de confirmação reenviado! Verifique sua caixa de entrada.
              </p>
            </div>
          )}

          {showResendEmail && !resendSuccess && (
            <div className="mb-5 rounded-lg bg-blue-500/10 border border-blue-500/50 p-4">
              <p className="text-sm text-blue-400 mb-3">
                Não recebeu o email de confirmação?
              </p>
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resendLoading}
                className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 py-2.5 px-4 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? "Enviando..." : "Reenviar email de confirmação"}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Senha
                </label>
                <Link
                  href="/esqueci-senha"
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Esqueci a senha
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 font-semibold text-white shadow-lg shadow-emerald-900/50 transition-all hover:shadow-xl hover:shadow-emerald-900/60 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "Entrar"}
              <LogIn className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-8 text-center space-y-3">
            <p className="text-sm text-slate-400">
              Não tem uma conta?{" "}
              <Link href="/registro" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                Criar conta
              </Link>
            </p>
            <Link href="/" className="block text-sm text-slate-500 hover:text-slate-400 transition-colors">
              Voltar para home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
