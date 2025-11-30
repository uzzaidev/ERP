"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { KanbanColumn, KanbanFilters, KanbanCardModal, KanbanCard as KanbanCardComponent } from "@/components/kanban";
import { useKanbanStore } from "@/lib/stores";
import type { KanbanCard } from "@/types/kanban";

export default function KanbanPage() {
  const { cards, setCards, setSprints, filter, setUsers, setCurrentUser } = useKanbanStore();
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch current user
        const currentUserRes = await fetch('/api/auth/me');
        const currentUserData = await currentUserRes.json();
        if (currentUserData.user) {
          setCurrentUser(currentUserData.user);
        }
        
        // Fetch sprints
        const sprintsRes = await fetch('/api/sprints');
        const sprintsData = await sprintsRes.json();
        if (sprintsData.data) {
          setSprints(sprintsData.data);
        }

        // Fetch users
        const usersRes = await fetch('/api/users');
        const usersData = await usersRes.json();
        if (usersData.data) {
          setUsers(usersData.data);
        }

        // Fetch tasks
        const tasksRes = await fetch('/api/tasks');
        const tasksData = await tasksRes.json();
        if (tasksData.data) {
          // Transform database tasks to KanbanCard format
          const transformedCards: KanbanCard[] = tasksData.data.map((task: {
            code?: string;
            id: string;
            title: string;
            description?: string;
            status: string;
            priority: string;
            project_id: string;
            sprint_id: string;
            assignee_id?: string;
            estimated_hours?: number;
            completed_hours?: number;
            due_date?: string;
            created_at: string;
            updated_at: string;
            assignee?: { id: string; full_name: string; email: string; avatar_url?: string };
            task_tags?: Array<{ tag?: { name: string } }>;
          }) => ({
            id: task.code || task.id,
            title: task.title,
            description: task.description || '',
            status: task.status,
            assignee: task.assignee ? {
              id: task.assignee.id,
              full_name: task.assignee.full_name,
              email: task.assignee.email,
              avatar: task.assignee.avatar_url
            } : null,
            sprint: task.sprint_id,
            priority: task.priority,
            estimatedHours: task.estimated_hours || 0,
            completedHours: task.completed_hours || 0,
            tags: task.task_tags?.map((tt) => tt.tag?.name).filter(Boolean) || [],
            comments: [],
            createdAt: task.created_at,
            updatedAt: task.updated_at,
            dbId: task.id, // Store database ID for updates
            projectId: task.project_id, // Store project ID for filtering
          }));
          setCards(transformedCards);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [setCards, setSprints, setUsers, setCurrentUser]);

  // Filter cards based on current filters
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (filter.sprint && card.sprint !== filter.sprint) return false;
      if (filter.assignee && card.assignee?.id !== filter.assignee) return false;
      if (filter.status && card.status !== filter.status) return false;
      if (filter.project && card.projectId !== filter.project) return false;
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

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const cardId = event.active.id as string;
    const card = cards.find(c => c.id === cardId);
    setActiveCard(card || null);
  }, [cards]);

  const handleCardDrop = useCallback(async (cardId: string, newStatus: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card || !card.dbId) return;

    try {
      // Optimistic update
      const updatedCards = cards.map(c =>
        c.id === cardId ? { ...c, status: newStatus as KanbanCard["status"] } : c
      );
      setCards(updatedCards);

      // Update in database
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: card.dbId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert optimistic update on error
      const revertedCards = cards.map(c =>
        c.id === cardId ? card : c
      );
      setCards(revertedCards);
    }
  }, [cards, setCards]);

  // Handle drag and drop to update task status
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveCard(null);
    
    if (!over) return;
    
    const cardId = active.id as string;
    
    // Check if dropped over a column (droppable) or another card (sortable)
    const overId = over.id as string;
    
    // If dropped over another card, find that card's status
    const overCard = cards.find(c => c.id === overId);
    const newStatus = overCard ? overCard.status : overId;
    
    // Only update if it's a valid status and different from current
    const validStatuses = ['backlog', 'todo', 'in-progress', 'review', 'done'];
    if (!validStatuses.includes(newStatus)) return;
    
    const currentCard = cards.find(c => c.id === cardId);
    if (currentCard?.status === newStatus) return;
    
    handleCardDrop(cardId, newStatus);
  }, [handleCardDrop, cards]);

  // Handle assignee change
  const handleAssigneeChange = useCallback(async (cardId: string, userId: string | null | undefined) => {
    const card = cards.find(c => c.id === cardId);
    if (!card || !card.dbId) return;

    try {
      // Update in database
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: card.dbId, assignee_id: userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task assignee');
      }

      const result = await response.json();
      
      // Update local state with server response
      if (result.data) {
        const updatedCard: KanbanCard = {
          ...card,
          assignee: result.data.assignee ? {
            id: result.data.assignee.id,
            full_name: result.data.assignee.full_name,
            email: result.data.assignee.email,
            avatar: result.data.assignee.avatar_url
          } : null,
        };
        
        const updatedCards = cards.map(c => c.id === cardId ? updatedCard : c);
        setCards(updatedCards);
      }
    } catch (error) {
      console.error('Error updating task assignee:', error);
    }
  }, [cards, setCards]);

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

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-400">Carregando tarefas...</div>
        </div>
      ) : (
        /* Kanban Board */
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
                    onAssigneeChange={handleAssigneeChange}
                  />
                );
              })}
            </div>
          </div>
          <DragOverlay>
            {activeCard ? (
              <div className="rotate-3 scale-105 opacity-90">
                <KanbanCardComponent card={activeCard} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Card Modal */}
      <KanbanCardModal onAssigneeChange={handleAssigneeChange} />
    </div>
  );
}
