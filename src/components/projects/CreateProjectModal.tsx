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
<<<<<<< HEAD
=======
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
>>>>>>> e14a2144b358425416219dcc49e76be76b968523

// Project creation schema
const createProjectSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  description: z.string().optional(),
<<<<<<< HEAD
  status: z.enum(["active", "on_hold", "completed", "cancelled"]).default("active"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  estimated_hours: z.coerce.number().min(0).optional(),
  budget: z.coerce.number().min(0).optional(),
=======
  status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]).default("planning"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget: z.string().optional(),
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
  client_name: z.string().optional(),
  client_contact: z.string().optional(),
  client_email: z.string().email("Email inválido").optional().or(z.literal("")),
  owner_id: z.string().optional(),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface User {
  id: string;
  full_name: string;
  email: string;
}

export function CreateProjectModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
<<<<<<< HEAD
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      status: "active",
=======
    setValue,
    watch,
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      status: "planning",
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
      priority: "medium",
    },
  });

<<<<<<< HEAD
=======
  const selectedStatus = watch("status");
  const selectedPriority = watch("priority");
  const selectedOwnerId = watch("owner_id");

>>>>>>> e14a2144b358425416219dcc49e76be76b968523
  // Fetch users when modal opens
  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

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

  const onSubmit = async (data: CreateProjectFormData) => {
    setIsSubmitting(true);
    try {
<<<<<<< HEAD
=======
      // Convert budget to number if provided
      const payload = {
        ...data,
        budget: data.budget ? parseFloat(data.budget) : undefined,
      };

>>>>>>> e14a2144b358425416219dcc49e76be76b968523
      const response = await fetch("/api/projects", {
        method: "POST",
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
        throw new Error(result.error || "Erro ao criar projeto");
      }

      // Success
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating project:", error);
      alert(error instanceof Error ? error.message : "Erro ao criar projeto");
=======
      if (result.success) {
        reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        console.error("Error creating project:", result.error);
        alert(`Erro ao criar projeto: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Erro ao criar projeto. Tente novamente.");
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
<<<<<<< HEAD
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700/50">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-white">
              Novo Projeto
            </DialogTitle>
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
            <div className="grid grid-cols-2 gap-4">
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
                {errors.estimated_hours && (
                  <p className="mt-1 text-sm text-red-400">{errors.estimated_hours.message}</p>
                )}
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
                {errors.budget && (
                  <p className="mt-1 text-sm text-red-400">{errors.budget.message}</p>
                )}
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
            <span>Criar Novo Projeto</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
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
              <option value="">Eu (padrão)</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
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
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
<<<<<<< HEAD
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
=======
              disabled={isSubmitting}
              className="border-slate-600 hover:bg-slate-800"
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
<<<<<<< HEAD
              className="bg-emerald-600 text-white hover:bg-emerald-700"
=======
              className="bg-emerald-600 hover:bg-emerald-700"
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
            >
              {isSubmitting ? "Criando..." : "Criar Projeto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
