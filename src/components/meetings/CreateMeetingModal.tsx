"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EffectivenessScore } from "./EffectivenessScore";

// Meeting creation schema
const createMeetingSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(255, "Título muito longo"),
  date: z.string().min(1, "Data é obrigatória"),
  decisionsCount: z.number().min(0).default(0),
  actionsCount: z.number().min(0).default(0),
  kaizensCount: z.number().min(0).default(0),
  blockersCount: z.number().min(0).default(0),
  notes: z.string().optional(),
  relatedProjectId: z.string().optional(),
});

type CreateMeetingFormData = z.infer<typeof createMeetingSchema>;

interface CreateMeetingModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Project {
  id: string;
  code: string;
  name: string;
}

export function CreateMeetingModal({
  open,
  onClose,
  onSuccess,
}: CreateMeetingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [previewScore, setPreviewScore] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateMeetingFormData>({
    resolver: zodResolver(createMeetingSchema),
    defaultValues: {
      decisionsCount: 0,
      actionsCount: 0,
      kaizensCount: 0,
      blockersCount: 0,
      date: new Date().toISOString().split('T')[0], // Today's date
    },
  });

  const decisionsCount = watch("decisionsCount");
  const actionsCount = watch("actionsCount");
  const kaizensCount = watch("kaizensCount");
  const blockersCount = watch("blockersCount");

  // Calculate preview score
  useEffect(() => {
    const score = Math.floor(
      (decisionsCount * 12 + actionsCount * 8 + kaizensCount * 15 + blockersCount * 5) / 4
    );
    setPreviewScore(score);
  }, [decisionsCount, actionsCount, kaizensCount, blockersCount]);

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

  const onSubmit = async (data: CreateMeetingFormData) => {
    try {
      setIsSubmitting(true);

      const payload = {
        ...data,
        // Ensure relatedProjectId is either a valid UUID or undefined, never empty string
        relatedProjectId: data.relatedProjectId || undefined,
      };

      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        reset();
        onClose();
        onSuccess?.();
      } else {
        alert(result.error || "Erro ao criar reunião");
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      alert("Erro ao criar reunião");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Criar Nova Reunião</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Ex: Sprint Planning - Q4 2025"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              {...register("date")}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          {/* Related Project */}
          <div className="space-y-2">
            <Label htmlFor="relatedProjectId">Projeto Relacionado</Label>
            <Select
              value={watch("relatedProjectId") || "none"}
              onValueChange={(value) => setValue("relatedProjectId", value === "none" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um projeto (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.code} - {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Outputs Section */}
          <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <h3 className="font-semibold text-lg">Outputs da Reunião</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Decisions Count */}
              <div className="space-y-2">
                <Label htmlFor="decisionsCount">Decisões (×12)</Label>
                <Input
                  id="decisionsCount"
                  type="number"
                  min="0"
                  {...register("decisionsCount", { valueAsNumber: true })}
                />
              </div>

              {/* Actions Count */}
              <div className="space-y-2">
                <Label htmlFor="actionsCount">Ações (×8)</Label>
                <Input
                  id="actionsCount"
                  type="number"
                  min="0"
                  {...register("actionsCount", { valueAsNumber: true })}
                />
              </div>

              {/* Kaizens Count */}
              <div className="space-y-2">
                <Label htmlFor="kaizensCount">Kaizens (×15)</Label>
                <Input
                  id="kaizensCount"
                  type="number"
                  min="0"
                  {...register("kaizensCount", { valueAsNumber: true })}
                />
              </div>

              {/* Blockers Count */}
              <div className="space-y-2">
                <Label htmlFor="blockersCount">Bloqueios (×5)</Label>
                <Input
                  id="blockersCount"
                  type="number"
                  min="0"
                  {...register("blockersCount", { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Score Preview */}
            <div className="pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  Effectiveness Score:
                </span>
                <EffectivenessScore score={previewScore} />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Fórmula: (decisões×12 + ações×8 + kaizens×15 + bloqueios×5) / 4
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Anotações gerais sobre a reunião"
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar Reunião"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
