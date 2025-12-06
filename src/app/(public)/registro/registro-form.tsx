"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle, Building2, Key } from "lucide-react";
import { useState, useEffect } from "react";
import { signUp } from "@/lib/supabase/auth";

export default function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantMode, setTenantMode] = useState<'create' | 'join'>('create');
  const [companyName, setCompanyName] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [accessMessage, setAccessMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Auto-fill tenant slug from URL parameter
  useEffect(() => {
    const tenantParam = searchParams.get('tenant');
    if (tenantParam) {
      setTenantSlug(tenantParam);
      setTenantMode('join');
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    setIsPending(false);

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      setLoading(false);
      return;
    }

    if (tenantMode === 'create' && !companyName.trim()) {
      setError("Por favor, informe o nome da empresa");
      setLoading(false);
      return;
    }

    if (tenantMode === 'join' && !tenantSlug.trim()) {
      setError("Por favor, informe o código da empresa");
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError, mode } = await signUp({
        email,
        password,
        name,
        tenantMode,
        companyName: tenantMode === 'create' ? companyName : undefined,
        tenantSlug: tenantMode === 'join' ? tenantSlug : undefined,
        accessMessage: tenantMode === 'join' ? accessMessage : undefined,
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

        // Se foi solicitação de acesso, mostrar mensagem diferente
        if (mode === 'join' && 'pending' in data && data.pending) {
          setIsPending(true);
          setTimeout(() => {
            router.push("/login?message=Sua solicitação foi enviada! Aguarde a aprovação do administrador.");
          }, 3000);
        } else {
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      }
    } catch {
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
          <p className="text-slate-400">Gestão completa e inteligente para sua empresa</p>
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
              <p className="text-sm text-emerald-400">
                {isPending
                  ? "Solicitação enviada! Aguarde aprovação do administrador."
                  : "Conta criada com sucesso! Redirecionando..."}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Dados pessoais */}
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

            {/* Modo de vinculação ao tenant */}
            <div className="space-y-3 pt-2">
              <label className="text-sm font-medium text-slate-300">
                Você deseja:
              </label>

              <div className="space-y-3">
                <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${tenantMode === 'create' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'}`}>
                  <input
                    type="radio"
                    name="tenantMode"
                    value="create"
                    checked={tenantMode === 'create'}
                    onChange={(e) => setTenantMode(e.target.value as 'create' | 'join')}
                    disabled={loading || success}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="h-4 w-4 text-emerald-400" />
                      <span className="font-medium text-white">Criar nova empresa</span>
                    </div>
                    <p className="text-xs text-slate-400">Você será o administrador</p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${tenantMode === 'join' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'}`}>
                  <input
                    type="radio"
                    name="tenantMode"
                    value="join"
                    checked={tenantMode === 'join'}
                    onChange={(e) => setTenantMode(e.target.value as 'create' | 'join')}
                    disabled={loading || success}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Key className="h-4 w-4 text-blue-400" />
                      <span className="font-medium text-white">Solicitar acesso a uma empresa</span>
                    </div>
                    <p className="text-xs text-slate-400">Aguardará aprovação do admin</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Campos condicionais baseados no modo */}
            {tenantMode === 'create' && (
              <div className="space-y-2">
                <label htmlFor="companyName" className="text-sm font-medium text-slate-300">
                  Nome da Empresa
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required={tenantMode === 'create'}
                    disabled={loading || success}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Minha Empresa Ltda"
                  />
                </div>
              </div>
            )}

            {tenantMode === 'join' && (
              <>
                <div className="space-y-2">
                  <label htmlFor="tenantSlug" className="text-sm font-medium text-slate-300">
                    Código da Empresa
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                      id="tenantSlug"
                      type="text"
                      value={tenantSlug}
                      onChange={(e) => setTenantSlug(e.target.value.toLowerCase())}
                      required={tenantMode === 'join'}
                      disabled={loading || success}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                      placeholder="codigo-da-empresa"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Peça o código ao administrador da empresa</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="accessMessage" className="text-sm font-medium text-slate-300">
                    Mensagem (Opcional)
                  </label>
                  <textarea
                    id="accessMessage"
                    value={accessMessage}
                    onChange={(e) => setAccessMessage(e.target.value)}
                    disabled={loading || success}
                    rows={3}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 px-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                    placeholder="Por que você quer acessar esta empresa?"
                  />
                </div>
              </>
            )}

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
