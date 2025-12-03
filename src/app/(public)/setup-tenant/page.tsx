"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Key, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SetupTenantPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [companyName, setCompanyName] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [accessMessage, setAccessMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const supabase = createClient();

    try {
      // Obter usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Você precisa estar logado");
        setLoading(false);
        return;
      }

      // Buscar dados do usuário na tabela users
      const { data: userData, error: fetchUserError } = await supabase
        .from('users')
        .select('id, email, full_name, tenant_id')
        .eq('id', user.id)
        .single();

      if (fetchUserError) {
        console.error('Error fetching user:', fetchUserError);
        setError("Erro ao buscar dados do usuário");
        setLoading(false);
        return;
      }

      if (userData.tenant_id) {
        setError("Você já está vinculado a uma empresa");
        setLoading(false);
        return;
      }

      if (mode === 'create') {
        if (!companyName.trim()) {
          setError("Por favor, informe o nome da empresa");
          setLoading(false);
          return;
        }

        // Criar tenant
        const slugGenerated = companyName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || `empresa-${Date.now()}`;

        const { data: tenant, error: tenantError } = await supabase
          .from('tenants')
          .insert({
            name: companyName,
            slug: slugGenerated,
            plan: 'trial',
            status: 'active',
            max_users: 5,
            max_projects: 10,
            storage_limit_mb: 1000,
          })
          .select()
          .single();

        if (tenantError) {
          console.error('Error creating tenant:', tenantError);
          setError("Erro ao criar empresa: " + tenantError.message);
          setLoading(false);
          return;
        }

        // Vincular usuário ao tenant como admin
        const { error: updateError } = await supabase
          .from('users')
          .update({
            tenant_id: tenant.id,
            role_name: 'admin',
            is_active: true,
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating user:', updateError);
          setError("Erro ao vincular usuário");
          setLoading(false);
          return;
        }

        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 2000);

      } else {
        // Modo join
        if (!tenantSlug.trim()) {
          setError("Por favor, informe o código da empresa");
          setLoading(false);
          return;
        }

        // Verificar se tenant existe
        const { data: tenant, error: tenantError } = await supabase
          .from('tenants')
          .select('id, name, slug, status')
          .eq('slug', tenantSlug)
          .single();

        if (tenantError || !tenant) {
          setError("Empresa não encontrada. Verifique o código.");
          setLoading(false);
          return;
        }

        if (tenant.status !== 'active') {
          setError("Esta empresa não está aceitando novos membros.");
          setLoading(false);
          return;
        }

        // Criar solicitação de acesso
        const { error: requestError } = await supabase
          .from('tenant_access_requests')
          .insert({
            user_id: user.id,
            email: userData.email,
            full_name: userData.full_name,
            tenant_id: tenant.id,
            tenant_slug: tenant.slug,
            status: 'pending',
            message: accessMessage,
          });

        if (requestError) {
          console.error('Error creating access request:', requestError);
          setError("Erro ao criar solicitação: " + requestError.message);
          setLoading(false);
          return;
        }

        setSuccess(true);
        setIsPending(true);
        setTimeout(() => {
          router.push('/login?message=Sua solicitação foi enviada! Aguarde aprovação.');
        }, 3000);
      }
    } catch (err) {
      console.error('Setup tenant error:', err);
      setError("Erro ao configurar empresa. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#040C14] via-[#0A1628] to-[#0F1F33] p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-800 p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Configurar Empresa</h1>
            <p className="text-slate-400">
              Você precisa estar vinculado a uma empresa para continuar
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/50 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg bg-emerald-500/10 border border-emerald-500/50 p-4 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-400">
                {isPending
                  ? "Solicitação enviada! Aguarde aprovação do administrador."
                  : "Empresa configurada! Redirecionando..."}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Modo de vinculação */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-300">
                Escolha uma opção:
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`flex flex-col gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    mode === 'create'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value="create"
                    checked={mode === 'create'}
                    onChange={(e) => setMode(e.target.value as 'create' | 'join')}
                    disabled={loading || success}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${mode === 'create' ? 'bg-emerald-500/20' : 'bg-slate-800'}`}>
                      <Building2 className={`h-6 w-6 ${mode === 'create' ? 'text-emerald-400' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Criar nova empresa</div>
                      <div className="text-xs text-slate-400">Você será o administrador</div>
                    </div>
                  </div>
                </label>

                <label
                  className={`flex flex-col gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    mode === 'join'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value="join"
                    checked={mode === 'join'}
                    onChange={(e) => setMode(e.target.value as 'create' | 'join')}
                    disabled={loading || success}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${mode === 'join' ? 'bg-blue-500/20' : 'bg-slate-800'}`}>
                      <Key className={`h-6 w-6 ${mode === 'join' ? 'text-blue-400' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Solicitar acesso</div>
                      <div className="text-xs text-slate-400">A uma empresa existente</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Campos condicionais */}
            {mode === 'create' && (
              <div className="space-y-2">
                <label htmlFor="companyName" className="text-sm font-medium text-slate-300">
                  Nome da Empresa *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required={mode === 'create'}
                    disabled={loading || success}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                    placeholder="Minha Empresa Ltda"
                  />
                </div>
              </div>
            )}

            {mode === 'join' && (
              <>
                <div className="space-y-2">
                  <label htmlFor="tenantSlug" className="text-sm font-medium text-slate-300">
                    Código da Empresa *
                  </label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                      id="tenantSlug"
                      type="text"
                      value={tenantSlug}
                      onChange={(e) => setTenantSlug(e.target.value.toLowerCase())}
                      required={mode === 'join'}
                      disabled={loading || success}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 font-mono"
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
                    rows={4}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 px-4 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 resize-none"
                    placeholder="Explique por que você quer acessar esta empresa..."
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className={`w-full flex items-center justify-center gap-2 rounded-lg py-4 font-semibold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                mode === 'create'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-emerald-900/60'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-900/60'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processando...
                </>
              ) : mode === 'create' ? (
                <>
                  <Building2 className="h-5 w-5" />
                  Criar Empresa
                </>
              ) : (
                <>
                  <Key className="h-5 w-5" />
                  Enviar Solicitação
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
