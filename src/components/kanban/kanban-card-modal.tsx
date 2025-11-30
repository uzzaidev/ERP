"use client";

import { useState } from "react";
import { X, Clock, User, MessageSquare, Send, Tag } from "lucide-react";
import { useKanbanStore } from "@/lib/stores";

interface KanbanCardModalProps {
  onAssigneeChange?: (cardId: string, userId: string | null) => void;
}

export function KanbanCardModal({ onAssigneeChange }: KanbanCardModalProps) {
  const { selectedCard, isCardModalOpen, closeCardModal, updateCard, addComment, updateTimeTracking, users } = useKanbanStore();
  const [newComment, setNewComment] = useState("");
  const [completedHours, setCompletedHours] = useState(selectedCard?.completedHours || 0);

  if (!isCardModalOpen || !selectedCard) return null;

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    // Extract mentions (@username)
    const mentions = newComment.match(/@(\w+)/g)?.map(m => m.substring(1)) || [];
    
    addComment(selectedCard.id, newComment, mentions);
    setNewComment("");
  };

  const handleUpdateTime = () => {
    updateTimeTracking(selectedCard.id, completedHours);
  };

  const handleAssigneeSelect = (userId: string) => {
    const newUserId = userId || null;
    onAssigneeChange?.(selectedCard.id, newUserId);
  };

  const remainingHours = selectedCard.estimatedHours - completedHours;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/50 p-6">
          <div>
            <h2 className="text-xl font-semibold text-white">{selectedCard.title}</h2>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
              <span>#{selectedCard.id}</span>
              {selectedCard.sprint && (
                <>
                  <span>·</span>
                  <span>{selectedCard.sprint}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={closeCardModal}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-300">Descricao</h3>
              <p className="text-sm text-slate-400">{selectedCard.description || "Sem descricao"}</p>
            </div>

            {/* Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">Status</label>
                <select
                  value={selectedCard.status}
                  onChange={(e) => updateCard(selectedCard.id, { status: e.target.value as any })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="backlog">Backlog</option>
                  <option value="todo">A Fazer</option>
                  <option value="in-progress">Em Progresso</option>
                  <option value="review">Em Revisao</option>
                  <option value="done">Concluido</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">Prioridade</label>
                <select
                  value={selectedCard.priority}
                  onChange={(e) => updateCard(selectedCard.id, { priority: e.target.value as any })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Critica</option>
                </select>
              </div>

              {/* Assignee */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <User className="h-4 w-4" />
                  Responsavel
                </label>
                <select
                  value={selectedCard.assignee?.id || ''}
                  onChange={(e) => handleAssigneeSelect(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="">Sem responsável</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <Tag className="h-4 w-4" />
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedCard.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                  {selectedCard.tags.length === 0 && (
                    <span className="text-sm text-slate-500">Sem tags</span>
                  )}
                </div>
              </div>
            </div>

            {/* Time Tracking */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
                <Clock className="h-4 w-4" />
                Controle de Horas
              </h3>
              <div className="space-y-3 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Estimado</label>
                    <div className="text-lg font-semibold text-white">{selectedCard.estimatedHours}h</div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Realizado</label>
                    <input
                      type="number"
                      value={completedHours}
                      onChange={(e) => setCompletedHours(Number(e.target.value))}
                      onBlur={handleUpdateTime}
                      className="w-full rounded border border-slate-600 bg-slate-700 px-2 py-1 text-lg font-semibold text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Restante</label>
                    <div className={`text-lg font-semibold ${remainingHours < 0 ? "text-red-400" : "text-emerald-400"}`}>
                      {remainingHours}h
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
                <MessageSquare className="h-4 w-4" />
                Comentarios ({selectedCard.comments.length})
              </h3>
              
              {/* Comment Input */}
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="Adicionar comentario... (use @nome para mencionar)"
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <button
                  onClick={handleAddComment}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                {selectedCard.comments.map((comment) => (
                  <div key={comment.id} className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{comment.author.full_name}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(comment.createdAt).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">{comment.content}</p>
                    {comment.mentions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {comment.mentions.map((mention) => (
                          <span key={mention} className="text-xs text-emerald-400">
                            @{mention}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {selectedCard.comments.length === 0 && (
                  <div className="py-8 text-center text-sm text-slate-500">
                    Nenhum comentario ainda
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
