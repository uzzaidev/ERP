# 🚀 QUICK START: Corrigir Registro de Usuários

## ⚡ Ação Rápida (3 minutos)

### 1. Aplicar Migration
```bash
# Acesse: https://app.supabase.com → SQL Editor
# Cole e execute o conteúdo de: db/12_fix_tenant_creation_rls.sql
```

### 2. Verificar
```sql
SELECT policyname FROM pg_policies 
WHERE tablename = 'tenants' AND cmd = 'INSERT';
```
**Esperado**: `Users can create tenants during signup`

### 3. Testar
- Acesse `/registro`
- Crie uma empresa nova
- ✅ Deve funcionar!

---

## 📋 O que foi corrigido?

| Problema | Status |
|----------|--------|
| ❌ Não consegue criar empresa nova | ✅ **RESOLVIDO** |
| ❌ Não encontra empresa existente | ✅ **Já funcionava** |

---

## 📚 Documentação Completa

### Para Desenvolvedores
- **Técnica**: [`FIX_TENANT_REGISTRATION.md`](./FIX_TENANT_REGISTRATION.md)
- **Diagramas**: [`DIAGRAMA_PROBLEMA_REGISTRO.md`](./DIAGRAMA_PROBLEMA_REGISTRO.md)
- **Testes**: `__tests__/integration/tenant-registration.test.ts`

### Para Deploy
- **Passo-a-passo**: [`APLICANDO_FIX_REGISTRO.md`](./APLICANDO_FIX_REGISTRO.md)
- **Resumo**: [`SUMMARY_FIX_REGISTRO.md`](./SUMMARY_FIX_REGISTRO.md)

---

## 🔧 Arquivos da Solução

```
db/
└── 12_fix_tenant_creation_rls.sql        ← Aplicar este SQL

docs/5. Supabase/
├── FIX_TENANT_REGISTRATION.md            ← Documentação técnica
├── APLICANDO_FIX_REGISTRO.md             ← Guia de deploy
├── DIAGRAMA_PROBLEMA_REGISTRO.md         ← Diagramas visuais
├── SUMMARY_FIX_REGISTRO.md               ← Resumo executivo
└── README_QUICK_START.md                 ← Este arquivo

__tests__/integration/
└── tenant-registration.test.ts           ← Testes de validação
```

---

## ✅ Checklist Rápido

- [ ] SQL executado no Supabase
- [ ] Policy INSERT verificada
- [ ] Teste: criar empresa funciona
- [ ] Teste: solicitar acesso funciona
- [ ] Sem erros no console

---

## 🆘 Problemas?

### Erro: "new row violates row-level security"
→ Migration não foi aplicada. Execute `db/12_fix_tenant_creation_rls.sql`

### Erro: "Empresa não encontrada"
→ Slug digitado incorretamente. Verifique o código da empresa

### Outros erros
→ Consulte [`APLICANDO_FIX_REGISTRO.md`](./APLICANDO_FIX_REGISTRO.md) seção "Resolução de Problemas"

---

## 💡 Como Funciona?

**Antes**: RLS bloqueava INSERT em `tenants`  
**Depois**: Policy permite INSERT para usuários autenticados  
**Segurança**: Mantida (isolamento multi-tenant preservado)

---

## 📞 Suporte

1. **Console do Browser** (F12) → Erros?
2. **Supabase Dashboard** → Logs
3. **Documentação** → Ver arquivos acima

---

**Status**: ✅ Solução completa e pronta para deploy  
**Tempo de aplicação**: ~3 minutos  
**Impacto**: Zero downtime  
**Risco**: Baixo (apenas adiciona permissão faltante)
