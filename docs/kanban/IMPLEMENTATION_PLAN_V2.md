# 🚀 Plano de Implementação V2 - UzzAI ERP

**Data Início**: 2025-12-08  
**Status Atual**: MVP Completo (Sprints 1-10) | **Próximo Milestone**: Features Únicas Restantes  
**Prazo Estimado Fase 5**: 3-4 meses (Sprints 11-17)  
**Versão**: 2.0 (Continuação do IMPLEMENTATION_PLAN)

---

## 📊 Status Atual (Resumo)

| Módulo | Status | Comentário |
|--------|--------|------------|
| **MVP (Fases 1-4)** | ✅ 100% | **COMPLETO** - Sprints 1-10 finalizadas |
| CRUD Tarefas | ✅ 100% | Sprint 1 completa |
| CRUD Projetos | ✅ 100% | Sprint 2 completa |
| CRUD Sprints | ✅ 100% | Sprint 3 completa |
| Comentários + Time Logs | ✅ 100% | Sprint 4 completa |
| Burndown + Velocity Charts | ✅ 100% | Sprint 5 completa |
| Dashboard + PDF Report | ✅ 100% | Sprint 6 completa |
| ADRs (Feature Única #1) | ✅ 100% | Sprint 7 completa |
| Kaizen (Feature Única #2) | ✅ 100% | Sprint 8 completa |
| Meeting Score (Feature Única #5) | ✅ 100% | Sprint 9 completa |
| Gantt Chart | ✅ 100% | Sprint 10 completa |
| **Features Únicas Restantes** | ❌ 0% | 6 de 9 features faltam (67%) |
| **Features Secundárias** | ⚠️ 30% | Templates, Automações, Integrações, etc. |

**Progresso Geral**: ~65% do sistema completo (51 de 129 features)

---

## 🎯 Visão Geral - Fase 5 (Sprints 11-17)

### Objetivo Principal

Implementar as **6 features únicas restantes** que diferenciam o ERP UzzAI da concorrência, completando assim o conjunto de 9 features exclusivas que criam uma barreira competitiva significativa.

### Features Únicas a Implementar

1. ✅ ADRs (Architecture Decision Records) - **COMPLETO**
2. ✅ Sistema Kaizen - **COMPLETO**
3. ❌ **Risk Severity Auto-calculado** - Sprint 11
4. ❌ **Financial Tracking por Decisão** - Sprint 12
5. ✅ Meeting Effectiveness Score - **COMPLETO**
6. ❌ **Knowledge Base/Wiki** - Sprints 13-14
7. ❌ **OKRs com Brutal Honesty** - Sprint 15
8. ❌ **Offline-First PWA** - Sprint 16
9. ❌ **Zero Vendor Lock-in (Export completo)** - Sprint 17

### Features Secundárias Prioritárias

- Subtasks UI completa
- Dependências entre tasks
- Templates (tasks, projects, sprints)
- Automações básicas
- Notificações (in-app, email)
- Módulos ERP (Financeiro, Vendas, Operações)

---

## 🔴 FASE 5 - FEATURES ÚNICAS RESTANTES (Sprints 11-17)

**Objetivo**: Completar as 6 features únicas restantes + features secundárias críticas  
**Duração Estimada**: 3-4 meses  
**Sprints**: 11-17

---

### 📅 Sprint 11: Risk Severity Auto-calculado (Semana 11) - Feature Única #3

**Objetivo**: Implementar sistema de gestão de riscos com cálculo automático de severidade

**Database Migration**: `db/18_risks_table.sql`

#### Tasks:

- [ ] **11.1 Database Migration** - 2 dias
  - [ ] Criar tabela `risks`
    ```sql
    CREATE TABLE risks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id),
      code TEXT NOT NULL, -- R-PROJ-001, R-PROJ-002, etc.
      title TEXT NOT NULL,
      description TEXT,
      probability INTEGER NOT NULL CHECK (probability BETWEEN 1 AND 5),
      impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 5),
      severity INTEGER GENERATED ALWAYS AS (probability * impact) STORED,
      category TEXT GENERATED ALWAYS AS (
        CASE 
          WHEN (probability * impact) >= 16 THEN 'critical'
          WHEN (probability * impact) >= 12 THEN 'high'
          WHEN (probability * impact) >= 6 THEN 'medium'
          ELSE 'low'
        END
      ) STORED,
      mitigation_plan TEXT,
      owner_id UUID REFERENCES users(id),
      project_id UUID REFERENCES projects(id),
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'mitigated', 'accepted')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    ```
  - [ ] Adicionar RLS policies
  - [ ] Criar função de geração de código (`R-{project_code}-{seq}`)
  - [ ] Criar triggers para auto-update de `updated_at`

- [ ] **11.2 Risk CRUD APIs** - 2 dias
  - [ ] `GET /api/risks` - Listar riscos (filtros: project, status, category)
  - [ ] `GET /api/risks/:id` - Detalhes do risco
  - [ ] `POST /api/risks` - Criar risco (gera código automático)
  - [ ] `PUT /api/risks/:id` - Atualizar risco
  - [ ] `DELETE /api/risks/:id` - Deletar risco
  - [ ] `GET /api/projects/:id/risks` - Riscos de um projeto específico

- [ ] **11.3 Risk UI Components** - 3 dias
  - [ ] Criar `src/components/risks/RiskCard.tsx`
    - [ ] Exibir severity com color coding (🔴 ≥16, 🟡 ≥12, 🟠 ≥6, 🟢 <6)
    - [ ] Mostrar probability × impact = severity
    - [ ] Badge de categoria (Critical, High, Medium, Low)
  - [ ] Criar `src/components/risks/CreateRiskModal.tsx`
    - [ ] Form: title, description, probability (slider 1-5), impact (slider 1-5)
    - [ ] Preview de severity calculado em tempo real
    - [ ] Campos: mitigation_plan, owner, project, status
  - [ ] Criar `src/components/risks/EditRiskModal.tsx`
    - [ ] Mesmos campos do CreateModal
    - [ ] Botão delete com confirmação

- [ ] **11.4 Risk Register Page** - 2 dias
  - [ ] Criar `src/app/(auth)/riscos/page.tsx`
  - [ ] Lista de riscos com filtros (project, status, category)
  - [ ] Grid/Cards view com color coding
  - [ ] Stats dashboard:
    - Total risks por categoria
    - Média de severity
    - Riscos ativos vs mitigados
  - [ ] Botão "Novo Risco"

- [ ] **11.5 Integração com Projetos** - 1 dia
  - [ ] Tab "Risks" em `/projetos/:id`
  - [ ] Mostrar riscos do projeto
  - [ ] Risk matrix 5×5 (probability × impact)
  - [ ] Quick add risk button

- [ ] **11.6 Tests** - 1 dia
  - [ ] `__tests__/api/risks.test.ts`
  - [ ] Testar CRUD completo
  - [ ] Testar cálculo automático de severity
  - [ ] Testar multi-tenancy
  - [ ] Testar categoria auto-assignada

**Resultado**: ✅ Sistema de Risk Management funcional com cálculo automático de severidade - **Feature Única #3**

**Duração Total**: 11 dias (~2 semanas)

---

### 📅 Sprint 12: Financial Tracking por Decisão (Semana 12-13) - Feature Única #4

**Objetivo**: Implementar rastreamento financeiro para cada decisão técnica (ADR)

**Database Migration**: `db/19_decision_financials.sql`

#### Tasks:

- [ ] **12.1 Database Migration** - 2 dias
  - [ ] Criar tabela `decision_financials`
    ```sql
    CREATE TABLE decision_financials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id),
      decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
      
      -- Initial Costs
      development_hours NUMERIC(10,2),
      hourly_rate NUMERIC(10,2) DEFAULT 100.00,
      tools_cost NUMERIC(10,2) DEFAULT 0,
      training_cost NUMERIC(10,2) DEFAULT 0,
      total_initial_cost NUMERIC(10,2) GENERATED ALWAYS AS (
        (development_hours * hourly_rate) + tools_cost + training_cost
      ) STORED,
      
      -- Ongoing Costs
      monthly_cost NUMERIC(10,2) DEFAULT 0,
      maintenance_hours_per_month NUMERIC(10,2) DEFAULT 0,
      
      -- Savings
      monthly_savings NUMERIC(10,2) DEFAULT 0,
      productivity_gain_percent NUMERIC(5,2) DEFAULT 0,
      
      -- ROI Calculations (auto-calculated)
      monthly_net_savings NUMERIC(10,2) GENERATED ALWAYS AS (
        monthly_savings - monthly_cost - (maintenance_hours_per_month * hourly_rate)
      ) STORED,
      break_even_months NUMERIC(10,2) GENERATED ALWAYS AS (
        CASE 
          WHEN (monthly_savings - monthly_cost - (maintenance_hours_per_month * hourly_rate)) > 0
          THEN ((development_hours * hourly_rate) + tools_cost + training_cost) / 
               (monthly_savings - monthly_cost - (maintenance_hours_per_month * hourly_rate))
          ELSE NULL
        END
      ) STORED,
      annual_roi_percent NUMERIC(10,2) GENERATED ALWAYS AS (
        CASE 
          WHEN ((development_hours * hourly_rate) + tools_cost + training_cost) > 0
          THEN (((monthly_savings - monthly_cost - (maintenance_hours_per_month * hourly_rate)) * 12) / 
                ((development_hours * hourly_rate) + tools_cost + training_cost)) * 100
          ELSE NULL
        END
      ) STORED,
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    ```
  - [ ] Adicionar RLS policies
  - [ ] Criar triggers

- [ ] **12.2 Financial Tracking APIs** - 2 dias
  - [ ] `GET /api/decisions/:id/financials` - Financials de uma decisão
  - [ ] `POST /api/decisions/:id/financials` - Adicionar tracking financeiro
  - [ ] `PUT /api/decisions/:id/financials` - Atualizar financials
  - [ ] `DELETE /api/decisions/:id/financials` - Remover tracking
  - [ ] `GET /api/analytics/financial-decisions` - Dashboard de decisões com ROI

- [ ] **12.3 Financial Form Component** - 3 dias
  - [ ] Criar `src/components/decisions/DecisionFinancialForm.tsx`
  - [ ] Seção: Initial Costs
    - Development hours (slider/input)
    - Hourly rate (default R$ 100/h)
    - Tools cost
    - Training cost
    - **Total Initial Cost (auto-calc)**
  - [ ] Seção: Ongoing Costs
    - Monthly cost
    - Maintenance hours/month
  - [ ] Seção: Savings
    - Monthly savings
    - Productivity gain %
  - [ ] Seção: ROI Metrics (auto-calculated, read-only)
    - Monthly net savings
    - Break-even months
    - Annual ROI %
  - [ ] Real-time calculations as user types

- [ ] **12.4 Decision Details Enhancement** - 2 dias
  - [ ] Atualizar `src/app/(auth)/decisoes/page.tsx`
  - [ ] Adicionar coluna "ROI" na tabela
  - [ ] Badge de ROI (verde ≥20%, amarelo ≥10%, vermelho <10%)
  - [ ] Filtro por "Com tracking financeiro"
  - [ ] Modal de detalhes expandido com tab "Financeiro"

- [ ] **12.5 Financial Dashboard** - 2 dias
  - [ ] Criar `src/app/(auth)/financeiro/decisoes/page.tsx`
  - [ ] Stats cards:
    - Total invested (soma initial costs)
    - Total monthly savings
    - Average break-even months
    - Average annual ROI
  - [ ] Chart: ROI por decisão (bar chart)
  - [ ] Chart: Break-even timeline
  - [ ] Tabela: Top 10 decisões por ROI

- [ ] **12.6 Tests** - 1 dia
  - [ ] `__tests__/api/decision-financials.test.ts`
  - [ ] Testar cálculos automáticos
  - [ ] Testar edge cases (zero savings, negative ROI)

**Resultado**: ✅ Sistema de Financial Tracking funcional - **Feature Única #4**

**Duração Total**: 12 dias (~2.5 semanas)

---

### 📅 Sprint 13-14: Knowledge Base/Wiki (Semanas 14-16) - Feature Única #6

**Objetivo**: Implementar sistema wiki completo com backlinks automáticos e versionamento

**Database Migration**: `db/20_wiki_system.sql`

#### Tasks Sprint 13:

- [ ] **13.1 Database Migration** - 3 dias
  - [ ] Criar tabela `wiki_pages`
    ```sql
    CREATE TABLE wiki_pages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id),
      slug TEXT NOT NULL, -- URL-friendly: "getting-started", "api-docs"
      title TEXT NOT NULL,
      content TEXT NOT NULL, -- Markdown content
      category TEXT,
      tags TEXT[],
      
      -- Metadata
      created_by UUID REFERENCES users(id),
      updated_by UUID REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      
      -- Version control
      version INTEGER DEFAULT 1,
      is_latest BOOLEAN DEFAULT true,
      
      UNIQUE(tenant_id, slug, version)
    );
    ```
  - [ ] Criar tabela `wiki_page_versions`
    ```sql
    CREATE TABLE wiki_page_versions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      page_id UUID NOT NULL REFERENCES wiki_pages(id) ON DELETE CASCADE,
      version INTEGER NOT NULL,
      content TEXT NOT NULL,
      updated_by UUID REFERENCES users(id),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      change_summary TEXT,
      UNIQUE(page_id, version)
    );
    ```
  - [ ] Criar tabela `wiki_backlinks`
    ```sql
    CREATE TABLE wiki_backlinks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id),
      from_page_id UUID NOT NULL REFERENCES wiki_pages(id) ON DELETE CASCADE,
      to_page_id UUID NOT NULL REFERENCES wiki_pages(id) ON DELETE CASCADE,
      link_text TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(from_page_id, to_page_id)
    );
    ```
  - [ ] Criar tabela `wiki_page_links` (para tasks, decisões, etc.)
    ```sql
    CREATE TABLE wiki_page_links (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      wiki_page_id UUID NOT NULL REFERENCES wiki_pages(id) ON DELETE CASCADE,
      linked_entity_type TEXT NOT NULL, -- 'task', 'decision', 'project', 'meeting'
      linked_entity_id UUID NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(wiki_page_id, linked_entity_type, linked_entity_id)
    );
    ```
  - [ ] Adicionar RLS policies
  - [ ] Criar função para detectar backlinks no conteúdo
    ```sql
    CREATE OR REPLACE FUNCTION extract_wiki_links(content TEXT)
    RETURNS TEXT[] AS $$
      -- Regex para detectar [[Page Title]] ou [[slug]]
      SELECT array_agg(matches[1])
      FROM regexp_matches(content, '\[\[([^\]]+)\]\]', 'g') AS matches;
    $$ LANGUAGE SQL IMMUTABLE;
    ```
  - [ ] Criar trigger para atualizar backlinks automaticamente

- [ ] **13.2 Wiki CRUD APIs** - 3 dias
  - [ ] `GET /api/wiki` - Listar páginas (filtros: category, tags, search)
  - [ ] `GET /api/wiki/:slug` - Obter página por slug
  - [ ] `GET /api/wiki/:slug/versions` - Histórico de versões
  - [ ] `GET /api/wiki/:slug/backlinks` - Páginas que linkam para esta
  - [ ] `POST /api/wiki` - Criar nova página
  - [ ] `PUT /api/wiki/:slug` - Atualizar página (cria nova versão)
  - [ ] `DELETE /api/wiki/:slug` - Deletar página
  - [ ] `POST /api/wiki/:slug/restore/:version` - Restaurar versão anterior

- [ ] **13.3 Markdown Editor Component** - 3 dias
  - [ ] Integrar editor MDX (react-md-editor ou similar)
  - [ ] Criar `src/components/wiki/WikiEditor.tsx`
  - [ ] Suporte a syntax highlighting
  - [ ] Preview side-by-side
  - [ ] Toolbar com formatação (bold, italic, headers, lists, code)
  - [ ] Autocomplete para wiki links `[[` → suggestions
  - [ ] Suporte a imagens (upload via Supabase Storage)

#### Tasks Sprint 14:

- [ ] **14.1 Wiki Page View** - 3 dias
  - [ ] Criar `src/app/(auth)/docs/[slug]/page.tsx`
  - [ ] Renderizar markdown com syntax highlighting
  - [ ] Converter [[wiki links]] em links clicáveis
  - [ ] Sidebar com:
    - Table of Contents (headings)
    - Backlinks section
    - Related pages
    - Version history
  - [ ] Botões de ação:
    - Edit page
    - View history
    - Delete page

- [ ] **14.2 Wiki List Page** - 2 dias
  - [ ] Criar `src/app/(auth)/docs/page.tsx`
  - [ ] Grid/Lista de páginas wiki
  - [ ] Filtros por categoria e tags
  - [ ] Busca por título e conteúdo
  - [ ] Stats: Total pages, total categories, recent updates
  - [ ] Botão "Nova Página"

- [ ] **14.3 Wiki Create/Edit Modal** - 2 dias
  - [ ] Criar `src/components/wiki/CreateWikiModal.tsx`
  - [ ] Form: title (auto-gera slug), category, tags
  - [ ] WikiEditor integrado
  - [ ] Preview tab
  - [ ] Change summary field (para versioning)
  - [ ] Validação de slug único

- [ ] **14.4 Version History UI** - 2 dias
  - [ ] Criar `src/components/wiki/VersionHistory.tsx`
  - [ ] Lista de versões com:
    - Version number
    - Updated by (user avatar + name)
    - Updated at (timestamp)
    - Change summary
    - Diff preview (opcional: react-diff-viewer)
  - [ ] Botão "Restore this version"

- [ ] **14.5 Backlinks & Related Pages** - 2 dias
  - [ ] Detectar e criar backlinks automaticamente ao salvar
  - [ ] Component `WikiBacklinks.tsx`
  - [ ] Mostrar páginas que linkam para a atual
  - [ ] Sugerir related pages baseado em tags/categoria

- [ ] **14.6 Tests** - 1 dia
  - [ ] `__tests__/api/wiki.test.ts`
  - [ ] Testar CRUD completo
  - [ ] Testar versionamento
  - [ ] Testar detecção de backlinks
  - [ ] Testar multi-tenancy

**Resultado**: ✅ Sistema Wiki completo com backlinks automáticos e versionamento - **Feature Única #6**

**Duração Total Sprint 13**: 9 dias (~2 semanas)  
**Duração Total Sprint 14**: 10 dias (~2 semanas)  
**Duração Total**: 19 dias (~4 semanas)

---

### 📅 Sprint 15: OKRs com Brutal Honesty (Semana 17-18) - Feature Única #7

**Objetivo**: Implementar sistema de OKRs com transparência radical sobre realidade vs projeções

**Database Migration**: `db/21_okrs_system.sql`

#### Tasks:

- [ ] **15.1 Database Migration** - 2 dias
  - [ ] Criar tabela `okrs`
    ```sql
    CREATE TABLE okrs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id),
      period TEXT NOT NULL CHECK (period IN ('annual', 'quarterly', 'monthly')),
      year INTEGER NOT NULL,
      quarter INTEGER CHECK (quarter BETWEEN 1 AND 4),
      month INTEGER CHECK (month BETWEEN 1 AND 12),
      objective TEXT NOT NULL,
      owner_id UUID REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    ```
  - [ ] Criar tabela `key_results`
    ```sql
    CREATE TABLE key_results (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      okr_id UUID NOT NULL REFERENCES okrs(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      target_value NUMERIC(10,2) NOT NULL,
      current_value NUMERIC(10,2) DEFAULT 0,
      progress_percent NUMERIC(5,2) GENERATED ALWAYS AS (
        (current_value / NULLIF(target_value, 0)) * 100
      ) STORED,
      
      -- Scenarios
      scenario_pessimistic NUMERIC(10,2),
      scenario_realistic NUMERIC(10,2),
      scenario_optimistic NUMERIC(10,2),
      
      -- Reality Check
      brutal_truth TEXT,
      lessons_learned TEXT[],
      course_corrections TEXT[],
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    ```
  - [ ] Adicionar RLS policies

- [ ] **15.2 OKR CRUD APIs** - 2 dias
  - [ ] `GET /api/okrs` - Listar OKRs (filtros: period, year, quarter)
  - [ ] `GET /api/okrs/:id` - Detalhes do OKR com KRs
  - [ ] `POST /api/okrs` - Criar OKR
  - [ ] `PUT /api/okrs/:id` - Atualizar OKR
  - [ ] `DELETE /api/okrs/:id` - Deletar OKR
  - [ ] `POST /api/okrs/:id/key-results` - Adicionar KR
  - [ ] `PUT /api/key-results/:id` - Atualizar KR
  - [ ] `DELETE /api/key-results/:id` - Deletar KR

- [ ] **15.3 OKR Components** - 3 dias
  - [ ] Criar `src/components/okrs/OKRCard.tsx`
    - [ ] Exibir objective
    - [ ] Lista de Key Results com progress bars
    - [ ] Color coding por progresso (verde ≥80%, amarelo ≥60%, vermelho <60%)
    - [ ] Badge de período (Q1 2025, 2025 Annual, etc.)
  - [ ] Criar `src/components/okrs/CreateOKRModal.tsx`
    - [ ] Form: period, year, quarter/month, objective, owner
    - [ ] Dynamic KR list (add/remove)
    - [ ] Por KR: description, target value, scenarios (P/R/O)

- [ ] **15.4 OKR Page** - 2 dias
  - [ ] Criar `src/app/(auth)/okrs/page.tsx`
  - [ ] Tabs: Annual, Quarterly, Monthly
  - [ ] Grid de OKRs com filtros
  - [ ] Stats: % OKRs on track, average progress
  - [ ] Botão "Novo OKR"

- [ ] **15.5 OKR Details & Reality Check** - 3 dias
  - [ ] Criar `src/app/(auth)/okrs/:id/page.tsx`
  - [ ] Seção: Key Results
    - Progress bar com current vs target
    - Scenario chart (pessimistic, realistic, optimistic lines)
    - Update current value button
  - [ ] Seção: Brutal Honesty
    - Campo "Brutal Truth" (O que realmente está acontecendo?)
    - Lista de "Lessons Learned"
    - Lista de "Course Corrections"
    - Save reality check

- [ ] **15.6 OKR Dashboard** - 2 dias
  - [ ] Criar `src/components/okrs/OKRDashboard.tsx`
  - [ ] Chart: Progress over time (line chart)
  - [ ] Comparison chart: Scenarios vs Reality
  - [ ] Heatmap: OKRs por período e status

- [ ] **15.7 Tests** - 1 dia
  - [ ] `__tests__/api/okrs.test.ts`
  - [ ] Testar CRUD completo
  - [ ] Testar cálculo de progress_percent
  - [ ] Testar scenarios

**Resultado**: ✅ Sistema de OKRs com Brutal Honesty funcional - **Feature Única #7**

**Duração Total**: 15 dias (~3 semanas)

---

### 📅 Sprint 16: Offline-First PWA (Semana 19-20) - Feature Única #8

**Objetivo**: Implementar Progressive Web App com funcionalidade offline completa

#### Tasks:

- [ ] **16.1 Service Worker Setup** - 2 dias
  - [ ] Configurar Next.js PWA
    ```bash
    npm install next-pwa
    ```
  - [ ] Criar `public/sw.js` (Service Worker)
  - [ ] Implementar cache strategies:
    - Cache-first para assets estáticos
    - Network-first para API calls
    - Stale-while-revalidate para páginas
  - [ ] Criar manifest.json com ícones e configurações

- [ ] **16.2 Offline Queue System** - 3 dias
  - [ ] Criar `src/lib/offline/queue.ts`
  - [ ] IndexedDB para armazenar mudanças offline
    ```typescript
    interface OfflineChange {
      id: string;
      timestamp: number;
      method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      url: string;
      body: any;
      synced: boolean;
    }
    ```
  - [ ] Interceptar API calls quando offline
  - [ ] Queue mudanças para sincronização posterior

- [ ] **16.3 Sync Manager** - 3 dias
  - [ ] Criar `src/lib/offline/sync.ts`
  - [ ] Detectar quando volta online
  - [ ] Sincronizar mudanças na ordem correta
  - [ ] Resolver conflitos (last-write-wins ou user prompt)
  - [ ] Background sync API para sync em background
  - [ ] Retry logic com exponential backoff

- [ ] **16.4 Offline Indicator UI** - 2 dias
  - [ ] Criar `src/components/offline/OfflineIndicator.tsx`
  - [ ] Banner no topo quando offline
  - [ ] Mostrar quantidade de mudanças pendentes
  - [ ] Botão "Sync Now" quando voltar online
  - [ ] Toast notifications para sync status

- [ ] **16.5 Offline-Ready Components** - 3 dias
  - [ ] Atualizar Kanban para funcionar offline
  - [ ] Cache tasks, projects, sprints no IndexedDB
  - [ ] Atualizar UI optimistically
  - [ ] Marcar itens não sincronizados (badge "Offline")
  - [ ] Atualizar Forms para validar offline

- [ ] **16.6 Tests & PWA Validation** - 2 dias
  - [ ] Testar funcionamento offline
  - [ ] Testar sincronização quando volta online
  - [ ] Testar conflitos de dados
  - [ ] Lighthouse PWA audit (deve passar 100%)
  - [ ] Testar em diferentes browsers
  - [ ] Testar instalação como app

**Resultado**: ✅ PWA funcional com capacidade offline completa - **Feature Única #8**

**Duração Total**: 15 dias (~3 semanas)

---

### 📅 Sprint 17: Zero Vendor Lock-in - Export Completo (Semana 21) - Feature Única #9

**Objetivo**: Implementar sistema de export completo em múltiplos formatos (Markdown, JSON, CSV)

#### Tasks:

- [ ] **17.1 Export Engine** - 2 dias
  - [ ] Criar `src/lib/export/engine.ts`
  - [ ] Função `exportAllData(tenantId, format)`
  - [ ] Buscar todos os dados do tenant:
    - Projects, tasks, sprints
    - Decisions (ADRs), kaizens, meetings
    - Risks, OKRs, wiki pages
    - Users, comments, time logs
  - [ ] Estruturar dados em formato hierárquico

- [ ] **17.2 Markdown Exporter** - 3 dias
  - [ ] Criar `src/lib/export/markdown.ts`
  - [ ] Converter tasks para formato Obsidian-compatible:
    ```markdown
    # TASK-123: Implementar feature X
    
    **Status**: In Progress
    **Assignee**: @john
    **Priority**: P0
    **Due Date**: 2025-12-31
    
    ## Description
    
    Lorem ipsum dolor sit amet...
    
    ## Comments
    
    - [2025-12-01 @jane] Comment text here
    
    ## Time Logs
    
    - 2h by @john: Development work
    ```
  - [ ] Converter projects para markdown
  - [ ] Converter decisões (ADRs) para formato ADR padrão
  - [ ] Criar estrutura de pastas: `/projects/`, `/tasks/`, `/decisions/`, etc.
  - [ ] Gerar arquivo ZIP com todos markdowns

- [ ] **17.3 JSON Exporter** - 2 dias
  - [ ] Criar `src/lib/export/json.ts`
  - [ ] Export completo em JSON estruturado
  - [ ] Manter relacionamentos (project_id, task_id, etc.)
  - [ ] Incluir metadados (export_date, tenant_name, version)
  - [ ] Pretty-print JSON (indentado)

- [ ] **17.4 CSV Exporter** - 2 dias
  - [ ] Criar `src/lib/export/csv.ts`
  - [ ] Um CSV por entidade:
    - `projects.csv`
    - `tasks.csv`
    - `sprints.csv`
    - `decisions.csv`
    - etc.
  - [ ] Headers com nomes amigáveis
  - [ ] Escape de caracteres especiais

- [ ] **17.5 Export UI** - 2 dias
  - [ ] Criar `src/app/(auth)/configuracoes/export/page.tsx`
  - [ ] Cards de export:
    - "Export Markdown" (Obsidian-ready)
    - "Export JSON" (Full backup)
    - "Export CSV" (Spreadsheet-ready)
  - [ ] Checkboxes para selecionar o que exportar
  - [ ] Progress bar durante export
  - [ ] Download automático do ZIP

- [ ] **17.6 Import System (Opcional)** - 2 dias
  - [ ] Criar `src/lib/import/engine.ts`
  - [ ] Suportar import de Markdown
  - [ ] Suportar import de JSON (restore backup)
  - [ ] Validação de dados antes de importar
  - [ ] Preview de dados a importar

- [ ] **17.7 Tests** - 1 dia
  - [ ] `__tests__/lib/export.test.ts`
  - [ ] Testar export MD, JSON, CSV
  - [ ] Verificar integridade dos dados exportados
  - [ ] Testar com diferentes volumes de dados

**Resultado**: ✅ Sistema de export completo - **Feature Única #9 - TODAS AS 9 FEATURES ÚNICAS COMPLETAS!**

**Duração Total**: 14 dias (~2.5 semanas)

---

## ⚪ BACKLOG - Features Secundárias (Sprint 18+)

Após completar as 9 features únicas, seguir com features secundárias prioritárias:

### Sprint 18: Templates System (2 semanas)
- Templates de Tarefas
- Templates de Projetos  
- Templates de Sprints
- Template Gallery
- Versionamento de Templates

### Sprint 19: Automações Básicas (2 semanas)
- Regras if-then simples
- Auto-assignment de tasks
- Status transitions automáticas
- Notificações baseadas em eventos
- Webhooks funcionais

### Sprint 20: Notificações Completas (2 semanas)
- Notificações in-app
- Notificações email
- Notificações push (mobile)
- Preferências de notificação por usuário
- Digest semanal/diário

### Sprint 21+: Módulos ERP (ongoing)
- Completar Módulo Financeiro
- Completar Módulo de Vendas/CRM
- Módulo de Operações
- Integrações externas (Slack, GitHub, etc.)

---

## 📈 Progresso Tracker V2

### Fase 5 - Features Únicas Restantes (Sprints 11-17)
- [ ] Sprint 11: Risk Auto-calc (0/6 tasks) ❌
- [ ] Sprint 12: Financial Tracking (0/6 tasks) ❌
- [ ] Sprint 13: Wiki Part 1 (0/3 tasks) ❌
- [ ] Sprint 14: Wiki Part 2 (0/6 tasks) ❌
- [ ] Sprint 15: OKRs (0/7 tasks) ❌
- [ ] Sprint 16: Offline-First (0/6 tasks) ❌
- [ ] Sprint 17: Export System (0/7 tasks) ❌

### Fase 6 - Features Secundárias (Sprints 18+)
- [ ] Sprint 18: Templates (planejada) ❌
- [ ] Sprint 19: Automações (planejada) ❌
- [ ] Sprint 20: Notificações (planejada) ❌
- [ ] Sprint 21+: Módulos ERP (planejadas) ❌

---

## 🎯 Próximas Ações

**Prioridade AGORA**: Iniciar Sprint 11 - Risk Severity Auto-calculado

**Cronograma Recomendado**:
- **Semana 11**: Sprint 11 - Risk Management
- **Semanas 12-13**: Sprint 12 - Financial Tracking
- **Semanas 14-16**: Sprints 13-14 - Wiki System
- **Semanas 17-18**: Sprint 15 - OKRs
- **Semanas 19-20**: Sprint 16 - Offline-First
- **Semana 21**: Sprint 17 - Export System

**Milestone**: Após Sprint 17, todas as **9 features únicas** estarão implementadas, criando uma barreira competitiva significativa!

---

**Última Atualização**: 2025-12-07  
**Versão**: 2.0  
**Mantido por**: Equipe de Desenvolvimento ERP UzzAI

**🎉 MVP Completo (Fases 1-4)! Próximo: Completar as 6 features únicas restantes!**
