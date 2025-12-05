"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Task creation schema
const createTaskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(255, "Título muito longo"),
  description: z.string().optional(),
  status: z.enum(["backlog", "todo", "in-progress", "review", "done", "blocked"]).default("backlog"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  task_type: z.enum(["feature", "bug", "improvement", "documentation"]).default("feature"),
  assignee_id: z.string().optional(),
  project_id: z.string().optional(),
  sprint_id: z.string().optional(),
  due_date: z.string().optional(),
  estimated_hours: z.number().min(0).optional(),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Project {
  id: string;
  code: string;
  name: string;
}

interface Sprint {
  id: string;
  name: string;
  code: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
}

export function CreateTaskModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      status: "backlog",
      priority: "medium",
      task_type: "feature",
    },
  });

  // Fetch projects, sprints, and users when modal opens
  useEffect(() => {
    if (open) {
      fetchProjects();
      fetchSprints();
      fetchUsers();
    }
  }, [open]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      if (data.success && data.data) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchSprints = async () => {
    try {
      const response = await fetch("/api/sprints");
      const data = await response.json();
      if (data.success && data.data) {
        setSprints(data.data);
      }
    } catch (error) {
      console.error("Error fetching sprints:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (data.success && data.data) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const onSubmit = async (data: CreateTaskFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao criar tarefa");
      }

      // Success
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating task:", error);
      alert(error instanceof Error ? error.message : "Erro ao criar tarefa");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-card-foreground">
              Nova Tarefa
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-card-foreground">
              Título *
            </Label>
            <Input
              id="title"
              {...register("title")}
              className="mt-1 bg-background border-input text-foreground"
              placeholder="Digite o título da tarefa"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-card-foreground">
              Descrição
            </Label>
            <textarea
              id="description"
              {...register("description")}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
              rows={4}
              placeholder="Descreva a tarefa em detalhes"
            />
          </div>

          {/* Grid for form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <Label htmlFor="status" className="text-card-foreground">
                Status
              </Label>
              <select
                id="status"
                {...register("status")}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">A Fazer</option>
                <option value="in-progress">Em Progresso</option>
                <option value="review">Em Revisão</option>
                <option value="done">Concluído</option>
                <option value="blocked">Bloqueado</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <Label htmlFor="priority" className="text-card-foreground">
                Prioridade
              </Label>
              <select
                id="priority"
                {...register("priority")}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>

            {/* Task Type */}
            <div>
              <Label htmlFor="task_type" className="text-card-foreground">
                Tipo
              </Label>
              <select
                id="task_type"
                {...register("task_type")}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                <option value="feature">Feature</option>
                <option value="bug">Bug</option>
                <option value="improvement">Melhoria</option>
                <option value="documentation">Documentação</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <Label htmlFor="assignee_id" className="text-card-foreground">
                Responsável
              </Label>
              <select
                id="assignee_id"
                {...register("assignee_id")}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                <option value="">Não atribuído</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Project */}
            <div>
              <Label htmlFor="project_id" className="text-card-foreground">
                Projeto
              </Label>
              <select
                id="project_id"
                {...register("project_id")}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                <option value="">Sem projeto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.code} - {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sprint */}
            <div>
              <Label htmlFor="sprint_id" className="text-card-foreground">
                Sprint
              </Label>
              <select
                id="sprint_id"
                {...register("sprint_id")}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                <option value="">Sem sprint</option>
                {sprints.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.code || sprint.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <Label htmlFor="due_date" className="text-card-foreground">
                Data de Entrega
              </Label>
              <Input
                id="due_date"
                type="date"
                {...register("due_date")}
                className="mt-1 bg-background border-input text-foreground"
              />
            </div>

            {/* Estimated Hours */}
            <div>
              <Label htmlFor="estimated_hours" className="text-card-foreground">
                Horas Estimadas
              </Label>
              <Input
                id="estimated_hours"
                type="number"
                step="0.5"
                min="0"
                {...register("estimated_hours", { valueAsNumber: true })}
                className="mt-1 bg-background border-input text-foreground"
                placeholder="0"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="border-border bg-background text-foreground hover:bg-muted"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? "Criando..." : "Criar Tarefa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
