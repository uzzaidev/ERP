# 🚀 ERP-UzzAI

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green.svg)](https://supabase.com/)

> **"Think Smart, Think Uzz.Ai"**
>
> Sistema ERP Multi-Tenant com Inteligência Artificial para automação empresarial completa.

---

## 📖 Sobre o Projeto

O **ERP-UzzAI** é um sistema completo de gestão empresarial **multi-tenant** que integra automação com IA para processar reuniões, extrair entidades, gerenciar projetos e controlar operações comerciais e financeiras. Construído com Next.js 15, React 19, TypeScript e Supabase (PostgreSQL).

### 🎯 Problema Resolvido

| Cenário | ANTES (Manual) | DEPOIS (Automatizado) |
|---------|----------------|----------------------|
| Reunião → Ata | 4-6 horas manuais | 5 minutos automáticos |
| Venda → Estoque | Planilhas separadas | Atualização automática |
| Projeto → Budget | Desconectados | Integração total |
| Decisões duplicadas | Frequentes | RAG detecta 100% |

---

## 🏢 Multi-Tenancy (SaaS-Ready)

O ERP-UzzAI foi construído desde o início como uma **aplicação SaaS multi-tenant**:

- **Isolamento Total de Dados** - Cada empresa (tenant) tem seus dados completamente isolados
- **Row Level Security (RLS)** - Políticas de segurança no PostgreSQL garantem isolamento na camada de banco
- **Gestão de Convites** - Sistema de convites por email para adicionar usuários aos tenants
- **Planos & Limites** - Suporte para diferentes planos (Trial, Basic, Professional, Enterprise)
- **Controle de Uso** - Métricas de uso por tenant (usuários, projetos, tasks, storage)
- **RBAC Completo** - Sistema de roles e permissões (admin, gestor, financeiro, dev, juridico)

Cada tenant opera de forma independente com seu próprio conjunto de projetos, usuários, dados financeiros e configurações.

---

## ✨ Funcionalidades Principais

### 🏢 Gestão Interna
- **Projetos** - Dashboard, Sprints Semanais, Roadmap Visual
- **Reuniões** - Atas Automáticas, Extração Multi-Agente
- **Decisões (ADRs)** - Catálogo com Anti-Duplicação via RAG
- **Ações/Tasks** - Kanban Board, Atribuição Automática
- **Bullet Journal** - Daily/Weekly/Monthly Reviews
- **Performance/OKRs** - Avaliação 360°, KPIs

### 🛒 ERP Comercial
- **Produtos** - Cadastro, Categorias, SKUs
- **Estoque** - Movimentações, Preço Médio Ponderado
- **Vendas (PDV)** - Ponto de Venda, Histórico
- **Clientes/Fornecedores** - Cadastro Unificado, Visão 360°

### 💰 Financeiro/Fiscal
- **Fluxo de Caixa** - Previsão e Realizado
- **Contas a Pagar/Receber** - Agendamento, Parcelamentos
- **DRE** - Demonstrativo por Período/Projeto
- **Notas Fiscais** - NFe e NFSe
- **Budget por Projeto** - Planejado vs Realizado

### 🤖 Inteligência Artificial
- **Multi-Agent System** - 13 agentes especializados
- **RAG System** - Anti-duplicação, Contexto Histórico
- **Automações** - Workflows Customizáveis

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         ERP-UZZAI v3.0                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐│
│  │  GESTÃO INTERNA  │  │  ERP COMERCIAL   │  │  FINANCEIRO    ││
│  │                  │  │                  │  │                ││
│  │ • Projetos       │  │ • Vendas (PDV)   │  │ • Fluxo Caixa  ││
│  │ • Reuniões/Atas  │  │ • Estoque        │  │ • Contas Pagar ││
│  │ • Decisões       │  │ • Produtos       │  │ • DRE          ││
│  │ • Ações/Tasks    │  │ • Clientes       │  │ • Notas Fiscais││
│  │ • Sprints        │  │ • Fornecedores   │  │ • Budget       ││
│  └──────────────────┘  └──────────────────┘  └────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                  CAMADA DE INTELIGÊNCIA                     ││
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐  ││
│  │  │  Multi-Agente  │ │      RAG       │ │   Automações   │  ││
│  │  │  (13 Agentes)  │ │  (Qdrant+OAI)  │ │  (Workflows)   │  ││
│  │  └────────────────┘ └────────────────┘ └────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Sistema Multi-Agente

O sistema utiliza **13 agentes especializados** organizados em **3 tiers**:

| Tier | Agentes | Função |
|------|---------|--------|
| **Tier 1: Extração** | DecisionAgent, ActionAgent, KaizenAgent, RiskAgent, BlockerAgent | Extração de entidades sem acesso ao DB |
| **Tier 2: Enriquecimento** | ProjectAgent, DeadlineAgent, PriorityAgent, SprintAgent, FinancialAgent, TeamHealthAgent | Enriquecimento com dados do DB |
| **Tier 3: Validação** | ValidatorAgent | Deduplica e valida entidades finais |

---

## 🛠️ Stack Tecnológico

### Stack Principal
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 15.0.3 | Framework React com App Router |
| React | 19+ | UI Library |
| TypeScript | 5.6+ | Type Safety |
| Tailwind CSS | 3.4+ | Estilização |
| Shadcn/ui | latest | Componentes UI |
| Supabase | latest | Backend (PostgreSQL + Auth + Storage) |
| PostgreSQL | 15+ | Banco de dados relacional |
| Zustand | 5.0+ | State Management |
| @dnd-kit | 6.3+ | Drag and Drop (Kanban) |
| Zod | 3.23+ | Validação de schemas |
| React Hook Form | 7.53+ | Formulários |
| Lucide React | 0.460+ | Ícones |

### Testes & DevOps
| Tecnologia | Uso |
|------------|-----|
| Jest | Framework de testes unitários |
| @testing-library/react | Testes de componentes React |
| GitHub Actions | CI/CD |
| Capacitor | Build para Android/iOS |

---

## 🚀 Começando

### Pré-requisitos

- **Node.js 18+** e **pnpm 10+**
- **Conta Supabase** (gratuita) - [supabase.com](https://supabase.com)
- **Git** para controle de versão

### Instalação Rápida

```bash
# 1. Clone o repositório
git clone https://github.com/uzzaidev/ERP.git
cd ERP

# 2. Instale as dependências (use pnpm)
pnpm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local

# 4. Edite .env.local com suas credenciais do Supabase:
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY
#    - SUPABASE_SERVICE_ROLE_KEY

# 5. Configure o banco de dados no Supabase
#    Acesse o SQL Editor no Supabase Dashboard e execute os scripts na ordem:
#    - db/00_init.sql
#    - db/00_tenants.sql
#    - db/01_users_and_auth.sql
#    - db/02_projects_and_tasks.sql
#    - db/03_finance.sql
#    - db/04_auxiliary_tables.sql
#    - db/05_rls_policies.sql

# 6. Inicie o servidor de desenvolvimento
pnpm dev

# 7. Acesse a aplicação
#    http://localhost:3000
```

### Comandos Disponíveis

```bash
# Desenvolvimento
pnpm dev                    # Servidor de desenvolvimento
pnpm build                  # Build para produção
pnpm start                  # Iniciar servidor de produção
pnpm lint                   # Executar ESLint

# Testes
pnpm test                   # Testes unitários
pnpm test:watch             # Testes em modo watch
pnpm test:coverage          # Cobertura de testes
pnpm test:integration       # Testes de integração
pnpm test:all               # Todos os testes

# Mobile (Capacitor)
pnpm cap:sync               # Sincronizar assets para mobile
pnpm cap:android            # Abrir projeto Android
pnpm cap:ios                # Abrir projeto iOS
```

---

## 📁 Estrutura do Projeto

```
erp-uzzai/
├── src/
│   ├── app/                  # Páginas Next.js (App Router)
│   │   ├── (auth)/           # Rotas autenticadas
│   │   ├── (public)/         # Rotas públicas
│   │   └── api/              # API Routes
│   ├── components/           # Componentes React
│   │   ├── layout/           # Sidebar, Topbar
│   │   └── kanban/           # Componentes do Kanban
│   ├── lib/                  # Utilitários e configurações
│   │   ├── api/              # Cliente API
│   │   ├── hooks/            # React Hooks customizados
│   │   ├── stores/           # Zustand stores
│   │   └── supabase/         # Cliente Supabase
│   └── types/                # TypeScript types
│
├── db/                       # Scripts SQL do banco de dados
│   ├── 00_init.sql           # Inicialização
│   ├── 00_tenants.sql        # Multi-tenancy
│   ├── 01_users_and_auth.sql # Usuários e autenticação
│   ├── 02_projects_and_tasks.sql # Projetos e tasks
│   ├── 03_finance.sql        # Módulo financeiro
│   ├── 04_auxiliary_tables.sql # Tabelas auxiliares
│   └── 05_rls_policies.sql   # Row Level Security
│
├── __tests__/                # Testes automatizados
│   └── api/                  # Testes das API routes
│
├── .github/
│   └── workflows/            # GitHub Actions CI/CD
│
├── public/                   # Assets estáticos
└── README.md
```

---

## 🔌 API Endpoints

### API Routes (Next.js)

Todas as rotas implementam **isolamento multi-tenant** automaticamente usando `getTenantContext()`.

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/projects` | Lista projetos do tenant com membros |
| `GET` | `/api/tasks` | Lista tarefas (filtros: project_id, sprint_id, status, assigned_to) |
| `PATCH` | `/api/tasks` | Atualiza status ou assignee de uma tarefa |
| `GET` | `/api/sprints` | Lista sprints (filtro opcional: project_id) |
| `GET` | `/api/users` | Lista usuários ativos do tenant |
| `GET` | `/api/tags` | Lista tags do tenant |
| `GET` | `/api/tenants` | Lista informações do tenant atual |
| `POST` | `/api/invitations/accept` | Aceita convite para tenant |
| `GET` | `/api/auth/me` | Retorna usuário autenticado |

### Arquitetura Multi-Tenant

**Isolamento de Dados**: Todos os dados são isolados por `tenant_id`. Cada requisição:

1. Extrai o `tenant_id` do usuário autenticado via `getTenantContext()`
2. Filtra todas as queries do banco com `.eq('tenant_id', tenantId)`
3. Valida acesso antes de UPDATE/DELETE
4. Row Level Security (RLS) no PostgreSQL garante isolamento na camada de banco

**Exemplo de Implementação**:
```typescript
import { getTenantContext } from '@/lib/supabase/tenant';

export async function GET() {
  const { tenantId } = await getTenantContext();

  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('tenant_id', tenantId); // Isolamento obrigatório

  return NextResponse.json({ success: true, data });
}
```

---

## 📊 Schema de IDs

| Entidade | Formato | Exemplo |
|----------|---------|---------|
| Decisão | `D-{YYYY}-{seq}` | `D-2025-042` |
| Ação | `A-{YYYY}-{seq}` | `A-2025-123` |
| Kaizen | `K-{tipo[0]}-{seq}` | `K-T-015` |
| Risco | `R-{projeto}-{seq}` | `R-CHATBOT-003` |
| Meeting | `MTG-{YYYY-MM-DD}-{projeto}` | `MTG-2025-11-24-CHATBOT` |
| Sprint | `Sprint-{YYYY}-W{nn}` | `Sprint-2025-W48` |
| Venda | `VND-{YYYY}-{seq}` | `VND-2025-00456` |
| Produto | `SKU-{categoria}-{seq}` | `SKU-ELET-001` |

---

## 🎯 Roadmap

### ✅ Concluído

- [x] Arquitetura Multi-Tenant completa
- [x] Autenticação e RBAC (Supabase Auth)
- [x] Frontend base (Next.js 15 + React 19 + Shadcn/ui)
- [x] Sistema de Projetos e Sprints
- [x] Kanban Board com drag-and-drop
- [x] Sistema de Tasks com comentários e time tracking
- [x] API Routes com isolamento multi-tenant
- [x] Row Level Security (RLS) no PostgreSQL
- [x] Testes unitários e de integração

### 🚧 Em Desenvolvimento

- [ ] **Gestão Interna**
  - [ ] Ingestão automática de Reuniões
  - [ ] Dashboard de Projetos avançado
  - [ ] Bullet Journal e Performance/OKRs

- [ ] **Multi-Agent System (IA)**
  - [ ] Setup Qdrant Vector Database
  - [ ] Multi-Agent Orchestrator (13 agentes)
  - [ ] RAG System para anti-duplicação
  - [ ] Extração automática de entidades de reuniões

### 📋 Planejado

- [ ] **ERP Comercial**
  - [ ] Cadastros unificados (Clientes/Fornecedores)
  - [ ] PDV / Vendas
  - [ ] Gestão de Estoque + Movimentações
  - [ ] Produtos e Categorias

- [ ] **Financeiro**
  - [ ] Contas a Pagar/Receber
  - [ ] Fluxo de Caixa e DRE
  - [ ] Emissão de Notas Fiscais (NFe/NFSe)
  - [ ] Budget por Projeto

- [ ] **SaaS & Billing**
  - [ ] Integração Stripe para pagamentos
  - [ ] Planos (Trial, Basic, Professional, Enterprise)
  - [ ] Onboarding automático de novos tenants
  - [ ] Métricas e Analytics por tenant

---

## 📈 Métricas de Sucesso

| Métrica | Target |
|---------|--------|
| Extração Recall | ≥ 85% |
| Extração Precision | ≥ 80% |
| Deduplicação RAG | 100% |
| Latência API | ≤ 200ms |
| Processamento Reunião | ≤ 60s |
| Uptime | ≥ 99.5% |

---

## 📚 Documentação

### Para Desenvolvedores

- **[CLAUDE.md](./CLAUDE.md)** - Guia completo para desenvolvimento com Claude Code (comandos, arquitetura, padrões)
- **[docs/README.md](./docs/README.md)** - Índice completo da documentação técnica
- **[db/README.md](./db/README.md)** - Documentação do schema do banco de dados

### Documentação de Arquitetura

Toda documentação técnica está organizada em **[docs/](./docs/README.md)** seguindo uma estrutura numerada:

- **[1. Arquitetura](./docs/1.%20Arquitetura/)** - Arquitetura do sistema e multi-tenancy
  - [MULTI_TENANT_SETUP.md](./docs/1.%20Arquitetura/MULTI_TENANT_SETUP.md)
  - [MULTI_TENANT_IMPLEMENTATION.md](./docs/1.%20Arquitetura/MULTI_TENANT_IMPLEMENTATION.md)
  - [MULTI_TENANT_API_USAGE.md](./docs/1.%20Arquitetura/MULTI_TENANT_API_USAGE.md)
- **[5. Supabase](./docs/5.%20Supabase/)** - Setup e configurações do Supabase
- **[6. Testing](./docs/6.%20Testing/)** - Estratégias e documentação de testes

> 💡 **Convenção**: Novos documentos técnicos devem ser criados nas subpastas de `docs/` seguindo a estrutura numerada. Consulte [docs/README.md](./docs/README.md) para detalhes.

### Recursos Externos

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Shadcn/ui Components](https://ui.shadcn.com)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia as diretrizes de contribuição antes de submeter um PR.

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Equipe

Desenvolvido com ❤️ pela equipe UzzAI.

---

## 📞 Contato

- **Website**: [uzzai.dev](https://uzzai.dev)
- **Email**: contato@uzzai.dev

---

<p align="center">
  <strong>ERP-UzzAI</strong> — Sistema ERP Unificado com IA
  <br>
  <em>"Think Smart, Think Uzz.Ai"</em>
</p>
