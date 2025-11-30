# 🚀 ERP-UzzAI

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)

> **"Think Smart, Think Uzz.Ai"**
>
> Sistema ERP Unificado com Inteligência Artificial para automação empresarial completa.

---

## 📖 Sobre o Projeto

O **ERP-UzzAI** é um sistema completo de gestão empresarial que integra automação com IA para processar reuniões, extrair entidades, gerenciar projetos e controlar operações comerciais e financeiras.

### 🎯 Problema Resolvido

| Cenário | ANTES (Manual) | DEPOIS (Automatizado) |
|---------|----------------|----------------------|
| Reunião → Ata | 4-6 horas manuais | 5 minutos automáticos |
| Venda → Estoque | Planilhas separadas | Atualização automática |
| Projeto → Budget | Desconectados | Integração total |
| Decisões duplicadas | Frequentes | RAG detecta 100% |

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

### Backend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Python | 3.11+ | Linguagem principal |
| FastAPI | 0.104+ | Framework API REST |
| SQLAlchemy | 2.0+ | ORM |
| Pydantic | 2.0+ | Validação de dados |
| OpenAI API | gpt-4o-mini | LLM para extração |
| Qdrant | 1.7+ | Vector Database (RAG) |
| PostgreSQL | 15+ | Banco de dados principal |
| Redis | 7+ | Cache |
| Alembic | 1.12+ | Migrations |

### Frontend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 15+ | Framework React |
| React | 19+ | UI Library |
| Shadcn/ui | latest | Componentes UI |
| Tailwind CSS | 3.4+ | Estilização |
| TypeScript | 5.3+ | Type Safety |
| Chart.js | 4.4+ | Gráficos |
| Zod | 3.22+ | Validação |
| Zustand | 4+ | State Management |

### Infraestrutura
| Tecnologia | Uso |
|------------|-----|
| Docker | Containerização |
| Docker Compose | Orquestração local |
| GitHub Actions | CI/CD |

---

## 🚀 Começando

### Pré-requisitos

- Python 3.11+
- Node.js 18+
- Docker e Docker Compose
- Chave de API da OpenAI

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/uzzaidev/ERP.git
cd ERP
```

2. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. **Inicie os serviços com Docker Compose**
```bash
docker-compose up -d
```

4. **Acesse a aplicação**
- API: http://localhost:8000
- Frontend: http://localhost:3000
- Qdrant: http://localhost:6333

### Configuração Manual (Desenvolvimento)

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn src.interfaces.api.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Estrutura do Projeto

```
erp-uzzai/
├── backend/
│   ├── src/
│   │   ├── domain/           # Entidades e regras de negócio
│   │   ├── application/      # Casos de uso
│   │   ├── infrastructure/   # Implementações (DB, RAG, LLM, Agentes)
│   │   └── interfaces/       # API e CLI
│   ├── migrations/           # Migrações do banco
│   └── tests/                # Testes
│
├── frontend/
│   ├── src/
│   │   ├── app/              # Páginas Next.js
│   │   ├── components/       # Componentes React
│   │   ├── lib/              # Utilitários
│   │   └── types/            # TypeScript types
│   └── public/               # Assets estáticos
│
├── docs/                     # Documentação
├── docker-compose.yml
└── README.md
```

---

## 🔌 API Endpoints

### Principais Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/v1/meetings/ingest` | Processa nova reunião |
| `GET` | `/api/v1/projects` | Lista projetos |
| `GET` | `/api/v1/actions` | Lista ações |
| `POST` | `/api/v1/sales` | Cria venda + baixa estoque |
| `GET` | `/api/v1/financial/cashflow` | Fluxo de caixa |
| `GET` | `/api/v1/decisions/similar` | Busca decisões similares (RAG) |

### Exemplo: Ingestão de Reunião

```bash
curl -X POST "http://localhost:8000/api/v1/meetings/ingest" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "transcript": {
      "raw_text": "Reunião de alinhamento...",
      "source": "fathom",
      "language": "pt-BR"
    },
    "metadata": {
      "title": "Reunião Chatbot - Sprint 48",
      "project_code": "CHATBOT"
    },
    "options": {
      "auto_extract": true,
      "generate_minutes": true
    }
  }'
```

**Resposta:**
```json
{
  "meeting": {
    "id": "...",
    "code": "MTG-2025-11-24-CHATBOT"
  },
  "extracted": {
    "decisions": 3,
    "actions": 7,
    "risks": 2,
    "kaizens": 1
  },
  "files_generated": {
    "ata": "40-Reunioes/2025-11-24-Reuniao-Chatbot.md"
  }
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

- [x] Arquitetura e Modelo de Domínio
- [ ] **Fase 0: Foundation**
  - [ ] Setup PostgreSQL + Qdrant
  - [ ] Multi-Agent Orchestrator
  - [ ] RAG Context Enricher
  - [ ] Frontend base (Next.js + Shadcn)
- [ ] **Fase 1: Gestão Interna**
  - [ ] CRUD Projetos e Sprints
  - [ ] Ingestão de Reuniões
  - [ ] Ações + Kanban Board
- [ ] **Fase 2: ERP Comercial**
  - [ ] Cadastros unificados
  - [ ] PDV / Vendas
  - [ ] Estoque + Movimentações
- [ ] **Fase 3: Financeiro**
  - [ ] Contas a Pagar/Receber
  - [ ] Fluxo de Caixa e DRE
  - [ ] Emissão de NF
- [ ] **Fase 4: SaaS**
  - [ ] Multi-tenancy
  - [ ] Billing (Stripe)
  - [ ] Onboarding

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

Para documentação técnica detalhada, consulte:

- [ARQUITETURA_ERP_UZZAI_COMPLETA.md](./ARQUITETURA_ERP_UZZAI_COMPLETA.md) - Arquitetura de Gestão Interna
- [ARQUITETURA_ERP_UNIFICADO_COMPLETA.md](./ARQUITETURA_ERP_UNIFICADO_COMPLETA.md) - Arquitetura Completa Unificada

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
