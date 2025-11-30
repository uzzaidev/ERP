# Configuração de Testes

## 🧪 Tipos de Testes

### 1. **Testes Unitários** (com Mocks) - RÁPIDOS ⚡
Testam a lógica das API routes sem conectar ao banco real.

**Quando usar:**
- ✅ Durante desenvolvimento (feedback instantâneo)
- ✅ No CI/CD (roda a cada commit)
- ✅ Para validar error handling
- ✅ Para testar edge cases

**Como rodar:**
```bash
pnpm test              # Todos os testes unitários
pnpm test:api          # Apenas API routes
pnpm test:watch        # Modo watch (desenvolvimento)
```

**Exemplo:** `__tests__/api/projects.test.ts`
```typescript
// Mock do Supabase - não conecta ao banco real
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

// Simula erro de conexão
mockSupabase.order.mockResolvedValue({
  data: null,
  error: { message: 'Database connection failed' }
});
```

### 2. **Testes de Integração** (Supabase Real) - COMPLETOS 🔌
Testam a integração completa com banco de dados real.

**Quando usar:**
- ✅ Antes de deploy em produção
- ✅ Para validar queries complexas
- ✅ Para testar schema do banco
- ✅ Após mudanças no schema SQL

**Como rodar:**
```bash
# 1. Configure ambiente de teste
cp .env.local .env.test.local

# 2. (Opcional) Use projeto Supabase separado para testes
# Edite .env.test.local com URL de teste

# 3. Remova .skip dos testes em __tests__/integration/
# 4. Execute:
pnpm test:integration
```

**Exemplo:** `__tests__/integration/supabase.test.ts`
```typescript
// Usa createClient REAL - conecta ao Supabase
const supabase = await createClient();

const { data, error } = await supabase
  .from('projects')
  .select('*');
  
// Valida resposta real do banco
expect(error).toBeNull();
```

## 🎯 Por que os "Erros" nos Testes?

Os console.error que você viu são **PROPOSITAIS**:

```typescript
it('should handle database errors', async () => {
  // Simula erro de conexão
  mockSupabase.order.mockResolvedValue({
    data: null,
    error: { message: 'Database connection failed' }
  });

  const response = await GET();
  
  // ✅ TESTE PASSA - valida que API retorna erro 500
  expect(response.status).toBe(500);
  expect(data.error).toBe('Database connection failed');
});
```

Esse teste **está passando** ✅ - ele valida que a API lida corretamente com erros!

## 📊 Resultado dos Testes Atuais

```
Test Suites: 2 passed, 2 total
Tests:       9 passed, 9 total

✅ projects.test.ts:
   ✓ should return projects successfully
   ✓ should handle database errors (PROPOSITAL!)
   ✓ should return empty array when no projects exist

✅ tasks.test.ts:
   ✓ should return all tasks without filters
   ✓ should filter tasks by project_id
   ✓ should filter tasks by status
   ✓ should update task status successfully
   ✓ should update task assignee
   ✓ should handle update errors (PROPOSITAL!)
```

## 🔧 Configuração GitHub Actions

O workflow já está configurado para ambos:

```yaml
# .github/workflows/qa.yml

jobs:
  test-api:
    name: API Routes Tests (Unit - Mocks)
    steps:
      - run: pnpm test:api  # Rápido, sem banco
      
  test-integration:
    name: Integration Tests (Real DB)
    steps:
      - run: pnpm test:integration  # Com Supabase real
    env:
      # Secrets configurados no GitHub
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
```

## 🚀 Recomendação de Uso

### Durante Desenvolvimento:
```bash
pnpm test:watch  # Roda testes unitários a cada mudança
```

### Antes de Commit:
```bash
pnpm test        # Valida todos os testes unitários
pnpm lint        # Valida código
```

### Antes de Deploy:
```bash
pnpm test:integration  # Valida integração real
pnpm build             # Valida build de produção
```

### No CI/CD (GitHub Actions):
- ✅ Sempre: Testes unitários (rápidos)
- ✅ Sempre: Build e lint
- ⚙️ Opcional: Testes de integração (mais lentos)

## 🎓 Melhores Práticas

1. **Testes Unitários = Velocidade**
   - Rodam em < 1 segundo
   - Feedback imediato durante desenvolvimento
   - 100% confiáveis (sem dependências externas)

2. **Testes de Integração = Confiança**
   - Rodam antes de deploy
   - Validam schema real
   - Detectam breaking changes

3. **Ambos Juntos = Qualidade Máxima**
   - Unitários: validam lógica
   - Integração: validam infraestrutura
   - Cobertura completa!

## 📝 Próximos Passos

1. **Continuar com testes unitários** (atual) ✅
2. **Opcionalmente**: Habilitar testes de integração quando necessário
3. **Adicionar mais testes** para outras API routes
4. **Configurar cobertura mínima** (80%+)

## ❓ FAQ

**Q: Por que mockar se temos Supabase?**
A: Testes unitários são 1000x mais rápidos e não dependem de rede/banco.

**Q: Os mocks são confiáveis?**
A: Sim! Testam a lógica da aplicação. Integração valida o banco.

**Q: Quando devo rodar integração?**
A: Antes de deploys importantes ou após mudanças no schema SQL.

**Q: Preciso de 2 projetos Supabase?**
A: Recomendado! Um para dev, outro para testes (evita poluir dados reais).
