# 🚀 Plano de Implementação - UzzAI ERP

**Data**: 2025-12-05
**Status Atual**: 55% MVP | **Próximo Milestone**: 70% MVP Funcional
**Prazo Estimado MVP**: 1-2 semanas

---

## 📊 Status Atual (Resumo)

| Módulo | Status | Comentário |
|--------|--------|------------|
| Database Schema | ✅ 100% | Completo |
| Multi-tenancy + RLS | ✅ 90% | Core pronto |
| Kanban Board | ✅ 95% | Drag-drop funcional |
| Admin/Usuários | ✅ 90% | Convites funcionais |
| **CRUD Tarefas** | ✅ **100%** | **COMPLETO** ✅ |
| **CRUD Projetos** | ✅ **100%** | **COMPLETO** ✅ |
| **CRUD Sprints** | 🔄 **0%** | **PRÓXIMO - SPRINT 3** |
| Analytics/Charts | ❌ 0% | Não iniciado |
| Features Únicas | ❌ 0% | Não iniciado |

**Progresso**: Sprints 1 e 2 completas! Iniciando Sprint 3 (CRUD Sprints)

---

## 🔴 FASE 1 - MVP FUNCIONAL (2-3 semanas)

**Objetivo**: Sistema básico mas funcional para gerenciar projetos + tasks + sprints

---

### 📅 Sprint 1: CRUD de Tarefas (Semana 1) - ✅ **COMPLETO**

**Arquivos modificados**:
- ✅ `src/app/(auth)/kanban/page.tsx`
- ✅ `src/app/api/tasks/route.ts`
- ✅ `src/app/api/tasks/[id]/route.ts`
- ✅ `src/components/tasks/CreateTaskModal.tsx`
- ✅ `src/components/tasks/EditTaskModal.tsx`

#### Tasks:

- [x] **1.1 Modal Criar Tarefa** ✅
  - [x] Criar `src/components/tasks/CreateTaskModal.tsx`
  - [x] Form: title, description, status, priority, type, assignee, project, sprint, due_date, estimated_hours
  - [x] Validação com Zod
  - [x] Botão "Nova Tarefa" no Kanban

- [x] **1.2 API POST /api/tasks** ✅
  - [x] Endpoint POST em `src/app/api/tasks/route.ts`
  - [x] Validar tenant_id
  - [x] Gerar `code` automático (TASK-XXX)
  - [x] Inserir no DB
  - [x] Retornar task criada

- [x] **1.3 Modal Editar Tarefa** ✅
  - [x] Criar `src/components/tasks/EditTaskModal.tsx`
  - [x] Reutilizar form do CreateTaskModal
  - [x] Pré-popular com dados existentes
  - [x] Abrir ao clicar no card do Kanban

- [x] **1.4 API PUT /api/tasks/:id** ✅
  - [x] Endpoint PUT em `src/app/api/tasks/[id]/route.ts`
  - [x] Validar tenant_id ownership
  - [x] Update campos
  - [x] Retornar task atualizada

- [x] **1.5 Deletar Tarefa** ✅
  - [x] Botão delete no modal de edição
  - [x] Confirmação (dialog)
  - [x] API DELETE /api/tasks/:id
  - [x] Remove do Kanban otimisticamente

- [x] **1.6 API DELETE /api/tasks/:id** ✅
  - [x] Endpoint DELETE em `src/app/api/tasks/[id]/route.ts`
  - [x] Validar tenant_id ownership
  - [x] Soft delete (is_active = false)
  - [x] Retornar sucesso

**Resultado**: ✅ Usuários podem criar, editar, deletar tasks via UI - **SPRINT 1 COMPLETA!**

---

### 📅 Sprint 2: CRUD de Projetos (Semana 1-2) - ✅ **COMPLETO**

**Arquivos modificados**:
- ✅ `src/app/(auth)/projetos/page.tsx`
- ✅ `src/app/api/projects/route.ts`
- ✅ `src/app/api/projects/[id]/route.ts`
- ✅ `src/components/projects/CreateProjectModal.tsx`
- ✅ `src/components/projects/EditProjectModal.tsx`
- ✅ `src/components/ui/alert-dialog.tsx`

#### Tasks:

- [x] **2.1 Modal Criar Projeto** ✅
  - [x] Criar `src/components/projects/CreateProjectModal.tsx`
  - [x] Form: code, name, description, status, priority, start_date, end_date, budget, client_name, owner_id
  - [x] Validação com Zod
  - [x] Botão "Novo Projeto" na página /projetos

