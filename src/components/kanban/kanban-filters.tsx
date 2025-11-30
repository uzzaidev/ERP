"use client";

import { Search, Filter, Calendar, User } from "lucide-react";
import { useKanbanStore } from "@/lib/stores";

export function KanbanFilters() {
  const { filter, setFilter, resetFilter, sprints } = useKanbanStore();

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar cards..."
          value={filter.search}
          onChange={(e) => setFilter({ search: e.target.value })}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>

      {/* Sprint Filter */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-slate-400" />
        <select
          value={filter.sprint || ""}
          onChange={(e) => setFilter({ sprint: e.target.value || null })}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <option value="">Todas as sprints</option>
          {sprints.map((sprint) => (
            <option key={sprint.id} value={sprint.id}>
              {sprint.name}
            </option>
          ))}
        </select>
      </div>

      {/* Assignee Filter */}
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-slate-400" />
        <select
          value={filter.assignee || ""}
          onChange={(e) => setFilter({ assignee: e.target.value || null })}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <option value="">Todas as pessoas</option>
          <option value="user-1">Luis Boff</option>
          <option value="user-2">Maria Silva</option>
          <option value="user-3">João Santos</option>
        </select>
      </div>

      {/* Status Filter */}
      <select
        value={filter.status || ""}
        onChange={(e) => setFilter({ status: e.target.value || null })}
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      >
        <option value="">Todos os status</option>
        <option value="backlog">Backlog</option>
        <option value="todo">A Fazer</option>
        <option value="in-progress">Em Progresso</option>
        <option value="review">Em Revisao</option>
        <option value="done">Concluido</option>
      </select>

      {/* Reset Button */}
      {(filter.search || filter.sprint || filter.assignee || filter.status) && (
        <button
          onClick={resetFilter}
          className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
