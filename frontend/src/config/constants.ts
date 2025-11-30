/**
 * Constantes globais da aplicacao
 */

export const PRIORITIES = {
  high: { label: "Alta", color: "text-red-500" },
  medium: { label: "Media", color: "text-yellow-500" },
  low: { label: "Baixa", color: "text-green-500" },
} as const;

export const ACTION_STATUSES = {
  open: { label: "Aberta", color: "bg-blue-100 text-blue-800" },
  in_progress: { label: "Em Progresso", color: "bg-yellow-100 text-yellow-800" },
  done: { label: "Concluida", color: "bg-green-100 text-green-800" },
  canceled: { label: "Cancelada", color: "bg-gray-100 text-gray-800" },
  blocked: { label: "Bloqueada", color: "bg-red-100 text-red-800" },
} as const;

export const PROJECT_STATUSES = {
  planning: { label: "Planejamento", color: "bg-purple-100 text-purple-800" },
  active: { label: "Ativo", color: "bg-green-100 text-green-800" },
  on_hold: { label: "Em Espera", color: "bg-yellow-100 text-yellow-800" },
  completed: { label: "Concluido", color: "bg-blue-100 text-blue-800" },
  canceled: { label: "Cancelado", color: "bg-gray-100 text-gray-800" },
} as const;

export const PERSON_TYPES = {
  cliente: { label: "Cliente", color: "bg-blue-100 text-blue-800" },
  fornecedor: { label: "Fornecedor", color: "bg-orange-100 text-orange-800" },
  colaborador: { label: "Colaborador", color: "bg-green-100 text-green-800" },
} as const;

export const KAIZEN_CATEGORIES = {
  technical: { label: "Tecnico" },
  process: { label: "Processo" },
  communication: { label: "Comunicacao" },
  planning: { label: "Planejamento" },
} as const;

export const IMPACT_LEVELS = {
  high: { label: "Alto", color: "text-red-500" },
  medium: { label: "Medio", color: "text-yellow-500" },
  low: { label: "Baixo", color: "text-green-500" },
} as const;
