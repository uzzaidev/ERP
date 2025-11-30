# Por que Testes de Integração são Críticos 🎯

## ⚙️ Configuração: Test Client para Jest

Os testes de integração usam um cliente Supabase especial que **não depende de cookies do Next.js**:

```typescript
// ❌ NÃO funciona no Jest
import { createClient } from '@/lib/supabase/server';
// TypeError: cookieStore.getAll is not a function

// ✅ Funciona no Jest
import { createTestClient } from '@/lib/supabase/test-client';
const supabase = createTestClient(); // Cliente simples sem cookies
```

### Por que precisamos de um Test Client?

1. **Jest não suporta `cookies()` do Next.js**
2. **Testes não precisam de autenticação com cookies**
3. **É mais rápido e simples**

## 🐛 O Problema que Você Encontrou

### Erro Real em Produção:
```
Error fetching tasks: {
  code: 'PGRST200',
  message: "Could not find a relationship between 'tasks' and 'users' in the schema cache"
}
```

### Por que os Testes Unitários NÃO Pegaram?

```typescript
// ❌ Teste Unitário com Mock (PASSA mesmo com erro!)
it('should fetch tasks', async () => {
  mockSupabase.from.mockReturnValue({
    select: () => ({ data: mockData, error: null })
  });
  
  // Mock aceita QUALQUER foreign key
  // Mock aceita QUALQUER nome de coluna
  // Mock sempre retorna sucesso!
  
  const response = await GET();
  expect(response.status).toBe(200); // ✅ PASSA (mas está errado!)
});

// ✅ Teste de Integração com Banco Real (FALHA corretamente!)
it('should fetch tasks', async () => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .select('assignee:users!tasks_assigned_to_fkey (...)'); // ❌ FK errado!
  
  // ERRO REAL: PGRST200 - Foreign key não existe!
  expect(error).toBeNull(); // ❌ FALHA (como deveria!)
});
```

## 📊 Comparação: Unit vs Integration Tests

### Testes Unitários (Mocks)
```typescript
// __tests__/api/tasks.test.ts

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}));

✅ Vantagens:
- Rápidos (< 1 segundo)
- Não precisam de banco
- Testam lógica isolada
- Rodam no CI/CD sem configuração

❌ Limitações:
- NÃO pegam erros de schema
- NÃO validam foreign keys
- NÃO detectam nomes de colunas errados
- NÃO testam queries SQL reais
```

### Testes de Integração (Supabase Real)
```typescript
// __tests__/integration/schema-validation.test.ts

const supabase = await createClient(); // SEM mock!

✅ Vantagens:
- Pegam erros REAIS de schema
- Validam foreign keys corretas
- Detectam nomes de colunas errados
- Testam queries SQL completas
- GARANTEM que API funciona

❌ Limitações:
- Mais lentos (alguns segundos)
- Precisam de banco configurado
- Não rodam sem .env.local
```

## 🎯 Estratégia Recomendada: AMBOS!

### 1. Testes Unitários (Desenvolvimento)
```bash
# Roda a cada mudança no código
pnpm test:watch

# Valida lógica rapidamente
pnpm test
```

**Quando usar:**
- ✅ Durante desenvolvimento (feedback imediato)
- ✅ Para testar edge cases
- ✅ Para validar error handling
- ✅ No CI/CD (rápido, sem dependências)

### 2. Testes de Integração (Validação Real)
```bash
# Antes de commit importante
pnpm test:integration

# Após mudanças no schema SQL
pnpm test:integration

# Antes de deploy em produção
pnpm test:integration
```

