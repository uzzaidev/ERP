export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  status: "backlog" | "todo" | "in-progress" | "review" | "done";
  assignee: {
    id: string;
    name: string;
    avatar?: string;
  } | null;
  sprint: string | null;
  priority: "low" | "medium" | "high" | "critical";
  estimatedHours: number;
  completedHours: number;
  tags: string[];
  comments: KanbanComment[];
  createdAt: string;
  updatedAt: string;
}

export interface KanbanComment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  mentions: string[];
  createdAt: string;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "planned" | "active" | "completed";
}

export interface KanbanFilter {
  sprint: string | null;
  assignee: string | null;
  status: string | null;
  search: string;
}
