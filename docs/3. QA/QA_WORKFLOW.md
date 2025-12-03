# 🧪 Workflow de QA - ERP UzzAI

**Data**: 2025-01-XX
**Versão**: 1.0
**Status**: ✅ Ativo

---

## 📋 Visão Geral

Este documento descreve o processo completo de Quality Assurance (QA) do projeto ERP UzzAI, incluindo testes automatizados, validações e quando executá-los.

## 🚀 Scripts de QA Disponíveis

### Scripts Rápidos (Unit Tests)

```bash
# Testes unitários (rápidos, com mocks)
pnpm test                # Todos os testes unitários
pnpm test:unit           # Mesma coisa que test
pnpm test:watch          # Modo watch (desenvolvimento)
pnpm test:api            # Apenas API routes
pnpm test:coverage       # Com cobertura de código
```

### Scripts Completos (Integration Tests)

```bash
# Testes de integração (lentos, banco real)
pnpm test:integration    # Todos os testes de integração
pnpm test:all            # Unit + Integration
```

### Scripts de QA Completo

```bash
# QA COMPLETO (recomendado antes de commits/deploys)
pnpm qa                  # Linux/Mac (bash)
pnpm qa:win              # Windows (PowerShell)
```

**O que o QA completo faz:**
1. ✅ Verifica ambiente (pnpm instalado, etc)
2. ✅ Instala dependências se necessário
3. ✅ Executa ESLint
4. ✅ Verifica tipos TypeScript
5. ✅ Executa testes unitários
6. ✅ Testa build de produção

---

## 📁 Estrutura de Testes

```
__tests__/
├── README.md                           # Documentação dos testes
├── WHY_INTEGRATION_TESTS.md            # Por que testes de integração
├── setup.ts                            # Setup global do Jest
├── api/                                # Testes de API (unit)
│   ├── projects.test.ts                # API de projetos
│   └── tasks.test.ts                   # API de tarefas
└── integration/                        # Testes de integração
    ├── setup.ts                        # Setup de integração
    ├── supabase.test.ts                # Conexão com Supabase
    ├── schema-validation.test.ts       # Validação de schema
    ├── rbac-system.test.ts             # Sistema RBAC ✨ NOVO
    └── auth-me-api.test.ts             # API /api/auth/me ✨ NOVO
```

---

## 🆕 Novos Testes Criados

### 1. `rbac-system.test.ts`

Valida o sistema RBAC após migração de `role_name` → `user_roles`.

**Valida:**
- ✅ Coluna `role_name` foi removida
- ✅ Tabelas `roles`, `user_roles` existem
- ✅ Roles padrão (admin, gestor, member) existem
- ✅ Usuários ativos têm roles atribuídas
- ✅ Foreign keys de `user_roles` estão corretas
- ✅ Usuários com tenant têm roles
- ✅ Relação users → tenants funciona

**Quando executar:**
- ✅ Após mudanças no schema RBAC
- ✅ Após executar db/10_fix_users_schema.sql
- ✅ Após executar db/12_fix_user_data.sql
- ✅ Se usuários reportarem problemas de acesso

### 2. `auth-me-api.test.ts`

Valida a API `/api/auth/me` que retorna dados do usuário logado.

**Valida:**
- ✅ Estrutura de resposta correta
- ✅ Dados do tenant incluídos
- ✅ Fallback de busca de tenant funciona
- ✅ Dados formatados para Topbar (nome + empresa)
- ✅ RLS policies permitem leitura de próprios dados
- ✅ Funções SECURITY DEFINER existem

**Quando executar:**
- ✅ Após mudanças em getTenantContext()
- ✅ Após mudanças nas RLS policies
- ✅ Se Topbar mostrar "Usuário" ou "Sem empresa"
- ✅ Após mudanças na API /api/auth/me

---

## ⚡ Quando Executar Cada Tipo de Teste

### Durante Desenvolvimento
```bash
pnpm test:watch  # Feedback imediato a cada mudança
```

### Antes de Commit
```bash
pnpm qa          # QA completo (lint + types + tests + build)
```

### Antes de Deploy
```bash
pnpm qa                    # QA completo
pnpm test:integration      # Validar com banco real
```

### Após Mudanças no Schema SQL
```bash
pnpm test:integration      # OBRIGATÓRIO
```

### Após Mudanças em APIs
```bash
pnpm test:api              # Validar APIs
pnpm test:integration      # Validar integração
```

---

## 🎯 Checklist de QA

### Antes de Commit ✅

- [ ] `pnpm qa` passou sem erros
- [ ] Código commitado tem testes
- [ ] Mensagem de commit descritiva

