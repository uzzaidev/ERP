"use client";

import { Bell, Search, User, Sparkles, ShieldCheck, Smartphone } from "lucide-react";

export function Topbar() {
  const quickStats = [
    { label: "Supabase", value: "Auth Mock", icon: ShieldCheck },
    { label: "Capacitor", value: "Mobile Ready", icon: Smartphone },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#050b12]/80 backdrop-blur-xl">
      <div className="flex h-20 items-center gap-4 px-4 lg:px-8">
        {/* Search */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar tarefas, projetos ou clientes"
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
            />
          </div>
          <div className="hidden gap-3 text-xs text-slate-400 md:flex">
            {quickStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <span
                  key={stat.label}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1"
                >
                  <Icon className="h-3.5 w-3.5 text-emerald-300" />
                  <span className="uppercase tracking-widest text-[10px]">{stat.label}</span>
                  <span className="font-semibold text-white">{stat.value}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="hidden items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-emerald-400/20 to-emerald-200/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-emerald-200 md:flex">
            <Sparkles className="h-4 w-4" />
            Acoes rapidas
          </button>
          <button className="rounded-full border border-white/10 p-2 text-slate-200 hover:bg-white/10">
            <Bell className="h-5 w-5" />
          </button>
          <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-left text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden leading-tight text-xs text-white sm:block">
              <p className="font-semibold">Luis Boff (mock)</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-200">Workspace</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
