# QA & Testing Setup - ERP UzzAI

## ✅ Implementado

### 1. GitHub Actions QA Workflow (`.github/workflows/qa.yml`)

Pipeline de CI/CD completo que executa em:
- Push para branches `main` ou `develop`
- Pull Requests
- Manualmente via workflow_dispatch

#### Jobs Configurados:

1. **Lint & Type Check**
   - ESLint
   - TypeScript type checking (`tsc --noEmit`)

2. **API Routes Tests**
   - Testes específicos das rotas API
   - Comando: `pnpm test:api`
   - Variáveis de ambiente: Supabase credentials (via secrets)

3. **Integration Tests**
   - Testes de integração entre componentes
   - Comando: `pnpm test:integration`

4. **Build Application**
   - Build de produção do Next.js
   - Valida que todas as páginas compilam
   - Gera artifacts do build (retidos por 7 dias)

5. **Security Audit**
   - `pnpm audit` para vulnerabilidades
   - Continue-on-error (não bloqueia pipeline)

6. **Quality Gate**
   - Valida resultados de todos os jobs
   - Bloqueia merge se lint ou build falharem

### 2. Estrutura de Testes Jest

```
__tests__/
├── setup.ts                 # Configuração global dos testes
└── api/
    ├── projects.test.ts     # Testes da API de projetos
    └── tasks.test.ts        # Testes da API de tarefas
```

#### Cobertura de Testes:

**projects.test.ts:**
- ✓ GET /api/projects - retorna projetos com sucesso
- ✓ GET /api/projects - lida com erros de banco
- ✓ GET /api/projects - retorna array vazio quando não há projetos

**tasks.test.ts:**
- ✓ GET /api/tasks - retorna todas as tarefas
- ✓ GET /api/tasks - filtra por project_id
- ✓ GET /api/tasks - filtra por status
- ✓ PATCH /api/tasks - atualiza status da tarefa
- ✓ PATCH /api/tasks - atualiza assignee da tarefa
- ✓ PATCH /api/tasks - lida com erros de atualização

### 3. Scripts NPM Adicionados

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:api": "jest __tests__/api",
  "test:integration": "jest __tests__/integration",
  "test:coverage": "jest --coverage"
}
```

### 4. Dependências Instaladas

```json
{
  "devDependencies": {
    "jest": "^30.2.0",
    "@types/jest": "^30.0.0",
    "jest-environment-jsdom": "^30.2.0",
    "@testing-library/react": "^16.3.0",
    "@testing-library/jest-dom": "^6.9.1",
    "ts-node": "^10.9.2"
  }
}
```

### 5. Configuração Jest (`jest.config.js`)

- Environment: `jest-environment-node`
- Setup: `__tests__/setup.ts`
- Module mapping: `@/` → `src/`
- Coverage threshold: 50% (branches, functions, lines, statements)
- Coleta de cobertura de:
  - `src/app/api/**/*.ts`
  - `src/lib/**/*.ts`

### 6. Página de Documentação (`/docs`)

Nova página interativa com:
- ✅ Navegação por seções (sidebar)
- ✅ Busca integrada
- ✅ Syntax highlighting para código
- ✅ Renderização de markdown

**Seções documentadas:**
1. **Começando** - Instalação e setup
2. **Arquitetura** - Stack tecnológico e estrutura
3. **Banco de Dados** - Schema e módulos SQL
4. **API Routes** - Documentação de endpoints
5. **Componentes** - Componentes principais
6. **Gerenciamento de Estado** - Zustand stores
7. **Testes** - Testes automatizados e CI/CD

### 7. Correções de Estrutura

- ❌ Removida pasta `frontend/` duplicada
- ✅ `.env.local` movido para raiz do projeto
- ✅ README.md atualizado com estrutura correta
- ✅ Navegação atualizada com link para `/docs`

## 📋 Como Usar

### Rodar Testes Localmente

```bash
# Todos os testes
pnpm test

# Modo watch (desenvolvimento)
pnpm test:watch

# Apenas API tests
pnpm test:api

# Com cobertura
pnpm test:coverage
```

### Validar Build

```bash
pnpm build
```

### Visualizar Documentação

1. Acesse: `http://localhost:3000/docs`
2. Use a busca para encontrar conteúdo
3. Navegue pelas seções no menu lateral

## 🔐 Secrets Necessários no GitHub

Para o workflow funcionar, configure em **Settings → Secrets and variables → Actions**:

```
NEXT_PUBLIC_SUPABASE_URL=https://lpuxgsaplqiercozlunh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgres://postgres.lpuxgsaplqiercozlunh:nPIHIVtLUFN535FG@...
```

## 📊 Quality Gate

O pipeline **bloqueia merges** se:
- ❌ Lint falhar
- ❌ Type check falhar
- ❌ Build falhar

Os testes de API e integração são informativos mas não bloqueiam (ainda).

## 🎯 Próximos Passos

1. [ ] Adicionar mais testes de API (sprints, users, tags)
2. [ ] Implementar testes de integração E2E
3. [ ] Aumentar cobertura de testes para 80%
4. [ ] Configurar badges do GitHub Actions no README
5. [ ] Adicionar testes de componentes React
6. [ ] Implementar testes de snapshot
