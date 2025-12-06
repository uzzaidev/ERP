/**
 * Tipos das entidades do dominio
 */

// Status comuns
export type ActionStatus = "open" | "in_progress" | "done" | "canceled" | "blocked";
export type Priority = "low" | "medium" | "high" | "critical";
export type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "canceled";
export type TenantPlan = "trial" | "basic" | "professional" | "enterprise";
export type TenantStatus = "active" | "suspended" | "cancelled";
export type InvitationStatus = "pending" | "accepted" | "expired" | "cancelled";

// ============================================
// MULTI-TENANCY TYPES
// ============================================

// Tenant (Company/Organization)
export interface Tenant {
  id: string;
  name: string;
  slug: string; // URL-friendly identifier
  document?: string; // CNPJ/Tax ID
  email?: string;
  phone?: string;
  
  // Address
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  addressCountry?: string;
  
  // Branding
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  
  // Settings
  currency?: string;
  timezone?: string;
  language?: string;
  fiscalYearStartMonth?: number;
  
  // Subscription
  plan: TenantPlan;
  status: TenantStatus;
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  
  // Limits
  maxUsers: number;
  maxProjects: number;
  storageLimitMb: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Tenant Invitation
export interface TenantInvitation {
  id: string;
  tenantId: string;
  tenant?: Tenant;
  email: string;
  roleId?: string;
  roleName: string; // admin, gestor, financeiro, dev, juridico

  // Invitation details
  token: string;
  invitedBy?: string;
  invitedByUser?: User;

  // Status
  status: InvitationStatus;
  acceptedAt?: string;
  acceptedBy?: string;
  expiresAt: string;

  // Optional message
  message?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Tenant Access Request (solicitação de acesso)
export type AccessRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface TenantAccessRequest {
  id: string;

  // Solicitante
  userId: string;
  email: string;
  fullName: string;

  // Tenant solicitado
  tenantId: string;
  tenantSlug: string;
  tenant?: Tenant;

  // Status
  status: AccessRequestStatus;
  message?: string;

  // Aprovação/Rejeição
  reviewedBy?: string;
  reviewedByUser?: User;
  reviewedAt?: string;
  rejectionReason?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Tenant Usage Stats
export interface TenantUsageStats {
  id: string;
  tenantId: string;
  usersCount: number;
  projectsCount: number;
  tasksCount: number;
  storageUsedMb: number;
  lastCalculatedAt: string;
  createdAt: string;
  updatedAt: string;
}

// User (with tenant relationship)
export interface User {
  id: string;
  tenantId: string;
  tenant?: Tenant;
  email: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// EXISTING TYPES (Updated with tenant_id)
// ============================================

// Pessoa (unificado: cliente, fornecedor, colaborador)
export interface Person {
  id: string;
  tenantId: string; // Required for multi-tenancy data isolation
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
  tenantId: string; // Added for multi-tenancy
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
  tenantId: string; // Added for multi-tenancy
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
  tenantId: string; // Added for multi-tenancy
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
  tenantId: string; // Added for multi-tenancy
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

// Decisao (Meeting Decision - legacy)
export interface MeetingDecision {
  id: string;
  tenantId: string; // Added for multi-tenancy
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
  tenantId: string; // Added for multi-tenancy
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
  tenantId: string; // Added for multi-tenancy
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
  tenantId: string; // Added for multi-tenancy
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
  tenantId: string; // Added for multi-tenancy
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
  tenantId: string; // Added for multi-tenancy
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
  tenantId: string; // Added for multi-tenancy
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
  tenantId: string; // Added for multi-tenancy
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
  tenantId: string; // Added for multi-tenancy
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

// ============================================
// TASK COMMENTS & TIME LOGS
// ============================================

// Task Comment (API Response)
export interface TaskComment {
  id: string;
  tenantId: string;
  taskId: string;
  authorId: string;
  author?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  content: string;
  mentions?: string[]; // Array of user IDs mentioned
  createdAt: string;
  updatedAt: string;
}

// Task Time Log (API Response)
export interface TimeLog {
  id: string;
  tenantId: string;
  taskId: string;
  userId: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  hours: number;
  description?: string;
  loggedDate: string;
  createdAt: string;
}

// ============================================
// DECISIONS (ADRs - Architecture Decision Records)
// ============================================

export type DecisionStatus = "draft" | "approved" | "implemented" | "deprecated" | "superseded";

// Decision Alternative (considered option)
export interface DecisionAlternative {
  option: string;
  pros: string[];
  cons: string[];
}

// Decision Consequences
export interface DecisionConsequences {
  benefits: string[];
  trade_offs: string[];
  reversibility?: string;
}

// Decision Impact Assessment
export interface DecisionImpact {
  cost?: string;
  timeline?: string;
  quality?: string;
  technical_debt?: string;
}

// Decision Stakeholders
export interface DecisionStakeholders {
  decided_by?: string;
  consulted: string[];
  informed: string[];
}

// Decision (ADR)
export interface Decision {
  id: string;
  tenantId: string;
  code: string; // D-2025-001, D-2025-002
  title: string;
  
  // Context & Decision
  context?: string;
  decision?: string;
  
  // Analysis
  alternatives?: DecisionAlternative[];
  consequences?: DecisionConsequences;
  impact?: DecisionImpact;
  
  // Stakeholders
  stakeholders?: DecisionStakeholders;
  
  // Relationships
  relatedTaskIds?: string[];
  relatedProjectId?: string;
  relatedProject?: {
    id: string;
    code: string;
    name: string;
  };
  
  // Status & Priority
  status: DecisionStatus;
  priority: Priority;
  
  // Metadata
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

// ============================================
// KAIZENS (Continuous Improvement System)
// ============================================

export type KaizenCategory = "technical" | "process" | "strategic" | "cultural";

// Kaizen Learning (structured learning)
export interface KaizenLearning {
  do?: string[]; // Things to do
  avoid?: string[]; // Things to avoid
  adjust?: string[]; // Things to adjust
}

// Kaizen
export interface Kaizen {
  id: string;
  tenantId: string;
  code: string; // K-T-001, K-P-002, K-S-003, K-C-004
  title: string;
  
  // Category & Content
  category: KaizenCategory;
  context?: string;
  learning?: KaizenLearning;
  goldenRule?: string;
  application?: string;
  
  // Relationships
  relatedTaskId?: string;
  relatedMeetingId?: string;
  relatedProjectId?: string;
  relatedProject?: {
    id: string;
    code: string;
    name: string;
  };
  
  // Metadata
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// MEETINGS (Meeting Effectiveness Score System)
// ============================================

// Meeting
export interface Meeting {
  id: string;
  tenantId: string;
  code: string; // MTG-YYYY-MM-DD-NNN or MTG-YYYY-MM-DD-PROJECT-NNN
  title: string;
  date: string; // ISO date string
  
  // Participants
  participants?: string[]; // Array of user IDs
  
  // Meeting Outputs (counts)
  decisionsCount: number;
  actionsCount: number;
  kaizensCount: number;
  blockersCount: number;
  
  // Effectiveness Score (auto-calculated)
  effectivenessScore?: number;
  
  // Content
  notes?: string;
  
  // Relationships
  relatedProjectId?: string;
  relatedProject?: {
    id: string;
    code: string;
    name: string;
  };
  
  // Metadata
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Meeting Effectiveness Score Color/Level
export type MeetingEffectivenessLevel = "excellent" | "good" | "fair" | "poor";

export interface MeetingEffectivenessInfo {
  score: number;
  level: MeetingEffectivenessLevel;
  color: string;
  label: string;
}
