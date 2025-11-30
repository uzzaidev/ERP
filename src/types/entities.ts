/**
 * Tipos das entidades do dominio
 */

// Status comuns
export type ActionStatus = "open" | "in_progress" | "done" | "canceled" | "blocked";
export type Priority = "high" | "medium" | "low";
export type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "canceled";

// Pessoa (unificado: cliente, fornecedor, colaborador)
export interface Person {
  id: string;
  fullName: string;
  nicknames: string[];
  types: ("cliente" | "fornecedor" | "colaborador")[];
  email?: string;
  phone?: string;
  document?: string; // CPF/CNPJ
  address?: Address;
  status: "active" | "inactive";
  availabilityWeeklyH?: number;
  allocatedWeeklyH?: number;
  sharePercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

// Projeto
export interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  progress: number;
  velocity: number;
  budget: number;
  budgetUsed: number;
  ownerId: string;
  owner?: Person;
  createdAt: string;
  updatedAt: string;
}

// Sprint
export interface Sprint {
  id: string;
  code: string;
  weekLabel: string;
  status: "planning" | "active" | "closed";
  objetivoPrincipal: string;
  acoesPlanejadas: number;
  acoesConcluidas: number;
  startDate: string;
  endDate: string;
  projectId: string;
  project?: Project;
}

// Reuniao
export interface Meeting {
  id: string;
  code: string;
  title: string;
  subtipo: string;
  dateStart: string;
  dateEnd: string;
  participants: string[];
  efetividade: number;
  projectId: string;
  project?: Project;
  sprintId?: string;
  sprint?: Sprint;
}

// Acao
export interface Action {
  id: string;
  publicId: string;
  description: string;
  status: ActionStatus;
  priority: Priority;
  dueDate: string;
  ownerId: string;
  owner?: Person;
  projectId: string;
  project?: Project;
  sprintId?: string;
  sprint?: Sprint;
  meetingId?: string;
  meeting?: Meeting;
  tags: string[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Decisao
export interface Decision {
  id: string;
  publicId: string;
  title: string;
  context: string;
  decisionText: string;
  alternatives: string[];
  impactCost: string;
  impactTime: string;
  impactQuality: string;
  projectId: string;
  project?: Project;
  meetingId?: string;
  meeting?: Meeting;
  createdAt: string;
  updatedAt: string;
}

// Risco
export interface Risk {
  id: string;
  publicId: string;
  description: string;
  probability: number; // 1-5
  impact: number; // 1-5
  severity: number; // probability * impact
  status: "open" | "mitigated" | "closed";
  mitigationPlan?: string;
  projectId: string;
  project?: Project;
  ownerId: string;
  owner?: Person;
  createdAt: string;
  updatedAt: string;
}

// Kaizen
export interface Kaizen {
  id: string;
  publicId: string;
  titulo: string;
  categoria: "technical" | "process" | "communication" | "planning";
  impacto: "high" | "medium" | "low";
  descricao: string;
  recomendacao: string;
  projectId?: string;
  project?: Project;
  createdAt: string;
  updatedAt: string;
}

// Produto
export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  precoVenda: number;
  precoCusto: number;
  estoque: number;
  estoqueMinimo: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

// Movimentacao de Estoque
export interface StockMovement {
  id: string;
  productId: string;
  product?: Product;
  tipo: "entrada" | "saida" | "ajuste";
  quantidade: number;
  precoUnitario: number;
  supplierId?: string;
  supplier?: Person;
  status: "pending" | "confirmed" | "canceled";
  createdAt: string;
}

// Venda
export interface Sale {
  id: string;
  code: string;
  customerId: string;
  customer?: Person;
  sellerId: string;
  seller?: Person;
  date: string;
  items: SaleItem[];
  total: number;
  discount: number;
  status: "pending" | "confirmed" | "canceled";
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Transacao Financeira
export interface Transaction {
  id: string;
  accountId: string;
  tipo: "receita" | "despesa";
  valor: number;
  categoria: string;
  description?: string;
  projectId?: string;
  project?: Project;
  actionId?: string;
  action?: Action;
  status: "pending" | "confirmed" | "canceled";
  dueDate: string;
  paidDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Nota Fiscal
export interface Invoice {
  id: string;
  code: string;
  customerId: string;
  customer?: Person;
  projectId?: string;
  project?: Project;
  valorBruto: number;
  impostos: number;
  valorLiquido: number;
  status: "draft" | "emitted" | "canceled";
  emissao?: string;
  vencimento: string;
  createdAt: string;
  updatedAt: string;
}
