-- ============================================
-- AUXILIARY TABLES AND RELATIONSHIPS
-- ============================================

-- ============================================
-- DROP TABLES IF EXIST (in reverse dependency order)
-- ============================================
DROP TABLE IF EXISTS document_shares CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS recurring_transactions CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS webhook_logs CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS activity_feed CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- ============================================
-- NOTIFICATIONS (Sistema de Notificações)
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- mention, assignment, comment, deadline, approval
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT, -- URL para onde a notificação leva
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USER_SETTINGS (Configurações do Usuário)
-- ============================================
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'dark', -- dark, light, auto
    language VARCHAR(10) DEFAULT 'pt-BR',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    daily_digest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- COMPANY_SETTINGS (DEPRECATED - Use tenants table instead)
-- ============================================
-- This table has been replaced by the tenants table in 00_tenants.sql
-- Company-specific settings are now stored in the tenants table

-- ============================================
-- ACTIVITY_FEED (Feed de Atividades)
-- ============================================
CREATE TABLE activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- created, updated, deleted, commented, assigned
    entity_type VARCHAR(50) NOT NULL, -- project, task, transaction, document
    entity_id UUID NOT NULL,
    entity_name VARCHAR(255),
    description TEXT,
    metadata JSONB, -- Dados adicionais em JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- FAVORITES (Itens Favoritos do Usuário)
-- ============================================
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- project, task, document
    entity_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, entity_type, entity_id)
);

-- ============================================
-- WEBHOOKS (Integrações via Webhook)
-- ============================================
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    secret VARCHAR(255),
    events TEXT[] NOT NULL, -- Array de eventos: ['task.created', 'project.completed']
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- WEBHOOK_LOGS (Histórico de Webhooks)
-- ============================================
CREATE TABLE webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- API_KEYS (Chaves de API para Integrações)
-- ============================================
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash TEXT NOT NULL, -- Hash da chave
    key_prefix VARCHAR(20) NOT NULL, -- Primeiros caracteres para identificação
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permissions TEXT[], -- Array de permissões: ['read:projects', 'write:tasks']
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Key hash must be unique within a tenant
    UNIQUE(tenant_id, key_hash)
);

-- ============================================
-- EMAIL_TEMPLATES (Templates de Email)
-- ============================================
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, -- e.g., 'task_assigned', 'invoice_due'
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables TEXT[], -- Array de variáveis disponíveis: ['{{user_name}}', '{{task_title}}']
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Template code must be unique within a tenant
    UNIQUE(tenant_id, code)
);

-- ============================================
-- RECURRING_TRANSACTIONS (Transações Recorrentes)
-- ============================================
CREATE TABLE recurring_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- income, expense
    category VARCHAR(100),
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    frequency VARCHAR(50) NOT NULL, -- daily, weekly, monthly, yearly
    interval_value INTEGER DEFAULT 1, -- A cada X dias/semanas/meses
    start_date DATE NOT NULL,
    end_date DATE, -- NULL para indefinido
    next_execution_date DATE NOT NULL,
    bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
    account_id UUID REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
    cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_user_settings_tenant_id ON user_settings(tenant_id);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_activity_feed_tenant_id ON activity_feed(tenant_id);
CREATE INDEX idx_activity_feed_user_id ON activity_feed(user_id);
CREATE INDEX idx_activity_feed_entity_type ON activity_feed(entity_type);
CREATE INDEX idx_activity_feed_created_at ON activity_feed(created_at);
CREATE INDEX idx_favorites_tenant_id ON favorites(tenant_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_webhooks_tenant_id ON webhooks(tenant_id);
CREATE INDEX idx_webhooks_active ON webhooks(is_active);
CREATE INDEX idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);
CREATE INDEX idx_recurring_transactions_active ON recurring_transactions(is_active);
CREATE INDEX idx_recurring_transactions_next_execution ON recurring_transactions(next_execution_date);

