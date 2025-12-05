"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Project edit schema
const editProjectSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  description: z.string().optional(),
  status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget: z.string().optional(),
  client_name: z.string().optional(),
  client_contact: z.string().optional(),
  client_email: z.string().email("Email inválido").optional().or(z.literal("")),
  owner_id: z.string().optional(),
});

type EditProjectFormData = z.infer<typeof editProjectSchema>;

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess?: () => void;
}

interface User {
  id: string;
  full_name: string;
  email: string;
}

interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  start_date: string;
  end_date: string;
  budget: number;
  client_name: string;
  client_contact: string;
  client_email: string;
  owner_id: string;
}

export function EditProjectModal({
  open,
  onOpenChange,
  projectId,
  onSuccess,
}: EditProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [project, setProject] = useState<Project | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema),
  });

  const selectedStatus = watch("status");
  const selectedPriority = watch("priority");
  const selectedOwnerId = watch("owner_id");

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();
      if (data.success && data.data) {
        const proj = data.data;
        setProject(proj);
        
        // Populate form with existing data
        reset({
          name: proj.name,
          description: proj.description || "",
          status: proj.status,
          priority: proj.priority,
          start_date: proj.start_date || "",
          end_date: proj.end_date || "",
          budget: proj.budget ? proj.budget.toString() : "",
          client_name: proj.client_name || "",
          client_contact: proj.client_contact || "",
          client_email: proj.client_email || "",
          owner_id: proj.owner_id || "",
        });
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  }, [projectId, reset]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (data.success && data.data) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  // Fetch project data and users when modal opens
  useEffect(() => {
    if (open && projectId) {
      fetchProject();
      fetchUsers();
    }
  }, [open, projectId, fetchProject, fetchUsers]);

  const onSubmit = async (data: EditProjectFormData) => {
    setIsSubmitting(true);
    try {
      // Convert budget to number if provided
      const payload = {
        ...data,
        budget: data.budget ? parseFloat(data.budget) : undefined,
      };

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        onOpenChange(false);
        onSuccess?.();
      } else {
        console.error("Error updating project:", result.error);
        alert(`Erro ao atualizar projeto: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Erro ao atualizar projeto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setShowDeleteDialog(false);
        onOpenChange(false);
        onSuccess?.();
      } else {
        console.error("Error deleting project:", result.error);
        alert(`Erro ao deletar projeto: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Erro ao deletar projeto. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!project) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div>
                <span>Editar Projeto</span>
                <p className="text-sm font-normal text-slate-400 mt-1">
                  {project.code} - {project.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome do Projeto */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome do Projeto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Ex: Sistema de Gestão"
                className="bg-slate-800 border-slate-700"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Descreva o projeto..."
                className="bg-slate-800 border-slate-700 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setValue("status", value as "planning" | "active" | "on_hold" | "completed" | "cancelled")}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planejamento</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="on_hold">Em espera</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Prioridade */}
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={selectedPriority}
                  onValueChange={(value) => setValue("priority", value as "low" | "medium" | "high" | "critical")}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Data de Início */}
              <div className="space-y-2">
                <Label htmlFor="start_date">Data de Início</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register("start_date")}
                  className="bg-slate-800 border-slate-700"
                />
              </div>

              {/* Data de Término */}
              <div className="space-y-2">
                <Label htmlFor="end_date">Data de Término</Label>
                <Input
                  id="end_date"
                  type="date"
                  {...register("end_date")}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>

            {/* Orçamento */}
            <div className="space-y-2">
              <Label htmlFor="budget">Orçamento (R$)</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="0"
                {...register("budget")}
                placeholder="0.00"
                className="bg-slate-800 border-slate-700"
              />
            </div>

            {/* Cliente */}
            <div className="space-y-4 border-t border-slate-700 pt-4">
              <h3 className="text-sm font-medium text-slate-300">Informações do Cliente</h3>
              
              <div className="space-y-2">
                <Label htmlFor="client_name">Nome do Cliente</Label>
                <Input
                  id="client_name"
                  {...register("client_name")}
                  placeholder="Ex: Empresa XYZ"
                  className="bg-slate-800 border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_contact">Contato</Label>
                  <Input
                    id="client_contact"
                    {...register("client_contact")}
                    placeholder="Nome do contato"
                    className="bg-slate-800 border-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_email">Email</Label>
                  <Input
                    id="client_email"
                    type="email"
                    {...register("client_email")}
                    placeholder="contato@empresa.com"
                    className="bg-slate-800 border-slate-700"
                  />
                  {errors.client_email && (
                    <p className="text-sm text-red-500">{errors.client_email.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Responsável do Projeto */}
            <div className="space-y-2">
              <Label htmlFor="owner_id">Responsável do Projeto</Label>
              <Select
                value={selectedOwnerId}
                onValueChange={(value) => setValue("owner_id", value)}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="border-slate-600 hover:bg-slate-800"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Deletar Projeto?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja deletar o projeto <strong>{project.name}</strong>?
              <br />
              <br />
              <span className="text-red-400">
                ⚠️ Esta ação não pode ser desfeita. Todas as tarefas e dados relacionados ao projeto também serão removidos.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600 hover:bg-slate-800">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deletando..." : "Deletar Projeto"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
