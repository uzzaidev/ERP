# Banco de Dados ERP UZZ.AI

Este diretório contém todos os scripts SQL necessários para criar e popular o banco de dados do sistema ERP.

## 📋 Estrutura dos Scripts

### `00_init.sql` - Script Principal
Script de inicialização que executa todos os outros scripts na ordem correta.

### `01_users_and_auth.sql` - Usuários e Autenticação
- **Tabelas**: `roles`, `permissions`, `role_permissions`, `users`, `user_roles`, `audit_logs`
- **Dados Mock**: 5 roles (admin, gestor, financeiro, juridico, dev), 27 permissions, 5 users
- **Recursos**: Sistema completo de RBAC (Role-Based Access Control)

### `02_projects_and_tasks.sql` - Projetos e Tasks
- **Tabelas**: `projects`, `project_members`, `sprints`, `tasks`, `tags`, `task_tags`, `task_comments`, `task_time_logs`, `task_attachments`
- **Dados Mock**: 3 projetos, 5 sprints, 10 tasks, 10 tags, 4 comentários, 9 logs de tempo
- **Recursos**: Kanban board completo, time tracking, comentários com @mentions

### `03_finance.sql` - Módulo Financeiro
- **Tabelas**: `bank_accounts`, `chart_of_accounts`, `cost_centers`, `transactions`, `invoices`, `invoice_items`, `documents`, `budgets`
- **Dados Mock**: 3 contas bancárias, 14 contas contábeis, 4 centros de custo, 8 transações, 3 notas fiscais, 4 documentos, 4 orçamentos
- **Recursos**: Gestão financeira completa, notas fiscais, orçamentos, plano de contas

### `04_auxiliary_tables.sql` - Tabelas Auxiliares
- **Tabelas**: `notifications`, `user_settings`, `company_settings`, `activity_feed`, `favorites`, `webhooks`, `webhook_logs`, `api_keys`, `email_templates`, `recurring_transactions`
- **Dados Mock**: 4 notificações, 5 configurações de usuário, 1 empresa, 5 atividades, 4 favoritos, 3 templates de email, 4 transações recorrentes
- **Recursos**: Notificações, configurações, webhooks, integrações

## 🚀 Como Executar

### Opção 1: Script Completo (Recomendado)
```bash
# No diretório db/
psql -U postgres -d uzz_erp -f 00_init.sql
```

### Opção 2: Scripts Individuais
```bash
psql -U postgres -d uzz_erp -f 01_users_and_auth.sql
psql -U postgres -d uzz_erp -f 02_projects_and_tasks.sql
psql -U postgres -d uzz_erp -f 03_finance.sql
psql -U postgres -d uzz_erp -f 04_auxiliary_tables.sql
```

### Opção 3: Docker Compose
```bash
# Crie um arquivo docker-compose.yml na raiz
docker-compose up -d
docker exec -i uzz_erp_postgres psql -U postgres -d uzz_erp < db/00_init.sql
```

## 🔐 Credenciais Mock

Todos os usuários têm a senha: `admin123`

| Email | Role | Permissões |
|-------|------|------------|
| admin@uzz.ai | Administrador | Todas |
| maria.silva@uzz.ai | Gestor | Projetos, Tasks, Documentos |
| joao.santos@uzz.ai | Desenvolvedor | Projetos, Tasks |
| ana.costa@uzz.ai | Financeiro | Financeiro, Documentos |
| pedro.oliveira@uzz.ai | Jurídico | Documentos, Contratos |

## 📊 Diagrama de Relacionamentos

### Módulo de Autenticação
```
users ←→ user_roles ←→ roles ←→ role_permissions ←→ permissions
```

### Módulo de Projetos
```
projects ←→ project_members ←→ users
    ↓
sprints ←→ tasks ←→ task_comments
              ↓
         task_tags ←→ tags
              ↓
         task_time_logs
              ↓
         task_attachments
```

### Módulo Financeiro
```
bank_accounts ← transactions → chart_of_accounts
                     ↓
                 invoices → invoice_items
                     ↓
                 documents
                     ↓
            cost_centers ← budgets
```

## 🛠️ Tecnologias

- **PostgreSQL 12+** (requerido)
- **UUID Extension** (para IDs únicos)
- **JSONB** (para dados flexíveis em audit_logs, webhooks)
- **Arrays** (para tags, permissions, mentions)
- **Triggers** (para updated_at automático)

## 📝 Notas Importantes

1. **UUIDs Fixos**: Os dados mock usam UUIDs fixos para facilitar testes e desenvolvimento
2. **Senhas**: As senhas estão com hash bcrypt fake. Substitua por hash real em produção
3. **Timestamps**: Todos os registros mock usam timestamps realistas baseados em Novembro 2025
4. **Relacionamentos**: Todas as foreign keys têm ON DELETE CASCADE ou SET NULL apropriados
5. **Indexes**: Indexes otimizados já criados para queries comuns

## 🔄 Migrações e Correções

### Scripts Aplicados

- **`12_fix_tenant_creation_rls.sql`** - ✅ Correção de RLS para permitir criação de tenants
  - Adiciona policy INSERT para tabela `tenants`
  - Permite que usuários autenticados criem empresas durante o registro
  - Mantém segurança e isolamento entre tenants
  - **OBRIGATÓRIO**: Aplique este script para corrigir problema de registro

### Migrações Futuras

Para adicionar novas tabelas ou modificar existentes, crie novos arquivos:
- `XX_nome_do_modulo.sql` (onde XX é o próximo número)
- `migration_YYYY_MM_DD_descricao.sql`

## 🧪 Testes

Para testar se tudo foi criado corretamente:

```sql
-- Contar tabelas
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar usuários
SELECT email, full_name FROM users;

-- Verificar permissões por role
SELECT r.display_name, COUNT(rp.permission_id) as total_permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.display_name;

-- Verificar projetos e tasks
SELECT p.name, COUNT(t.id) as total_tasks
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
GROUP BY p.name;
```

## 📚 Próximos Passos

1. Desenvolver APIs RESTful para cada módulo
2. Implementar autenticação JWT com Supabase
3. Criar endpoints de CRUD para todas as entidades
4. Implementar filtros e paginação
5. Adicionar validações de permissões (RBAC)
6. Criar documentação Swagger/OpenAPI
7. Implementar testes de integração
