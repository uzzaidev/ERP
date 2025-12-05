"use client";

import { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Sprint update schema
const updateSprintSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  goal: z.string().optional(),
  start_date: z.string().min(1, "Data de início é obrigatória"),
  end_date: z.string().min(1, "Data de término é obrigatória"),
  project_id: z.string().optional(),
  status: z.enum(["planned", "active", "completed"]).default("planned"),
});

type UpdateSprintFormData = z.infer<typeof updateSprintSchema>;

interface EditSprintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  sprintId: string | null;
}

interface Project {
  id: string;
  code: string;
  name: string;
}

export function EditSprintModal({
  open,
  onOpenChange,
  onSuccess,
  sprintId,
}: EditSprintModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<UpdateSprintFormData>({
    resolver: zodResolver(updateSprintSchema),
  });

  // Fetch sprint data and projects when modal opens
  useEffect(() => {
    const fetchSprint = async () => {
      if (!sprintId) return;

      try {
        const response = await fetch(`/api/sprints/${sprintId}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          const sprintData = data.data;
          
          // Populate form with sprint data
          setValue("name", sprintData.name);
          setValue("goal", sprintData.goal || "");
          setValue("start_date", sprintData.start_date?.split('T')[0] || "");
          setValue("end_date", sprintData.end_date?.split('T')[0] || "");
          setValue("project_id", sprintData.project_id || "");
          setValue("status", sprintData.status || "planned");
        }
      } catch (error) {
        console.error("Error fetching sprint:", error);
        alert("Erro ao carregar sprint");
      }
    };

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

    if (open && sprintId) {
      fetchSprint();
      fetchProjects();
    }
  }, [open, sprintId, setValue]);

  const onSubmit = async (data: UpdateSprintFormData) => {
    if (!sprintId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/sprints/${sprintId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao atualizar sprint");
      }

      // Success
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating sprint:", error);
      alert(error instanceof Error ? error.message : "Erro ao atualizar sprint");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!sprintId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/sprints/${sprintId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao excluir sprint");
      }

      // Success
      setShowDeleteDialog(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error deleting sprint:", error);
      alert(error instanceof Error ? error.message : "Erro ao excluir sprint");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-card-foreground">
                Editar Sprint
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
            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-card-foreground">
                Nome da Sprint *
              </Label>
              <Input
                id="name"
                {...register("name")}
                className="mt-1 bg-background border-input text-foreground"
                placeholder="Ex: Sprint 2025-W48"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Goal */}
            <div>
              <Label htmlFor="goal" className="text-card-foreground">
                Objetivo Principal
              </Label>
              <textarea
                id="goal"
                {...register("goal")}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
                rows={3}
                placeholder="Descreva o objetivo principal desta sprint"
              />
            </div>

            {/* Grid for form fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <Label htmlFor="start_date" className="text-card-foreground">
                  Data de Início *
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register("start_date")}
                  className="mt-1 bg-background border-input text-foreground"
                />
                {errors.start_date && (
                  <p className="mt-1 text-sm text-destructive">{errors.start_date.message}</p>
                )}
              </div>

              {/* End Date */}
              <div>
                <Label htmlFor="end_date" className="text-card-foreground">
                  Data de Término *
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  {...register("end_date")}
                  className="mt-1 bg-background border-input text-foreground"
                />
                {errors.end_date && (
                  <p className="mt-1 text-sm text-destructive">{errors.end_date.message}</p>
                )}
              </div>

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
                  <option value="planned">Planejada</option>
                  <option value="active">Ativa</option>
                  <option value="completed">Concluída</option>
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
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t border-border">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isSubmitting || isDeleting}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting || isDeleting}
                  className="border-border bg-background text-foreground hover:bg-muted"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isDeleting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-card-foreground">
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja excluir esta sprint? Esta ação não pode ser desfeita.
              As tarefas associadas não serão excluídas, mas perderão a associação com a sprint.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir Sprint"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
