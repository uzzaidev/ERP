"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, ShieldCheck, Smartphone } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const mockCredentials = {
    email: "meguispet@uzz.ai",
    password: "thinksmart",
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#03070c] text-white md:flex-row">
      <div className="relative flex flex-1 flex-col justify-between gap-12 p-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(26,188,156,0.35),_transparent_55%)]" />
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-emerald-200">
            Manual UZZ.AI
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">
            Automacao criativa para o ERP MeguisPet.
          </h1>
          <p className="mt-4 text-slate-300">
            Integramos Supabase, Capacitor e o helper de API (Desktop vs Mobile)
            em um unico frontend inspirado no site poker.luisfboff.com.
          </p>
        </div>

        <div className="grid gap-3 text-sm text-slate-300 md:max-w-sm">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.4em] text-emerald-200">
              Mock Credentials
            </p>
            <p className="font-mono text-lg text-white">{mockCredentials.email}</p>
            <p className="font-mono text-lg text-white">{mockCredentials.password}</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Supabase Auth</p>
              <p>Em breve. Por enquanto, apenas aperte entrar para ver o dashboard.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Smartphone className="h-5 w-5 text-blue-300" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Capacitor</p>       
              <p>Helper de API pronto para direcionar mobile para producao.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[#050c12] p-10">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_20px_70px_rgba(3,7,12,0.5)]">
          <div className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.5em] text-slate-400">
              Think Smart
            </p>
            <h2 className="text-3xl font-semibold">Entrar no ERP UzzAI</h2>
            <p className="text-sm text-slate-400">
              Dados mock apenas para navegacao visual.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-200">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  defaultValue={mockCredentials.email}
                  className="w-full rounded-2xl border border-white/10 bg-transparent py-3 pl-12 pr-4 text-sm placeholder:text-slate-600 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-200">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  defaultValue={mockCredentials.password}
                  className="w-full rounded-2xl border border-white/10 bg-transparent py-3 pl-12 pr-4 text-sm placeholder:text-slate-600 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-300 to-blue-500 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-emerald-900 transition hover:opacity-90"
            >
              <LogIn className="h-4 w-4" />
              Entrar
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            <span>Ainda sem workspace? </span>
            <Link href="/" className="text-emerald-300 hover:underline">
              Explorar landing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
