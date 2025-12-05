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

// Sprint creation schema
const createSprintSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  goal: z.string().optional(),
  start_date: z.string().min(1, "Data de início é obrigatória"),
  end_date: z.string().min(1, "Data de término é obrigatória"),
  project_id: z.string().optional(),
  status: z.enum(["planned", "active", "completed"]).default("planned"),
});

type CreateSprintFormData = z.infer<typeof createSprintSchema>;

interface CreateSprintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Project {
  id: string;
  code: string;
  name: string;
}

export function CreateSprintModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateSprintModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateSprintFormData>({
    resolver: zodResolver(createSprintSchema),
    defaultValues: {
      status: "planned",
    },
  });

  // Fetch projects when modal opens
  useEffect(() => {
    if (open) {
      fetchProjects();
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

  const onSubmit = async (data: CreateSprintFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/sprints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao criar sprint");
      }

      // Success
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating sprint:", error);
      alert(error instanceof Error ? error.message : "Erro ao criar sprint");
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
              Nova Sprint
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
              {isSubmitting ? "Criando..." : "Criar Sprint"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