-- ============================================
-- MOCK DATA - COMPANY SETTINGS (DEPRECATED)
-- ============================================
-- Company settings are now stored in the tenants table (00_tenants.sql)

-- ============================================
-- MOCK DATA - USER SETTINGS
-- ============================================
INSERT INTO user_settings (tenant_id, user_id, theme, language, timezone, email_notifications, daily_digest) VALUES
('10000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dark', 'pt-BR', 'America/Sao_Paulo', TRUE, TRUE),
('10000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'dark', 'pt-BR', 'America/Sao_Paulo', TRUE, FALSE),
('10000000-0000-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dark', 'pt-BR', 'America/Sao_Paulo', TRUE, FALSE),
('10000000-0000-0000-0000-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'light', 'pt-BR', 'America/Sao_Paulo', TRUE, TRUE),
('10000000-0000-0000-0000-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'dark', 'pt-BR', 'America/Sao_Paulo', FALSE, FALSE);

-- ============================================
-- MOCK DATA - NOTIFICATIONS
-- ============================================
INSERT INTO notifications (tenant_id, user_id, type, title, message, link_url, is_read) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'mention',
    'Você foi mencionado em TASK-003',
    'João Santos mencionou você em um comentário',
    '/projetos?task=44444444-0001-0001-0001-000000000003',
    FALSE
),
(
    '10000000-0000-0000-0000-000000000001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'comment',
    'Novo comentário em TASK-002',
    'Luis Boff comentou: "Componentes concluídos e testados"',
    '/projetos?task=44444444-0001-0001-0001-000000000002',
    TRUE
),
(
    '10000000-0000-0000-0000-000000000001',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'approval',
    'Aprovação pendente: Salários Novembro',
    'Transação TRX-002 aguarda aprovação',
    '/financeiro?transaction=88888888-0001-0001-0001-000000000002',
    FALSE
),
(
    '10000000-0000-0000-0000-000000000001',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'assignment',
    'Nova tarefa atribuída: PORTAL-003',
    'Você foi atribuído à tarefa "Criar API de listagem de projetos"',
    '/projetos?task=44444444-0001-0001-0001-000000000010',
    FALSE
);

-- ============================================
-- MOCK DATA - ACTIVITY FEED
-- ============================================
INSERT INTO activity_feed (tenant_id, user_id, action, entity_type, entity_id, entity_name, description) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'completed',
    'task',
    '44444444-0001-0001-0001-000000000002',
    'Criar componentes do Kanban Board',
    'completou a tarefa'
),
(
    '10000000-0000-0000-0000-000000000001',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'commented',
    'task',
    '44444444-0001-0001-0001-000000000003',
    'Configurar Capacitor para mobile',
    'comentou na tarefa'
),
(
    '10000000-0000-0000-0000-000000000001',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'created',
    'transaction',
    '88888888-0001-0001-0001-000000000008',
    'Impostos - ISS Novembro',
    'criou uma transação'
),
(
    '10000000-0000-0000-0000-000000000001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'updated',
    'project',
    '22222222-0001-0001-0001-000000000002',
    'Portal Web Cliente',
    'atualizou o projeto'
),
(
    '10000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'created',
    'task',
    '44444444-0001-0001-0001-000000000007',
    'Corrigir bug no filtro de sprints',
    'criou uma tarefa'
);

-- ============================================
-- MOCK DATA - FAVORITES
-- ============================================
INSERT INTO favorites (tenant_id, user_id, entity_type, entity_id) VALUES
('10000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'project', '22222222-0001-0001-0001-000000000001'),
('10000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'task', '44444444-0001-0001-0001-000000000001'),
('10000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'project', '22222222-0001-0001-0001-000000000002'),
('10000000-0000-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'task', '44444444-0001-0001-0001-000000000009');

-- ============================================
-- MOCK DATA - EMAIL TEMPLATES
-- ============================================
INSERT INTO email_templates (tenant_id, code, name, subject, body_html, body_text, variables) VALUES
(
    'task_assigned',
    'Tarefa Atribuída',
    'Nova tarefa atribuída: {{task_title}}',
    '<h1>Olá {{user_name}},</h1><p>Você foi atribuído à tarefa <strong>{{task_title}}</strong>.</p><p><a href="{{task_url}}">Ver tarefa</a></p>',
    'Olá {{user_name}}, Você foi atribuído à tarefa {{task_title}}. Ver em: {{task_url}}',
    ARRAY['{{user_name}}', '{{task_title}}', '{{task_url}}']
),
(
    'invoice_due',
    'Fatura Vencendo',
    'Fatura {{invoice_number}} vence em {{days}} dias',
    '<h1>Atenção!</h1><p>A fatura <strong>{{invoice_number}}</strong> no valor de R$ {{amount}} vence em {{days}} dias.</p>',
    'Atenção! A fatura {{invoice_number}} no valor de R$ {{amount}} vence em {{days}} dias.',
    ARRAY['{{invoice_number}}', '{{amount}}', '{{days}}']
),
(
    'task_mentioned',
    'Menção em Comentário',
    '{{author_name}} mencionou você em {{task_title}}',
    '<h1>Olá {{user_name}},</h1><p><strong>{{author_name}}</strong> mencionou você em um comentário na tarefa <strong>{{task_title}}</strong>.</p><p>Comentário: "{{comment}}"</p><p><a href="{{task_url}}">Ver tarefa</a></p>',
    'Olá {{user_name}}, {{author_name}} mencionou você em um comentário na tarefa {{task_title}}. Ver em: {{task_url}}',
    ARRAY['{{user_name}}', '{{author_name}}', '{{task_title}}', '{{comment}}', '{{task_url}}']
);

-- ============================================
-- MOCK DATA - RECURRING TRANSACTIONS
-- ============================================
INSERT INTO recurring_transactions (tenant_id, name, transaction_type, category, description, amount, frequency, interval_value, start_date, next_execution_date, bank_account_id, account_id, cost_center_id, is_active, created_by) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'Salários Mensais',
    'expense',
    'salary',
    'Pagamento de salários da equipe',
    35000.00,
    'monthly',
    1,
    '2025-01-30',
    '2025-12-30',
    '55555555-0001-0001-0001-000000000001',
    '66666666-0001-0001-0001-000000000005',
    '77777777-0001-0001-0001-000000000003',
    TRUE,
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
),
(
    '10000000-0000-0000-0000-000000000001',
    'Aluguel Escritório',
    'expense',
    'payment',
    'Aluguel mensal do escritório',
    6000.00,
    'monthly',
    1,
    '2025-01-05',
    '2025-12-05',
    '55555555-0001-0001-0001-000000000001',
    '66666666-0001-0001-0001-000000000008',
    '77777777-0001-0001-0001-000000000003',
    TRUE,
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
),
(
    '10000000-0000-0000-0000-000000000001',
    'Servidor AWS',
    'expense',
    'payment',
    'Infraestrutura AWS mensal',
    5000.00,
    'monthly',
    1,
    '2025-01-05',
    '2025-12-05',
    '55555555-0001-0001-0001-000000000001',
    '66666666-0001-0001-0001-000000000007',
    '77777777-0001-0001-0001-000000000001',
    TRUE,
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
),
(
    '10000000-0000-0000-0000-000000000001',
    'Licenças Microsoft 365',
    'expense',
    'payment',
    'Assinatura Microsoft 365 mensal',
    2500.00,
    'monthly',
    1,
    '2025-01-10',
    '2025-12-10',
    '55555555-0001-0001-0001-000000000001',
    '66666666-0001-0001-0001-000000000007',
    '77777777-0001-0001-0001-000000000003',
    TRUE,
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON company_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON recurring_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