### Antes de Pull Request ✅

- [ ] `pnpm qa` passou
- [ ] `pnpm test:integration` passou
- [ ] Documentação atualizada
- [ ] CHANGELOG atualizado (se aplicável)

### Antes de Deploy ✅

- [ ] `pnpm qa` passou
- [ ] `pnpm test:integration` passou
- [ ] `pnpm build` gerou build sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Migrations SQL aplicadas no Supabase

### Após Mudanças no Sistema RBAC ✅

- [ ] Execute: `pnpm test:integration`
- [ ] Verifique: `rbac-system.test.ts` passou
- [ ] Verifique: Nenhum warning sobre usuários sem roles
- [ ] Teste manual: Login e acesso ao sistema

### Após Mudanças no Sistema de Autenticação ✅

- [ ] Execute: `pnpm test:integration`
- [ ] Verifique: `auth-me-api.test.ts` passou
- [ ] Teste manual: Topbar mostra nome e empresa
- [ ] Teste manual: Login/logout funciona

---

## 🐛 Troubleshooting

### Testes de Integração Falhando

**Problema**: `Connection refused` ou `timeout`

**Solução**:
1. Verifique se `.env.test.local` existe
2. Configure variáveis do Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
3. Teste conexão: `pnpm test:integration`

### Script QA Falha no Lint

**Problema**: ESLint encontra erros

**Solução**:
1. Execute: `pnpm lint --fix` para corrigir automaticamente
2. Corrija erros manualmente se necessário
3. Execute `pnpm qa` novamente

### Script QA Falha no Type Check

**Problema**: TypeScript encontra erros de tipo

**Solução**:
1. Execute: `pnpm exec tsc --noEmit` para ver erros
2. Corrija os erros de tipo
3. Execute `pnpm qa` novamente

### Build Falha

**Problema**: `pnpm build` falha

**Solução**:
1. Limpe cache: `rm -rf .next`
2. Reinstale dependências: `rm -rf node_modules && pnpm install`
3. Execute novamente: `pnpm build`

---

## 📊 Cobertura de Testes

### Mínimos Requeridos

- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

### Ver Cobertura

```bash
pnpm test:coverage
```

Relatório gerado em: `coverage/lcov-report/index.html`

---

## 🔄 Fluxo de Trabalho Completo

### 1. Desenvolvimento

```
Código → test:watch → Feedback Imediato
```

### 2. Antes de Commit

```
Código → pnpm qa → Lint → Types → Tests → Build → ✅ Commit
```

### 3. Pull Request

```
PR → GitHub Actions → pnpm qa → pnpm test:integration → Review → Merge
```

### 4. Deploy

```
Merge → pnpm qa → pnpm test:integration → pnpm build → Deploy → ✅
```

---

## 📝 Adicionando Novos Testes

### Teste Unitário (API Route)

```typescript
// __tests__/api/my-route.test.ts
import { GET } from '@/app/api/my-route/route';

describe('GET /api/my-route', () => {
  it('should return data filtered by tenant', async () => {
    // Mock getTenantContext
    // Mock Supabase
    // Call GET()
    // Assert response
  });
});
```

### Teste de Integração (Schema)

```typescript
// __tests__/integration/my-feature.test.ts
import { createTestClient } from '@/lib/supabase/test-client';

describe('Integration: My Feature', () => {
  it('should validate schema', async () => {
    const supabase = createTestClient();
    const { data, error } = await supabase
      .from('my_table')
      .select('*')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
```

---

## 🎓 Melhores Práticas

### ✅ DO

- Execute `pnpm qa` antes de CADA commit importante
- Execute `pnpm test:integration` após mudanças no schema
- Escreva testes para novas features
- Mantenha cobertura acima de 50%
- Use mocks para testes unitários
- Use banco real para testes de integração

### ❌ DON'T

- Não commite código sem testes
- Não skip testes falhando (conserte-os!)
- Não ignore warnings do lint
- Não ignore erros de tipo do TypeScript
- Não faça deploy sem rodar QA completo

---

## 📚 Referências

- [__tests__/README.md](../../__tests__/README.md) - Documentação detalhada de testes
- [__tests__/WHY_INTEGRATION_TESTS.md](../../__tests__/WHY_INTEGRATION_TESTS.md) - Por que testes de integração
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## 🎉 Conclusão

O sistema de QA está configurado para garantir que o código esteja sempre funcionando corretamente.

**Regra de Ouro**: Execute `pnpm qa` antes de commits e deploys importantes!

---

**Última Atualização**: 2025-01-XX
**Mantido por**: Equipe de Desenvolvimento ERP UzzAI