- [x] **2.2 API POST /api/projects** ✅
  - [x] Endpoint POST em `src/app/api/projects/route.ts`
  - [x] Gerar `code` automático (PROJ-XXX)
  - [x] Inserir projeto
  - [x] Retornar projeto criado

- [x] **2.3 Modal Editar Projeto** ✅
  - [x] Criar `src/components/projects/EditProjectModal.tsx`
  - [x] Abrir ao clicar na linha da tabela
  - [x] Pré-popular dados

- [x] **2.4 API PUT /api/projects/:id** ✅
  - [x] Criar `src/app/api/projects/[id]/route.ts`
  - [x] Validar ownership
  - [x] Update projeto

- [x] **2.5 Deletar Projeto** ✅
  - [x] Botão delete no modal
  - [x] Confirmação com AlertDialog
  - [x] API DELETE /api/projects/:id

- [x] **2.6 Página Detalhe do Projeto** ⏭️
  - [ ] Criar `src/app/(auth)/projetos/[id]/page.tsx`
  - [ ] Dashboard: stats, tasks, team, budget progress
  - [ ] Link na tabela de projetos
  - [ ] *Movido para Sprint 5 (opcional para MVP)*

**Resultado**: ✅ Usuários podem criar, editar, deletar projetos via UI - **SPRINT 2 COMPLETA!**

---

### 📅 Sprint 3: CRUD de Sprints (Semana 2) - **P0**

**Arquivos a modificar**:
- `src/app/(auth)/kanban/page.tsx` (adicionar botão)
- `src/app/api/sprints/route.ts`
- `src/components/sprints/` (criar)

#### Tasks:

- [ ] **3.1 Modal Criar Sprint**
  - [ ] Criar `src/components/sprints/CreateSprintModal.tsx`
  - [ ] Form: name, goal, start_date, end_date, project_id
  - [ ] Validação
  - [ ] Botão "Nova Sprint" no Kanban

- [ ] **3.2 API POST /api/sprints**
  - [ ] Endpoint POST em `src/app/api/sprints/route.ts`
  - [ ] Gerar `code` automático (SPR-XXX)
  - [ ] Inserir sprint

- [ ] **3.3 Modal Editar Sprint**
  - [ ] Edit modal
  - [ ] Abrir ao clicar no filtro de sprint

- [ ] **3.4 API PUT /api/sprints/:id**
  - [ ] Criar `src/app/api/sprints/[id]/route.ts`
  - [ ] Update sprint

- [ ] **3.5 Sprint Planning UI** (Opcional para MVP)
  - [ ] Drag tarefas do backlog para sprint
  - [ ] Mostrar capacity vs committed

**Resultado**: Usuários podem criar, editar sprints via UI

---

### 📅 Sprint 4: Comentários + Time Logs (Semana 2-3) - **P1**

**Arquivos a modificar**:
- `src/app/api/tasks/[id]/comments/route.ts` (criar)
- `src/app/api/tasks/[id]/time-logs/route.ts` (criar)
- `src/components/tasks/TaskComments.tsx` (criar)
- `src/components/tasks/TimeLogEntry.tsx` (criar)

#### Tasks:

- [ ] **4.1 Comentários em Tarefas**
  - [ ] Componente TaskComments
  - [ ] API POST /api/tasks/:id/comments
  - [ ] API GET /api/tasks/:id/comments
  - [ ] Mostrar no modal de editar tarefa
  - [ ] Suporte a @mentions (básico)

- [ ] **4.2 Time Tracking Manual**
  - [ ] Componente TimeLogEntry
  - [ ] API POST /api/tasks/:id/time-logs
  - [ ] Form: hours, description, logged_date
  - [ ] Mostrar total de horas na task

**Resultado**: Usuários podem comentar e registrar horas em tasks

---

## 🟡 FASE 2 - ANALYTICS & RELATÓRIOS (Semana 4-5)

**Objetivo**: Gráficos e relatórios para tomada de decisão

---

### 📅 Sprint 5: Burndown Chart (Semana 4) - **P0**

#### Tasks:

- [ ] **5.1 Burndown Chart Component**
  - [ ] Criar `src/components/charts/BurndownChart.tsx`
  - [ ] Usar Chart.js ou Recharts
  - [ ] Calcular ideal line vs actual line
  - [ ] API GET /api/sprints/:id/burndown

- [ ] **5.2 API Burndown Data**
  - [ ] Criar `src/app/api/sprints/[id]/burndown/route.ts`
  - [ ] Calcular story points ou horas por dia
  - [ ] Retornar dados para gráfico

