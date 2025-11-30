import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  Layers,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { navigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";

const featurePillars = [
  {
    title: "SSR + Capacitor",
    description: "Helper identifica Desktop vs Mobile e direciona API routes automaticamente.",
    icon: MonitorSmartphone,
  },
  {
    title: "Supabase ready",
    description: "Clientes browser/server ja configurados para auth JWT com Doppler.",
    icon: ShieldCheck,
  },
  {
    title: "Brand retrofuturista",
    description: "Gradientes neon seguindo o manual de identidade visual UZZ.AI.",
    icon: Sparkles,
  },
];

const architecture = [
  {
    title: "Gestao Interna",
    description: "Projetos, Bullet Journal, Acoes, Reunioes e Performance 360 graus.",
    items: ["Projetos", "Acoes", "Equipe", "Bullet Journal"],
  },
  {
    title: "ERP Comercial",
    description: "Produtos, Vendas, PDV, Clientes e Estoque com alertas.",
    items: ["Produtos", "Estoque", "Vendas", "PDV"],
  },
  {
    title: "Financeiro",
    description: "Fluxo de Caixa, Notas Fiscais e Contas conectadas ao MeguisPet.",
    items: ["Fluxo de caixa", "Contas", "Notas"],
  },
  {
    title: "IA + RAG",
    description: "Multi-agents, insights e integracoes com decisoes MeguisPet.",
    items: ["RAG", "Insights", "Kaizens", "Workflows"],
  },
];

const stackBadges = ["Next.js 15", "React 19", "Tailwind 3.4", "Shadcn/ui", "Supabase", "Capacitor"];

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent text-white">
      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(26,188,156,0.35),transparent_45%)]" />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 lg:flex-row lg:items-center lg:py-20">
          <div className="flex-1 space-y-6">
            <p className="text-xs uppercase tracking-[0.5em] text-emerald-200">
              {siteConfig.slogan}
            </p>
            <h1 className="text-4xl font-semibold leading-tight lg:text-5xl">
              LP inspirada no poker.luisfboff.com para apresentar o ERP UzzAI.
            </h1>
            <p className="text-base text-slate-300">
              Base unica para Desktop (SSR) e Mobile (Capacitor), com componentes
              mockados e navegacao completa pelos modulos MeguisPet.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-blue-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-emerald-900"
              >
                Login mock
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white"
              >
                Ver dashboard
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-400">
              {stackBadges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 uppercase tracking-[0.4em]"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
          <div className="flex-1 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_40px_120px_rgba(5,12,18,0.65)]">
            <p className="text-xs uppercase tracking-[0.5em] text-slate-400">
              Preview MeguisPet
            </p>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
              <p className="text-sm text-slate-300">
                Layout com gradientes neon, cards em vidro e tipografia Poppins + Exo 2,
                seguindo o manual de identidade visual UZZ.AI.
              </p>
              <div className="mt-6 grid gap-3 text-sm">
                <div className="flex items-center gap-2 text-emerald-200">
                  <BadgeCheck className="h-4 w-4" /> API Helper Desktop/Mobile
                </div>
                <div className="flex items-center gap-2 text-emerald-200">
                  <Brain className="h-4 w-4" /> IA pronta para RAG Insights
                </div>
                <div className="flex items-center gap-2 text-emerald-200">
                  <Layers className="h-4 w-4" /> Navbar com todos os modulos
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16">
        <section className="grid gap-6 md:grid-cols-3">
          {featurePillars.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <Icon className="h-6 w-6 text-emerald-200" />
                <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                <p className="text-sm text-slate-300">{feature.description}</p>
              </div>
            );
          })}
        </section>

        <section className="space-y-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.5em] text-emerald-200">
              Arquitetura MeguisPet
            </p>
            <h2 className="text-3xl font-semibold">Modulos disponiveis na nav do dashboard</h2>
            <p className="text-slate-300">
              Cada grupo tem placeholder visual no cluster autenticado para validar UX antes dos dados reais.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {architecture.map((block) => (
              <div key={block.title} className="rounded-3xl border border-white/10 bg-[#050b12]/80 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold">{block.title}</h3>
                  <Zap className="h-5 w-5 text-emerald-200" />
                </div>
                <p className="mt-2 text-sm text-slate-300">{block.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-emerald-200">
                  {block.items.map((item) => (
                    <span key={item} className="rounded-full border border-emerald-400/20 px-3 py-1">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.5em] text-emerald-200">Rotas prontas</p>
            <h2 className="text-3xl font-semibold">Navbar mock com todos os caminhos</h2>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {navigation.map((group) => (
              <div key={group.title} className="rounded-2xl border border-white/10 bg-[#050b12]/70 p-5">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{group.title}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-sm text-white">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.4em] text-emerald-200"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 p-8">
            <h2 className="text-3xl font-semibold">Por que esta landing lembra o poker.luisfboff.com?</h2>
            <p className="mt-4 text-slate-200">
              Utilizamos o mesmo clima retro neon: cards com blur, tipografia audaciosa e CTA em gradiente para
              comunicar tecnologia + postura premium.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-200">
              <li className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-emerald-200" /> Radial gradients com preto cinematografico
              </li>
              <li className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-emerald-200" /> Tipos Poppins + Exo 2 como no manual
              </li>
              <li className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-emerald-200" /> Micro interacoes nos chips e CTA
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-semibold">Roadmap imediato</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <p>1. Conectar Supabase Auth real + Doppler.</p>
              <p>2. Substituir mock API pelo helper com fetch real.</p>
              <p>3. Exportar build Next para Capacitor e testar mobile.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-10 text-center text-sm text-slate-400">
        <p>
          {siteConfig.name} - Automacao criativa realizada - <Link className="text-emerald-300" href="/login">Entrar</Link>
        </p>
      </footer>
    </div>
  );
}
