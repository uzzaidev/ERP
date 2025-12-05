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

// Project creation schema
const createProjectSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  description: z.string().optional(),
  status: z.enum(["active", "on_hold", "completed", "cancelled"]).default("active"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  estimated_hours: z.coerce.number().min(0).optional(),
  budget: z.coerce.number().min(0).optional(),
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
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      status: "active",
      priority: "medium",
    },
  });

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
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              <option value="">Eu (padrão)</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
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
              {isSubmitting ? "Criando..." : "Criar Projeto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
