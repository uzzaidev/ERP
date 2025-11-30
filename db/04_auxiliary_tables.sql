-- ============================================
-- AUXILIARY TABLES AND RELATIONSHIPS
-- ============================================

-- ============================================
-- NOTIFICATIONS (Sistema de Notificações)
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
-- COMPANY_SETTINGS (Configurações da Empresa)
-- ============================================
CREATE TABLE company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    company_document VARCHAR(50), -- CNPJ
    company_email VARCHAR(255),
    company_phone VARCHAR(20),
    address_street VARCHAR(255),
    address_number VARCHAR(20),
    address_complement VARCHAR(100),
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100),
    address_state VARCHAR(2),
    address_zip VARCHAR(10),
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#1ABC9C',
    secondary_color VARCHAR(7) DEFAULT '#0F172A',
    fiscal_year_start_month INTEGER DEFAULT 1, -- Mês de início do ano fiscal
    currency VARCHAR(3) DEFAULT 'BRL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ACTIVITY_FEED (Feed de Atividades)
-- ============================================
CREATE TABLE activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    name VARCHAR(255) NOT NULL,
    key_hash TEXT NOT NULL UNIQUE, -- Hash da chave
    key_prefix VARCHAR(20) NOT NULL, -- Primeiros caracteres para identificação
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permissions TEXT[], -- Array de permissões: ['read:projects', 'write:tasks']
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- EMAIL_TEMPLATES (Templates de Email)
-- ============================================
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'task_assigned', 'invoice_due'
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables TEXT[], -- Array de variáveis disponíveis: ['{{user_name}}', '{{task_title}}']
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- RECURRING_TRANSACTIONS (Transações Recorrentes)
-- ============================================
CREATE TABLE recurring_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_activity_feed_user_id ON activity_feed(user_id);
CREATE INDEX idx_activity_feed_entity_type ON activity_feed(entity_type);
CREATE INDEX idx_activity_feed_created_at ON activity_feed(created_at);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_webhooks_active ON webhooks(is_active);
CREATE INDEX idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);
CREATE INDEX idx_recurring_transactions_active ON recurring_transactions(is_active);
CREATE INDEX idx_recurring_transactions_next_execution ON recurring_transactions(next_execution_date);

-- ============================================
-- MOCK DATA - COMPANY SETTINGS
-- ============================================
INSERT INTO company_settings (company_name, company_document, company_email, company_phone, address_city, address_state, logo_url, primary_color) VALUES
('UZZ.AI Tecnologia LTDA', '99.999.999/0001-99', 'contato@uzz.ai', '+55 47 99999-0000', 'Joinville', 'SC', NULL, '#1ABC9C');

-- ============================================
-- MOCK DATA - USER SETTINGS
-- ============================================
INSERT INTO user_settings (user_id, theme, language, timezone, email_notifications, daily_digest) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dark', 'pt-BR', 'America/Sao_Paulo', TRUE, TRUE),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'dark', 'pt-BR', 'America/Sao_Paulo', TRUE, FALSE),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'dark', 'pt-BR', 'America/Sao_Paulo', TRUE, FALSE),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'light', 'pt-BR', 'America/Sao_Paulo', TRUE, TRUE),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'dark', 'pt-BR', 'America/Sao_Paulo', FALSE, FALSE);

-- ============================================
-- MOCK DATA - NOTIFICATIONS
-- ============================================
INSERT INTO notifications (user_id, type, title, message, link_url, is_read) VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'mention',
    'Você foi mencionado em TASK-003',
    'João Santos mencionou você em um comentário',
    '/projetos?task=44444444-0001-0001-0001-000000000003',
    FALSE
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'comment',
    'Novo comentário em TASK-002',
    'Luis Boff comentou: "Componentes concluídos e testados"',
    '/projetos?task=44444444-0001-0001-0001-000000000002',
    TRUE
),
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'approval',
    'Aprovação pendente: Salários Novembro',
    'Transação TRX-002 aguarda aprovação',
    '/financeiro?transaction=88888888-0001-0001-0001-000000000002',
    FALSE
),
(
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
INSERT INTO activity_feed (user_id, action, entity_type, entity_id, entity_name, description) VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'completed',
    'task',
    '44444444-0001-0001-0001-000000000002',
    'Criar componentes do Kanban Board',
    'completou a tarefa'
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'commented',
    'task',
    '44444444-0001-0001-0001-000000000003',
    'Configurar Capacitor para mobile',
    'comentou na tarefa'
),
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'created',
    'transaction',
    '88888888-0001-0001-0001-000000000008',
    'Impostos - ISS Novembro',
    'criou uma transação'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'updated',
    'project',
    '22222222-0001-0001-0001-000000000002',
    'Portal Web Cliente',
    'atualizou o projeto'
),
(
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
INSERT INTO favorites (user_id, entity_type, entity_id) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'project', '22222222-0001-0001-0001-000000000001'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'task', '44444444-0001-0001-0001-000000000001'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'project', '22222222-0001-0001-0001-000000000002'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'task', '44444444-0001-0001-0001-000000000009');

-- ============================================
-- MOCK DATA - EMAIL TEMPLATES
-- ============================================
INSERT INTO email_templates (code, name, subject, body_html, body_text, variables) VALUES
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
INSERT INTO recurring_transactions (name, transaction_type, category, description, amount, frequency, interval_value, start_date, next_execution_date, bank_account_id, account_id, cost_center_id, is_active, created_by) VALUES
(
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
