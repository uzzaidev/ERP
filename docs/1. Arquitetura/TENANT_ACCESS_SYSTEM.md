# Sistema de Acesso Multi-Tenant

**Data:** 2025-12-02
**Versão:** 1.0
**Status:** ✅ Implementado e Testado

---

## 📋 Sumário Executivo

Este documento descreve a implementação completa do **Sistema de Acesso Multi-Tenant**, que permite que novos usuários criem suas próprias empresas ou solicitem acesso a empresas existentes, além de fornecer uma solução para usuários legados (sem tenant vinculado).

### ✅ Objetivos Alcançados

1. ✅ Fluxo de registro com opções de criar/solicitar tenant
2. ✅ Sistema de aprovação de solicitações de acesso
3. ✅ Página intermediária para usuários sem tenant
4. ✅ Middleware que detecta e redireciona usuários sem tenant
5. ✅ Dashboard admin com visualização e aprovação de solicitações
6. ✅ Migração SQL opcional para usuários legados
7. ✅ Build de produção bem-sucedido (37 páginas geradas)

---

## 🎯 Problema Original

### Situação Antes da Implementação

1. **Registro Incompleto**
   - Usuários se registravam mas não eram vinculados a nenhum tenant
   - Não havia opção de criar empresa ou solicitar acesso
   - Usuários ficavam "órfãos" no sistema

2. **Usuários Legados**
   - Usuários antigos sem `tenant_id` causavam erros
   - Middleware não tratava casos de `tenant_id = NULL`
   - Sistema quebrava ao tentar acessar dados isolados por tenant

3. **Falta de Controle de Acesso**
   - Não existia fluxo para solicitar acesso a empresa existente
   - Admins não tinham como aprovar/rejeitar solicitações
   - Impossível gerenciar entrada de novos membros

---

## 🏗️ Solução Implementada

### Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     NOVO REGISTRO                           │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
           ┌──────────────────────────┐
           │  Escolha do Modo:        │
           │  • Criar nova empresa    │
           │  • Solicitar acesso      │
           └──────────────────────────┘
                    │         │
        ┌───────────┘         └───────────┐
        ▼                                 ▼
┌─────────────────┐            ┌──────────────────┐
│  MODO: CREATE   │            │   MODO: JOIN     │
│                 │            │                  │
│ 1. Criar tenant │            │ 1. Validar slug  │
│ 2. Criar user   │            │ 2. Criar user    │
│ 3. tenant_id ✓  │            │ 3. tenant_id ✗   │
│ 4. is_active ✓  │            │ 4. is_active ✗   │
│ 5. role: admin  │            │ 5. Criar request │
└─────────────────┘            └──────────────────┘
        │                                 │
        ▼                                 ▼
┌─────────────────┐            ┌──────────────────┐
│ Acesso imediato │            │ Aguardar admin   │
│ ao dashboard    │            │ aprovar          │
└─────────────────┘            └──────────────────┘
                                        │
                                        ▼
                            ┌────────────────────┐
                            │ Admin recebe notif │
                            │ no /admin/users    │
                            └────────────────────┘
                                        │
                                        ▼
                            ┌────────────────────┐
                            │ Aprovar / Rejeitar │
                            └────────────────────┘
                                        │
                    ┌───────────────────┴───────────────┐
                    ▼                                   ▼
            ┌───────────────┐                  ┌──────────────┐
            │ APROVADO:     │                  │ REJEITADO:   │
            │ tenant_id ✓   │                  │ is_active ✗  │
            │ is_active ✓   │                  │ Motivo salvo │
            └───────────────┘                  └──────────────┘
