/**
 * Tipos de resposta da API
 */

// Resposta paginada
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

// Resposta de erro
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

// Resposta de ingestao de reuniao
export interface MeetingIngestResponse {
  meeting: {
    id: string;
    code: string;
    title: string;
    status: string;
    durationMin: number;
    efetividade: number;
  };
  extracted: {
    decisions: number;
    actions: number;
    risks: number;
    kaizens: number;
    blockers: number;
  };
  ragSuggestions: {
    duplicateDecisions: Array<{
      decisionId: string;
      similarity: number;
    }>;
    similarActions: Array<{
      actionId: string;
      similarity: number;
    }>;
  };
  filesGenerated: {
    ata?: string;
    tasks?: string;
  };
}

// Request de ingestao de reuniao
export interface MeetingIngestRequest {
  transcript: {
    rawText: string;
    source: string;
    sourceUrl?: string;
    language?: string;
  };
  metadata: {
    title: string;
    dateStart?: string;
    dateEnd?: string;
    participants?: string[];
    subtipo?: string;
    projectCode?: string;
    sprintCode?: string;
  };
  options?: {
    autoExtract?: boolean;
    generateMinutes?: boolean;
    updateDashboard?: boolean;
    createActions?: boolean;
  };
}
