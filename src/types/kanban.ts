export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  status: "backlog" | "todo" | "in-progress" | "review" | "done";
  assignee: {
    id: string;
    full_name: string;
    email?: string;
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
  dbId?: string; // Database UUID for API updates
  projectId?: string; // Project UUID for filtering
}

export interface KanbanComment {
  id: string;
  author: {
    id: string;
    full_name: string;
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
  project: string | null;
  search: string;
}
