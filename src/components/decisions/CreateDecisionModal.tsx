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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Decision creation schema
const createDecisionSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(255, "Título muito longo"),
  context: z.string().optional(),
  decision: z.string().optional(),
  status: z.enum(["draft", "approved", "implemented", "deprecated", "superseded"]).default("draft"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  relatedProjectId: z.string().optional(),
});

type CreateDecisionFormData = z.infer<typeof createDecisionSchema>;

interface CreateDecisionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Project {
  id: string;
  code: string;
  name: string;
}

interface Alternative {
  option: string;
  pros: string[];
  cons: string[];
}

export function CreateDecisionModal({
  open,
  onClose,
  onSuccess,
}: CreateDecisionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Advanced fields state
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [tradeOffs, setTradeOffs] = useState<string[]>([]);
  const [consulted, setConsulted] = useState<string[]>([]);
  const [informed, setInformed] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateDecisionFormData>({
    resolver: zodResolver(createDecisionSchema),
    defaultValues: {
      status: "draft",
      priority: "medium",
    },
  });

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

  const onSubmit = async (data: CreateDecisionFormData) => {
    try {
      setIsSubmitting(true);

      // Build alternatives array
      const alternativesData = alternatives.length > 0 ? alternatives : undefined;
      
      // Build consequences object
      const consequences = (benefits.length > 0 || tradeOffs.length > 0) ? {
        benefits: benefits.filter(b => b.trim()),
        trade_offs: tradeOffs.filter(t => t.trim()),
      } : undefined;

      // Build stakeholders object
      const stakeholders = (consulted.length > 0 || informed.length > 0) ? {
        consulted: consulted.filter(c => c.trim()),
        informed: informed.filter(i => i.trim()),
      } : undefined;

      const payload = {
        ...data,
        alternatives: alternativesData,
        consequences,
        stakeholders,
      };

      const response = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        reset();
        setAlternatives([]);
        setBenefits([]);
        setTradeOffs([]);
        setConsulted([]);
        setInformed([]);
        onClose();
        onSuccess?.();
      } else {
        alert(result.error || "Erro ao criar decisão");
      }
    } catch (error) {
      console.error("Error creating decision:", error);
      alert("Erro ao criar decisão");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Alternative management
  const addAlternative = () => {
    setAlternatives([...alternatives, { option: "", pros: [""], cons: [""] }]);
  };

  const removeAlternative = (index: number) => {
    setAlternatives(alternatives.filter((_, i) => i !== index));
  };

  const updateAlternative = (index: number, field: keyof Alternative, value: string | string[]) => {
    const updated = [...alternatives];
    updated[index] = { ...updated[index], [field]: value };
    setAlternatives(updated);
  };

  const addProCon = (altIndex: number, type: 'pros' | 'cons') => {
    const updated = [...alternatives];
    updated[altIndex][type] = [...updated[altIndex][type], ""];
    setAlternatives(updated);
  };

  const updateProCon = (altIndex: number, type: 'pros' | 'cons', itemIndex: number, value: string) => {
    const updated = [...alternatives];
    updated[altIndex][type][itemIndex] = value;
    setAlternatives(updated);
  };

  const removeProCon = (altIndex: number, type: 'pros' | 'cons', itemIndex: number) => {
    const updated = [...alternatives];
    updated[altIndex][type] = updated[altIndex][type].filter((_, i) => i !== itemIndex);
    setAlternatives(updated);
  };

  // Simple array management (benefits, tradeOffs, etc.)
  const addItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, ""]);
  };

  const updateItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const removeItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 text-white border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Nova Decisão (ADR)</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-300">Informações Básicas</h3>
            
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Ex: Migração para PostgreSQL"
                className="bg-slate-800 border-slate-700 text-white"
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  {...register("status")}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="draft">Rascunho</option>
                  <option value="approved">Aprovada</option>
                  <option value="implemented">Implementada</option>
                  <option value="deprecated">Depreciada</option>
                  <option value="superseded">Substituída</option>
                </select>
              </div>

              <div>
                <Label htmlFor="priority">Prioridade</Label>
                <select
                  id="priority"
                  {...register("priority")}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="relatedProjectId">Projeto Relacionado</Label>
              <select
                id="relatedProjectId"
                {...register("relatedProjectId")}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Nenhum</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.code} - {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Context & Decision */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-300">Contexto & Decisão</h3>
            
            <div>
              <Label htmlFor="context">Contexto</Label>
              <textarea
                id="context"
                {...register("context")}
                rows={4}
                placeholder="Por que essa decisão foi necessária? Qual problema estamos resolvendo?"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <Label htmlFor="decision">Decisão</Label>
              <textarea
                id="decision"
                {...register("decision")}
                rows={4}
                placeholder="O que foi decidido?"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Alternatives */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-300">Alternativas Consideradas</h3>
              <Button
                type="button"
                onClick={addAlternative}
                variant="outline"
                size="sm"
                className="border-slate-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Alternativa
              </Button>
            </div>

            {alternatives.map((alt, altIndex) => (
              <div key={altIndex} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Opção {altIndex + 1}</Label>
                  <Button
                    type="button"
                    onClick={() => removeAlternative(altIndex)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  value={alt.option}
                  onChange={(e) => updateAlternative(altIndex, 'option', e.target.value)}
                  placeholder="Nome da alternativa"
                  className="bg-slate-900 border-slate-700"
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Pros */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-emerald-400">Prós</Label>
                      <Button
                        type="button"
                        onClick={() => addProCon(altIndex, 'pros')}
                        variant="ghost"
                        size="sm"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    {alt.pros.map((pro, proIndex) => (
                      <div key={proIndex} className="flex items-center gap-2 mb-2">
                        <Input
                          value={pro}
                          onChange={(e) => updateProCon(altIndex, 'pros', proIndex, e.target.value)}
                          placeholder="Pró"
                          className="bg-slate-900 border-slate-700"
                        />
                        <Button
                          type="button"
                          onClick={() => removeProCon(altIndex, 'pros', proIndex)}
                          variant="ghost"
                          size="sm"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Cons */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-red-400">Contras</Label>
                      <Button
                        type="button"
                        onClick={() => addProCon(altIndex, 'cons')}
                        variant="ghost"
                        size="sm"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    {alt.cons.map((con, conIndex) => (
                      <div key={conIndex} className="flex items-center gap-2 mb-2">
                        <Input
                          value={con}
                          onChange={(e) => updateProCon(altIndex, 'cons', conIndex, e.target.value)}
                          placeholder="Contra"
                          className="bg-slate-900 border-slate-700"
                        />
                        <Button
                          type="button"
                          onClick={() => removeProCon(altIndex, 'cons', conIndex)}
                          variant="ghost"
                          size="sm"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Consequences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-300">Consequências</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Benefits */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Benefícios</Label>
                  <Button
                    type="button"
                    onClick={() => addItem(setBenefits)}
                    variant="ghost"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <Input
                      value={benefit}
                      onChange={(e) => updateItem(setBenefits, index, e.target.value)}
                      placeholder="Benefício"
                      className="bg-slate-800 border-slate-700"
                    />
                    <Button
                      type="button"
                      onClick={() => removeItem(setBenefits, index)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Trade-offs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Trade-offs</Label>
                  <Button
                    type="button"
                    onClick={() => addItem(setTradeOffs)}
                    variant="ghost"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tradeOffs.map((tradeOff, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <Input
                      value={tradeOff}
                      onChange={(e) => updateItem(setTradeOffs, index, e.target.value)}
                      placeholder="Trade-off"
                      className="bg-slate-800 border-slate-700"
                    />
                    <Button
                      type="button"
                      onClick={() => removeItem(setTradeOffs, index)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stakeholders */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-300">Stakeholders</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Consulted */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Consultados</Label>
                  <Button
                    type="button"
                    onClick={() => addItem(setConsulted)}
                    variant="ghost"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {consulted.map((person, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <Input
                      value={person}
                      onChange={(e) => updateItem(setConsulted, index, e.target.value)}
                      placeholder="Nome"
                      className="bg-slate-800 border-slate-700"
                    />
                    <Button
                      type="button"
                      onClick={() => removeItem(setConsulted, index)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Informed */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Informados</Label>
                  <Button
                    type="button"
                    onClick={() => addItem(setInformed)}
                    variant="ghost"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {informed.map((person, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <Input
                      value={person}
                      onChange={(e) => updateItem(setInformed, index, e.target.value)}
                      placeholder="Nome"
                      className="bg-slate-800 border-slate-700"
                    />
                    <Button
                      type="button"
                      onClick={() => removeItem(setInformed, index)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-700">
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? "Criando..." : "Criar Decisão"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
