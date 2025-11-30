---
created: 2025-11-29T16:00
updated: 2025-11-30T14:46
tipo: arquitetura-master
projeto: ERP-UNIFICADO-UZZAI
versao: 3.0.0
status: consolidado
baseado_em:
  - ARQUITETURA_ERP_UZZAI_COMPLETA.md (Gestão Interna)
  - ARQUITETURA_WEB_COMPLETA.md (Stack Web)
  - DIAGRAMAS_INTERLIGACOES.md (MeguisPet)
  - MAPA_INTERLIGACOES_SISTEMA.md (MeguisPet)
  - FORMULARIOS_REDESIGN.md (Unificação)
---

# 🏗️ ARQUITETURA ERP UNIFICADO UZZAI v3.0 — O SANTO GRAAL

> **DOCUMENTO MASTER DE ARQUITETURA**
>
> Este documento consolida a arquitetura completa do **ERP Unificado UzzAI**, 
> que combina:
> - 🏢 **Gestão Interna** (Projetos, Reuniões, Atas, Decisões, Ações, Sprints, RAG)
> - 💰 **ERP Comercial** (Vendas, Estoque, Produtos, Clientes, Fornecedores)
> - 📊 **Financeiro/Fiscal** (Fluxo de Caixa, DRE, Impostos, Notas Fiscais)
> - 🤖 **IA Multi-Agente** (Extração automática, RAG, Automações)
>
> **Visão:** "Um sistema único que gerencia toda a empresa — da reunião à nota fiscal."

---

