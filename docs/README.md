# Documentação ERP-UzzAI

Documentação técnica completa do sistema ERP multi-tenant.

## 📁 Estrutura de Documentação

### 0. Plans
Planejamento e roadmap do projeto
- Roadmap de features
- Backlog de tarefas
- Planejamento de sprints

### 1. Arquitetura
Documentação da arquitetura do sistema
- **[ARQUITETURA_ERP_UZZAI_COMPLETA.md](./1.%20Arquitetura/ARQUITETURA_ERP_UZZAI_COMPLETA.md)** - Arquitetura de Gestão Interna
- **[ARQUITETURA_ERP_UNIFICADO_COMPLETA.md](./1.%20Arquitetura/ARQUITETURA_ERP_UNIFICADO_COMPLETA.md)** - Arquitetura Completa Unificada
- **[MULTI_TENANT_SETUP.md](./1.%20Arquitetura/MULTI_TENANT_SETUP.md)** - Configuração inicial de multi-tenancy
- **[MULTI_TENANT_IMPLEMENTATION.md](./1.%20Arquitetura/MULTI_TENANT_IMPLEMENTATION.md)** - Detalhes de implementação multi-tenant
- **[MULTI_TENANT_API_USAGE.md](./1.%20Arquitetura/MULTI_TENANT_API_USAGE.md)** - Como usar a API multi-tenant

### 2. Branding
Identidade visual e design system
- Cores e tipografia
- Componentes UI
- Guias de estilo

### 3. QA
Garantia de qualidade
- Estratégias de teste
- Test cases
- Bug reports e tracking

### 4. Kanban
Gestão de tarefas e projetos
- Sprint planning
- Retrospectivas
- Métricas de time

### 5. Supabase
Configurações e setup do Supabase
- Setup inicial
- Migrations de banco de dados
- Row Level Security (RLS) policies

### 6. Testing
Documentação de testes
- Testes unitários
- Testes de integração
- Testes E2E

## 📝 Convenções de Documentação

### Onde criar novos documentos

- **Arquitetura e Design**: `1. Arquitetura/`
- **Planos e Roadmaps**: `0. Plans/`
- **Testes**: `6. Testing/`
- **Configurações Supabase**: `5. Supabase/`
- **Processos de QA**: `3. QA/`
- **Gestão de Projetos**: `4. Kanban/`
- **Design e UI**: `2. Branding/`

### Padrões de Nomenclatura

- Use SCREAMING_SNAKE_CASE para documentos principais: `MULTI_TENANT_SETUP.md`
- Use kebab-case para documentos auxiliares: `sprint-planning.md`
- Sempre use `.md` como extensão
- Inclua data em documentos temporários: `retrospective-2025-12-02.md`

## 🔗 Links Rápidos

- [README Principal](../README.md)
- [CLAUDE.md - Guia para Claude Code](../CLAUDE.md)
- [Database Schema](../db/README.md)

## 🚀 Para Começar

Se você é novo no projeto, comece por:
1. [README Principal](../README.md) - Visão geral do projeto
2. [CLAUDE.md](../CLAUDE.md) - Guia de desenvolvimento
3. [Arquitetura Unificada](./1.%20Arquitetura/ARQUITETURA_ERP_UNIFICADO_COMPLETA.md)
4. [Multi-Tenant Setup](./1.%20Arquitetura/MULTI_TENANT_SETUP.md)
