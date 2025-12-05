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

const addMemberSchema = z.object({
  user_id: z.string().min(1, "Selecione um usuário"),
  role: z.string().optional(),
  hourly_rate: z.coerce.number().min(0).optional(),
});

type AddMemberFormData = z.infer<typeof addMemberSchema>;

interface AddProjectMemberModalProps {
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

export function AddProjectMemberModal({
  open,
  onOpenChange,
  projectId,
  onSuccess,
}: AddProjectMemberModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
  });

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (data.success && data.data) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const onSubmit = async (data: AddMemberFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao adicionar membro");
      }

      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error adding member:", error);
      alert(error instanceof Error ? error.message : "Erro ao adicionar membro");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-card-foreground">
              Adicionar Membro à Equipe
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
          {/* User Selection */}
          <div>
            <Label htmlFor="user_id" className="text-card-foreground">
              Usuário *
            </Label>
            <select
              id="user_id"
              {...register("user_id")}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
              disabled={isLoadingUsers}
            >
              <option value="">
                {isLoadingUsers ? "Carregando..." : "Selecione um usuário"}
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.email})
                </option>
              ))}
            </select>
            {errors.user_id && (
              <p className="mt-1 text-sm text-destructive">
                {errors.user_id.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <Label htmlFor="role" className="text-card-foreground">
              Função/Papel (opcional)
            </Label>
            <Input
              id="role"
              {...register("role")}
              className="mt-1 bg-background border-input text-foreground"
              placeholder="Ex: Desenvolvedor, Designer, QA"
            />
          </div>

          {/* Hourly Rate */}
          <div>
            <Label htmlFor="hourly_rate" className="text-card-foreground">
              Taxa Horária (R$/h - opcional)
            </Label>
            <Input
              id="hourly_rate"
              type="number"
              step="0.01"
              min="0"
              {...register("hourly_rate")}
              className="mt-1 bg-background border-input text-foreground"
              placeholder="0.00"
            />
            {errors.hourly_rate && (
              <p className="mt-1 text-sm text-destructive">
                {errors.hourly_rate.message}
              </p>
            )}
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
              disabled={isSubmitting || isLoadingUsers}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? "Adicionando..." : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
