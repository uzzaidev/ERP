"use client";

import { Clock, User, MessageSquare } from "lucide-react";
import type { KanbanCard as KanbanCardType } from "@/types/kanban";
import { useKanbanStore } from "@/lib/stores";

interface KanbanCardProps {
  card: KanbanCardType;
}

export function KanbanCard({ card }: KanbanCardProps) {
  const openCardModal = useKanbanStore((state) => state.openCardModal);
  
  const remainingHours = card.estimatedHours - card.completedHours;
  const progress = card.estimatedHours > 0 
    ? (card.completedHours / card.estimatedHours) * 100 
    : 0;

  const priorityColors = {
    low: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    critical: "bg-red-500/20 text-red-300 border-red-500/30",
  };

  return (
    <div
      onClick={() => openCardModal(card)}
      className="group cursor-pointer rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 transition-all hover:border-emerald-500/50 hover:bg-slate-800"
    >
      {/* Priority Badge */}
      <div className="mb-3 flex items-center justify-between">
        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${priorityColors[card.priority]}`}>
          {card.priority}
        </span>
        {card.tags.length > 0 && (
          <span className="text-xs text-slate-500">+{card.tags.length}</span>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-2 font-medium text-white line-clamp-2">{card.title}</h3>

      {/* Description Preview */}
      {card.description && (
        <p className="mb-3 text-xs text-slate-400 line-clamp-2">{card.description}</p>
      )}

      {/* Progress Bar */}
      {card.estimatedHours > 0 && (
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
            <span>Progresso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          {card.assignee && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[80px]">{card.assignee.name.split(" ")[0]}</span>
            </div>
          )}
          {card.estimatedHours > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{remainingHours}h</span>
            </div>
          )}
        </div>
        {card.comments.length > 0 && (
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            <span>{card.comments.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}
