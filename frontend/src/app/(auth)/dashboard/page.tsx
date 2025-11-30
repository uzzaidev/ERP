import Link from "next/link";
import { navigation } from "@/config/navigation";
import {
  Activity,
  AlarmClock,
  AlertTriangle,
  Brain,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

const kpis = [
  { title: "Projetos ativos", value: "12", delta: "+2", icon: FolderKanban },
  { title: "Acoes pendentes", value: "48", delta: "7 hoje", icon: CheckSquare },
  { title: "Equipe online", value: "08", delta: "3 em reuniao", icon: Users },
  { title: "Velocidade", value: "68%", delta: "+5%", icon: Zap },
];

const activity = [
  { title: "Reuniao finalizada", detail: "Sprint Planning - CHATBOT", time: "Ha 2h" },
  { title: "Acao concluida", detail: "A-2025-123 - Login Capacitor", time: "Ha 4h" },
  { title: "Decisao registrada", detail: "D-2025-042 - Helper API", time: "Ha 1d" },
];

const alerts = [
  { title: "Sprint termina em 2 dias", detail: "Sprint-2025-W48 com 5 acoes", tone: "warning" },
  { title: "Risco alto: estoque MeguisPet", detail: "3 SKUs abaixo do minimo", tone: "critical" },
  { title: "Cliente aguardando nota", detail: "Pet Plaza solicitou NFSe", tone: "warning" },
];

const aiInsights = [
  "Sync do helper API concluido: Desktop -> /api, Mobile -> prod.",
  "Supabase Auth mock pronto para conectar com Doppler.",
];

export default function DashboardPage() {
  const quickModules = navigation.flatMap((group) =>
    group.items.map((item) => ({
      title: item.title,
      href: item.href,
      icon: item.icon,
      group: group.title,
    }))
  );

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-white/5 via-emerald-500/10 to-transparent p-8 text-white shadow-[0_20px_90px_rgba(5,12,18,0.65)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-emerald-200">
              Mock Environment
            </p>
            <h1 className="mt-3 text-3xl font-semibold">
              Dashboard unificado ERP UzzAI + MeguisPet
            </h1>
            <p className="mt-2 text-sm text-slate-200">
              Visual retrofuturista inspirado no manual da marca e na landing do poker.luisfboff.com.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
              <Sparkles className="h-4 w-4" />
              Playground IA
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
            >
              <LayoutDashboard className="h-4 w-4" />
              Abrir LP
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/5 bg-[#040a11]/70 p-6">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-slate-400">
          <Activity className="h-4 w-4 text-emerald-300" />
          Navigator de modulos
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {quickModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.href}
                href={module.href}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:border-emerald-400/40 hover:bg-emerald-400/10"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-200">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{module.title}</p>
                  <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
                    {module.group}
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-[0.4em] text-emerald-200">
                  mock
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="rounded-3xl border border-white/5 bg-white/5 p-5"
            >
              <div className="flex items-center justify-between text-slate-300">
                <p className="text-xs uppercase tracking-[0.4em]">{kpi.title}</p>
                <Icon className="h-4 w-4 text-emerald-200" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-white">{kpi.value}</p>
              <p className="text-sm text-emerald-200">{kpi.delta}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-3xl border border-white/5 bg-white/5 p-6">
          <div className="mb-4 flex items-center gap-3">
            <Activity className="h-5 w-5 text-emerald-200" />
            <h2 className="text-lg font-semibold text-white">Atividade recente</h2>
          </div>
          <div className="space-y-4">
            {activity.map((item) => (
              <div key={item.title} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-0">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-300" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.detail}</p>
                </div>
                <span className="text-xs text-slate-500">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/5 bg-[#0b141c]/90 p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-300" />
            <h2 className="text-lg font-semibold text-white">Alertas</h2>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-sm font-semibold text-white">{alert.title}</p>
                <p className="text-xs text-slate-400">{alert.detail}</p>
                <span
                  className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.3em] ${alert.tone === "critical" ? "bg-red-500/20 text-red-200" : "bg-amber-400/20 text-amber-200"}`}
                >
                  {alert.tone}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 p-6">
          <div className="flex items-center gap-3 text-white">
            <Brain className="h-5 w-5 text-emerald-200" />
            <h2 className="text-lg font-semibold">Insights do RAG</h2>
          </div>
          <div className="mt-4 space-y-3">
            {aiInsights.map((insight) => (
              <p key={insight} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm">
                {insight}
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/5 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <AlarmClock className="h-5 w-5 text-blue-200" />
            <h2 className="text-lg font-semibold text-white">Timeline MeguisPet</h2>
          </div>
          <ul className="mt-4 space-y-4 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-300" />
              <div>
                <p className="font-semibold text-white">Capacitor helper</p>
                <p className="text-xs text-slate-400">Desktop vs Mobile configurado</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-300" />
              <div>
                <p className="font-semibold text-white">LP + Login</p>
                <p className="text-xs text-slate-400">Mock pronto com branding</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-amber-300" />
              <div>
                <p className="font-semibold text-white">Dashboard visual</p>
                <p className="text-xs text-slate-400">Navbar com todos os modulos</p>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
