"use client";

import { useState, useEffect } from "react";
import { X, Calendar, User, Clock, CheckSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TaskComments } from "./TaskComments";
import { TimeLogEntry } from "./TimeLogEntry";
import { TagSelector } from "@/components/tags/TagSelector";

interface TaskDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string | null;
  onSuccess?: () => void;
}

interface Task {
  id: string;
  code: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  task_type: string;
  assignee_id?: string;
  assignee?: {
    id: string;
    full_name: string;
  };
  project_id?: string;
  project?: {
    code: string;
    name: string;
  };
  sprint_id?: string;
  sprint?: {
    name: string;
  };
  due_date?: string;
  estimated_hours?: number;
  completed_hours?: number;
}

export function TaskDetailModal({
  open,
  onOpenChange,
  taskId,
  onSuccess,
}: TaskDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [taskTags, setTaskTags] = useState<Array<{id: string; name: string; color: string}>>([]);
  const [completedHours, setCompletedHours] = useState<number>(0);

  // Editable fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("backlog");
  const [priority, setPriority] = useState("medium");
  const [taskType, setTaskType] = useState("feature");

  useEffect(() => {
    if (open && taskId) {
      fetchTaskDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, taskId]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority);
      setTaskType(task.task_type);
      setCompletedHours(task.completed_hours || 0);
    }
  }, [task]);

  const fetchTaskDetails = async () => {
    if (!taskId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
      const data = await response.json();
      if (data.success && data.data) {
        setTask(data.data);
        if (data.data.task_tags) {
          type TagType = { id: string; name: string; color: string };
          const tags = data.data.task_tags
            .map((tt: { tag?: TagType }) => tt.tag)
            .filter((tag: TagType | undefined): tag is TagType => tag !== undefined);
          setTaskTags(tags);
        }
      }
    } catch (error) {
      console.error("Error fetching task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (field: string, value: string) => {
    if (!taskId) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar");
      }

      // Refresh task data
      fetchTaskDetails();
      onSuccess?.();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Erro ao salvar alteração");
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-card border-border">
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-card border-border flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
              <span className="text-muted-foreground font-mono text-sm">{task.code}</span>
              <span>{task.title}</span>
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Main Content - Left Side (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <Label className="text-card-foreground text-xs text-muted-foreground">Título</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => handleSave("title", title)}
                  className="mt-1 text-lg font-medium bg-background border-input text-foreground"
                />
              </div>

              {/* Description */}
              <div>
                <Label className="text-card-foreground text-xs text-muted-foreground">Descrição</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => handleSave("description", description)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 min-h-[100px]"
                  placeholder="Adicione uma descrição..."
                />
              </div>

              {/* Tags */}
              <div>
                <Label className="text-card-foreground text-xs text-muted-foreground mb-2 block">Tags</Label>
                <TagSelector
                  taskId={taskId || undefined}
                  selectedTags={taskTags}
                  onTagsChange={setTaskTags}
                />
              </div>

              {/* Comments */}
              <div className="border-t border-border pt-6">
                <TaskComments taskId={taskId!} />
              </div>
            </div>

            {/* Sidebar - Right Side (1/3) */}
            <div className="space-y-6">
              {/* Status & Priority */}
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      handleSave("status", e.target.value);
                    }}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="todo">A Fazer</option>
                    <option value="in-progress">Em Progresso</option>
                    <option value="review">Em Revisão</option>
                    <option value="done">Concluído</option>
                    <option value="blocked">Bloqueado</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Prioridade</Label>
                  <select
                    value={priority}
                    onChange={(e) => {
                      setPriority(e.target.value);
                      handleSave("priority", e.target.value);
                    }}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Tipo</Label>
                  <select
                    value={taskType}
                    onChange={(e) => {
                      setTaskType(e.target.value);
                      handleSave("task_type", e.target.value);
                    }}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="feature">Feature</option>
                    <option value="bug">Bug</option>
                    <option value="improvement">Melhoria</option>
                    <option value="documentation">Documentação</option>
                  </select>
                </div>
              </div>

              {/* Assignment Info */}
              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Responsável:</span>
                  <span className="text-foreground font-medium">
                    {task.assignee?.full_name || "Não atribuído"}
                  </span>
                </div>

                {task.project && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Projeto:</span>
                    <span className="text-foreground font-medium">
                      {task.project.code} - {task.project.name}
                    </span>
                  </div>
                )}

                {task.sprint && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Sprint:</span>
                    <span className="text-foreground font-medium">{task.sprint.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Horas:</span>
                  <span className="text-foreground font-medium">
                    {completedHours.toFixed(1)}h / {task.estimated_hours || 0}h
                  </span>
                </div>
              </div>

              {/* Time Tracking */}
              <div className="border-t border-border pt-4">
                <TimeLogEntry
                  taskId={taskId!}
                  onTimeLogged={(totalHours) => {
                    setCompletedHours(totalHours);
                    fetchTaskDetails();
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