**Quando usar:**
- ✅ Após mudar schema SQL (db/*.sql)
- ✅ Antes de deploys importantes
- ✅ Quando APIs retornam erros PGRST*
- ✅ Para validar foreign keys
- ✅ Para garantir que queries reais funcionam

## 🔍 Erros que Cada Tipo Pega

### Unitários pegam:
- ✅ Lógica de negócio errada
- ✅ Error handling faltando
- ✅ Validações de input
- ✅ Formatação de resposta

### Unitários NÃO pegam:
- ❌ Foreign key errada (como `tasks_assigned_to_fkey`)
- ❌ Nome de coluna errado (como `name` vs `full_name`)
- ❌ Query SQL inválida
- ❌ Schema desatualizado

### Integração pega:
- ✅ Foreign key errada → **PGRST200**
- ✅ Foreign key ambígua → **PGRST201**
- ✅ Coluna não existe → **42703**
- ✅ Queries SQL inválidas
- ✅ Schema desincronizado

## 🚀 Como Usar os Testes de Integração

### 1. Configure .env.local (já feito)
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

### 2. Execute testes de integração
```bash
pnpm test:integration
```

### 3. Interprete os resultados

#### ✅ Todos passam:
```
✅ Tasks API schema está correto!
✅ Coluna assignee_id existe!
✅ Projects API schema está correto!
✅ Coluna full_name existe!

Test Suites: 1 passed
Tests: 6 passed
```
**Significa:** Schema sincronizado, APIs funcionam!

#### ❌ Algum falha:
```
❌ ERRO DE SCHEMA: PGRST200
Detalhes: Searched for 'tasks_assigned_to_fkey' but not found
Hint: Check your foreign key name

Test Suites: 1 failed
Tests: 3 passed, 1 failed
```
**Significa:** Schema desatualizado, API vai crashar!

## 📝 Exemplo Real: Seu Erro

### O que aconteceu:
1. API usava `tasks_assigned_to_fkey` ❌
2. Schema tem `tasks_assignee_id_fkey` ✅
3. Testes unitários **PASSARAM** (usam mock)
4. Em desenvolvimento, API **CRASHOU**

### Se tivesse testes de integração:
```typescript
// Teste falharia ANTES de rodar a aplicação
it('should validate tasks foreign key', async () => {
  const { error } = await supabase
    .from('tasks')
    .select('assignee:users!tasks_assigned_to_fkey (...)');
  
  expect(error).toBeNull(); // ❌ FALHA
  // Erro: PGRST200 - Foreign key not found
});
```

**Resultado:** Você descobriria o erro ANTES de testar manualmente! 🎉

## 🎓 Lições Aprendidas

1. **Mocks são ótimos, mas não suficientes**
   - Testam lógica ✅
   - Não testam infraestrutura ❌

2. **Integração pega erros reais**
   - Schema mismatches ✅
   - Foreign keys erradas ✅
   - Nomes de colunas errados ✅

3. **Use ambos estrategicamente**
   - Unitários: feedback rápido durante dev
   - Integração: validação antes de deploy

## 🔧 Workflow Recomendado

```bash
# 1. Durante desenvolvimento (rápido)
pnpm test:watch

# 2. Antes de commit
pnpm test

# 3. Após mudança no schema SQL
pnpm test:integration

# 4. Antes de deploy
pnpm test:all  # Unitários + Integração
pnpm build
```

## 📊 Cobertura Atual

### Testes Unitários:
- ✅ 9 testes passando
- ✅ /api/projects (3 testes)
- ✅ /api/tasks (6 testes)
- ⏳ /api/users (0 testes)
- ⏳ /api/sprints (0 testes)
- ⏳ /api/tags (0 testes)

### Testes de Integração:
- ✅ 6 testes de validação de schema
- ✅ Tasks foreign keys
- ✅ Projects foreign keys  
- ✅ Users columns
- ⏳ Sprints validation
- ⏳ Tags validation

## 🎯 Próximos Passos

1. ✅ Executar `pnpm test:integration` agora
2. ⏳ Adicionar mais testes de integração
3. ⏳ Configurar CI/CD para rodar ambos
4. ⏳ Documentar erros comuns e soluções

---

**TL;DR:**
- Testes unitários = Lógica ✅
- Testes de integração = Schema ✅
- Use **AMBOS** para cobertura completa! 🎯
