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

// Project update schema
const updateProjectSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  description: z.string().optional(),
  status: z.enum(["active", "on_hold", "completed", "cancelled"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  estimated_hours: z.coerce.number().min(0).optional(),
  budget: z.coerce.number().min(0).optional(),
  spent: z.coerce.number().min(0).optional(),
  client_name: z.string().optional(),
  client_contact: z.string().optional(),
  client_email: z.string().email("Email inválido").optional().or(z.literal("")),
  owner_id: z.string().optional(),
});

type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;

interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  budget?: number;
  spent?: number;
  client_name?: string;
  client_contact?: string;
  client_email?: string;
  owner_id?: string;
}

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onSuccess?: () => void;
}

interface User {
  id: string;
  full_name: string;
  email: string;
}

export function EditProjectModal({
  open,
  onOpenChange,
  project,
  onSuccess,
}: EditProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProjectFormData>({
    resolver: zodResolver(updateProjectSchema),
  });

  // Load project data when modal opens or project changes
  useEffect(() => {
    if (open && project) {
      reset({
        name: project.name,
        description: project.description || "",
        status: project.status as "active" | "on_hold" | "completed" | "cancelled",
        priority: project.priority as "low" | "medium" | "high" | "critical",
        start_date: project.start_date || "",
        end_date: project.end_date || "",
        estimated_hours: project.estimated_hours || 0,
        budget: project.budget || 0,
        spent: project.spent || 0,
        client_name: project.client_name || "",
        client_contact: project.client_contact || "",
        client_email: project.client_email || "",
        owner_id: project.owner_id || "",
      });
      fetchUsers();
    }
  }, [open, project, reset]);

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

  const onSubmit = async (data: UpdateProjectFormData) => {
    if (!project) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao atualizar projeto");
      }

      // Success
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating project:", error);
      alert(error instanceof Error ? error.message : "Erro ao atualizar projeto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao excluir projeto");
      }

      // Success
      setShowDeleteDialog(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error deleting project:", error);
      alert(error instanceof Error ? error.message : "Erro ao excluir projeto");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!project) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700/50">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold text-white">
                  Editar Projeto
                </DialogTitle>
                <p className="text-sm text-slate-400 mt-1">
                  Código: {project.code}
                </p>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-700 pb-2">
                Informações Básicas
              </h3>
              
              {/* Name */}
              <div>
                <Label htmlFor="name" className="text-slate-300">
                  Nome do Projeto *
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="mt-1 bg-slate-800 border-slate-700 text-white"
                  placeholder="Digite o nome do projeto"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-slate-300">
                  Descrição
                </Label>
                <textarea
                  id="description"
                  {...register("description")}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  rows={3}
                  placeholder="Descreva o projeto"
                />
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status" className="text-slate-300">
                    Status
                  </Label>
                  <select
                    id="status"
                    {...register("status")}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="active">Ativo</option>
                    <option value="on_hold">Em Espera</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="priority" className="text-slate-300">
                    Prioridade
                  </Label>
                  <select
                    id="priority"
                    {...register("priority")}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Timeline and Budget */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-700 pb-2">
                Cronograma e Orçamento
              </h3>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date" className="text-slate-300">
                    Data de Início
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    {...register("start_date")}
                    className="mt-1 bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="end_date" className="text-slate-300">
                    Data de Término
                  </Label>
                  <Input
                    id="end_date"
                    type="date"
                    {...register("end_date")}
                    className="mt-1 bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Hours and Budget */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="estimated_hours" className="text-slate-300">
                    Horas Estimadas
                  </Label>
                  <Input
                    id="estimated_hours"
                    type="number"
                    step="0.01"
                    {...register("estimated_hours")}
                    className="mt-1 bg-slate-800 border-slate-700 text-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="budget" className="text-slate-300">
                    Orçamento (R$)
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    {...register("budget")}
                    className="mt-1 bg-slate-800 border-slate-700 text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="spent" className="text-slate-300">
                    Gasto (R$)
                  </Label>
                  <Input
                    id="spent"
                    type="number"
                    step="0.01"
                    {...register("spent")}
                    className="mt-1 bg-slate-800 border-slate-700 text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-700 pb-2">
                Informações do Cliente
              </h3>

              <div>
                <Label htmlFor="client_name" className="text-slate-300">
                  Nome do Cliente
                </Label>
                <Input
                  id="client_name"
                  {...register("client_name")}
                  className="mt-1 bg-slate-800 border-slate-700 text-white"
                  placeholder="Nome ou empresa do cliente"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_contact" className="text-slate-300">
                    Contato
                  </Label>
                  <Input
                    id="client_contact"
                    {...register("client_contact")}
                    className="mt-1 bg-slate-800 border-slate-700 text-white"
                    placeholder="Telefone ou contato"
                  />
                </div>

                <div>
                  <Label htmlFor="client_email" className="text-slate-300">
                    Email do Cliente
                  </Label>
                  <Input
                    id="client_email"
                    type="email"
                    {...register("client_email")}
                    className="mt-1 bg-slate-800 border-slate-700 text-white"
                    placeholder="cliente@example.com"
                  />
                  {errors.client_email && (
                    <p className="mt-1 text-sm text-red-400">{errors.client_email.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Owner */}
            <div>
              <Label htmlFor="owner_id" className="text-slate-300">
                Responsável pelo Projeto
              </Label>
              <select
                id="owner_id"
                {...register("owner_id")}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="">Sem responsável</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t border-slate-700">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Projeto
              </Button>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
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
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Excluir Projeto?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Tem certeza que deseja excluir o projeto <strong>{project.name}</strong>?
              <br />
              <br />
              Esta ação não pode ser desfeita. Todas as tarefas, sprints e dados
              relacionados a este projeto também serão excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300 hover:bg-slate-800">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Sim, Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