## 📑 ÍNDICE

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura de Alto Nível](#2-arquitetura-de-alto-nível)
3. [Módulos do Sistema](#3-módulos-do-sistema)
4. [Modelo de Domínio Unificado](#4-modelo-de-domínio-unificado)
5. [Arquitetura Multi-Agente](#5-arquitetura-multi-agente)
6. [Sistema RAG](#6-sistema-rag)
7. [Banco de Dados](#7-banco-de-dados)
8. [API REST Unificada](#8-api-rest-unificada)
9. [Frontend Unificado](#9-frontend-unificado)
10. [Fluxos de Negócio](#10-fluxos-de-negócio)
11. [Stack Tecnológico](#11-stack-tecnológico)
12. [Estrutura de Código](#12-estrutura-de-código)
13. [Roadmap de Implementação](#13-roadmap-de-implementação)

---

## 1. VISÃO GERAL

### 1.1 O Que É Este Sistema

O **ERP Unificado UzzAI** é um sistema completo de gestão empresarial que integra:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ERP UNIFICADO UZZAI v3.0                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐│
│  │    GESTÃO INTERNA    │  │   ERP COMERCIAL      │  │  FINANCEIRO/FISCAL   ││
│  │                      │  │                      │  │                      ││
│  │ • Projetos           │  │ • Vendas (PDV)       │  │ • Fluxo de Caixa     ││
│  │ • Reuniões/Atas      │  │ • Estoque            │  │ • Contas a Pagar     ││
│  │ • Decisões (ADRs)    │  │ • Produtos           │  │ • Contas a Receber   ││
│  │ • Ações/Tasks        │  │ • Clientes           │  │ • DRE                ││
│  │ • Sprints            │  │ • Fornecedores       │  │ • Notas Fiscais      ││
│  │ • Bullet Journal     │  │ • Movimentações      │  │ • Impostos           ││
│  │ • Performance/OKRs   │  │ • Pedidos            │  │ • Relatórios         ││
│  │ • Kaizens            │  │ • Serviços           │  │ • Dashboard Fin.     ││
│  │ • Riscos             │  │ • Orçamentos         │  │ • Budget por Projeto ││
│  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘│
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │                        CAMADA DE INTELIGÊNCIA                            ││
│  │                                                                          ││
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐             ││
│  │  │  Multi-Agente  │  │      RAG       │  │   Automações   │             ││
│  │  │  (13 Agentes)  │  │  (Qdrant+OAI)  │  │  (Workflows)   │             ││
│  │  └────────────────┘  └────────────────┘  └────────────────┘             ││
│  └──────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Problema Resolvido

| Cenário | ANTES (Fragmentado) | DEPOIS (Unificado) |
|---------|---------------------|---------------------|
| **Reunião → Ata** | 4-6 horas manuais | 5 min automáticos |
| **Venda → Estoque** | Planilhas separadas | Atualização automática |
| **Projeto → Budget** | Desconectados | Integração total |
| **Cliente → Histórico** | Sistemas separados | Visão 360° |
| **Relatório Financeiro** | Export manual | Dashboard real-time |
| **Decisões duplicadas** | Frequentes | RAG detecta 100% |

### 1.3 Princípios Arquiteturais

| Princípio | Descrição | Implementação |
|-----------|-----------|---------------|
| **Clean Architecture** | Separação de camadas | Domain → Application → Infrastructure |
| **Domain-Driven Design** | Modelagem por domínio | Bounded Contexts por módulo |
| **Event-Driven** | Comunicação desacoplada | Domain Events + Webhooks |
| **Multi-Tenancy** | Isolamento por organização | `organization_id` global |
| **RAG-First** | Contexto histórico | Qdrant + OpenAI Embeddings |
| **Mobile-First** | Responsividade | Next.js + PWA |

---

## 2. ARQUITETURA DE ALTO NÍVEL

### 2.1 Diagrama de Componentes

```mermaid
graph TB
    subgraph "ENTRADA DE DADOS"
        TR[Transcrição Reunião]
        PDV[PDV / Vendas]
        WEB[Web Dashboard]
        APP[Mobile App]
        API[APIs Externas]
    end
    
    subgraph "FRONTEND LAYER"
        NEXT[Next.js 15]
        SHAD[Shadcn/ui]
        TW[Tailwind CSS]
    end
    
    subgraph "API LAYER"
        FAST[FastAPI REST]
        WS[WebSocket]
        WH[Webhooks]
    end
    
    subgraph "PROCESSING LAYER"
        MAO[Multi-Agent Orchestrator]
        RAG[RAG Context Enricher]
        WF[Workflow Engine]
        VAL[Entity Validator]
    end
    
    subgraph "DOMAIN LAYER"
        subgraph "Gestão Interna"
            PRJ[Project]
            MTG[Meeting]
            ACT[Action]
            DEC[Decision]
            SPR[Sprint]
        end
        subgraph "ERP Comercial"
            PROD[Product]
            CLI[Customer]
            FORN[Supplier]
            VENDA[Sale]
            EST[Stock]
        end
        subgraph "Financeiro"
            TRX[Transaction]
            INV[Invoice]
            ACC[Account]
            EXP[Expense]
        end
    end
    
    subgraph "INFRASTRUCTURE"
        PG[(PostgreSQL)]
        QD[(Qdrant)]
        REDIS[(Redis Cache)]
        S3[S3 Storage]
        OAI[OpenAI API]
    end
    
    TR --> API
    PDV --> API
    WEB --> NEXT
    APP --> NEXT
    
    NEXT --> FAST
    FAST --> MAO
    FAST --> RAG
    FAST --> WF
    
    MAO --> OAI
    RAG --> QD
    
    PRJ --> PG
    VENDA --> PG
    TRX --> PG
    
    style MAO fill:#fbbf24,stroke:#f59e0b
    style RAG fill:#3b82f6,stroke:#1e40af,color:#fff
    style PG fill:#10b981,stroke:#059669,color:#fff
```

### 2.2 Fluxo de Dados Principal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLUXO DE DADOS UNIFICADO                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  INPUT SOURCES           PROCESSING              OUTPUTS                      │
│  ═══════════════         ══════════              ═══════                      │
│                                                                               │
│  ┌─────────────┐    ┌─────────────────────┐    ┌─────────────────────┐       │
│  │ Transcrição │───►│                     │───►│ Atas Estruturadas   │       │
│  │ (Fathom)    │    │                     │    └─────────────────────┘       │
│  └─────────────┘    │                     │                                   │
│                     │  MULTI-AGENT        │    ┌─────────────────────┐       │
│  ┌─────────────┐    │  ORCHESTRATOR       │───►│ Decisões (ADRs)     │       │
│  │ PDV/Vendas  │───►│                     │    └─────────────────────┘       │
│  │             │    │  + RAG ENRICHER     │                                   │
│  └─────────────┘    │                     │    ┌─────────────────────┐       │
│                     │                     │───►│ Ações/Tasks         │       │
│  ┌─────────────┐    │                     │    └─────────────────────┘       │
│  │ Estoque     │───►│                     │                                   │
│  │ Manual      │    │                     │    ┌─────────────────────┐       │
│  └─────────────┘    └─────────────────────┘───►│ Transações Fin.     │       │
│                              │                  └─────────────────────┘       │
│                              │                                                 │
│                              ▼                  ┌─────────────────────┐       │
│                     ┌─────────────────────┐    │ Dashboards          │       │
│                     │    PERSISTÊNCIA     │───►│ Relatórios          │       │
│                     │ PostgreSQL + Qdrant │    │ Alertas             │       │
│                     └─────────────────────┘    └─────────────────────┘       │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. MÓDULOS DO SISTEMA

### 3.1 Mapa de Módulos

```
ERP-UNIFICADO-UZZAI/
│
├── 🏢 GESTÃO INTERNA (Core UzzAI)
│   ├── Projetos
│   │   ├── Dashboard por Projeto
│   │   ├── Sprints Semanais
│   │   ├── Roadmap Visual (Gantt)
│   │   └── Métricas de Velocity
│   │
│   ├── Reuniões
│   │   ├── Atas Automáticas
│   │   ├── Extração Multi-Agente
│   │   └── Efetividade Score
│   │
│   ├── Decisões (ADRs)
│   │   ├── Catálogo de Decisões
│   │   ├── Anti-Duplicação RAG
│   │   └── Impacto Tracking
│   │
│   ├── Ações/Tasks
│   │   ├── Kanban Board
│   │   ├── Atribuição Automática
│   │   └── Deadlines Inteligentes
│   │
│   ├── Bullet Journal
│   │   ├── Daily Logs
│   │   ├── Weekly Reviews
│   │   └── Monthly Reports
│   │
│   ├── Pessoas
│   │   ├── Perfis Unificados
│   │   ├── Alocação de Carga
│   │   └── Performance Score
│   │
│   ├── Performance/OKRs
│   │   ├── Avaliação 360°
│   │   ├── KPIs por Pessoa
│   │   └── OKRs Trimestrais
│   │
│   └── Base de Conhecimento
│       ├── Frameworks
│       ├── Garimpos/Insights
│       └── Metodologias
│
├── 🛒 ERP COMERCIAL (Core MeguisPet)
│   ├── Cadastros
│   │   ├── Pessoas (Cliente/Fornecedor/Ambos) ← UNIFICADO
│   │   ├── Produtos
│   │   ├── Categorias
│   │   └── Serviços
│   │
│   ├── Vendas
│   │   ├── PDV (Ponto de Venda)
│   │   ├── Orçamentos
│   │   ├── Pedidos
│   │   └── Histórico de Vendas
│   │
│   ├── Estoque
│   │   ├── Movimentações (Entrada/Saída/Ajuste)
│   │   ├── Inventário
│   │   ├── Preço Médio Ponderado
│   │   └── Alertas de Mínimo
│   │
│   └── Compras
│       ├── Pedidos de Compra
│       ├── Cotações
│       └── Recebimento
│
├── 💰 FINANCEIRO/FISCAL
│   ├── Contas a Pagar
│   │   ├── Agendamento
│   │   ├── Parcelamentos
│   │   └── Baixa Automática
│   │
│   ├── Contas a Receber
│   │   ├── Faturamento
│   │   ├── Cobrança
│   │   └── Inadimplência
│   │
│   ├── Fluxo de Caixa
│   │   ├── Previsão
│   │   ├── Realizado
│   │   └── Runway
│   │
│   ├── DRE (Demonstrativo)
│   │   ├── Por Período
│   │   ├── Por Projeto
│   │   └── Por Centro de Custo
│   │
│   ├── Notas Fiscais
│   │   ├── NFe (Produtos)
│   │   ├── NFSe (Serviços)
│   │   └── Cancelamentos
│   │
│   └── Budget por Projeto
│       ├── Planejado vs Realizado
│       ├── Alertas de Estouro
│       └── Integração Reunião→Despesa
│
└── 🤖 INTELIGÊNCIA ARTIFICIAL
    ├── Multi-Agent System
    │   ├── Extraction Agents (5)
    │   ├── Enrichment Agents (6)
    │   └── Validator Agent (1)
    │
    ├── RAG System
    │   ├── Decisions Index
    │   ├── Actions Index
    │   └── Kaizens Index
    │
    └── Automações
        ├── Workflows Customizáveis
        ├── Triggers Inteligentes
        └── Notificações
```

### 3.2 Matriz de Integração entre Módulos

| Origem | Destino | Integração | Exemplo |
|--------|---------|------------|---------|
| **Reunião** | **Decisão** | Auto-extração | "D-2025-042: Usar Capacitor" |
| **Reunião** | **Ação** | Auto-extração | "A-2025-123: Implementar login" |
| **Reunião** | **Despesa** | Classificação | "Contratar designer R$2.500" |
| **Venda** | **Estoque** | Baixa automática | Produto vendido → Estoque-1 |
| **Venda** | **Contas Receber** | Faturamento | Venda a prazo → Parcelas |
| **Compra** | **Estoque** | Entrada automática | Compra recebida → Estoque+N |
| **Compra** | **Contas Pagar** | Agendamento | Compra → Parcelas a pagar |
| **Projeto** | **Budget** | Monitoramento | Despesas vs Planejado |
| **Cliente** | **Vendas** | Histórico 360° | Todas compras do cliente |
| **Produto** | **Estoque** | Status real-time | Quantidade disponível |

---

## 4. MODELO DE DOMÍNIO UNIFICADO

### 4.1 Entidades Principais (Diagrama ER)

```mermaid
erDiagram
    %% CORE
    organizations ||--o{ projects : "has"
    organizations ||--o{ persons : "has"
    organizations ||--o{ products : "has"
    organizations ||--o{ accounts : "has"
    
    %% PESSOAS UNIFICADAS
    persons ||--o{ actions : "owns"
    persons ||--o{ sales : "sells"
    persons ||--o{ purchases : "requests"
    persons {
        uuid id PK
        string full_name
        string[] nicknames
        string[] types "cliente,fornecedor,colaborador"
        string email UK
        string phone
        string document "CPF/CNPJ"
        json address
        string status
        int availability_h
        int allocated_h
        decimal share_percentage
    }
    
    %% PROJETOS E GESTÃO
    projects ||--o{ sprints : "has"
    projects ||--o{ meetings : "has"
    projects ||--o{ actions : "has"
    projects ||--o{ decisions : "has"
    projects ||--o{ risks : "has"
    projects ||--o{ expenses : "charges"
    projects {
        uuid id PK
        string code UK
        string name
        string status
        int progress
        int velocity
        decimal budget
        decimal budget_used
        uuid owner_id FK
    }
    
    sprints ||--o{ actions : "organizes"
    sprints {
        uuid id PK
        string code UK
        string week_label
        string status
        string objetivo
        date start_date
        date end_date
    }
    
    meetings ||--o{ actions : "generates"
    meetings ||--o{ decisions : "generates"
    meetings ||--o{ transcripts : "has"
    meetings {
        uuid id PK
        string code UK
        string title
        string subtipo
        datetime date_start
        datetime date_end
        int efetividade
    }
    
    %% PRODUTOS E ESTOQUE
    products ||--o{ stock_movements : "tracks"
    products ||--o{ sale_items : "sold_in"
    products ||--o{ purchase_items : "bought_in"
    products {
        uuid id PK
        string sku UK
        string name
        string category
        decimal preco_venda
        decimal preco_custo
        int estoque
        int estoque_minimo
        boolean ativo
    }
    
    stock_movements {
        uuid id PK
        uuid product_id FK
        string tipo "entrada,saida,ajuste"
        int quantidade
        decimal preco_unitario
        uuid supplier_id FK
        string status
    }
    
    %% VENDAS
    sales ||--o{ sale_items : "contains"
    sales ||--o{ payments : "paid_by"
    sales {
        uuid id PK
        string code UK
        uuid customer_id FK
        uuid seller_id FK
        datetime date
        decimal total
        decimal discount
        string status
    }
    
    sale_items {
        uuid id PK
        uuid sale_id FK
        uuid product_id FK
        int quantity
        decimal unit_price
        decimal subtotal
    }
    
    %% FINANCEIRO
    accounts ||--o{ transactions : "has"
    accounts {
        uuid id PK
        string name
        string tipo "corrente,poupanca,caixa"
        decimal saldo
        string banco
    }
    
    transactions {
        uuid id PK
        uuid account_id FK
        string tipo "receita,despesa"
        decimal valor
        string categoria
        uuid project_id FK
        uuid action_id FK
        string status
        date due_date
        date paid_date
    }
    
    invoices {
        uuid id PK
        string code UK
        uuid customer_id FK
        uuid project_id FK
        decimal valor_bruto
        decimal impostos
        decimal valor_liquido
        string status
        date emissao
        date vencimento
    }
```

### 4.2 Schema de IDs Unificados

| Entidade | Formato | Exemplo |
|----------|---------|---------|
| **Decisão** | `D-{YYYY}-{seq}` | `D-2025-042` |
| **Ação** | `A-{YYYY}-{seq}` | `A-2025-123` |
| **Kaizen** | `K-{tipo[0]}-{seq}` | `K-T-015` |
| **Risco** | `R-{projeto}-{seq}` | `R-CHATBOT-003` |
| **Meeting** | `MTG-{YYYY-MM-DD}-{projeto}` | `MTG-2025-11-24-CHATBOT` |
| **Sprint** | `Sprint-{YYYY}-W{nn}` | `Sprint-2025-W48` |
| **Venda** | `VND-{YYYY}-{seq}` | `VND-2025-00456` |
| **NF** | `NF-{YYYY}-{seq}` | `NF-2025-00123` |
| **Produto** | `SKU-{categoria}-{seq}` | `SKU-ELET-001` |

---

## 5. ARQUITETURA MULTI-AGENTE

### 5.1 Visão Geral

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MULTI-AGENT ORCHESTRATOR (13 Agentes)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │                    TIER 1: EXTRACTION (5 Agentes - Sem DB)           │    │
│  │                                                                      │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │    │
│  │  │ Decision │ │ Action   │ │ Kaizen   │ │  Risk    │ │ Blocker  │  │    │
│  │  │  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │  │    │
│  │  │          │ │          │ │          │ │          │ │          │  │    │
│  │  │D-XXXX    │ │A-XXXX    │ │K-X-XXX   │ │R-PRJ-XXX │ │B-PRJ-XXX │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                    │                                          │
│                                    ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │                    TIER 2: ENRICHMENT (6 Agentes - Com DB)           │    │
│  │                                                                      │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │    │
│  │  │ Project  │ │ Deadline │ │ Priority │ │  Sprint  │ │ Financial│  │    │
│  │  │  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │  │    │
│  │  │          │ │          │ │          │ │          │ │          │  │    │
│  │  │ ← DB     │ │ ← DB     │ │ ← DB     │ │ ← DB     │ │ ← DB     │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │    │
│  │                                                                      │    │
│  │  ┌──────────┐                                                        │    │
│  │  │ TeamHlth │                                                        │    │
│  │  │  Agent   │                                                        │    │
│  │  └──────────┘                                                        │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                    │                                          │
│                                    ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │                    TIER 3: VALIDATION (1 Agente)                     │    │
│  │                                                                      │    │
│  │  ┌────────────────────────────────────────────────────────────────┐ │    │
│  │  │                     VALIDATOR AGENT                             │ │    │
│  │  │  • Deduplica entidades                                         │ │    │
│  │  │  • Valida schemas                                              │ │    │
│  │  │  • Resolve conflitos                                           │ │    │
│  │  │  • Gera alertas de revisão                                     │ │    │
│  │  └────────────────────────────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Financial Agent (NOVO)

```python
class FinancialAgent(BaseSpecializedAgent):
    """Agente que classifica ações com impacto financeiro."""
    
    FINANCIAL_VERBS = [
        "contratar", "comprar", "pagar", "assinar", "adquirir",
        "investir", "gastar", "desembolsar", "fechar plano"
    ]
    
    CATEGORY_MAPPING = {
        "ferramenta": "ferramentas",
        "design": "design", 
        "dev": "desenvolvimento",
        "marketing": "marketing",
        "infra": "infraestrutura"
    }
    
    async def classify(self, action: ActionDTO) -> Optional[ExpenseDraft]:
        """Classifica se ação gera despesa."""
        text = action.description.lower()
        
        # Detecta verbos financeiros
        is_financial = any(v in text for v in self.FINANCIAL_VERBS)
        
        # Extrai valor se mencionado
        value_match = re.search(r'R\$\s*([\d.,]+)', action.description)
        value = parse_currency(value_match.group(1)) if value_match else None
        
        if is_financial:
            return ExpenseDraft(
                description=action.description,
                project_code=action.project,
                action_id=action.id,
                gross_total=value,
                category=self.infer_category(text),
                status="draft"  # Requer aprovação
            )
        return None
```

---

## 6. SISTEMA RAG

### 6.1 Coleções Qdrant

```python
COLLECTIONS = {
    "decisions": {
        "vector_size": 3072,  # text-embedding-3-large
        "payload": ["decision_id", "project_code", "title", "status"]
    },
    "actions": {
        "vector_size": 3072,
        "payload": ["action_id", "project_code", "description", "success_score"]
    },
    "kaizens": {
        "vector_size": 3072,
        "payload": ["kaizen_id", "lesson", "category", "roi_impact"]
    },
    "products": {
        "vector_size": 3072,
        "payload": ["sku", "name", "category", "description"]
    },
    "customers": {
        "vector_size": 3072,
        "payload": ["person_id", "name", "preferences", "purchase_history"]
    }
}
```

### 6.2 Fluxo Anti-Duplicação

```
Nova Decisão → Embed → Buscar Similares → Threshold > 0.75?
                                              │
                            ┌─────────────────┼─────────────────┐
                            │                 │                 │
                            ▼                 ▼                 ▼
                      SIM (>0.75)       TALVEZ (0.5-0.75)    NÃO (<0.5)
                            │                 │                 │
                            ▼                 ▼                 ▼
                   Marca requires_review  Sugere similar   Indexa nova
                   Alerta para usuário    para verificar   decisão
```

---

## 7. BANCO DE DADOS

### 7.1 Índices Críticos

```sql
-- Performance para Gestão Interna
CREATE INDEX idx_actions_project_status ON actions(project_id, status);
CREATE INDEX idx_actions_owner_due ON actions(owner_id, due_date);
CREATE INDEX idx_meetings_project_date ON meetings(project_id, date_start DESC);
CREATE INDEX idx_decisions_project ON decisions(project_id);

-- Performance para ERP Comercial
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_date ON sales(date DESC);
CREATE INDEX idx_stock_product ON stock_movements(product_id);

-- Performance para Financeiro
CREATE INDEX idx_transactions_account_date ON transactions(account_id, due_date);
CREATE INDEX idx_transactions_project ON transactions(project_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);

-- Full Text Search
CREATE INDEX idx_products_name_fts ON products USING gin(to_tsvector('portuguese', name));
CREATE INDEX idx_actions_desc_fts ON actions USING gin(to_tsvector('portuguese', description));
```

### 7.2 Views Materializadas

```sql
-- View: Estoque com Valores
CREATE MATERIALIZED VIEW estoque_com_valores AS
SELECT 
    p.id,
    p.sku,
    p.name,
    p.estoque,
    p.preco_custo,
    p.preco_venda,
    (p.estoque * p.preco_custo) as valor_total_custo,
    (p.estoque * p.preco_venda) as valor_total_venda,
    (p.preco_venda - p.preco_custo) as margem_unitaria,
    CASE 
        WHEN p.estoque <= 0 THEN 'sem_estoque'
        WHEN p.estoque <= p.estoque_minimo THEN 'estoque_baixo'
        ELSE 'normal'
    END as status_estoque
FROM products p
WHERE p.ativo = true;

-- View: Métricas de Projeto
CREATE MATERIALIZED VIEW project_metrics AS
SELECT 
    p.id AS project_id,
    p.code,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'open') AS open_actions,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'done') AS done_actions,
    COALESCE(SUM(e.valor), 0) AS budget_used,
    MAX(r.severity) AS max_risk_severity
FROM projects p
LEFT JOIN actions a ON a.project_id = p.id
LEFT JOIN transactions e ON e.project_id = p.id AND e.tipo = 'despesa'
LEFT JOIN risks r ON r.project_id = p.id AND r.status = 'open'
GROUP BY p.id, p.code;
```

---

## 8. API REST UNIFICADA

### 8.1 Estrutura de Endpoints

```
/api/v1/
│
├── /auth/
│   ├── POST   /login
│   ├── POST   /logout
│   └── POST   /refresh
│
├── /organizations/
│   ├── GET    /
│   └── GET    /{id}
│
├── /projects/
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /{id}
│   ├── PUT    /{id}
│   └── GET    /{id}/dashboard
│
├── /meetings/
│   ├── GET    /
│   ├── POST   /ingest          ← PROCESSA TRANSCRIÇÃO
│   ├── GET    /{id}
│   └── GET    /{id}/entities
│
├── /actions/
│   ├── GET    /
│   ├── POST   /
│   ├── PUT    /{id}
│   ├── POST   /{id}/complete
│   └── GET    /kanban
│
├── /decisions/
│   ├── GET    /
│   ├── GET    /{id}
│   └── GET    /similar         ← RAG SEARCH
│
├── /sprints/
│   ├── GET    /
│   ├── GET    /{id}
│   └── POST   /{id}/close
│
├── /products/
│   ├── GET    /
│   ├── POST   /
│   ├── PUT    /{id}
│   ├── DELETE /{id}
│   └── GET    /{id}/stock
│
├── /sales/
│   ├── GET    /
│   ├── POST   /                ← CRIA VENDA + BAIXA ESTOQUE
│   ├── GET    /{id}
│   └── POST   /{id}/cancel
│
├── /stock/
│   ├── GET    /movements
│   ├── POST   /entry           ← ENTRADA ESTOQUE
│   ├── POST   /exit            ← SAÍDA ESTOQUE
│   └── POST   /adjust          ← AJUSTE/INVENTÁRIO
│
├── /persons/
│   ├── GET    /
│   ├── POST   /
│   ├── PUT    /{id}
│   ├── GET    /{id}/360        ← VISÃO 360° (cliente+colaborador)
│   └── GET    /customers
│   └── GET    /suppliers
│   └── GET    /team
│
├── /financial/
│   ├── GET    /accounts
│   ├── GET    /transactions
│   ├── POST   /transactions
│   ├── GET    /cashflow
│   ├── GET    /dre
│   └── GET    /budget/{project_id}
│
├── /invoices/
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /{id}
│   └── POST   /{id}/emit       ← EMITE NF
│
└── /reports/
    ├── GET    /sales
    ├── GET    /stock
    ├── GET    /financial
    └── GET    /performance
```

### 8.2 Endpoint Principal: Ingest Meeting

```json
// POST /api/v1/meetings/ingest
{
  "transcript": {
    "raw_text": "Reunião de alinhamento...",
    "source": "fathom",
    "language": "pt-BR"
  },
  "metadata": {
    "title": "Reunião Chatbot - Sprint 48",
    "date_start": "2025-11-24T14:00:00Z",
    "project_code": "CHATBOT",
    "sprint_code": "Sprint-2025-W48"
  },
  "options": {
    "auto_extract": true,
    "generate_minutes": true,
    "detect_financial": true,    // ← NOVO: Detecta despesas
    "update_dashboard": true
  }
}

// Response 201
{
  "meeting": { "id": "...", "code": "MTG-2025-11-24-CHATBOT" },
  "extracted": {
    "decisions": 3,
    "actions": 7,
    "risks": 2,
    "kaizens": 1,
    "expenses_draft": 2  // ← NOVO: Despesas detectadas
  },
  "files_generated": {
    "ata": "40-Reunioes/2025-11-24-Reuniao-Chatbot.md"
  }
}
```

---

## 9. FRONTEND UNIFICADO

### 9.1 Estrutura de Navegação

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SIDEBAR UNIFICADA                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  🚀 ERP-UZZAI                                                                 │
│  "Think Smart, Think Uzz.Ai"                                                 │
│                                                                               │
│  ────────────────────────────────────────                                     │
│                                                                               │
│  📊 DASHBOARD EXECUTIVO                                                       │
│                                                                               │
│  🏢 GESTÃO INTERNA                                                           │
│    ├── 📁 Projetos                                                           │
│    │     ├── CHATBOT                                                         │
│    │     ├── SITE-BUILDER                                                    │
│    │     └── NUTRI-TRAIN                                                     │
│    ├── 📅 Reuniões                                                           │
│    ├── ✅ Ações (Kanban)                                                     │
│    ├── 📓 Bullet Journal                                                     │
│    ├── 👥 Equipe                                                             │
│    └── 📈 Performance                                                        │
│                                                                               │
│  🛒 ERP COMERCIAL                                                            │
│    ├── 🏷️ Produtos                                                          │
│    ├── 📦 Estoque                                                            │
│    ├── 💳 Vendas (PDV)                                                       │
│    ├── 🧾 Pedidos                                                            │
│    └── 👤 Clientes                                                           │
│                                                                               │
│  💰 FINANCEIRO                                                               │
│    ├── 💵 Fluxo de Caixa                                                     │
│    ├── 📋 Contas a Pagar                                                     │
│    ├── 📋 Contas a Receber                                                   │
│    ├── 📄 Notas Fiscais                                                      │
│    └── 📊 Relatórios                                                         │
│                                                                               │
│  🧠 INTELIGÊNCIA                                                             │
│    ├── 🔍 RAG Insights                                                       │
│    └── 📚 Base de Conhecimento                                               │
│                                                                               │
│  ⚙️ CONFIGURAÇÕES                                                            │
│                                                                               │
│  ────────────────────────────────────────                                     │
│  👤 Pedro Vitor                                                              │
│     CEO & Founder                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Páginas por Módulo

| Módulo | Páginas | Componentes Principais |
|--------|---------|------------------------|
| **Dashboard** | `/` | KPIs, Charts, Alertas, Atividade Recente |
| **Projetos** | `/projetos`, `/projetos/[id]` | ProjectCard, SprintBoard, GanttChart |
| **Reuniões** | `/reunioes`, `/reunioes/[id]` | MeetingCard, AtaViewer, EntityList |
| **Ações** | `/acoes` | KanbanBoard, ActionCard, FilterBar |
| **BuJo** | `/bullet-journal` | DailyView, WeeklyView, MonthlyView |
| **Equipe** | `/equipe`, `/equipe/[id]` | PersonCard, PerformanceChart, 360View |
| **Produtos** | `/produtos`, `/produtos/[id]` | ProductCard, ProductForm, StockBadge |
| **Estoque** | `/estoque` | MovimentacaoForm, StockTable, AlertBadge |
| **Vendas** | `/vendas`, `/pdv` | PDVScreen, VendaForm, SaleHistory |
| **Clientes** | `/clientes`, `/clientes/[id]` | PessoaForm, CustomerHistory, 360View |
| **Financeiro** | `/financeiro` | CashFlowChart, DRETable, BudgetChart |
| **NF** | `/notas-fiscais` | InvoiceList, InvoiceEmit, NFViewer |
| **RAG** | `/rag-insights` | SimilaritySearch, DedupeAlert |
| **KB** | `/conhecimento` | KBCard, CategoryFilter, SearchBar |

---

## 10. FLUXOS DE NEGÓCIO

### 10.1 Fluxo: Reunião → Ata → Despesa

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Transcrição │────►│ Multi-Agent │────►│  Extração   │────►│    Ata      │
│   (Fathom)  │     │ Orchestrator│     │ Entidades   │     │ Estruturada │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
                    ┌─────────────────────────────────────────────────┐
                    │              ENTIDADES EXTRAÍDAS                 │
                    ├─────────────────────────────────────────────────┤
                    │  D-2025-042: Usar Capacitor                     │
                    │  A-2025-123: Implementar login @Luis ⏰ 01/12   │
                    │  A-2025-124: Contratar designer R$2.500 @Pedro  │ ← FINANCEIRO
                    │  K-T-015: Commits pequenos evitam conflitos     │
                    │  R-CHATBOT-003: LOI atrasada                    │
                    └─────────────────────────────────────────────────┘
                                              │
                                              ▼
                    ┌─────────────────────────────────────────────────┐
                    │              FINANCIAL AGENT                     │
                    ├─────────────────────────────────────────────────┤
                    │  Detecta: "Contratar designer R$2.500"          │
                    │  Verbo: "contratar" ✓                           │
                    │  Valor: R$ 2.500,00 ✓                           │
                    │  Categoria: design                              │
                    │  → Cria ExpenseDraft (status: draft)            │
                    └─────────────────────────────────────────────────┘
                                              │
                                              ▼
                    ┌─────────────────────────────────────────────────┐
                    │              EXPENSE DRAFT                       │
                    ├─────────────────────────────────────────────────┤
                    │  ID: EXP-DRAFT-2025-001                         │
                    │  Descrição: Contratar designer                  │
                    │  Projeto: CHATBOT                               │
                    │  Valor: R$ 2.500,00                             │
                    │  Categoria: design                              │
                    │  Status: AGUARDANDO APROVAÇÃO                   │
                    │  Origem: A-2025-124 (Reunião MTG-2025-11-24)    │
                    └─────────────────────────────────────────────────┘
                                              │
                            ┌─────────────────┼─────────────────┐
                            │                 │                 │
                            ▼                 ▼                 ▼
                    ┌───────────┐     ┌───────────┐     ┌───────────┐
                    │  APROVAR  │     │  EDITAR   │     │  REJEITAR │
                    └───────────┘     └───────────┘     └───────────┘
                            │
                            ▼
                    ┌─────────────────────────────────────────────────┐
                    │              EXPENSE CONFIRMED                   │
                    │  → Cria Transação em Contas a Pagar             │
                    │  → Atualiza Budget do Projeto CHATBOT           │
                    │  → Agenda pagamento                             │
                    └─────────────────────────────────────────────────┘
```

### 10.2 Fluxo: Venda → Estoque → Financeiro

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    PDV      │────►│   Venda     │────►│   Itens     │
│  (Frontend) │     │  Registrada │     │  da Venda   │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                          ┌───────────────────┼───────────────────┐
                          │                   │                   │
                          ▼                   ▼                   ▼
                    ┌───────────┐       ┌───────────┐       ┌───────────┐
                    │  ESTOQUE  │       │ FINANCEIRO│       │  CLIENTE  │
                    │  -Qtd     │       │  +Receita │       │ Histórico │
                    └───────────┘       └───────────┘       └───────────┘
                          │                   │
                          ▼                   ▼
                    ┌───────────┐       ┌───────────┐
                    │  Trigger  │       │  À Vista? │
                    │ Estoque   │       │           │
                    │ Mínimo?   │       │   Sim     │──────► Baixa automática
                    └───────────┘       │   Não     │──────► Contas a Receber
                          │             └───────────┘
                          ▼
                    ┌───────────┐
                    │  ALERTA   │
                    │ Reposição │
                    └───────────┘
```

---

## 11. STACK TECNOLÓGICO

### 11.1 Backend

| Componente | Tecnologia | Versão |
|------------|------------|--------|
| **Linguagem** | Python | 3.11+ |
| **Framework API** | FastAPI | 0.104+ |
| **ORM** | SQLAlchemy | 2.0+ |
| **Validação** | Pydantic | 2.0+ |
| **LLM** | OpenAI API | gpt-4o-mini |
| **Embeddings** | OpenAI | text-embedding-3-large |
| **Vector DB** | Qdrant | 1.7+ |
| **Database** | PostgreSQL | 15+ |
| **Cache** | Redis | 7+ |
| **Migrations** | Alembic | 1.12+ |
| **CLI** | Typer | 0.9+ |
| **Templates** | Jinja2 | 3.1+ |

### 11.2 Frontend

| Componente | Tecnologia | Versão |
|------------|------------|--------|
| **Framework** | Next.js | 15+ |
| **UI Library** | React | 19+ |
| **Components** | Shadcn/ui | latest |
| **Styling** | Tailwind CSS | 3.4+ |
| **Language** | TypeScript | 5.3+ |
| **Charts** | Chart.js | 4.4+ |
| **Forms** | React Hook Form | 7+ |
| **Validation** | Zod | 3.22+ |
| **State** | Zustand | 4+ |

### 11.3 Infraestrutura

| Componente | Tecnologia |
|------------|------------|
| **Container** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |
| **Hosting API** | Vercel / Railway |
| **Hosting DB** | Supabase / Neon |
| **Vector DB** | Qdrant Cloud |
| **Storage** | S3 / Cloudflare R2 |
| **Monitoring** | Sentry |

### 11.4 Docker Compose

```yaml
version: '3.8'

services:
  api:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/erpuzzai
      - QDRANT_URL=http://qdrant:6333
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - postgres
      - qdrant
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:8000

  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: erpuzzai
    volumes:
      - postgres_data:/var/lib/postgresql/data

  qdrant:
    image: qdrant/qdrant:v1.7.0
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
  qdrant_data:
```

---

## 12. ESTRUTURA DE CÓDIGO

```
erp-uzzai-unified/
├── backend/
│   ├── src/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── project.py
│   │   │   │   ├── meeting.py
│   │   │   │   ├── action.py
│   │   │   │   ├── decision.py
│   │   │   │   ├── person.py           # Unificado: cliente+fornecedor+colaborador
│   │   │   │   ├── product.py
│   │   │   │   ├── sale.py
│   │   │   │   ├── stock_movement.py
│   │   │   │   ├── transaction.py
│   │   │   │   └── invoice.py
│   │   │   ├── repositories/
│   │   │   │   └── ...
│   │   │   └── events/
│   │   │       └── domain_events.py
│   │   │
│   │   ├── application/
│   │   │   ├── use_cases/
│   │   │   │   ├── ingest_meeting.py
│   │   │   │   ├── create_sale.py
│   │   │   │   ├── process_stock.py
│   │   │   │   └── emit_invoice.py
│   │   │   └── services/
│   │   │       ├── rag_context_enricher.py
│   │   │       ├── financial_classifier.py
│   │   │       └── stock_calculator.py
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── persistence/
│   │   │   │   ├── sql/
│   │   │   │   │   ├── database.py
│   │   │   │   │   ├── models.py
│   │   │   │   │   └── repositories/
│   │   │   │   └── file/
│   │   │   │       └── markdown_assembler.py
│   │   │   ├── rag/
│   │   │   │   ├── qdrant_client.py
│   │   │   │   └── embedding_service.py
│   │   │   ├── llm/
│   │   │   │   └── openai_client.py
│   │   │   └── agents/
│   │   │       ├── base_agent.py
│   │   │       ├── decision_agent.py
│   │   │       ├── action_agent.py
│   │   │       ├── financial_agent.py  # NOVO
│   │   │       └── orchestrator.py
│   │   │
│   │   └── interfaces/
│   │       ├── api/
│   │       │   ├── main.py
│   │       │   ├── routes/
│   │       │   │   ├── meetings.py
│   │       │   │   ├── projects.py
│   │       │   │   ├── products.py
│   │       │   │   ├── sales.py
│   │       │   │   ├── stock.py
│   │       │   │   ├── financial.py
│   │       │   │   └── invoices.py
│   │       │   └── schemas/
│   │       └── cli/
│   │
│   ├── migrations/
│   ├── tests/
│   ├── Dockerfile
│   └── pyproject.toml
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                # Dashboard
│   │   │   ├── projetos/
│   │   │   ├── reunioes/
│   │   │   ├── acoes/
│   │   │   ├── bullet-journal/
│   │   │   ├── equipe/
│   │   │   ├── produtos/
│   │   │   ├── estoque/
│   │   │   ├── vendas/
│   │   │   ├── pdv/
│   │   │   ├── clientes/
│   │   │   ├── financeiro/
│   │   │   ├── notas-fiscais/
│   │   │   ├── rag-insights/
│   │   │   └── conhecimento/
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                      # Shadcn/ui
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── TopBar.tsx
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   ├── meetings/
│   │   │   ├── actions/
│   │   │   ├── products/
│   │   │   ├── sales/
│   │   │   ├── stock/
│   │   │   ├── financial/
│   │   │   └── forms/
│   │   │       ├── PessoaForm.tsx       # Unificado
│   │   │       ├── ProductForm.tsx
│   │   │       ├── VendaForm.tsx
│   │   │       ├── EstoqueOperacaoForm.tsx
│   │   │       └── TransacaoForm.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── utils.ts
│   │   │   └── hooks/
│   │   │
│   │   └── types/
│   │
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── docs/
│   └── architecture/
│
├── docker-compose.yml
└── README.md
```

---

## 13. ROADMAP DE IMPLEMENTAÇÃO

### 13.1 Gantt Chart

```mermaid
gantt
    title Roadmap ERP Unificado UzzAI
    dateFormat YYYY-MM-DD
    
    section Fase 0: Foundation
    Setup Monorepo              :done, f0a, 2025-11-20, 3d
    Domain Model Unificado      :done, f0b, 2025-11-23, 5d
    Multi-Agent MVP             :active, f0c, 2025-11-28, 7d
    RAG Basic                   :f0d, 2025-12-05, 5d
    
    section Fase 1: Gestão Interna
    Projetos + Sprints          :f1a, 2025-12-10, 5d
    Reuniões + Extração         :f1b, 2025-12-15, 7d
    Ações + Kanban              :f1c, 2025-12-22, 5d
    Bullet Journal              :f1d, 2025-12-27, 3d
    
    section Fase 2: ERP Comercial
    Cadastros (Pessoa/Produto)  :f2a, 2026-01-05, 7d
    Vendas + PDV                :f2b, 2026-01-12, 7d
    Estoque + Movimentações     :f2c, 2026-01-19, 7d
    
    section Fase 3: Financeiro
    Contas Pagar/Receber        :f3a, 2026-01-26, 7d
    Fluxo de Caixa + DRE        :f3b, 2026-02-02, 5d
    Notas Fiscais               :f3c, 2026-02-07, 7d
    
    section Fase 4: SaaS
    Multi-tenancy               :f4a, 2026-02-14, 7d
    Billing (Stripe)            :f4b, 2026-02-21, 5d
    Onboarding                  :f4c, 2026-02-26, 5d
```

### 13.2 Checklist por Fase

#### Fase 0: Foundation
- [x] Estrutura de pastas
- [x] Modelo de domínio
- [ ] Setup PostgreSQL + Qdrant
- [ ] Multi-Agent Orchestrator
- [ ] RAG Context Enricher
- [ ] Frontend base (Next.js + Shadcn)

#### Fase 1: Gestão Interna
- [ ] CRUD Projetos
- [ ] Sprints + Dashboard
- [ ] Ingestão de Reuniões
- [ ] Extração Multi-Agente
- [ ] Ações + Kanban Board
- [ ] Bullet Journal

#### Fase 2: ERP Comercial
- [ ] PessoaForm unificado
- [ ] CRUD Produtos
- [ ] PDV / Vendas
- [ ] Estoque + Movimentações
- [ ] Preço Médio Ponderado

#### Fase 3: Financeiro
- [ ] Contas a Pagar
- [ ] Contas a Receber
- [ ] Fluxo de Caixa
- [ ] DRE
- [ ] Emissão NF

#### Fase 4: SaaS
- [ ] Multi-tenancy
- [ ] Billing
- [ ] Onboarding
- [ ] Integrações

---

## 📊 MÉTRICAS DE SUCESSO

| Métrica | Target |
|---------|--------|
| **Extração Recall** | ≥ 85% |
| **Extração Precision** | ≥ 80% |
| **Deduplicação** | 100% |
| **Latência API** | ≤ 200ms |
| **Processamento Reunião** | ≤ 60s |
| **Uptime** | ≥ 99.5% |

---

## 🔗 REFERÊNCIAS

- `ARQUITETURA_ERP_UZZAI_COMPLETA.md` — Gestão Interna
- `ARQUITETURA_WEB_COMPLETA.md` — Stack Web
- `DIAGRAMAS_INTERLIGACOES.md` — MeguisPet
- `MAPA_INTERLIGACOES_SISTEMA.md` — Dependências
- `FORMULARIOS_REDESIGN.md` — Unificação

---

**📅 Última Atualização:** 2025-11-29T16:00  
**👤 Autor:** Sistema de Documentação ERP-UzzAI  
**📈 Versão:** 3.0.0  
**🔄 Próxima Revisão:** Após conclusão da Fase 0

