"use client";

import { useState } from "react";
import { Book, Code, Database, FileText, GitBranch, Layers, Search, Server } from "lucide-react";

interface DocSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string;
  subsections?: { title: string; content: string }[];
}

const docSections: DocSection[] = [
  {
    id: "getting-started",
    title: "Começando",
    icon: Book,
    content: `
# Bem-vindo ao ERP UzzAI

Este é o sistema ERP completo desenvolvido com Next.js 15, React 19, e Supabase.

## Pré-requisitos

- Node.js 18+
- pnpm 8+
- Conta no Supabase

## Instalação

\`\`\`bash
# Clone o repositório
git clone https://github.com/uzzaidev/ERP.git
cd ERP

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Execute o projeto
pnpm dev
\`\`\`

O projeto estará disponível em http://localhost:3000
    `.trim(),
  },
  {
    id: "architecture",
    title: "Arquitetura",
    icon: Layers,
    content: `
# Arquitetura do Sistema

O ERP UzzAI é construído com uma arquitetura moderna e escalável.

## Stack Tecnológico

### Frontend
- **Next.js 15.0.3** - Framework React com App Router
- **React 19** - Biblioteca UI
- **TypeScript 5.6** - Type Safety
- **Tailwind CSS 3.4** - Estilização
- **Shadcn/ui** - Componentes UI
- **Zustand 5.0** - State Management
- **@dnd-kit 6.3** - Drag and Drop

### Backend
- **Supabase** - Backend as a Service
- **PostgreSQL 15** - Banco de dados relacional
- **Supabase Auth** - Autenticação
- **Supabase Storage** - Armazenamento de arquivos

## Estrutura de Pastas

\`\`\`
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas autenticadas
│   │   ├── dashboard/
│   │   ├── projetos/
│   │   ├── kanban/
│   │   ├── estoque/
│   │   └── financeiro/
│   ├── (public)/          # Rotas públicas
│   │   ├── login/
│   │   └── registro/
│   └── api/               # API Routes
│       ├── projects/
│       ├── tasks/
│       ├── sprints/
│       └── users/
├── components/            # Componentes React
│   ├── layout/
│   └── kanban/
├── lib/                   # Utilitários
│   ├── api/
│   ├── hooks/
│   ├── stores/
│   └── supabase/
└── types/                 # TypeScript types
\`\`\`
    `.trim(),
  },
  {
    id: "database",
    title: "Banco de Dados",
    icon: Database,
    content: `
# Estrutura do Banco de Dados

O banco de dados PostgreSQL está organizado em módulos:

## Módulos SQL

### 01_core_tables.sql
Tabelas fundamentais do sistema:
- **users** - Usuários do sistema
- **companies** - Empresas (multi-tenancy)
- **user_settings** - Configurações personalizadas

### 02_project_management.sql
Gestão de projetos e tarefas:
- **projects** - Projetos
- **project_members** - Membros da equipe
- **sprints** - Sprints/iterações
- **tasks** - Tarefas/ações
- **tags** - Tags para categorização
- **task_tags** - Relação tasks-tags

### 03_finance.sql
Módulo financeiro:
- **bank_accounts** - Contas bancárias
- **chart_of_accounts** - Plano de contas
- **cost_centers** - Centros de custo
- **transactions** - Transações financeiras
- **invoices** - Faturas/notas fiscais
- **invoice_items** - Itens das faturas
- **budgets** - Orçamentos

### 04_auxiliary_tables.sql
Tabelas auxiliares:
- **notifications** - Notificações
- **activity_feed** - Feed de atividades
- **favorites** - Favoritos
- **recurring_transactions** - Transações recorrentes
- **webhooks** - Integrações webhook
- **system_settings** - Configurações do sistema

## Padrão de IDs

Todos os IDs seguem o formato UUID:

\`\`\`
Users:     aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
Projects:  22222222-0001-0001-0001-00000000000X
Sprints:   33333333-0001-0001-0001-00000000000X
Tasks:     44444444-0001-0001-0001-00000000000X
Tags:      11111111-0001-0001-0001-00000000000X
\`\`\`
    `.trim(),
  },
  {
    id: "api",
    title: "API Routes",
    icon: Server,
    content: `
# API Routes

O sistema utiliza Next.js API Routes para comunicação com o banco de dados.

## Endpoints Disponíveis

### GET /api/projects
Lista todos os projetos com membros da equipe.

**Resposta:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "PROJ-001",
      "name": "Sistema ERP",
      "status": "active",
      "budget": 50000,
      "project_members": [...]
    }
  ]
}
\`\`\`

### GET /api/tasks
Lista tarefas com filtros opcionais.

**Query params:**
- \`project_id\` - Filtrar por projeto
- \`sprint_id\` - Filtrar por sprint
- \`status\` - Filtrar por status (backlog, todo, in-progress, review, done)
- \`assigned_to\` - Filtrar por usuário atribuído

**Exemplo:**
\`\`\`bash
GET /api/tasks?project_id=uuid&status=in-progress
\`\`\`

### PATCH /api/tasks
Atualiza uma tarefa (status ou assignee).

**Body:**
\`\`\`json
{
  "id": "task-uuid",
  "status": "done",
  "assigned_to": "user-uuid"
}
\`\`\`

### GET /api/sprints
Lista sprints, opcionalmente filtradas por projeto.

**Query params:**
- \`project_id\` - Filtrar por projeto

### GET /api/users
Lista todos os usuários ativos.

### GET /api/tags
Lista todas as tags do sistema.
    `.trim(),
  },
  {
    id: "components",
    title: "Componentes",
    icon: Code,
    content: `
# Componentes Principais

## Layout

### Sidebar
Barra lateral de navegação com links para todas as seções.

**Localização:** \`src/components/layout/sidebar.tsx\`

**Features:**
- Navegação entre módulos
- Indicador de rota ativa
- Logo da empresa
- Links para Dashboard, Projetos, Kanban, etc.

### Topbar
Barra superior com busca e perfil do usuário.

**Localização:** \`src/components/layout/topbar.tsx\`

## Kanban Board

### KanbanColumn
Coluna droppable para drag-and-drop de cards.

**Props:**
- \`title\` - Título da coluna
- \`status\` - Status das tarefas (backlog, todo, in-progress, review, done)
- \`cards\` - Array de cards
- \`count\` - Número de cards
- \`onCardDrop\` - Callback quando card é solto
- \`onAssigneeChange\` - Callback quando assignee muda

### KanbanCard
Card individual draggável com informações da tarefa.

**Props:**
- \`card\` - Objeto com dados da tarefa
- \`onAssigneeChange\` - Callback para mudança de assignee

**Features:**
- Drag handle
- Dropdown de assignee
- Badges de prioridade e tags
- Indicador de horas (estimadas/completadas)

### KanbanFilters
Filtros para o board Kanban.

**Features:**
- Busca por texto
- Filtro por projeto
- Filtro por sprint
- Filtro por assignee
- Filtro por status
- Botão reset

### KanbanCardModal
Modal com detalhes completos da tarefa.

**Features:**
- Visualização de todas as informações
- Seleção de assignee
- Edição de dados (futuro)
    `.trim(),
  },
  {
    id: "state-management",
    title: "Gerenciamento de Estado",
    icon: GitBranch,
    content: `
# Gerenciamento de Estado com Zustand

O sistema utiliza Zustand para state management.

## KanbanStore

**Localização:** \`src/lib/stores/kanban-store.ts\`

### State
\`\`\`typescript
interface KanbanState {
  cards: KanbanCard[];
  sprints: Sprint[];
  users: User[];
  selectedCard: KanbanCard | null;
  filter: KanbanFilter;
}
\`\`\`

### Actions
- \`setCards(cards)\` - Atualiza lista de cards
- \`setSprints(sprints)\` - Atualiza lista de sprints
- \`setUsers(users)\` - Atualiza lista de usuários
- \`setSelectedCard(card)\` - Define card selecionado
- \`setFilter(filter)\` - Atualiza filtros
- \`resetFilter()\` - Reseta filtros para padrão

### Uso

\`\`\`typescript
import { useKanbanStore } from '@/lib/stores';

function MyComponent() {
  const { cards, setCards, filter, setFilter } = useKanbanStore();
  
  // Usar state e actions
  const handleFilter = (newFilter) => {
    setFilter({ ...filter, ...newFilter });
  };
  
  return <div>...</div>;
}
\`\`\`

## UIStore

**Localização:** \`src/lib/stores/ui-store.ts\`

Gerencia estado da UI (sidebar, modals, etc).

### State
\`\`\`typescript
interface UIState {
  sidebarOpen: boolean;
}
\`\`\`

### Actions
- \`toggleSidebar()\` - Alterna sidebar
- \`setSidebarOpen(open)\` - Define estado da sidebar
    `.trim(),
  },
  {
    id: "testing",
    title: "Testes",
    icon: FileText,
    content: `
# Testes Automatizados

O projeto utiliza Jest para testes automatizados.

## Estrutura de Testes

\`\`\`
__tests__/
├── setup.ts              # Configuração global
└── api/                  # Testes de API routes
    ├── projects.test.ts
    └── tasks.test.ts
\`\`\`

## Comandos

\`\`\`bash
# Rodar todos os testes
pnpm test

# Rodar em modo watch
pnpm test:watch

# Rodar apenas testes de API
pnpm test:api

# Rodar testes de integração
pnpm test:integration

# Gerar relatório de cobertura
pnpm test:coverage
\`\`\`

## Exemplo de Teste

\`\`\`typescript
describe('GET /api/projects', () => {
  it('should return projects successfully', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
\`\`\`

## GitHub Actions

O CI/CD roda automaticamente em:
- Push para \`main\` ou \`develop\`
- Pull Requests

**Workflow:** \`.github/workflows/qa.yml\`

### Jobs
1. **Lint** - ESLint + TypeScript type check
2. **Test API** - Testes das API routes
3. **Test Integration** - Testes de integração
4. **Build** - Build da aplicação
5. **Security Audit** - Auditoria de segurança
6. **Quality Gate** - Validação final
    `.trim(),
  },
];

