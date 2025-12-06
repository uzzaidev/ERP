"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MeetingEffectiveness as Meeting } from "@/types/entities";
import { EffectivenessScore } from "./EffectivenessScore";

// Meeting edit schema
const editMeetingSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(255, "Título muito longo"),
  date: z.string().min(1, "Data é obrigatória"),
  decisionsCount: z.number().min(0).default(0),
  actionsCount: z.number().min(0).default(0),
  kaizensCount: z.number().min(0).default(0),
  blockersCount: z.number().min(0).default(0),
  notes: z.string().optional(),
  relatedProjectId: z.string().optional(),
});

type EditMeetingFormData = z.infer<typeof editMeetingSchema>;

interface EditMeetingModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  meeting: Meeting | null;
}

interface Project {
  id: string;
  code: string;
  name: string;
}

export function EditMeetingModal({
  open,
  onClose,
  onSuccess,
  meeting,
}: EditMeetingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [previewScore, setPreviewScore] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<EditMeetingFormData>({
    resolver: zodResolver(editMeetingSchema),
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

  // Load meeting data when modal opens or meeting changes
  useEffect(() => {
    if (open && meeting) {
      // Use reset to properly initialize all form values at once
      reset({
        title: meeting.title,
        date: meeting.date,
        decisionsCount: meeting.decisionsCount,
        actionsCount: meeting.actionsCount,
        kaizensCount: meeting.kaizensCount,
        blockersCount: meeting.blockersCount,
        notes: meeting.notes || "",
        relatedProjectId: meeting.relatedProjectId || "none",
      });
      
      fetchProjects();
    }
  }, [open, meeting, reset]);

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

  const onSubmit = async (data: EditMeetingFormData) => {
    if (!meeting) return;
    
    try {
      setIsSubmitting(true);

      const payload = {
        ...data,
        // Ensure relatedProjectId is either a valid UUID or undefined, never empty string
        relatedProjectId: data.relatedProjectId || undefined,
      };

      const response = await fetch(`/api/meetings/${meeting.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        reset();
        onClose();
        onSuccess?.();
      } else {
        alert(result.error || "Erro ao atualizar reunião");
      }
    } catch (error) {
      console.error("Error updating meeting:", error);
      alert("Erro ao atualizar reunião");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!meeting) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/meetings/${meeting.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setShowDeleteDialog(false);
        onClose();
        onSuccess?.();
      } else {
        alert(result.error || "Erro ao deletar reunião");
      }
    } catch (error) {
      console.error("Error deleting meeting:", error);
      alert("Erro ao deletar reunião");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!meeting) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">
                Editar Reunião {meeting.code}
              </DialogTitle>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </Button>
            </div>
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
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar a reunião <strong>{meeting.code}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
