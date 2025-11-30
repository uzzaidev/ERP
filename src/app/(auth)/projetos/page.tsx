"use client";

import { useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { KanbanColumn, KanbanFilters, KanbanCardModal } from "@/components/kanban";
import { useKanbanStore } from "@/lib/stores";
import type { KanbanCard } from "@/types/kanban";

// Mock data
const mockSprints = [
  { id: "sprint-1", name: "Sprint 48 - Nov 2025", startDate: "2025-11-18", endDate: "2025-12-01", status: "active" as const },
  { id: "sprint-2", name: "Sprint 47 - Nov 2025", startDate: "2025-11-04", endDate: "2025-11-17", status: "completed" as const },
  { id: "sprint-3", name: "Sprint 46 - Out 2025", startDate: "2025-10-21", endDate: "2025-11-03", status: "completed" as const },
];

const mockCards: KanbanCard[] = [
  {
    id: "TASK-001",
    title: "Implementar autenticacao com Supabase",
    description: "Configurar Supabase Auth com JWT e integrar com Doppler para gerenciamento de secrets",
    status: "in-progress",
    assignee: { id: "user-1", name: "Luis Boff" },
    sprint: "sprint-1",
    priority: "high",
    estimatedHours: 8,
    completedHours: 5,
    tags: ["backend", "auth"],
    comments: [
      {
        id: "c1",
        author: { id: "user-1", name: "Luis Boff" },
        content: "Ja configurei o client do Supabase, falta integrar com o Doppler",
        mentions: [],
        createdAt: "2025-11-28T10:30:00Z",
      },
    ],
    createdAt: "2025-11-25T09:00:00Z",
    updatedAt: "2025-11-28T10:30:00Z",
  },
  {
    id: "TASK-002",
    title: "Criar componentes do Kanban Board",
    description: "Desenvolver KanbanCard, KanbanColumn e KanbanFilters com filtros por sprint e pessoa",
    status: "done",
    assignee: { id: "user-1", name: "Luis Boff" },
    sprint: "sprint-1",
    priority: "high",
    estimatedHours: 6,
    completedHours: 6,
    tags: ["frontend", "kanban"],
    comments: [],
    createdAt: "2025-11-27T14:00:00Z",
    updatedAt: "2025-11-30T16:00:00Z",
  },
  {
    id: "TASK-003",
    title: "Configurar Capacitor para mobile",
    description: "Setup inicial do Capacitor e helper de API para detectar Desktop vs Mobile",
    status: "review",
    assignee: { id: "user-2", name: "Maria Silva" },
    sprint: "sprint-1",
    priority: "medium",
    estimatedHours: 10,
    completedHours: 9,
    tags: ["mobile", "capacitor"],
    comments: [],
    createdAt: "2025-11-26T11:00:00Z",
    updatedAt: "2025-11-29T15:00:00Z",
  },
  {
    id: "TASK-004",
    title: "Refatorar sidebar para ser colapsavel",
    description: "Adicionar funcionalidade de expandir/colapsar sidebar com estado no Zustand",
    status: "todo",
    assignee: null,
    sprint: "sprint-1",
    priority: "low",
    estimatedHours: 3,
    completedHours: 0,
    tags: ["frontend", "ui"],
    comments: [],
    createdAt: "2025-11-29T09:00:00Z",
    updatedAt: "2025-11-29T09:00:00Z",
  },
  {
    id: "TASK-005",
    title: "Implementar RAG Insights",
    description: "Criar modulo de IA para insights automaticos usando RAG",
    status: "backlog",
    assignee: null,
    sprint: null,
    priority: "medium",
    estimatedHours: 20,
    completedHours: 0,
    tags: ["ai", "backend"],
    comments: [],
    createdAt: "2025-11-20T08:00:00Z",
    updatedAt: "2025-11-20T08:00:00Z",
  },
  {
    id: "TASK-006",
    title: "Design system com cores mais claras",
    description: "Ajustar paleta de cores para ter background menos escuro e melhor legibilidade",
    status: "done",
    assignee: { id: "user-1", name: "Luis Boff" },
    sprint: "sprint-2",
    priority: "medium",
    estimatedHours: 4,
    completedHours: 4,
    tags: ["design", "ui"],
    comments: [],
    createdAt: "2025-11-15T10:00:00Z",
    updatedAt: "2025-11-17T14:00:00Z",
  },
];

export default function ProjetosPage() {
  const { cards, setCards, setSprints, filter } = useKanbanStore();

  useEffect(() => {
    setCards(mockCards);
    setSprints(mockSprints);
  }, [setCards, setSprints]);

  // Filter cards based on current filters
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (filter.sprint && card.sprint !== filter.sprint) return false;
      if (filter.assignee && card.assignee?.id !== filter.assignee) return false;
      if (filter.status && card.status !== filter.status) return false;
      if (filter.search) {
        const search = filter.search.toLowerCase();
        return (
          card.title.toLowerCase().includes(search) ||
          card.description.toLowerCase().includes(search) ||
          card.id.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [cards, filter]);

  const columns = [
    { title: "Backlog", status: "backlog" as const },
    { title: "A Fazer", status: "todo" as const },
    { title: "Em Progresso", status: "in-progress" as const },
    { title: "Em Revisao", status: "review" as const },
    { title: "Concluido", status: "done" as const },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Kanban Board</h1>
          <p className="mt-1 text-sm text-slate-400">Gerencie suas tarefas e sprints</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-700">
          <Plus className="h-5 w-5" />
          Nova Tarefa
        </button>
      </div>

      {/* Filters */}
      <KanbanFilters />

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4">
          {columns.map((column) => {
            const columnCards = filteredCards.filter((card) => card.status === column.status);
            return (
              <KanbanColumn
                key={column.status}
                title={column.title}
                status={column.status}
                cards={columnCards}
                count={columnCards.length}
              />
            );
          })}
        </div>
      </div>

      {/* Card Modal */}
      <KanbanCardModal />
    </div>
  );
}