export default function DocsPage() {
  const [selectedSection, setSelectedSection] = useState<string>("getting-started");
  const [searchQuery, setSearchQuery] = useState("");

  const currentSection = docSections.find((s) => s.id === selectedSection);

  const filteredSections = docSections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6">
      {/* Sidebar de navegação */}
      <div className="w-64 flex-shrink-0 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        {/* Menu de seções */}
        <nav className="space-y-1">
          {filteredSections.map((section) => {
            const Icon = section.icon;
            const isActive = selectedSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {section.title}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/30">
        <div className="h-full overflow-y-auto p-8">
          {currentSection && (
            <div className="prose prose-invert max-w-none">
              <div className="mb-8 flex items-center gap-3">
                {(() => {
                  const Icon = currentSection.icon;
                  return <Icon className="h-8 w-8 text-emerald-500" />;
                })()}
                <h1 className="m-0 text-3xl font-bold text-white">{currentSection.title}</h1>
              </div>
              
              <div className="space-y-6 text-slate-300">
                {currentSection.content.split('\n\n').map((paragraph, idx) => {
                  // Detect code blocks
                  if (paragraph.startsWith('```')) {
                    const lines = paragraph.split('\n');
                    const code = lines.slice(1, -1).join('\n');
                    return (
                      <pre key={idx} className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-800 p-4">
                        <code className="text-sm text-emerald-400">{code}</code>
                      </pre>
                    );
                  }
                  
                  // Detect headings
                  if (paragraph.startsWith('# ')) {
                    return (
                      <h1 key={idx} className="text-2xl font-bold text-white">
                        {paragraph.replace('# ', '')}
                      </h1>
                    );
                  }
                  if (paragraph.startsWith('## ')) {
                    return (
                      <h2 key={idx} className="text-xl font-semibold text-white">
                        {paragraph.replace('## ', '')}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h3 key={idx} className="text-lg font-semibold text-white">
                        {paragraph.replace('### ', '')}
                      </h3>
                    );
                  }

                  // Detect lists
                  if (paragraph.includes('\n- ')) {
                    const items = paragraph.split('\n- ').slice(1);
                    return (
                      <ul key={idx} className="list-disc space-y-2 pl-6">
                        {items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    );
                  }

                  // Inline code
                  const parts = paragraph.split('`');
                  if (parts.length > 1) {
                    return (
                      <p key={idx} className="leading-relaxed">
                        {parts.map((part, i) => 
                          i % 2 === 0 ? (
                            part
                          ) : (
                            <code key={i} className="rounded bg-slate-800 px-1.5 py-0.5 text-sm text-emerald-400">
                              {part}
                            </code>
                          )
                        )}
                      </p>
                    );
                  }

                  // Regular paragraph
                  return (
                    <p key={idx} className="leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
