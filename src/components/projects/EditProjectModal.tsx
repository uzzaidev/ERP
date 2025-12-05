"use client";

<<<<<<< HEAD
import { useState, useEffect } from "react";
=======
import { useState, useEffect, useCallback } from "react";
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
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
<<<<<<< HEAD

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
=======
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
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
  client_name: z.string().optional(),
  client_contact: z.string().optional(),
  client_email: z.string().email("Email inválido").optional().or(z.literal("")),
  owner_id: z.string().optional(),
});

<<<<<<< HEAD
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
=======
type EditProjectFormData = z.infer<typeof editProjectSchema>;
>>>>>>> e14a2144b358425416219dcc49e76be76b968523

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
<<<<<<< HEAD
  project: Project | null;
=======
  projectId: string;
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
  onSuccess?: () => void;
}

interface User {
  id: string;
  full_name: string;
  email: string;
}

<<<<<<< HEAD
export function EditProjectModal({
  open,
  onOpenChange,
  project,
=======
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
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
  onSuccess,
}: EditProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
<<<<<<< HEAD
=======
  const [project, setProject] = useState<Project | null>(null);
>>>>>>> e14a2144b358425416219dcc49e76be76b968523

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
<<<<<<< HEAD
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
=======
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
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (data.success && data.data) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
<<<<<<< HEAD
  };

  const onSubmit = async (data: UpdateProjectFormData) => {
    if (!project) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
=======
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
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
<<<<<<< HEAD
        body: JSON.stringify(data),
=======
        body: JSON.stringify(payload),
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
      });

      const result = await response.json();

<<<<<<< HEAD
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao atualizar projeto");
      }

      // Success
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating project:", error);
      alert(error instanceof Error ? error.message : "Erro ao atualizar projeto");
=======
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
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
<<<<<<< HEAD
    if (!project) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
=======
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
        method: "DELETE",
      });

      const result = await response.json();

<<<<<<< HEAD
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
=======
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
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
    } finally {
      setIsDeleting(false);
    }
  };

<<<<<<< HEAD
  if (!project) return null;
=======
  if (!project) {
    return null;
  }
>>>>>>> e14a2144b358425416219dcc49e76be76b968523

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
<<<<<<< HEAD
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
=======
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
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
<<<<<<< HEAD
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
=======
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
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
                  <Input
                    id="client_email"
                    type="email"
                    {...register("client_email")}
<<<<<<< HEAD
                    className="mt-1 bg-slate-800 border-slate-700 text-white"
                    placeholder="cliente@example.com"
                  />
                  {errors.client_email && (
                    <p className="mt-1 text-sm text-red-400">{errors.client_email.message}</p>
=======
                    placeholder="contato@empresa.com"
                    className="bg-slate-800 border-slate-700"
                  />
                  {errors.client_email && (
                    <p className="text-sm text-red-500">{errors.client_email.message}</p>
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
                  )}
                </div>
              </div>
            </div>

<<<<<<< HEAD
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
=======
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
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
<<<<<<< HEAD
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
=======
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
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
<<<<<<< HEAD
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Sim, Excluir"}
=======
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deletando..." : "Deletar Projeto"}
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