- [ ] **5.3 Mostrar no Kanban**
  - [ ] Adicionar tab "Analytics" no Kanban
  - [ ] Mostrar burndown do sprint ativo

**Resultado**: Burndown chart funcional

---

### 📅 Sprint 6: Velocity + Dashboard (Semana 4-5) - **P0**

#### Tasks:

- [ ] **6.1 Velocity Chart**
  - [ ] Criar `src/components/charts/VelocityChart.tsx`
  - [ ] Calcular story points completados por sprint (últimas 5 sprints)
  - [ ] API GET /api/analytics/velocity

- [ ] **6.2 Dashboard Executivo Melhorado**
  - [ ] Atualizar `/dashboard`
  - [ ] Cards: tasks completed, velocity média, sprint progress
  - [ ] Gráficos: burndown, velocity
  - [ ] Recent activity feed funcional

- [ ] **6.3 Relatório PDF de Sprint** (Opcional)
  - [ ] Usar react-pdf/renderer
  - [ ] Gerar PDF com: sprint goal, tasks completed, burndown, retrospective
  - [ ] Botão "Export PDF" na sprint

**Resultado**: Dashboard com analytics funcionais

---

## 🟢 FASE 3 - FEATURES ÚNICAS (Semana 6-8)

**Objetivo**: Implementar diferenciais competitivos

---

### 📅 Sprint 7: ADRs (Architecture Decision Records) - **P0**

**Tabela DB**: Criar `decisions` table

