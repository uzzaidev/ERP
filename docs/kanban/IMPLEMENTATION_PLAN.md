# 🚀 Plano de Implementação - UzzAI ERP

**Data**: 2025-12-06
**Status Atual**: 90% MVP | **Próximo Milestone**: Visualizações (Gantt)
**Prazo Estimado MVP**: Quase completo!

---

## 📊 Status Atual (Resumo)

| Módulo | Status | Comentário |
|--------|--------|------------|
| Database Schema | ✅ 100% | Completo |
| Multi-tenancy + RLS | ✅ 100% | Core pronto |
| Kanban Board | ✅ 95% | Drag-drop funcional |
| Admin/Usuários | ✅ 90% | Convites funcionais |
| **CRUD Tarefas** | ✅ **100%** | **COMPLETO** ✅ |
| **CRUD Projetos** | ✅ **100%** | **COMPLETO** ✅ |
| **CRUD Sprints** | ✅ **100%** | **COMPLETO** ✅ |
| **Comentários + Time Logs** | ✅ **100%** | **COMPLETO** ✅ |
| **Analytics/Charts** | ✅ **100%** | **COMPLETO** ✅ |
| **Features Únicas** | ✅ **75%** | 3 de 4 features completas |
| **ADRs System** | ✅ **100%** | **COMPLETO** ✅ |
| **Kaizen System** | ✅ **100%** | **COMPLETO** ✅ |
| **Meeting Score** | ✅ **100%** | **COMPLETO** ✅ |

**Progresso**: Sprints 1-9 completas! 🎉 Fases 1, 2 e grande parte da Fase 3 concluídas!

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

### 📅 Sprint 3: CRUD de Sprints (Semana 2) - ✅ **COMPLETO**

**Arquivos modificados**:
- ✅ `src/app/(auth)/kanban/page.tsx`
- ✅ `src/app/api/sprints/route.ts`
- ✅ `src/app/api/sprints/[id]/route.ts`
- ✅ `src/components/sprints/CreateSprintModal.tsx`
- ✅ `src/components/sprints/EditSprintModal.tsx`
- ✅ `src/components/sprints/index.ts`
- ✅ `__tests__/api/sprints.test.ts`

#### Tasks:

- [x] **3.1 Modal Criar Sprint** ✅
  - [x] Criar `src/components/sprints/CreateSprintModal.tsx`
  - [x] Form: name, goal, start_date, end_date, project_id, status
  - [x] Validação com Zod
  - [x] Botão "Nova Sprint" no Kanban (roxo, ícone Calendar)

- [x] **3.2 API POST /api/sprints** ✅
  - [x] Endpoint POST em `src/app/api/sprints/route.ts`
  - [x] Gerar `code` automático (SPR-001, SPR-002, etc.)
  - [x] Inserir sprint
  - [x] Validação tenant_id

- [x] **3.3 Modal Editar Sprint** ✅
  - [x] Criar `src/components/sprints/EditSprintModal.tsx`
  - [x] Reutilizar form do CreateSprintModal
  - [x] Pré-popular com dados existentes
  - [x] Botão delete com AlertDialog de confirmação

- [x] **3.4 API PUT /api/sprints/:id** ✅
  - [x] Criar `src/app/api/sprints/[id]/route.ts`
  - [x] Validar tenant_id ownership
  - [x] Update sprint
  - [x] Retornar sprint atualizada

- [x] **3.5 API DELETE /api/sprints/:id** ✅
  - [x] Endpoint DELETE em `src/app/api/sprints/[id]/route.ts`
  - [x] Validar tenant_id ownership
  - [x] Delete sprint (tasks mantêm-se, sprint_id = NULL)
  - [x] Retornar sucesso

- [x] **3.6 Testes Unitários** ✅
  - [x] Criar `__tests__/api/sprints.test.ts`
  - [x] Testar todos endpoints (GET, POST, PUT, DELETE)
  - [x] Testar validação e multi-tenancy
  - [x] 24 testes passando

**Resultado**: ✅ Usuários podem criar, editar, deletar sprints via UI - **SPRINT 3 COMPLETA!**

**Nota**: EditSprintModal está pronto mas ainda não tem trigger na UI (futuro: lista/seletor de sprints)

---

### 📅 Sprint 4: Comentários + Time Logs (Semana 2-3) - ✅ **COMPLETO**

**Arquivos modificados**:
- ✅ `src/app/api/tasks/[id]/comments/route.ts` (criado)
- ✅ `src/app/api/tasks/[id]/time-logs/route.ts` (criado)
- ✅ `src/components/tasks/TaskComments.tsx` (criado)
- ✅ `src/components/tasks/TimeLogEntry.tsx` (criado)
- ✅ `src/components/tasks/EditTaskModal.tsx` (modificado)
- ✅ `src/types/entities.ts` (modificado)
- ✅ `db/13_task_time_tracking_functions.sql` (criado)

#### Tasks:

