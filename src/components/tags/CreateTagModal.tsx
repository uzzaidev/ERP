"use client";

import { useState } from "react";
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

const createTagSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(50, "Nome muito longo"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida"),
});

type CreateTagFormData = z.infer<typeof createTagSchema>;

interface CreateTagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
];

export function CreateTagModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateTagModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateTagFormData>({
    resolver: zodResolver(createTagSchema),
    defaultValues: {
      color: "#3b82f6",
    },
  });

  const selectedColor = watch("color");

  const handleCreateTag = async () => {
    const name = watch("name");
    const color = watch("color");

    // Validate
    if (!name || name.trim().length === 0) {
      alert("Nome é obrigatório");
      return;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      alert("Cor inválida");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, color }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao criar tag");
      }

      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating tag:", error);
      alert(error instanceof Error ? error.message : "Erro ao criar tag");
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
              Nova Tag
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-card-foreground">
              Nome da Tag *
            </Label>
            <Input
              id="name"
              {...register("name")}
              className="mt-1 bg-background border-input text-foreground"
              placeholder="Ex: Bug, Feature, Urgent"
              maxLength={50}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Color Picker */}
          <div>
            <Label className="text-card-foreground">Cor *</Label>
            <div className="mt-2 grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue("color", color)}
                  className={`h-8 w-8 rounded-md transition-all ${
                    selectedColor === color
                      ? "ring-2 ring-ring ring-offset-2 ring-offset-background scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Input
                type="color"
                {...register("color")}
                className="h-10 w-20 cursor-pointer"
              />
              <Input
                type="text"
                {...register("color")}
                className="flex-1 bg-background border-input text-foreground font-mono"
                placeholder="#3b82f6"
                maxLength={7}
              />
            </div>
            {errors.color && (
              <p className="mt-1 text-sm text-destructive">{errors.color.message}</p>
            )}
          </div>

          {/* Preview */}
          <div className="pt-2">
            <Label className="text-card-foreground">Preview</Label>
            <div className="mt-2 flex items-center gap-2">
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: selectedColor + "20",
                  color: selectedColor,
                  borderColor: selectedColor,
                  borderWidth: "1px",
                }}
              >
                {watch("name") || "Nome da Tag"}
              </span>
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
              type="button"
              onClick={handleCreateTag}
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? "Criando..." : "Criar Tag"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
