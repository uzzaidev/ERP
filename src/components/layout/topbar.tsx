"use client";

import { Bell, Search, User } from "lucide-react";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-700/30 bg-slate-900/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-8">
        {/* Search */}
        <div className="flex flex-1">
          <div className="relative max-w-xl w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar tarefas, projetos ou clientes"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:bg-slate-800">
            <Bell className="h-5 w-5" />
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden text-sm text-white sm:block">
              <p className="font-medium">Luis Boff</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