- [x] **4.1 Comentários em Tarefas** ✅
  - [x] Componente TaskComments
  - [x] API POST /api/tasks/:id/comments
  - [x] API GET /api/tasks/:id/comments
  - [x] Mostrar no modal de editar tarefa
  - [x] Suporte a @mentions (básico)

- [x] **4.2 Time Tracking Manual** ✅
  - [x] Componente TimeLogEntry
  - [x] API POST /api/tasks/:id/time-logs
  - [x] Form: hours, description, logged_date
  - [x] Mostrar total de horas na task

**Resultado**: ✅ Usuários podem comentar e registrar horas em tasks

---

## 🟡 FASE 2 - ANALYTICS & RELATÓRIOS (Semana 4-5)

**Objetivo**: Gráficos e relatórios para tomada de decisão

---

### 📅 Sprint 5: Burndown Chart (Semana 4) - ✅ **COMPLETO**

#### Tasks:

- [x] **5.1 Burndown Chart Component** ✅
  - [x] Criar `src/components/charts/BurndownChart.tsx`
  - [x] Usar Recharts (shadcn-style)
  - [x] Calcular ideal line vs actual line
  - [x] API GET /api/sprints/:id/burndown
  - [x] Componente totalmente customizável (métricas, cores, formato)

- [x] **5.2 API Burndown Data** ✅
  - [x] Criar `src/app/api/sprints/[id]/burndown/route.ts`
  - [x] Calcular story points ou horas por dia
  - [x] Retornar dados para gráfico
  - [x] Incluir métricas e progresso

- [x] **5.3 Integração na Página Performance** ✅
  - [x] Atualizar `/performance` com charts
  - [x] Mostrar burndown do sprint ativo
  - [x] Seletor de sprints
  - [x] Tabs para organização (Velocidade/Burndown)

- [x] **5.4 Velocity Chart Component** ✅
  - [x] Criar `src/components/charts/VelocityChart.tsx`
  - [x] Calcular velocidade das últimas sprints
  - [x] API GET /api/analytics/velocity
  - [x] Métricas: média planejado, concluído, velocidade

- [x] **5.5 Chart Controls** ✅
  - [x] Componente `ChartControls` para customização
  - [x] Seleção de métricas (mostrar/ocultar)
  - [x] Seleção de cores
  - [x] Tipo de gráfico (linha/barra/área)
  - [x] Ajuste de altura
  - [x] Export para CSV

**Resultado**: ✅ Burndown e Velocity charts funcionais com customização completa - **SPRINT 5 COMPLETA!**

---

### 📅 Sprint 6: Velocity + Dashboard (Semana 4-5) - ✅ **COMPLETO**

#### Tasks:

- [x] **6.1 Velocity Chart** ✅
  - [x] Criar `src/components/charts/VelocityChart.tsx`
  - [x] Calcular story points completados por sprint (últimas 5 sprints)
  - [x] API GET /api/analytics/velocity
  - [x] Já implementado na Sprint 5

- [x] **6.2 Dashboard Executivo Melhorado** ✅
  - [x] Atualizar `/dashboard`
  - [x] Cards: tasks completed, velocity média, sprint progress
  - [x] Gráficos: burndown, velocity integrados
  - [x] Recent activity feed funcional com dados reais
  - [x] Alertas baseados em sprint ativa
  - [x] Card de progresso da sprint ativa

- [x] **6.3 Relatório PDF de Sprint** ✅
  - [x] Usar react-pdf/renderer
  - [x] Gerar PDF com: sprint goal, tasks completed, burndown, retrospective
  - [x] Botão "Export PDF" na página performance
  - [x] Componentes criados: SprintReportPDF e ExportSprintPDF

**Resultado**: ✅ Dashboard com analytics funcionais - **SPRINT 6 COMPLETA!**

---

## 🟢 FASE 3 - FEATURES ÚNICAS (Semana 6-8)

**Objetivo**: Implementar diferenciais competitivos

---

### 📅 Sprint 7: ADRs (Architecture Decision Records) - ✅ **COMPLETO**

**Tabela DB**: ✅ Criada `decisions` table

#### Tasks:

- [x] **7.1 Database Migration** ✅
  - [x] Criar tabela `decisions`
  - [x] Adicionar RLS policies

- [x] **7.2 ADR CRUD UI** ✅
  - [x] Página `/decisoes` (nova)
  - [x] Lista de decisões
  - [x] Modal criar decisão
  - [x] Form completo com todos campos

- [x] **7.3 ADR APIs** ✅
  - [x] GET /api/decisions
  - [x] POST /api/decisions
  - [x] PUT /api/decisions/:id
  - [x] DELETE /api/decisions/:id

- [x] **7.4 Linkar ADRs em Tarefas** ✅
  - [x] Adicionar campo `related_decision_ids` em tasks
  - [x] Update tasks API para suportar decisões relacionadas
  - [x] Migration SQL criada

**Resultado**: Sistema de ADRs funcional ✅ Feature única #1

---

### 📅 Sprint 8: Sistema Kaizen (Semana 6-7) - ✅ **COMPLETO**

