import { create } from "zustand";
import type { KanbanCard, Sprint, KanbanFilter } from "@/types/kanban";

interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

interface KanbanState {
  cards: KanbanCard[];
  sprints: Sprint[];
  users: User[];
  filter: KanbanFilter;
  selectedCard: KanbanCard | null;
  isCardModalOpen: boolean;
  currentUser: User | null;
  
  // Actions
  setCards: (cards: KanbanCard[]) => void;
  addCard: (card: KanbanCard) => void;
  updateCard: (id: string, updates: Partial<KanbanCard>) => void;
  deleteCard: (id: string) => void;
  moveCard: (id: string, status: KanbanCard["status"]) => void;
  
  setSprints: (sprints: Sprint[]) => void;
  setUsers: (users: User[]) => void;
  setCurrentUser: (user: User) => void;
  setFilter: (filter: Partial<KanbanFilter>) => void;
  resetFilter: () => void;
  
  openCardModal: (card: KanbanCard) => Promise<void>;
  closeCardModal: () => void;

  addComment: (cardId: string, comment: string, mentions: string[]) => Promise<void>;
  updateTimeTracking: (cardId: string, completed: number) => Promise<void>;
}

const defaultFilter: KanbanFilter = {
  sprint: null,
  assignee: null,
  status: null,
  project: null,
  search: "",
};

export const useKanbanStore = create<KanbanState>((set) => ({
  cards: [],
  sprints: [],
  users: [],
  filter: defaultFilter,
  selectedCard: null,
  isCardModalOpen: false,
  currentUser: null,
  
  setCards: (cards) => set({ cards }),
  
  addCard: (card) => set((state) => ({ 
    cards: [...state.cards, card] 
  })),
  
  updateCard: (id, updates) => set((state) => ({
    cards: state.cards.map((card) =>
      card.id === id ? { ...card, ...updates, updatedAt: new Date().toISOString() } : card
    ),
  })),
  
  deleteCard: (id) => set((state) => ({
    cards: state.cards.filter((card) => card.id !== id),
  })),
  
  moveCard: (id, status) => set((state) => ({
    cards: state.cards.map((card) =>
      card.id === id ? { ...card, status, updatedAt: new Date().toISOString() } : card
    ),
  })),
  
  setSprints: (sprints) => set({ sprints }),
  
  setUsers: (users) => set({ users }),
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  setFilter: (filter) => set((state) => ({
    filter: { ...state.filter, ...filter },
  })),
  
  resetFilter: () => set({ filter: defaultFilter }),
  
  openCardModal: async (card) => {
    set({ selectedCard: card, isCardModalOpen: true });

    // Load comments for this card
    if (card.dbId) {
      try {
        const response = await fetch(`/api/tasks/${card.dbId}/comments`);
        const result = await response.json();

        if (result.success && result.data) {
          // Update the card with loaded comments
          set((state) => ({
            selectedCard: state.selectedCard?.id === card.id
              ? { ...state.selectedCard, comments: result.data }
              : state.selectedCard,
            cards: state.cards.map((c) =>
              c.id === card.id
                ? { ...c, comments: result.data }
                : c
            ),
          }));
        }
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    }
  },
  
  closeCardModal: () => set({ selectedCard: null, isCardModalOpen: false }),
  
  addComment: async (cardId, content, mentions) => {
    // Find the card and get its dbId
    const state = useKanbanStore.getState();
    const card = state.cards.find(c => c.id === cardId);

    if (!card || !card.dbId) {
      console.error('Card not found or missing dbId:', cardId);
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${card.dbId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mentions }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to add comment');
      }

      // Update local state with the comment from API
      const newComment = {
        id: result.data.id,
        author: result.data.author || state.currentUser || {
          id: "current-user",
          full_name: "Usuário",
          email: ""
        },
        content: result.data.content,
        mentions: result.data.mentions || [],
        createdAt: result.data.createdAt,
      };

      set((state) => {
        const updatedCards = state.cards.map((c) =>
          c.id === cardId
            ? {
                ...c,
                comments: [...c.comments, newComment],
                updatedAt: new Date().toISOString(),
              }
            : c
        );

        const updatedSelectedCard = state.selectedCard?.id === cardId
          ? {
              ...state.selectedCard,
              comments: [...state.selectedCard.comments, newComment],
              updatedAt: new Date().toISOString(),
            }
          : state.selectedCard;

        return {
          cards: updatedCards,
          selectedCard: updatedSelectedCard,
        };
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Erro ao adicionar comentário');
    }
  },
  
  updateTimeTracking: async (cardId, completed) => {
    // Find the card and get its dbId
    const state = useKanbanStore.getState();
    const card = state.cards.find(c => c.id === cardId);

    if (!card || !card.dbId) {
      console.error('Card not found or missing dbId:', cardId);
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${card.dbId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed_hours: completed }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update time tracking');
      }

      // Update local state
      set((state) => {
        const updatedCards = state.cards.map((c) =>
          c.id === cardId
            ? {
                ...c,
                completedHours: completed,
                updatedAt: new Date().toISOString(),
              }
            : c
        );

        const updatedSelectedCard = state.selectedCard?.id === cardId
          ? {
              ...state.selectedCard,
              completedHours: completed,
              updatedAt: new Date().toISOString(),
            }
          : state.selectedCard;

        return {
          cards: updatedCards,
          selectedCard: updatedSelectedCard,
        };
      });
    } catch (error) {
      console.error('Error updating time tracking:', error);
      alert('Erro ao salvar horas trabalhadas');
    }
  },
}));
