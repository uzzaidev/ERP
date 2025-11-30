# Fix: Integration Tests no GitHub Actions

## Problema

Os testes de integração falhavam no CI com o erro:
```
TypeError: cookieStore.getAll is not a function
```

## Causa

Os testes tentavam usar `createClient()` de `server.ts`, que depende de `cookies()` do Next.js. Isso não funciona no ambiente Jest porque:

1. Jest roda em Node.js puro (sem Next.js runtime)
2. `cookies()` do Next.js só funciona em Server Components e API Routes
3. Testes não precisam de sessão persistente com cookies

## Solução

### 1. Criado Test Client Dedicado

**Arquivo:** `src/lib/supabase/test-client.ts`

```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createTestClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Por que funciona:**
- Usa `@supabase/supabase-js` diretamente (não SSR)
- Não depende de cookies
- Cliente simples para testes

### 2. Atualizado Testes de Integração

**Antes:**
```typescript
import { createClient } from '@/lib/supabase/server';

it('should validate schema', async () => {
  const supabase = await createClient(); // ❌ Falha no Jest
  // ...
});
```

**Depois:**
```typescript
import { createTestClient } from '@/lib/supabase/test-client';

it('should validate schema', async () => {
  const supabase = createTestClient(); // ✅ Funciona
  // ...
});
```

### 3. Corrigido versão do pnpm no CI

**Antes:**
```yaml
env:
  PNPM_VERSION: '8'  # ❌ Incompatível com lockfile local
```

**Depois:**
```yaml
env:
  PNPM_VERSION: '10'  # ✅ Mesma versão local

# + adicionado em package.json:
"packageManager": "pnpm@10.18.1"
```

## Estrutura de Clientes Supabase

```
src/lib/supabase/
├── client.ts       → Browser (localStorage)
├── server.ts       → Server Components (cookies)
└── test-client.ts  → Testes Jest (sem cookies)
```

### Quando usar cada um:

| Cliente | Uso | Ambiente |
|---------|-----|----------|
| `client.ts` | Componentes cliente | Browser |
| `server.ts` | Server Components, API Routes | Next.js Server |
| `test-client.ts` | Testes de integração | Jest/CI |

## Arquivos Modificados

1. ✅ `src/lib/supabase/test-client.ts` (novo)
2. ✅ `__tests__/integration/schema-validation.test.ts`
3. ✅ `__tests__/integration/supabase.test.ts`
4. ✅ `.github/workflows/qa.yml`
5. ✅ `package.json` (packageManager)
6. ✅ `__tests__/WHY_INTEGRATION_TESTS.md` (doc)

## Teste Localmente

```bash
# Deve funcionar agora
pnpm test:integration
```

## Teste no CI

Push para o GitHub e veja os workflows passarem:
```
✓ lint
✓ test-api
✓ test-integration  ← Agora funciona!
✓ build
```

## Benefícios

1. ✅ **Testes rodam no CI** sem erros de cookies
2. ✅ **Validação real do schema** antes do deploy
3. ✅ **Mesma versão pnpm** local e CI
4. ✅ **Cliente dedicado** para testes

## Lições Aprendidas

### Problema: Misturar Ambientes
- ❌ Usar código de Server Components em Jest
- ❌ Assumir que Next.js runtime está disponível

### Solução: Separar Responsabilidades
- ✅ Cada cliente tem um propósito específico
- ✅ Test client é independente do Next.js
- ✅ Testes focam no que importa: validar o schema
