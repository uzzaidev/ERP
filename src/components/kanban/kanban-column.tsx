"use client";

import { KanbanCard } from "./kanban-card";
import type { KanbanCard as KanbanCardType } from "@/types/kanban";

interface KanbanColumnProps {
  title: string;
  status: KanbanCardType["status"];
  cards: KanbanCardType[];
  count: number;
}

const statusColors = {
  backlog: "bg-slate-500",
  todo: "bg-blue-500",
  "in-progress": "bg-yellow-500",
  review: "bg-purple-500",
  done: "bg-emerald-500",
};

export function KanbanColumn({ title, status, cards, count }: KanbanColumnProps) {
  return (
    <div className="flex min-w-[320px] flex-col rounded-xl border border-slate-700/30 bg-slate-900/30 p-4">
      {/* Column Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${statusColors[status]}`} />
          <h2 className="font-semibold text-white">{title}</h2>
          <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
            {count}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {cards.map((card) => (
          <KanbanCard key={card.id} card={card} />
        ))}
        {cards.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-slate-700/50 text-sm text-slate-500">
            Nenhum card
          </div>
        )}
      </div>
    </div>
  );
}
