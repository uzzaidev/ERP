"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { signUp } from "@/lib/supabase/auth";

export default function RegistroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await signUp({ 
        email, 
        password, 
        name,
        role: 'member' 
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("Este email já está cadastrado");
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (data) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#040C14] via-[#0A1628] to-[#0F1F33] items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl font-bold text-white mb-4">ERP UzzAI</h1>
          <p className="text-xl text-slate-300 mb-6">Sistema ERP unificado com IA</p>
          <p className="text-slate-400">Gestao completa e inteligente para sua empresa</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-950 p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">Criar Conta</h2>
            <p className="text-sm text-slate-400">Preencha os dados para começar</p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-red-500/10 border border-red-500/50 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-lg bg-emerald-500/10 border border-emerald-500/50 p-4 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-400">Conta criada com sucesso! Redirecionando...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-slate-300">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading || success}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

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
                  disabled={loading || success}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-300">
                Senha
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
                  disabled={loading || success}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 font-semibold text-white shadow-lg shadow-emerald-900/50 transition-all hover:shadow-xl hover:shadow-emerald-900/60 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Criando conta..." : "Criar Conta"}
              <UserPlus className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-8 text-center space-y-3">
            <p className="text-sm text-slate-400">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                Entre aqui
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
