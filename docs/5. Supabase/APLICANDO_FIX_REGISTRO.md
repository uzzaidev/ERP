# Aplicando a Correção de Registro de Usuários

Este documento descreve como aplicar a correção que permite que novos usuários criem empresas e se juntem a empresas existentes.

## 📋 Resumo do Problema

Usuários não conseguiam:
1. ✅ **RESOLVIDO**: Criar novas empresas durante o registro
2. ✅ **RESOLVIDO**: Encontrar empresas existentes pelo código/slug

**Causa**: Faltava uma policy RLS (Row Level Security) de INSERT na tabela `tenants`.

## 🔧 Aplicando a Correção

### Passo 1: Aplicar a Migration no Supabase

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Abra o arquivo `db/12_fix_tenant_creation_rls.sql`
5. Copie todo o conteúdo
6. Cole no SQL Editor
7. Clique em **Run** (ou pressione Ctrl+Enter)

**Saída esperada**:
```
✅ Policies de tenants atualizadas com sucesso!

📝 Alterações:
1. ✓ Usuários autenticados podem CRIAR tenants (INSERT)
2. ✓ Usuários autenticados podem LER tenants para validação (SELECT)
3. ✓ Usuários podem ver seu próprio tenant (SELECT)
4. ✓ Apenas admins podem ATUALIZAR seu tenant (UPDATE)

🔒 Segurança:
• Usuários só podem criar tenants, não deletar ou atualizar outros
• Lookup de tenants por slug funciona para validação
• Isolamento entre tenants mantido após criação
```

### Passo 2: Verificar as Policies

Ainda no SQL Editor, execute:

```sql
SELECT
    policyname,
    cmd as operacao,
    pg_get_expr(qual, 'public.tenants'::regclass) as using_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'tenants'
ORDER BY cmd, policyname;
```

**Esperado**:
- Policy `Users can create tenants during signup` com operacao = `INSERT`
- Policy `Authenticated users can read tenants for validation` com operacao = `SELECT`
- Policy `Users can view own tenant` com operacao = `SELECT`
- Policy `Admins can update own tenant` com operacao = `UPDATE`

### Passo 3: Testar o Registro

#### Teste 1: Criar Nova Empresa

1. Acesse `http://localhost:3000/registro` (ou URL de produção)
2. Preencha os dados:
   - Nome completo
   - Email
   - Senha
3. Selecione **"Criar nova empresa"**
4. Informe o nome da empresa
5. Clique em **"Criar Conta"**

**Resultado esperado**: ✅ Conta criada com sucesso, redirecionamento para login

#### Teste 2: Solicitar Acesso a Empresa Existente

1. Obtenha o código de uma empresa existente:
   - No dashboard, vá em Configurações
   - Na seção "Convites", copie o código da empresa
2. Acesse `http://localhost:3000/registro` (ou adicione `?tenant=codigo-empresa`)
3. Preencha os dados do usuário
4. Selecione **"Solicitar acesso a uma empresa"**
5. Cole o código da empresa
6. Clique em **"Criar Conta"**

**Resultado esperado**: ✅ Solicitação enviada, mensagem de aguardar aprovação

### Passo 4: Executar Testes de Integração (Opcional)

Se você tem ambiente de desenvolvimento local:

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente de teste
cp .env.test.local.example .env.test.local
# Edite .env.test.local com credenciais de teste

# 3. Executar testes de integração
npm run test:integration -- tenant-registration
```

**Saída esperada**:
```
✅ should have INSERT policy for tenants table
✅ should have SELECT policy for tenant lookup
✅ should allow authenticated users to lookup tenants by slug
✅ should allow authenticated users to create new tenants
✅ should allow users to create access requests
```

## 🐛 Resolução de Problemas

### Erro: "new row violates row-level security policy for table \"tenants\""

**Causa**: A migration não foi aplicada ou não foi aplicada corretamente.

**Solução**:
1. Verifique se você executou `db/12_fix_tenant_creation_rls.sql`
2. Verifique se não há erros na saída do SQL
3. Execute a query de verificação (Passo 2)
4. Se a policy não aparecer, re-execute a migration

### Erro: "Empresa não encontrada. Verifique o código/slug"

**Causa 1**: O código/slug digitado está incorreto

**Solução**: Verifique se o código está correto (case-sensitive)

**Causa 2**: A empresa está inativa (status != 'active')

**Solução**: A empresa deve estar com status 'active' para aceitar novos membros

### Erro: "Este email já está cadastrado"

**Causa**: O email já tem uma conta no sistema

**Solução**: Use outro email ou faça login com a conta existente

## 📊 Monitoramento

### No Supabase Dashboard

1. Vá para **Table Editor > tenants**
2. Verifique novos tenants criados
3. Vá para **Table Editor > tenant_access_requests**
4. Verifique novas solicitações de acesso

### Logs de Erro

No console do navegador (F12):
- Erros de RLS aparecerão como: `Error creating tenant: ...`
- Após o fix, não deve haver erros relacionados a RLS

## 🔒 Impacto de Segurança

### ✅ O que está protegido:

- **Isolamento Multi-Tenant**: Cada tenant continua isolado
- **Criação Restrita**: Apenas usuários autenticados podem criar tenants
- **Modificação Bloqueada**: Usuários não podem modificar tenants de outros
- **Validação Ativa**: Constraints de UNIQUE e formato de slug continuam ativos

### ⚠️ Considerações:

- Usuários podem criar múltiplos tenants (não há rate limiting ainda)
- Considere adicionar limites ou aprovação de criação de empresas no futuro
- Monitore criação de tenants para detectar spam

## 📝 Arquivos Envolvidos

- `db/12_fix_tenant_creation_rls.sql` - Migration com a correção
- `docs/5. Supabase/FIX_TENANT_REGISTRATION.md` - Documentação técnica
- `__tests__/integration/tenant-registration.test.ts` - Testes de integração
- `src/lib/supabase/auth.ts` - Lógica de signUp que cria tenants
- `src/app/(public)/registro/registro-form.tsx` - Formulário de registro

## 🎯 Próximos Passos

Após aplicar a correção:

- [ ] Aplicar migration no ambiente de produção
- [ ] Testar fluxo completo de registro
- [ ] Monitorar logs do Supabase
- [ ] Considerar rate limiting para criação de tenants
- [ ] Adicionar analytics de conversão de registro

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs no console do navegador
2. Verifique os logs do Supabase (Dashboard > Logs)
3. Consulte `docs/5. Supabase/FIX_TENANT_REGISTRATION.md` para detalhes técnicos
4. Execute os testes de integração para diagnóstico

## ✅ Checklist de Deploy

Antes de considerar o problema resolvido:

- [ ] Migration aplicada no Supabase
- [ ] Policies verificadas no banco
- [ ] Teste manual: criar nova empresa funciona
- [ ] Teste manual: solicitar acesso a empresa funciona
- [ ] Testes de integração passam (se aplicável)
- [ ] Sem erros no console do navegador
- [ ] Sem erros nos logs do Supabase
- [ ] Documentação atualizada
- [ ] Time notificado sobre a correção