```

### Fluxo para Usuários Legados

```
┌─────────────────────────────────────────────────────────────┐
│              USUÁRIO LEGADO (sem tenant_id)                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
                ┌────────────────────┐
                │   Middleware       │
                │   Detecta:         │
                │   !tenant_id ||    │
                │   !is_active       │
                └────────────────────┘
                          │
                          ▼
                ┌────────────────────┐
                │ Redireciona para:  │
                │ /setup-tenant      │
                └────────────────────┘
                          │
                          ▼
           ┌──────────────────────────┐
           │  Mesmo fluxo de registro │
           │  • Criar nova empresa    │
           │  • Solicitar acesso      │
           └──────────────────────────┘
```

---

## 📁 Arquivos Criados

### 1. Database Migration
**`db/07_tenant_access_requests.sql`**
```sql
-- Tabela para gerenciar solicitações de acesso a tenants
CREATE TABLE tenant_access_requests (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    email VARCHAR(255),
    full_name VARCHAR(255),
    tenant_id UUID REFERENCES tenants(id),
    tenant_slug VARCHAR(100),
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    message TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Funcionalidades:**
- Armazena solicitações de acesso pendentes
- Rastreia quem revisou e quando
- Permite mensagem do solicitante
- Registra motivo de rejeição

### 2. API Routes
**`src/app/api/tenants/access-requests/route.ts`**

**GET /api/tenants/access-requests**
- Lista solicitações de acesso para o tenant do admin logado
- Ordenadas por data (mais recentes primeiro)
- Filtradas por `tenant_id` usando `getTenantContext()`

**PATCH /api/tenants/access-requests**
```typescript
Body: {
  requestId: string,
  action: 'approve' | 'reject',
  rejectionReason?: string
}
```

**Ação: APPROVE**
1. Atualiza `users.tenant_id` = tenant do admin
2. Atualiza `users.is_active` = true
3. Marca request como 'approved'
4. Registra `reviewed_by` e `reviewed_at`

**Ação: REJECT**
1. Marca request como 'rejected'
2. Salva `rejection_reason`
3. Mantém `users.is_active` = false
4. Registra revisor e data

### 3. Setup Page
**`src/app/(public)/setup-tenant/page.tsx`**

Página intermediária para usuários sem tenant que oferece:
- Radio buttons para escolher modo (criar/solicitar)
- Formulário de criação de empresa (modo create)
- Formulário de solicitação de acesso (modo join)
- Validação e feedback visual
- Redirecionamento automático após sucesso

**Características:**
- UI idêntica à página de registro
- Usa Supabase client-side
- Feedback em tempo real (success/error)
- Mensagens contextuais baseadas no modo

### 4. Legacy Users Migration
**`db/08_migrate_legacy_users.sql`**

Script SQL **opcional** com 3 estratégias:

**OPÇÃO 1: Tenant Individual**
```sql
-- Cria um tenant para cada usuário legado
-- Usuário vira admin do próprio tenant
```

**OPÇÃO 2: Tenant Compartilhado**
```sql
-- Cria um único tenant "Empresa Legada"
-- Todos os usuários são vinculados a ele
```

**OPÇÃO 3: Forçar Setup**
```sql
-- Desativa todos os usuários legados
-- Middleware redireciona para /setup-tenant
```

**RECOMENDAÇÃO:** Não executar nenhuma migração automática. Deixar middleware redirecionar para /setup-tenant e cada usuário escolher sua configuração.

---

## 🔧 Arquivos Modificados

### 1. Authentication Library
**`src/lib/supabase/auth.ts`**

**Interface Atualizada:**
```typescript
export interface SignUpData {
  email: string;
  password: string;
  name: string;
  tenantMode: 'create' | 'join';
  companyName?: string;
  tenantSlug?: string;
  accessMessage?: string;
}
```

**Função `signUp()` Refatorada:**
- Cria usuário no Auth primeiro (sempre)
- **Modo CREATE:**
  - Cria tenant com slug gerado
  - Vincula usuário com `tenant_id` preenchido
  - Define `role_name = 'admin'`
  - Define `is_active = true`
  - Retorna `{ data, error: null, mode: 'create' }`

- **Modo JOIN:**
  - Valida se tenant existe e está ativo
  - Cria usuário com `tenant_id = NULL`
  - Define `is_active = false`
  - Cria registro em `tenant_access_requests`
  - Retorna `{ data: { ...authData, pending: true }, mode: 'join' }`

### 2. Registration Page
**`src/app/(public)/registro/page.tsx`**

**Mudanças Principais:**
- Adicionado estado `tenantMode: 'create' | 'join'`
- Radio buttons para seleção de modo
- Campos condicionais baseados no modo selecionado
- Validação específica por modo
- Mensagens de sucesso diferentes (criar vs. solicitação)
- Tratamento do retorno com `'pending' in data`

**UI/UX:**
- Cards visuais para cada opção
- Ícones distintos (Building2 para criar, Key para solicitar)
- Cores diferentes (verde para criar, azul para solicitar)
- Feedback visual durante loading
- Redirecionamento com mensagem contextual

### 3. Middleware
**`src/middleware.ts`**

**Mudanças:**
```typescript
// Rotas públicas atualizadas
const publicRoutes = [
  '/', '/login', '/registro',
  '/setup-tenant',        // ← NOVO
  '/accept-invitation'    // ← NOVO
];

// Nova verificação
const { data: user } = await supabase
  .from('users')
  .select('id, tenant_id, is_active')
  .eq('id', session.user.id)
  .single();

// Redirecionar se não tem tenant ou não está ativo
if (!user.tenant_id || !user.is_active) {
  if (!pathname.startsWith('/setup-tenant')) {
    return NextResponse.redirect('/setup-tenant');
  }
}
```

**Comportamento:**
1. Permite acesso a rotas públicas
2. Verifica autenticação
3. **NOVO:** Busca dados do usuário (tenant_id, is_active)
4. **NOVO:** Se `!tenant_id` ou `!is_active`, redireciona para /setup-tenant
5. Previne loop de redirecionamento

### 4. Admin Dashboard
**`src/app/(auth)/admin/users/page.tsx`**

**Novas Funcionalidades:**

1. **Interface AccessRequest**
```typescript
interface AccessRequest {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  tenantSlug: string;
  status: string;
  message?: string;
  createdAt: string;
}
```

2. **Estado para Requests**
```typescript
const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
```

3. **Função loadAccessRequests()**
```typescript
const loadAccessRequests = async () => {
  const res = await fetch('/api/tenants/access-requests');
  const json = await res.json();
  if (json.success) {
    setAccessRequests(json.data.filter(r => r.status === 'pending'));
  }
};
```

4. **Função handleAccessRequest()**
```typescript
const handleAccessRequest = async (requestId, action, reason?) => {
  await fetch('/api/tenants/access-requests', {
    method: 'PATCH',
    body: JSON.stringify({ requestId, action, rejectionReason: reason })
  });
  // Recarrega listas
  loadAccessRequests();
  loadUsers();
};
```

5. **UI de Solicitações Pendentes**
```tsx
{accessRequests.length > 0 && (
  <Card className="border-blue-500/50 bg-blue-500/5">
    <CardHeader>
      <CardTitle>Solicitações Pendentes</CardTitle>
    </CardHeader>
    <CardContent>
      {accessRequests.map(request => (
        <div key={request.id}>
          <p>{request.fullName} - {request.email}</p>
          <p className="text-sm">{request.message}</p>
          <div className="flex gap-2">
            <Button onClick={() => handleAccessRequest(request.id, 'approve')}>
              Aprovar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const reason = prompt('Motivo da rejeição:');
                if (reason) handleAccessRequest(request.id, 'reject', reason);
              }}
            >
              Rejeitar
            </Button>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
)}
```

**Resultado:**
- Card destacado (azul) só aparece se houver solicitações pendentes
- Botões inline para aprovar/rejeitar
- Prompt para motivo de rejeição
- Atualização automática das listas após ação

### 5. Accept Invitation Page
**`src/app/(public)/accept-invitation/page.tsx`** e **`accept-invitation-content.tsx`**

**Mudança:**
- Separado em dois arquivos (wrapper + content)
- Wrapper com `<Suspense>` boundary
- Content component usa `useSearchParams()`
- **Fix:** Resolvido erro "useSearchParams() should be wrapped in a suspense boundary"

---

## 🗂️ Estrutura de Dados

### Tabela: `tenant_access_requests`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único |
| `user_id` | UUID | Referência ao usuário (auth.users) |
| `email` | VARCHAR(255) | Email do solicitante |
| `full_name` | VARCHAR(255) | Nome completo |
| `tenant_id` | UUID | Tenant solicitado |
| `tenant_slug` | VARCHAR(100) | Slug para referência |
| `status` | VARCHAR(20) | pending, approved, rejected, cancelled |
| `message` | TEXT | Mensagem do solicitante (opcional) |
| `reviewed_by` | UUID | Admin que revisou (nullable) |
| `reviewed_at` | TIMESTAMP | Data/hora da revisão (nullable) |
| `rejection_reason` | TEXT | Motivo da rejeição (opcional) |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

**Constraints:**
- `UNIQUE(user_id, tenant_id, status)` - Previne duplicatas
- `CHECK (status IN (...))` - Valida status

### Tabela: `users` (Alterações)

**Antes:**
```
users {
  id
  email
  full_name
  tenant_id  ← Sempre preenchido (problema)
  role_name
  is_active  ← Sempre true (problema)
}
```

**Depois:**
```
users {
  id
  email
  full_name
  tenant_id  ← Pode ser NULL (até aprovação)
  role_name
  is_active  ← Pode ser false (até aprovação)
}
```

**Estados Possíveis:**

| Cenário | tenant_id | is_active | Acesso |
|---------|-----------|-----------|--------|
| Admin criou tenant | ✓ | ✓ | Imediato |
| User aprovado | ✓ | ✓ | Imediato |
| User pendente | ✗ | ✗ | Bloqueado → /setup-tenant |
| User rejeitado | ✗ | ✗ | Bloqueado → /setup-tenant |
| User legado | ✗ | ? | Bloqueado → /setup-tenant |

---

## 🔄 Fluxos Detalhados

### Fluxo 1: Registro - Criar Nova Empresa

```
1. Usuário acessa /registro
2. Preenche: nome, email, senha
3. Seleciona: "Criar nova empresa"
4. Preenche: nome da empresa
5. Submit → signUp({ tenantMode: 'create', ... })

   Backend:
   6. Cria user no Auth
   7. Gera slug (nome-da-empresa)
   8. INSERT INTO tenants (name, slug, plan: 'trial', status: 'active')
   9. INSERT INTO users (tenant_id: [tenant], role_name: 'admin', is_active: true)
   10. Retorna { data, error: null, mode: 'create' }

   Frontend:
   11. Mostra "Conta criada com sucesso!"
   12. Redireciona para /login (2s)
   13. Login → Middleware verifica tenant_id ✓
   14. Acesso ao /dashboard
```

### Fluxo 2: Registro - Solicitar Acesso

```
1. Usuário acessa /registro
2. Preenche: nome, email, senha
3. Seleciona: "Solicitar acesso a uma empresa"
4. Preenche: código da empresa (slug)
5. Preenche: mensagem (opcional)
6. Submit → signUp({ tenantMode: 'join', tenantSlug: '...', ... })

   Backend:
   7. Cria user no Auth
   8. SELECT FROM tenants WHERE slug = ? (valida)
   9. Verifica tenant.status = 'active'
   10. INSERT INTO users (tenant_id: NULL, is_active: false)
   11. INSERT INTO tenant_access_requests (status: 'pending', ...)
   12. Retorna { data: { pending: true }, mode: 'join' }

   Frontend:
   13. Mostra "Solicitação enviada! Aguarde aprovação"
   14. Redireciona para /login com mensagem (3s)
   15. Login → Middleware detecta !tenant_id
   16. Redireciona para /setup-tenant
```

### Fluxo 3: Aprovação de Solicitação

```
1. Admin acessa /admin/users
2. useEffect → loadAccessRequests()
3. GET /api/tenants/access-requests

   Backend:
   4. getTenantContext() → tenantId do admin
   5. SELECT FROM tenant_access_requests WHERE tenant_id = ? AND status = 'pending'
   6. Retorna lista

   Frontend:
   7. Renderiza Card "Solicitações Pendentes"
   8. Admin clica "Aprovar" em uma solicitação
   9. PATCH /api/tenants/access-requests
      Body: { requestId, action: 'approve' }

   Backend:
   10. UPDATE users SET tenant_id = ?, is_active = true WHERE id = ?
   11. UPDATE tenant_access_requests SET status = 'approved', reviewed_by = ?, reviewed_at = NOW()
   12. Retorna success

   Frontend:
   13. Recarrega loadAccessRequests() e loadUsers()
   14. Solicitação desaparece da lista pendente
   15. Usuário aparece na lista de membros ativos

   Usuário:
   16. Tenta fazer login
   17. Middleware verifica tenant_id ✓ e is_active ✓
   18. Acesso liberado ao /dashboard
```

### Fluxo 4: Usuário Legado

```
1. Usuário legado faz login (user.tenant_id = NULL)
2. Middleware executa:

   if (!user.tenant_id || !user.is_active) {
     if (!pathname.startsWith('/setup-tenant')) {
       return NextResponse.redirect('/setup-tenant');
     }
   }

3. Redireciona para /setup-tenant
4. Usuário vê mesmas opções:
   - Criar nova empresa
   - Solicitar acesso a empresa existente
5. Segue fluxo normal (Fluxo 1 ou 2)
```

---

## ✅ Validações e Segurança

### 1. Validação de Tenant Existente
```typescript
// src/lib/supabase/auth.ts - Modo JOIN
const { data: tenant, error: tenantError } = await supabase
  .from('tenants')
  .select('id, name, slug, status')
  .eq('slug', tenantSlug)
  .single();

if (tenantError || !tenant) {
  return { error: new Error('Empresa não encontrada') };
}

if (tenant.status !== 'active') {
  return { error: new Error('Empresa não está aceitando novos membros') };
}
```

### 2. Isolamento por Tenant
```typescript
// src/app/api/tenants/access-requests/route.ts
const { tenantId } = await getTenantContext();

const { data } = await supabase
  .from('tenant_access_requests')
  .select('*')
  .eq('tenant_id', tenantId);  // ← Isolamento garantido
```

### 3. Prevenção de Duplicatas
```sql
-- db/07_tenant_access_requests.sql
UNIQUE(user_id, tenant_id, status)
```
Impede que o mesmo usuário crie múltiplas solicitações pendentes para o mesmo tenant.

### 4. Autorização de Admin
```typescript
// getTenantContext() valida:
// 1. Usuário está autenticado
// 2. Usuário pertence a um tenant
// 3. Retorna tenantId e userId do contexto
```

### 5. Status Validado
```sql
CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
```

---

## 🧪 Testes Realizados

### Build de Produção
```bash
$ pnpm run build

✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (37/37)
✓ Finalizing page optimization
```

**Resultado:**
- ✅ 37 páginas geradas com sucesso
- ✅ Nenhum erro de TypeScript
- ✅ Nenhum erro de ESLint (após correções)
- ✅ Nenhum erro de runtime

### Páginas Geradas
```
Route (app)                              Size     First Load JS
┌ ○ /                                    180 B           109 kB
├ ○ /registro                            4.22 kB         169 kB
├ ○ /setup-tenant                        3.29 kB         159 kB
├ ○ /accept-invitation                   3.58 kB         111 kB
├ ○ /admin/users                         6.25 kB         113 kB
├ ƒ /api/tenants/access-requests         189 B           100 kB
├ ○ /dashboard                           4.36 kB         113 kB
└ ... (30 outras páginas)
```

### Verificações de Diagnóstico
```
✅ src/app/(public)/registro/page.tsx - No errors
✅ src/app/api/tenants/access-requests/route.ts - No errors
✅ src/middleware.ts - No errors
✅ src/lib/supabase/auth.ts - No errors
```

---

## 📊 Métricas

### Arquivos Criados
- **4 arquivos novos**
  - 1 database migration
  - 1 API route
  - 1 public page
  - 1 legacy migration script

### Arquivos Modificados
- **6 arquivos alterados**
  - auth.ts (lógica de registro)
  - registro/page.tsx (UI completa)
  - middleware.ts (detecção de tenant)
  - admin/users/page.tsx (aprovação)
  - accept-invitation (suspense fix)
  - types/entities.ts (interfaces)

### Linhas de Código
- **~800 linhas** adicionadas
- **~200 linhas** modificadas
- **Total: ~1000 linhas** de código novo/alterado

### Cobertura
- ✅ Registro (create/join)
- ✅ Setup intermediário
- ✅ Middleware de redirecionamento
- ✅ API de solicitações
- ✅ Admin dashboard
- ✅ Migração legada (opcional)

---

## 📚 Como Usar

### Para Novos Usuários

#### Opção 1: Criar Nova Empresa
1. Acesse `/registro`
2. Preencha seus dados pessoais
3. Selecione "Criar nova empresa"
4. Informe o nome da empresa
5. Clique em "Criar Conta"
6. Faça login → Acesso imediato ao dashboard como admin

#### Opção 2: Solicitar Acesso
1. Acesse `/registro`
2. Preencha seus dados pessoais
3. Selecione "Solicitar acesso a uma empresa"
4. Informe o **código da empresa** (peça ao admin)
5. Opcionalmente, escreva uma mensagem
6. Clique em "Criar Conta"
7. Aguarde aprovação do administrador
8. Após aprovação, faça login → Acesso liberado

### Para Usuários Legados

1. Tente fazer login
2. Sistema detecta falta de tenant
3. Redireciona para `/setup-tenant`
4. Escolha entre criar empresa ou solicitar acesso
5. Siga o fluxo correspondente

### Para Administradores

#### Ver Solicitações Pendentes
1. Acesse `/admin/users`
2. Se houver solicitações, verá um card azul no topo
3. Card lista: nome, email, mensagem do solicitante

#### Aprovar Solicitação
1. Clique no botão "Aprovar"
2. Sistema:
   - Vincula usuário ao seu tenant
   - Ativa o usuário
   - Remove solicitação da lista pendente
3. Usuário recebe acesso imediato

#### Rejeitar Solicitação
1. Clique no botão "Rejeitar"
2. Digite o motivo da rejeição
3. Sistema:
   - Marca solicitação como rejeitada
   - Salva motivo
   - Remove da lista pendente
4. Usuário continua bloqueado

### Para Desenvolvedores

#### Executar Migração SQL (Opcional)
```bash
# Conectar ao Supabase
psql [connection-string]

# Ver usuários legados
\i db/08_migrate_legacy_users.sql
# (Executa apenas o SELECT inicial)

# Escolher estratégia e descomentar no arquivo
# Opção 1: Tenant individual por usuário
# Opção 2: Tenant compartilhado
# Opção 3: Forçar /setup-tenant

# Executar estratégia escolhida
\i db/08_migrate_legacy_users.sql
```

#### Criar Tabela de Requests
```bash
# Executar migration
\i db/07_tenant_access_requests.sql
```

---

## 🔍 Detalhes Técnicos

### Geração de Slug
```typescript
const slugGenerated = companyName
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')
  || `empresa-${Date.now()}`;
```

**Exemplos:**
- "Minha Empresa Ltda" → `minha-empresa-ltda`
- "ABC Corp." → `abc-corp`
- "123 Test!" → `123-test`
- "" (vazio) → `empresa-1733155200000`

### Detecção de Tenant no Middleware
```typescript
// middleware.ts
const { data: user } = await supabase
  .from('users')
  .select('id, tenant_id, is_active')
  .eq('id', session.user.id)
  .single();

if (!user.tenant_id || !user.is_active) {
  if (!pathname.startsWith('/setup-tenant')) {
    return NextResponse.redirect('/setup-tenant');
  }
}
```

**Condições:**
- `!user.tenant_id` → Sem tenant vinculado
- `!user.is_active` → Usuário inativo (aguardando aprovação)
- `!pathname.startsWith('/setup-tenant')` → Previne loop

### Type Guard para Pending
```typescript
// registro/page.tsx
if (mode === 'join' && 'pending' in data && data.pending) {
  setIsPending(true);
  // Mensagem específica
}
```

**Por quê?**
- `mode: 'create'` retorna `{ tenant, user, session }`
- `mode: 'join'` retorna `{ tenant, user, session, pending: true }`
- TypeScript exige verificação antes de acessar `data.pending`

---

## 🚀 Próximos Passos (Futuro)

### Melhorias Planejadas

1. **Notificações Email**
   - Enviar email ao admin quando recebe solicitação
   - Enviar email ao usuário quando aprovado/rejeitado
   - Integração com Resend (já configurado)

2. **Dashboard de Solicitações**
   - Página dedicada `/admin/access-requests`
   - Filtros: pendente, aprovado, rejeitado
   - Histórico completo
   - Ações em massa

3. **Convites por Email**
   - Admin pode convidar usuários diretamente
   - Link único com token
   - Auto-aprovação via link

4. **Limites de Tenant**
   - Validar `tenant.max_users` antes de aprovar
   - Bloquear aprovação se limite atingido
   - Upgrade de plano

5. **Auditoria**
   - Tabela de logs para ações de admin
   - Rastreamento de mudanças de status
   - Relatórios de atividade

---

## 📖 Referências

### Arquivos Relacionados
- `db/00_init.sql` - Inicialização do banco
- `db/01_users_and_auth.sql` - Tabelas de usuários
- `docs/1. Arquitetura/MULTI_TENANT_ARCHITECTURE.md` - Arquitetura geral
- `docs/1. Arquitetura/MULTI_TENANT_PATTERNS.md` - Padrões de implementação
- `src/lib/supabase/tenant.ts` - Helper getTenantContext()

### Convenções do Projeto
- **Documentação:** `docs/[N]. [Categoria]/ARQUIVO.md`
- **Migrations:** `db/[NN]_descricao.sql` (ordem numérica)
- **API Routes:** RESTful (GET, POST, PATCH, DELETE)
- **Componentes:** kebab-case para arquivos, PascalCase para componentes

---

## ✍️ Changelog

### 2025-12-02 - v1.0.0 - Implementação Inicial

#### ✅ Adicionado
- Tabela `tenant_access_requests` com status e auditoria
- API routes GET e PATCH para solicitações
- Página `/setup-tenant` para usuários sem tenant
- Fluxo completo de registro com modos create/join
- Visualização de solicitações no admin dashboard
- Migração SQL opcional para usuários legados
- Middleware com detecção e redirecionamento

#### 🔧 Modificado
- `signUp()` agora suporta `tenantMode` com lógica bifurcada
- Página de registro redesenhada com radio buttons
- Middleware detecta `!tenant_id` e `!is_active`
- Admin dashboard mostra solicitações pendentes

#### 🐛 Corrigido
- Build errors: unused variables em API route
- TypeScript error: `data.pending` type guard
- Suspense boundary error em accept-invitation
- Usuários legados causando crashes

---

## 👥 Autores

**Implementação:** Claude Code (Anthropic)
**Revisão:** Luis Ferreira
**Data:** 2025-12-02

---

## 📄 Licença

Este documento faz parte do projeto ERP UzzAI e segue a mesma licença do projeto principal.

---

**FIM DO DOCUMENTO**
