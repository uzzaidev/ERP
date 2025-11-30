"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const mockCredentials = {
    email: "admin@uzz.ai",
    password: "admin123",
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/dashboard");
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
                  defaultValue={mockCredentials.email}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
                  defaultValue={mockCredentials.password}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 font-semibold text-white shadow-lg shadow-emerald-900/50 transition-all hover:shadow-xl hover:shadow-emerald-900/60"
            >
              Entrar
              <LogIn className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            <Link href="/" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Voltar para home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
