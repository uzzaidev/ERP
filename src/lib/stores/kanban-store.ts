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
  
  // Actions
  setCards: (cards: KanbanCard[]) => void;
  addCard: (card: KanbanCard) => void;
  updateCard: (id: string, updates: Partial<KanbanCard>) => void;
  deleteCard: (id: string) => void;
  moveCard: (id: string, status: KanbanCard["status"]) => void;
  
  setSprints: (sprints: Sprint[]) => void;
  setUsers: (users: User[]) => void;
  setFilter: (filter: Partial<KanbanFilter>) => void;
  resetFilter: () => void;
  
  openCardModal: (card: KanbanCard) => void;
  closeCardModal: () => void;
  
  addComment: (cardId: string, comment: string, mentions: string[]) => void;
  updateTimeTracking: (cardId: string, completed: number) => void;
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
  
  setFilter: (filter) => set((state) => ({
    filter: { ...state.filter, ...filter },
  })),
  
  resetFilter: () => set({ filter: defaultFilter }),
  
  openCardModal: (card) => set({ selectedCard: card, isCardModalOpen: true }),
  
  closeCardModal: () => set({ selectedCard: null, isCardModalOpen: false }),
  
  addComment: (cardId, content, mentions) => set((state) => ({
    cards: state.cards.map((card) =>
      card.id === cardId
        ? {
            ...card,
            comments: [
              ...card.comments,
              {
                id: `comment-${Date.now()}`,
                author: { id: "current-user", full_name: "Luis Boff" },
                content,
                mentions,
                createdAt: new Date().toISOString(),
              },
            ],
            updatedAt: new Date().toISOString(),
          }
        : card
    ),
  })),
  
  updateTimeTracking: (cardId, completed) => set((state) => ({
    cards: state.cards.map((card) =>
      card.id === cardId
        ? {
            ...card,
            completedHours: completed,
            updatedAt: new Date().toISOString(),
          }
        : card
    ),
  })),
}));
