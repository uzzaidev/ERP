"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X, Trash2 } from "lucide-react";
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
import { KaizenImprovement as Kaizen, KaizenCategory } from "@/types/entities";

// Kaizen edit schema
const editKaizenSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(255, "Título muito longo"),
  category: z.enum(["technical", "process", "strategic", "cultural"]),
  context: z.string().optional(),
  goldenRule: z.string().optional(),
  application: z.string().optional(),
  relatedProjectId: z.string().optional(),
  relatedTaskId: z.string().optional(),
});

type EditKaizenFormData = z.infer<typeof editKaizenSchema>;

interface EditKaizenModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  kaizen: Kaizen | null;
}

interface Project {
  id: string;
  code: string;
  name: string;
}

export function EditKaizenModal({
  open,
  onClose,
  onSuccess,
  kaizen,
}: EditKaizenModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Learning arrays
  const [doItems, setDoItems] = useState<string[]>([]);
  const [avoidItems, setAvoidItems] = useState<string[]>([]);
  const [adjustItems, setAdjustItems] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<EditKaizenFormData>({
    resolver: zodResolver(editKaizenSchema),
  });

  const selectedCategory = watch("category");

  // Load kaizen data when modal opens or kaizen changes
  useEffect(() => {
    if (open && kaizen) {
      // Use reset to properly initialize all form values at once
      reset({
        title: kaizen.title,
        category: kaizen.category,
        context: kaizen.context || "",
        goldenRule: kaizen.goldenRule || "",
        application: kaizen.application || "",
        relatedProjectId: kaizen.relatedProjectId || "none",
        relatedTaskId: kaizen.relatedTaskId || undefined,
      });
      
      // Load learning arrays
      setDoItems(kaizen.learning?.do || []);
      setAvoidItems(kaizen.learning?.avoid || []);
      setAdjustItems(kaizen.learning?.adjust || []);
      
      fetchProjects();
    }
  }, [open, kaizen, reset]);

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

  const onSubmit = async (data: EditKaizenFormData) => {
    if (!kaizen) return;
    
    try {
      setIsSubmitting(true);

      // Build learning object
      const learning = (doItems.length > 0 || avoidItems.length > 0 || adjustItems.length > 0) ? {
        do: doItems.filter(item => item.trim()),
        avoid: avoidItems.filter(item => item.trim()),
        adjust: adjustItems.filter(item => item.trim()),
      } : undefined;

      const payload = {
        ...data,
        learning,
        // Ensure relatedProjectId is either a valid UUID or undefined, never empty string
        relatedProjectId: data.relatedProjectId || undefined,
        relatedTaskId: data.relatedTaskId || undefined,
      };

      const response = await fetch(`/api/kaizens/${kaizen.id}`, {
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
        alert(result.error || "Erro ao atualizar kaizen");
      }
    } catch (error) {
      console.error("Error updating kaizen:", error);
      alert("Erro ao atualizar kaizen");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!kaizen) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/kaizens/${kaizen.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setShowDeleteDialog(false);
        onClose();
        onSuccess?.();
      } else {
        alert(result.error || "Erro ao deletar kaizen");
      }
    } catch (error) {
      console.error("Error deleting kaizen:", error);
      alert("Erro ao deletar kaizen");
    } finally {
      setIsDeleting(false);
    }
  };

  // Array item management
  const addItem = (items: string[], setItems: (items: string[]) => void) => {
    setItems([...items, ""]);
  };

  const updateItem = (items: string[], setItems: (items: string[]) => void, index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const removeItem = (items: string[], setItems: (items: string[]) => void, index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technical: "text-blue-400",
      process: "text-green-400",
      strategic: "text-purple-400",
      cultural: "text-orange-400",
    };
    return colors[category] || "text-gray-400";
  };

  if (!kaizen) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">
                Editar Kaizen {kaizen.code}
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
                placeholder="Ex: Sempre validar tipos com TypeScript"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setValue("category", value as KaizenCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">
                    <span className={getCategoryColor("technical")}>
                      🔧 Técnico
                    </span>
                  </SelectItem>
                  <SelectItem value="process">
                    <span className={getCategoryColor("process")}>
                      ⚙️ Processo
                    </span>
                  </SelectItem>
                  <SelectItem value="strategic">
                    <span className={getCategoryColor("strategic")}>
                      🎯 Estratégico
                    </span>
                  </SelectItem>
                  <SelectItem value="cultural">
                    <span className={getCategoryColor("cultural")}>
                      🌟 Cultural
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            {/* Context */}
            <div className="space-y-2">
              <Label htmlFor="context">Contexto</Label>
              <Textarea
                id="context"
                {...register("context")}
                placeholder="Qual era a situação? O que aconteceu?"
                rows={3}
              />
            </div>

            {/* Learning - Do */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>✅ Fazer (Do)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addItem(doItems, setDoItems)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              {doItems.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateItem(doItems, setDoItems, index, e.target.value)}
                    placeholder="O que devemos fazer?"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(doItems, setDoItems, index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Learning - Avoid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>❌ Evitar (Avoid)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addItem(avoidItems, setAvoidItems)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              {avoidItems.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateItem(avoidItems, setAvoidItems, index, e.target.value)}
                    placeholder="O que devemos evitar?"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(avoidItems, setAvoidItems, index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Learning - Adjust */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>🔄 Ajustar (Adjust)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addItem(adjustItems, setAdjustItems)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              {adjustItems.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateItem(adjustItems, setAdjustItems, index, e.target.value)}
                    placeholder="O que devemos ajustar?"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(adjustItems, setAdjustItems, index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Golden Rule */}
            <div className="space-y-2">
              <Label htmlFor="goldenRule">Regra de Ouro 💡</Label>
              <Textarea
                id="goldenRule"
                {...register("goldenRule")}
                placeholder="Qual é o princípio-chave ou takeaway?"
                rows={2}
              />
            </div>

            {/* Application */}
            <div className="space-y-2">
              <Label htmlFor="application">Como Aplicar 🚀</Label>
              <Textarea
                id="application"
                {...register("application")}
                placeholder="Como aplicar este aprendizado na prática?"
                rows={3}
              />
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
              Tem certeza que deseja deletar o kaizen <strong>{kaizen.code}</strong>?
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
