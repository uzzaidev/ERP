# Fix: Registro de Usuários e Criação de Empresas

## Problema

Usuários não conseguiam completar o registro no sistema devido a dois problemas relacionados a Row Level Security (RLS):

1. **Não conseguem criar novas empresas**: Ao tentar criar uma empresa nova durante o registro, a operação falhava.
2. **Não conseguem encontrar empresas existentes**: Ao tentar se juntar a uma empresa usando o código/slug, a empresa não era encontrada.

## Causa Raiz

A causa estava nas políticas RLS (Row Level Security) da tabela `tenants`:

### 1. Falta de Policy INSERT
A tabela `tenants` tinha as seguintes policies:
- ✅ SELECT: Usuários podem ver seu próprio tenant
- ✅ SELECT: Usuários autenticados podem ler tenants (para validação)
- ✅ UPDATE: Admins podem atualizar seu tenant
- ❌ **INSERT: FALTANDO** - Não havia policy para permitir criação de novos tenants

### 2. Fluxo de Registro

No arquivo `src/lib/supabase/auth.ts`, função `signUp()`:

```typescript
// Modo 1: Criar novo tenant
const { data: tenant, error: tenantError } = await supabase
  .from('tenants')
  .insert({
    name: companyName || name,
    slug: tenantSlugGenerated,
    plan: 'trial',
    status: 'active',
    max_users: 5,
    max_projects: 10,
    storage_limit_mb: 1000,
  })
  .select()
  .single();
```

Este INSERT falhava porque não havia uma policy RLS que permitisse usuários autenticados criarem registros na tabela `tenants`.

```typescript
// Modo 2: Solicitar acesso a tenant existente
const { data: tenant, error: tenantError } = await supabase
  .from('tenants')
  .select('id, name, slug, status')
  .eq('slug', tenantSlug)
  .single();
```

Este SELECT funcionava porque já existia a policy:
```sql
CREATE POLICY "Authenticated users can read tenants for validation"
  ON public.tenants
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

## Solução

### Migration: `db/12_fix_tenant_creation_rls.sql`

Criamos uma nova policy RLS para permitir INSERT na tabela `tenants`:

```sql
CREATE POLICY "Users can create tenants during signup"
  ON public.tenants
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

#### Como Funciona

1. **`WITH CHECK (auth.uid() IS NOT NULL)`**: Permite que qualquer usuário autenticado crie um tenant
2. **Segurança Mantida**: 
   - Usuários só podem CRIAR tenants, não modificar ou deletar
   - Após criação, apenas admins do próprio tenant podem atualizar (policy UPDATE existente)
   - Isolamento entre tenants permanece intacto

### Verificação das Policies

Após aplicar a migração, a tabela `tenants` terá:

| Policy Name | Operation | Description |
|------------|-----------|-------------|
| Users can view own tenant | SELECT | Ver o próprio tenant |
| Authenticated users can read tenants for validation | SELECT | Ler qualquer tenant para validar slug |
| Users can create tenants during signup | INSERT | **NOVO**: Criar tenant durante registro |
| Admins can update own tenant | UPDATE | Admins podem atualizar apenas seu tenant |

## Como Aplicar

### No Supabase SQL Editor

1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Cole o conteúdo de `db/12_fix_tenant_creation_rls.sql`
4. Execute o script
5. Verifique a saída mostrando as policies criadas

### Alternativa: psql

```bash
psql -h db.YOUR_PROJECT.supabase.co -p 5432 -d postgres -U postgres -f db/12_fix_tenant_creation_rls.sql
```

## Teste

### 1. Criar Nova Empresa

1. Acesse `/registro`
2. Preencha os dados do usuário
3. Selecione "Criar nova empresa"
4. Informe o nome da empresa
5. Clique em "Criar Conta"
6. ✅ Deve criar com sucesso e redirecionar para login

### 2. Solicitar Acesso a Empresa Existente

1. Acesse `/registro` ou `/registro?tenant=codigo-empresa`
2. Preencha os dados do usuário
3. Selecione "Solicitar acesso a uma empresa"
4. Informe o código da empresa
5. Clique em "Criar Conta"
6. ✅ Deve criar solicitação e mostrar mensagem de aguardar aprovação

### 3. Verificar no Console do Navegador

Se houver erro, o console mostrará algo como:
```
Error creating tenant: {
  code: "42501",
  message: "new row violates row-level security policy for table \"tenants\""
}
```

Após o fix, não deve haver erro.

## Impacto de Segurança

### ✅ Segurança Mantida

1. **Isolamento Multi-Tenant**: Cada tenant continua isolado
2. **Princípio de Menor Privilégio**: Usuários só podem criar, não modificar tenants alheios
3. **Autenticação Obrigatória**: Apenas usuários autenticados (auth.uid() IS NOT NULL)
4. **Validação de Dados**: Triggers e constraints da tabela permanecem ativos

### ⚠️ Considerações

- **Spam de Tenants**: Usuários podem criar múltiplos tenants
  - Mitigação: Implementar rate limiting no futuro
  - Mitigação: Monitorar criação de tenants
- **Nome/Slug Duplicado**: Já protegido pela constraint UNIQUE no slug

## Arquivos Modificados

- ✅ `db/12_fix_tenant_creation_rls.sql` - Nova migration com policy INSERT
- ✅ `docs/5. Supabase/FIX_TENANT_REGISTRATION.md` - Esta documentação

## Arquivos Relacionados

- `src/lib/supabase/auth.ts` - Função signUp() que cria tenants
- `src/app/(public)/registro/registro-form.tsx` - UI de registro
- `db/00_tenants.sql` - Schema da tabela tenants
- `db/05_rls_policies.sql` - Policies RLS originais
- `db/11_fix_rls_for_setup.sql` - Fix anterior de RLS

## Próximos Passos

- [ ] Aplicar migração no ambiente de produção
- [ ] Testar fluxo completo de registro
- [ ] Monitorar logs de erro do Supabase
- [ ] Considerar adicionar rate limiting para criação de tenants
- [ ] Adicionar testes automatizados para fluxo de registro

## Referências

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Multi-Tenant Architecture Best Practices](https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-api-access-authorization/multi-tenant-data-isolation-with-postgresql-rls.html)
