/**
 * Definicao de endpoints da API
 */
export const endpoints = {
  // Auth
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },

  // Projects
  projects: {
    list: "/projects",
    get: (id: string) => `/projects/${id}`,
    create: "/projects",
    update: (id: string) => `/projects/${id}`,
    delete: (id: string) => `/projects/${id}`,
    dashboard: (id: string) => `/projects/${id}/dashboard`,
  },

  // Meetings
  meetings: {
    list: "/meetings",
    get: (id: string) => `/meetings/${id}`,
    ingest: "/meetings/ingest",
    entities: (id: string) => `/meetings/${id}/entities`,
  },

  // Actions
  actions: {
    list: "/actions",
    get: (id: string) => `/actions/${id}`,
    create: "/actions",
    update: (id: string) => `/actions/${id}`,
    complete: (id: string) => `/actions/${id}/complete`,
    kanban: "/actions/kanban",
  },

  // Decisions
  decisions: {
    list: "/decisions",
    get: (id: string) => `/decisions/${id}`,
    similar: "/decisions/similar",
  },

  // Sprints
  sprints: {
    list: "/sprints",
    get: (id: string) => `/sprints/${id}`,
    close: (id: string) => `/sprints/${id}/close`,
  },

  // Products
  products: {
    list: "/products",
    get: (id: string) => `/products/${id}`,
    create: "/products",
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
    stock: (id: string) => `/products/${id}/stock`,
  },

  // Sales
  sales: {
    list: "/sales",
    get: (id: string) => `/sales/${id}`,
    create: "/sales",
    cancel: (id: string) => `/sales/${id}/cancel`,
  },

  // Stock
  stock: {
    movements: "/stock/movements",
    entry: "/stock/entry",
    exit: "/stock/exit",
    adjust: "/stock/adjust",
  },

  // Persons
  persons: {
    list: "/persons",
    get: (id: string) => `/persons/${id}`,
    create: "/persons",
    update: (id: string) => `/persons/${id}`,
    view360: (id: string) => `/persons/${id}/360`,
    customers: "/persons/customers",
    suppliers: "/persons/suppliers",
    team: "/persons/team",
  },

  // Financial
  financial: {
    accounts: "/financial/accounts",
    transactions: "/financial/transactions",
    cashflow: "/financial/cashflow",
    dre: "/financial/dre",
    budget: (projectId: string) => `/financial/budget/${projectId}`,
  },

  // Invoices
  invoices: {
    list: "/invoices",
    get: (id: string) => `/invoices/${id}`,
    create: "/invoices",
    emit: (id: string) => `/invoices/${id}/emit`,
  },

  // Reports
  reports: {
    sales: "/reports/sales",
    stock: "/reports/stock",
    financial: "/reports/financial",
    performance: "/reports/performance",
  },
} as const;

export default endpoints;
