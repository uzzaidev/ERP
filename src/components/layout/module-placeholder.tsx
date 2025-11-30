import type { LucideIcon } from "lucide-react";

interface Highlight {
  label: string;
  value: string;
  detail?: string;
}

interface RoadmapItem {
  title: string;
  description: string;
  badge?: string;
}

interface ModulePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  highlights: Highlight[];
  roadmap: RoadmapItem[];
  insights?: string[];
}

/**
 * Visual placeholder to keep every future modulo page consistent with the brand system.
 */
export function ModulePlaceholder({
  title,
  description,
  icon: Icon,
  highlights,
  roadmap,
  insights = [],
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/5 bg-gradient-to-br from-white/5 via-emerald-500/5 to-transparent p-8 shadow-[0_15px_60px_rgba(4,15,20,0.45)]">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/30 via-emerald-300/30 to-blue-500/30 text-emerald-200">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-emerald-200">Mock Preview</p>
            <h1 className="text-3xl font-semibold text-white">{title}</h1>
            <p className="text-sm text-slate-300">
              {description}
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((highlight) => (
          <div
            key={highlight.label}
            className="rounded-2xl border border-white/5 bg-white/5 p-5"
          >
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
              {highlight.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {highlight.value}
            </p>
            {highlight.detail && (
              <p className="mt-1 text-xs text-slate-400">{highlight.detail}</p>
            )}
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4 rounded-3xl border border-white/5 bg-[#0a141c]/80 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            Roadmap
          </p>
          <div className="space-y-4">
            {roadmap.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/5 bg-white/5 p-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  {item.badge && (
                    <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-200">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3 rounded-3xl border border-white/5 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-200">
            Insights
          </p>
          {insights.map((insight) => (
            <p key={insight} className="text-sm text-slate-50">
              {insight}
            </p>
          ))}
          {insights.length === 0 && (
            <p className="text-sm text-slate-400">
              Em breve adicionaremos insights de IA para este modulo.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