```sql
CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  code VARCHAR(50) NOT NULL, -- D-001, D-002
  title VARCHAR(255) NOT NULL,
  context TEXT,
  decision TEXT,
  alternatives JSONB, -- [{option, pros[], cons[]}]
  consequences JSONB, -- {benefits[], trade_offs[], reversibility}
  impact JSONB, -- {cost, timeline, quality}
  stakeholders JSONB, -- {decided_by, consulted[], informed[]}
  related_task_ids UUID[],
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tasks:

- [ ] **7.1 Database Migration**
  - [ ] Criar tabela `decisions`
  - [ ] Adicionar RLS policies

- [ ] **7.2 ADR CRUD UI**
  - [ ] Página `/decisoes` (nova)
  - [ ] Lista de decisões
  - [ ] Modal criar decisão
  - [ ] Form completo com todos campos

- [ ] **7.3 ADR APIs**
  - [ ] GET /api/decisions
  - [ ] POST /api/decisions
  - [ ] PUT /api/decisions/:id
  - [ ] DELETE /api/decisions/:id

- [ ] **7.4 Linkar ADRs em Tarefas**
  - [ ] Adicionar campo `related_decision_ids` em tasks
  - [ ] Mostrar decisões relacionadas no modal de task

**Resultado**: Sistema de ADRs funcional ✅ Feature única #1

---

### 📅 Sprint 8: Sistema Kaizen (Semana 6-7) - **P0**

**Tabela DB**: Criar `kaizens` table

```sql
CREATE TABLE kaizens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  category VARCHAR(50), -- technical, process, strategic, cultural
  context TEXT,
  learning JSONB, -- {do[], avoid[], adjust[]}
  golden_rule TEXT,
  application TEXT,
  related_task_id UUID REFERENCES tasks(id),
  related_meeting_id UUID REFERENCES meetings(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tasks:

- [ ] **8.1 Database Migration**
  - [ ] Criar tabela `kaizens`
  - [ ] RLS policies

- [ ] **8.2 Kaizen CRUD UI**
  - [ ] Página `/kaizens` (nova)
  - [ ] Lista de kaizens por categoria
  - [ ] Modal criar kaizen
  - [ ] Tags de categoria com cores

- [ ] **8.3 Kaizen APIs**
  - [ ] GET /api/kaizens
  - [ ] POST /api/kaizens
  - [ ] AI categorization (opcional)

**Resultado**: Sistema Kaizen funcional ✅ Feature única #2

---

### 📅 Sprint 9: Meeting Effectiveness Score (Semana 7-8) - **P0**

**Tabela DB**: Criar `meetings` table

```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  title VARCHAR(255),
  date DATE,
  participants UUID[],
  decisions_count INT DEFAULT 0,
  actions_count INT DEFAULT 0,
  kaizens_count INT DEFAULT 0,
  blockers_count INT DEFAULT 0,
  effectiveness_score INT, -- Auto-calculated
  notes TEXT,
  created_by UUID REFERENCES users(id)
);
```

#### Tasks:

- [ ] **9.1 Database Migration**
  - [ ] Criar tabela `meetings`
  - [ ] Trigger para auto-calcular effectiveness_score

- [ ] **9.2 Meeting CRUD UI**
  - [ ] Página `/reunioes`
  - [ ] Modal criar reunião
  - [ ] Form: title, date, participants, notes
  - [ ] Seções: Decisões, Ações, Kaizens, Bloqueios

- [ ] **9.3 Meeting Effectiveness Calculation**
  - [ ] Função: `(decisions×12 + actions×8 + kaizens×15 + blockers×5) / 4`
  - [ ] Color coding: verde (≥80), amarelo (≥60), laranja (≥40), vermelho (<40)
  - [ ] Mostrar score na lista

- [ ] **9.4 Meeting APIs**
  - [ ] GET /api/meetings
  - [ ] POST /api/meetings
  - [ ] PUT /api/meetings/:id

**Resultado**: Meeting Effectiveness Score funcional ✅ Feature única #5

---

## 🔵 FASE 4 - VISUALIZAÇÕES (Semana 9-10)

**Objetivo**: Gantt, Timeline, Roadmap

---

### 📅 Sprint 10: Gantt Chart - **P1**

#### Tasks:

- [ ] **10.1 Gantt Chart Component**
  - [ ] Biblioteca: `react-gantt-chart` ou custom
  - [ ] Mostrar tasks com start_date e due_date
  - [ ] Dependências entre tasks (se implementado)

- [ ] **10.2 Integrar em /projetos/:id**
  - [ ] Tab "Timeline" na página de projeto
  - [ ] Mostrar Gantt do projeto

**Resultado**: Gantt chart funcional

---

## ⚪ BACKLOG (Fase 5+)

**Features para implementar depois do MVP:**

### Features Únicas Restantes:
- [ ] Risk Severity Auto-calculado (Feature #3)
- [ ] Financial Tracking por Decisão (Feature #4)
- [ ] Knowledge Base/Wiki (Feature #6)
- [ ] OKRs com Brutal Honesty (Feature #7)
- [ ] Offline-First PWA (Feature #8)
- [ ] Zero Vendor Lock-in - Export completo (Feature #9)

### Outras Features:
- [ ] Subtasks UI (parent_task_id já existe no DB)
- [ ] Dependências entre tasks
- [ ] Automações básicas
- [ ] Templates de tarefas/projetos
- [ ] Notificações email
- [ ] Integrações (Slack, GitHub)
- [ ] Relatórios customizados
- [ ] Mobile app (PWA)

---

## 📈 Progresso Tracker

### Fase 1 - MVP Funcional (Target: Semana 3)
- [x] Sprint 1: CRUD Tarefas (6/6 tasks) ✅ **COMPLETO**
- [x] Sprint 2: CRUD Projetos (5/6 tasks) ✅ **COMPLETO**
- [ ] Sprint 3: CRUD Sprints (0/5 tasks) 🔄 **PRÓXIMO**
- [ ] Sprint 4: Comentários + Time Logs (0/2 tasks)

### Fase 2 - Analytics (Target: Semana 5)
- [ ] Sprint 5: Burndown Chart (0/3 tasks)
- [ ] Sprint 6: Velocity + Dashboard (0/3 tasks)

### Fase 3 - Features Únicas (Target: Semana 8)
- [ ] Sprint 7: ADRs (0/4 tasks)
- [ ] Sprint 8: Kaizen (0/3 tasks)
- [ ] Sprint 9: Meeting Score (0/4 tasks)

### Fase 4 - Visualizações (Target: Semana 10)
- [ ] Sprint 10: Gantt Chart (0/2 tasks)

---

## 🎯 Próximas Ações (AGORA)

**Sprint 3 - CRUD Sprints** (ordem de prioridade):

1. 🔄 Sprint 3, Task 3.1: Criar `CreateSprintModal.tsx`
2. 🔄 Sprint 3, Task 3.2: Implementar `POST /api/sprints`
3. ⏳ Testar criação de sprint via UI
4. ⏳ Sprint 3, Task 3.3: Criar `EditSprintModal.tsx`
5. ⏳ Sprint 3, Task 3.4: Implementar `PUT /api/sprints/:id`
6. ⏳ Sprint 3, Task 3.5: Implementar `DELETE /api/sprints/:id`
7. ⏳ Integrar modals na página Kanban

---

**Última Atualização**: 2025-12-05
**Versão**: 1.2
**Mantido por**: Equipe de Desenvolvimento ERP UzzAI

**🎉 Sprints 1 e 2 Completas!** 
- ✅ CRUD de Tarefas totalmente funcional
- ✅ CRUD de Projetos totalmente funcional
- 🚀 Sprint 3 iniciando: CRUD de Sprints