**Tabela DB**: ✅ Criada `kaizens` table

#### Tasks:

- [x] **8.1 Database Migration** ✅
  - [x] Criar tabela `kaizens`
  - [x] RLS policies
  - [x] Função de geração de código (K-T-001, K-P-002, etc.)

- [x] **8.2 Kaizen CRUD UI** ✅
  - [x] Página `/kaizens` (criada)
  - [x] Lista de kaizens por categoria
  - [x] Modal criar kaizen
  - [x] Tags de categoria com cores
  - [x] Stats cards por categoria

- [x] **8.3 Kaizen APIs** ✅
  - [x] GET /api/kaizens
  - [x] POST /api/kaizens
  - [x] PUT /api/kaizens/:id
  - [x] DELETE /api/kaizens/:id

**Resultado**: Sistema Kaizen funcional ✅ Feature única #2

---

### 📅 Sprint 9: Meeting Effectiveness Score (Semana 7-8) - ✅ **COMPLETO**

**Tabela DB**: ✅ Criada `meetings` table

#### Tasks:

- [x] **9.1 Database Migration** ✅
  - [x] Criar tabela `meetings`
  - [x] Trigger para auto-calcular effectiveness_score
  - [x] RLS policies
  - [x] Função de geração de código (MTG-YYYY-MM-DD-NNN)

- [x] **9.2 Meeting CRUD UI** ✅
  - [x] Página `/reunioes` (atualizada)
  - [x] Modal criar reunião
  - [x] Form: title, date, participants, notes
  - [x] Seções: Decisões, Ações, Kaizens, Bloqueios
  - [x] Stats dashboard com score médio

- [x] **9.3 Meeting Effectiveness Calculation** ✅
  - [x] Função: `(decisions×12 + actions×8 + kaizens×15 + blockers×5) / 4`
  - [x] Color coding: verde (≥80), amarelo (≥60), laranja (≥40), vermelho (<40)
  - [x] Mostrar score na lista
  - [x] Preview score no modal de criação/edição

- [x] **9.4 Meeting APIs** ✅
  - [x] GET /api/meetings
  - [x] POST /api/meetings
  - [x] PUT /api/meetings/:id
  - [x] DELETE /api/meetings/:id

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
- [x] Sprint 3: CRUD Sprints (6/6 tasks) ✅ **COMPLETO**
- [x] Sprint 4: Comentários + Time Logs (2/2 tasks) ✅ **COMPLETO**

### Fase 2 - Analytics (Target: Semana 5)
- [x] Sprint 5: Burndown Chart (5/5 tasks) ✅ **COMPLETO**
- [x] Sprint 6: Velocity + Dashboard (3/3 tasks) ✅ **COMPLETO**

### Fase 3 - Features Únicas (Target: Semana 8)
- [x] Sprint 7: ADRs (4/4 tasks) ✅ **COMPLETO**
- [x] Sprint 8: Kaizen (3/3 tasks) ✅ **COMPLETO**
- [x] Sprint 9: Meeting Score (4/4 tasks) ✅ **COMPLETO**

### Fase 4 - Visualizações (Target: Semana 10)
- [ ] Sprint 10: Gantt Chart (0/2 tasks)

---

## 🎯 Próximas Ações (AGORA)

**✅ Sprints 7, 8 e 9 - COMPLETAS!**

**Features Implementadas**:
- ✅ Sprint 7: Sistema de ADRs (Architecture Decision Records)
- ✅ Sprint 8: Sistema Kaizen (Melhoria Contínua por Categoria)
- ✅ Sprint 9: Meeting Effectiveness Score (Score automático baseado em outputs)

**Próximo** - Sprint 10: Gantt Chart (Fase 4 - Visualizações):

1. 🔄 Sprint 10, Task 10.1: Gantt Chart Component
   - Biblioteca: `react-gantt-chart` ou custom
   - Mostrar tasks com start_date e due_date
   - Dependências entre tasks (se implementado)
   
2. 🔄 Sprint 10, Task 10.2: Integrar em /projetos/:id
   - Tab "Timeline" na página de projeto
   - Mostrar Gantt do projeto

---

**Última Atualização**: 2025-12-06
**Versão**: 1.8
**Mantido por**: Equipe de Desenvolvimento ERP UzzAI

**🎉 Sprints 7, 8 e 9 - 100% COMPLETAS!** 
- ✅ CRUD de Tarefas totalmente funcional
- ✅ CRUD de Projetos totalmente funcional
- ✅ CRUD de Sprints totalmente funcional
- ✅ Comentários + Time Logs funcionais
- ✅ Burndown & Velocity Charts com customização completa
- ✅ Dashboard Executivo com métricas reais e analytics
- ✅ Export PDF de Sprint com relatório completo
- ✅ **Sistema de ADRs (Architecture Decision Records) completo**
- ✅ **Sistema Kaizen (Melhoria Contínua) completo**
- ✅ **Meeting Effectiveness Score System completo**
- 🚀 Sprint 10 próxima: Gantt Chart
