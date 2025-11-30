"use client";

import { memo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./kanban-card";
import type { KanbanCard as KanbanCardType } from "@/types/kanban";

interface KanbanColumnProps {
  title: string;
  status: KanbanCardType["status"];
  cards: KanbanCardType[];
  count: number;
  onAssigneeChange?: (cardId: string, userId: string | null) => void;
}

const statusColors = {
  backlog: "bg-slate-500",
  todo: "bg-blue-500",
  "in-progress": "bg-yellow-500",
  review: "bg-purple-500",
  done: "bg-emerald-500",
};

export const KanbanColumn = memo(function KanbanColumn({ 
  title, 
  status, 
  cards, 
  count,
  onAssigneeChange 
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex min-w-[320px] flex-col rounded-xl border border-slate-700/30 bg-slate-900/30 p-4 transition-colors ${
        isOver ? 'border-emerald-500 bg-slate-800/50' : ''
      }`}
    >
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
      <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3 overflow-visible">
          {cards.map((card) => (
            <KanbanCard key={card.id} card={card} onAssigneeChange={onAssigneeChange} />
          ))}
          {cards.length === 0 && (
            <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-slate-700/50 text-sm text-slate-500">
              Nenhum card
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
});
