import Link from "next/link";
import { ArrowRight, MonitorSmartphone, Brain, Zap, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";

const features = [
  { label: "Desktop + Mobile", icon: MonitorSmartphone },
  { label: "IA nativa", icon: Brain },
  { label: "Realtime", icon: Zap },
];

const stats = [
  { value: "15+", label: "Modulos" },
  { value: "100%", label: "TypeSafe" },
  { value: "Next 15", label: "SSR" },
];

const modules = [
  { name: "Projetos", area: "Gestao" },
  { name: "Vendas", area: "Comercial" },
  { name: "Estoque", area: "Operacional" },
  { name: "RAG IA", area: "Inteligencia" },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#040C14] via-[#0A1628] to-[#0F1F33]">
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-4 py-2 text-sm backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-emerald-300">{siteConfig.slogan}</span>
          </div>

          <h1 className="mb-6 bg-gradient-to-r from-emerald-200 via-emerald-300 to-teal-200 bg-clip-text text-6xl font-bold text-transparent sm:text-7xl md:text-8xl">
            {siteConfig.name}
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-lg text-slate-300 sm:text-xl">
            Sistema ERP unificado com IA, realtime e multiplataforma.
            Gestao completa em um ecossistema integrado.
          </p>

          <div className="mb-12 flex flex-wrap items-center justify-center gap-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.label}
                  className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-900/40 px-4 py-2 backdrop-blur-sm"
                >
                  <Icon className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm text-slate-300">{f.label}</span>
                </div>
              );
            })}
          </div>

          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-900/50 transition-all hover:shadow-xl hover:shadow-emerald-900/60"
          >
            Acessar plataforma
            <ArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <div className="text-3xl font-bold text-emerald-400">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="relative border-t border-slate-800/50 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-4xl font-bold text-slate-100">Sistema modular</h2>
          <p className="mb-16 text-center text-slate-400">Todos os modulos integrados em um unico dashboard</p>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((mod) => (
              <div
                key={mod.name}
                className="group rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 backdrop-blur-sm transition-all hover:border-emerald-500/50 hover:bg-slate-900/60"
              >
                <Zap className="mb-3 h-8 w-8 text-emerald-400 transition-transform group-hover:scale-110" />
                <h3 className="mb-2 text-lg font-semibold text-slate-100">{mod.name}</h3>
                <p className="text-sm text-slate-400">{mod.area}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-800/50 px-6 py-12 text-center">
        <p className="text-sm text-slate-400">
          {siteConfig.name} - Automacao criativa realizada
        </p>
      </footer>
    </main>
  );
}
