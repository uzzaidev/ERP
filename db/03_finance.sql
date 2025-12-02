-- ============================================
-- FINANCE MODULE
-- ============================================

-- ============================================
-- DROP TABLES IF EXIST (in reverse dependency order)
-- ============================================
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS payment_terms CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS transaction_attachments CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS cost_centers CASCADE;
DROP TABLE IF EXISTS chart_of_accounts CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;

-- ============================================
-- BANK_ACCOUNTS (Contas Bancárias)
-- ============================================
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255),
    account_number VARCHAR(50),
    agency VARCHAR(20),
    account_type VARCHAR(50), -- checking, savings, investment
    currency VARCHAR(3) DEFAULT 'BRL',
    initial_balance DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CHART_OF_ACCOUNTS (Plano de Contas)
-- ============================================
CREATE TABLE chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, -- e.g., '1.1.01.001'
    name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- revenue, expense, asset, liability, equity
    category VARCHAR(100), -- e.g., 'Marketing', 'Salários', 'Equipamentos'
    parent_id UUID REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Code must be unique within a tenant
    UNIQUE(tenant_id, code)
);

-- ============================================
-- COST_CENTERS (Centros de Custo)
-- ============================================
CREATE TABLE cost_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Code must be unique within a tenant
    UNIQUE(tenant_id, code)
);

-- ============================================
-- TRANSACTIONS (Transações Financeiras)
-- ============================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, -- e.g., 'TRX-001'
    transaction_type VARCHAR(50) NOT NULL, -- income, expense, transfer
    category VARCHAR(100), -- e.g., 'payment', 'invoice', 'salary', 'reimbursement'
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    transaction_date DATE NOT NULL,
    due_date DATE,
    payment_date DATE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, cancelled, overdue
    payment_method VARCHAR(50), -- credit_card, debit_card, bank_transfer, pix, cash, check
    bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
    account_id UUID REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
    cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    contact_name VARCHAR(255), -- Cliente ou fornecedor
    contact_document VARCHAR(50), -- CPF/CNPJ
    notes TEXT,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Code must be unique within a tenant
    UNIQUE(tenant_id, code)
);

-- ============================================
-- INVOICES (Notas Fiscais)
-- ============================================
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL,
    invoice_type VARCHAR(50) NOT NULL, -- nfse, nfe, nfce
    series VARCHAR(20),
    issue_date DATE NOT NULL,
    due_date DATE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    issuer_name VARCHAR(255) NOT NULL,
    issuer_document VARCHAR(50) NOT NULL, -- CNPJ
    recipient_name VARCHAR(255) NOT NULL,
    recipient_document VARCHAR(50) NOT NULL, -- CPF/CNPJ
    gross_amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    xml_file_url TEXT,
    pdf_file_url TEXT,
    access_key VARCHAR(100), -- Chave de acesso NFe
    status VARCHAR(50) DEFAULT 'issued', -- issued, cancelled, rejected
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Invoice number must be unique within a tenant
    UNIQUE(tenant_id, invoice_number)
);

-- ============================================
-- INVOICE_ITEMS (Itens da Nota Fiscal)
-- ============================================
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DOCUMENTS (Documentos Financeiros)
-- ============================================
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- contract, invoice, receipt, agreement, report
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER, -- in bytes
    mime_type VARCHAR(100),
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    tags TEXT[], -- Array de tags
    is_confidential BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- BUDGETS (Orçamentos)
-- ============================================
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER, -- NULL for annual budgets
    cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
    account_id UUID REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
    budgeted_amount DECIMAL(15,2) NOT NULL,
    spent_amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active', -- active, closed, archived
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_bank_accounts_tenant_id ON bank_accounts(tenant_id);
CREATE INDEX idx_bank_accounts_active ON bank_accounts(is_active);
CREATE INDEX idx_chart_of_accounts_tenant_id ON chart_of_accounts(tenant_id);
CREATE INDEX idx_chart_of_accounts_type ON chart_of_accounts(account_type);
CREATE INDEX idx_chart_of_accounts_parent_id ON chart_of_accounts(parent_id);
CREATE INDEX idx_cost_centers_tenant_id ON cost_centers(tenant_id);
CREATE INDEX idx_cost_centers_active ON cost_centers(is_active);
CREATE INDEX idx_transactions_tenant_id ON transactions(tenant_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_bank_account_id ON transactions(bank_account_id);
CREATE INDEX idx_transactions_project_id ON transactions(project_id);
CREATE INDEX idx_transactions_created_by ON transactions(created_by);
CREATE INDEX idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX idx_invoices_number ON invoices(tenant_id, invoice_number);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoice_items_tenant_id ON invoice_items(tenant_id);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_transaction_id ON documents(transaction_id);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_budgets_year ON budgets(year);
CREATE INDEX idx_budgets_cost_center_id ON budgets(cost_center_id);

-- ============================================
-- MOCK DATA - BANK ACCOUNTS
-- ============================================
INSERT INTO bank_accounts (id, tenant_id, name, bank_name, account_number, agency, account_type, initial_balance, current_balance) VALUES
('55555555-0001-0001-0001-000000000001', '10000000-0000-0000-0000-000000000001', 'Conta Corrente Principal', 'Banco do Brasil', '12345-6', '0001', 'checking', 100000.00, 185000.00),
('55555555-0001-0001-0001-000000000002', '10000000-0000-0000-0000-000000000001', 'Conta Poupança', 'Caixa Econômica', '98765-4', '0123', 'savings', 50000.00, 52000.00),
('55555555-0001-0001-0001-000000000003', '10000000-0000-0000-0000-000000000001', 'Conta Investimentos', 'Nubank', '55555-5', '0001', 'investment', 200000.00, 210000.00);

-- ============================================
-- MOCK DATA - CHART OF ACCOUNTS
-- ============================================
INSERT INTO chart_of_accounts (id, tenant_id, code, name, account_type, category, parent_id) VALUES
-- RECEITAS
('66666666-0001-0001-0001-000000000001', '10000000-0000-0000-0000-000000000001', '3.1', 'Receitas Operacionais', 'revenue', NULL, NULL),
('66666666-0001-0001-0001-000000000002', '10000000-0000-0000-0000-000000000001', '3.1.01', 'Receita de Serviços', 'revenue', 'Serviços', '66666666-0001-0001-0001-000000000001'),
('66666666-0001-0001-0001-000000000003', '10000000-0000-0000-0000-000000000001', '3.1.02', 'Receita de Produtos', 'revenue', 'Produtos', '66666666-0001-0001-0001-000000000001'),

-- DESPESAS
('66666666-0001-0001-0001-000000000004', '10000000-0000-0000-0000-000000000001', '4.1', 'Despesas Operacionais', 'expense', NULL, NULL),
('66666666-0001-0001-0001-000000000005', '10000000-0000-0000-0000-000000000001', '4.1.01', 'Salários e Encargos', 'expense', 'Pessoal', '66666666-0001-0001-0001-000000000004'),
('66666666-0001-0001-0001-000000000006', '10000000-0000-0000-0000-000000000001', '4.1.02', 'Marketing', 'expense', 'Marketing', '66666666-0001-0001-0001-000000000004'),
('66666666-0001-0001-0001-000000000007', '10000000-0000-0000-0000-000000000001', '4.1.03', 'Infraestrutura', 'expense', 'TI', '66666666-0001-0001-0001-000000000004'),
('66666666-0001-0001-0001-000000000008', '10000000-0000-0000-0000-000000000001', '4.1.04', 'Escritório', 'expense', 'Administrativo', '66666666-0001-0001-0001-000000000004'),
('66666666-0001-0001-0001-000000000009', '10000000-0000-0000-0000-000000000001', '4.1.05', 'Impostos', 'expense', 'Fiscal', '66666666-0001-0001-0001-000000000004'),

-- ATIVOS
('66666666-0001-0001-0001-000000000010', '10000000-0000-0000-0000-000000000001', '1.1', 'Ativo Circulante', 'asset', NULL, NULL),
('66666666-0001-0001-0001-000000000011', '10000000-0000-0000-0000-000000000001', '1.1.01', 'Caixa e Bancos', 'asset', 'Caixa', '66666666-0001-0001-0001-000000000010'),
('66666666-0001-0001-0001-000000000012', '10000000-0000-0000-0000-000000000001', '1.2', 'Ativo Não Circulante', 'asset', NULL, NULL),
('66666666-0001-0001-0001-000000000013', '10000000-0000-0000-0000-000000000001', '1.2.01', 'Imobilizado', 'asset', 'Equipamentos', '66666666-0001-0001-0001-000000000012');

-- ============================================
-- MOCK DATA - COST CENTERS
-- ============================================
INSERT INTO cost_centers (id, tenant_id, code, name, description, manager_id) VALUES
('77777777-0001-0001-0001-000000000001', '10000000-0000-0000-0000-000000000001', 'CC-001', 'Desenvolvimento', 'Centro de custo para equipe de desenvolvimento', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('77777777-0001-0001-0001-000000000002', '10000000-0000-0000-0000-000000000001', 'CC-002', 'Marketing', 'Centro de custo para marketing e vendas', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('77777777-0001-0001-0001-000000000003', '10000000-0000-0000-0000-000000000001', 'CC-003', 'Administrativo', 'Centro de custo para administrativo e financeiro', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
('77777777-0001-0001-0001-000000000004', '10000000-0000-0000-0000-000000000001', 'CC-004', 'Jurídico', 'Centro de custo para departamento jurídico', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee');

-- ============================================
-- MOCK DATA - TRANSACTIONS
-- ============================================
INSERT INTO transactions (id, tenant_id, code, transaction_type, category, description, amount, transaction_date, due_date, payment_date, status, payment_method, bank_account_id, account_id, cost_center_id, project_id, contact_name, contact_document, created_by) VALUES
(
    '88888888-0001-0001-0001-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'TRX-001',
    'income',
    'invoice',
    'Pagamento Projeto Portal Web - Sprint 1',
    75000.00,
    '2025-11-15',
    '2025-11-15',
    '2025-11-15',
    'paid',
    'bank_transfer',
    '55555555-0001-0001-0001-000000000001',
    '66666666-0001-0001-0001-000000000002',
    '77777777-0001-0001-0001-000000000001',
    '22222222-0001-0001-0001-000000000002',
    'Cliente Externo LTDA',
    '12.345.678/0001-90',
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
),
(
    '88888888-0001-0001-0001-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'TRX-002',
    'expense',
    'salary',
    'Salários Novembro 2025',
    35000.00,
    '2025-11-30',
    '2025-11-30',
    NULL,
    'pending',
    'bank_transfer',
    '55555555-0001-0001-0001-000000000001',
    '66666666-0001-0001-0001-000000000005',
    '77777777-0001-0001-0001-000000000003',
    NULL,
    'Folha de Pagamento',
    NULL,
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
),
(
    '88888888-0001-0001-0001-000000000003',
    '10000000-0000-0000-0000-000000000001',
    'TRX-003',
    'expense',
    'payment',
    'Servidor AWS - Novembro 2025',
    5000.00,
    '2025-11-05',
    '2025-11-05',
    '2025-11-05',
    'paid',
    'credit_card',
    '55555555-0001-0001-0001-000000000001',
    '66666666-0001-0001-0001-000000000007',
    '77777777-0001-0001-0001-000000000001',
    '22222222-0001-0001-0001-000000000001',
    'Amazon Web Services',
    '15.436.940/0001-03',
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
),
(
    '88888888-0001-0001-0001-000000000004',
    '10000000-0000-0000-0000-000000000001',
    'TRX-004',
    'expense',
    'payment',
    'Licenças Microsoft 365',
    2500.00,
    '2025-11-10',
    '2025-11-10',
    '2025-11-10',
    'paid',
    'credit_card',
    '55555555-0001-0001-0001-000000000001',
    '66666666-0001-0001-0001-000000000007',
    '77777777-0001-0001-0001-000000000003',
    NULL,
    'Microsoft Corporation',
    '04.712.500/0001-07',
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
),
(
    '88888888-0001-0001-0001-000000000005',
    '10000000-0000-0000-0000-000000000001',
    'TRX-005',
    'expense',
    'payment',
    'Campanha Google Ads - Novembro',
    8000.00,
    '2025-11-20',
    '2025-11-20',
    '2025-11-21',
    'paid',
    'credit_card',
    '55555555-0001-0001-0001-000000000001',
    '66666666-0001-0001-0001-000000000006',
    '77777777-0001-0001-0001-000000000002',
    NULL,
    'Google Brasil',
    '06.990.590/0001-23',
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
),
(
    '88888888-0001-0001-0001-000000000006',
    '10000000-0000-0000-0000-000000000001',
    'TRX-006',
    'income',
    'invoice',
    'Projeto ERP - Parcela 3/12',
    41666.67,
    '2025-11-01',
    '2025-11-01',
    '2025-11-03',
    'paid',
    'pix',
    '55555555-0001-0001-0001-000000000001',
    '66666666-0001-0001-0001-000000000002',
    '77777777-0001-0001-0001-000000000001',
    '22222222-0001-0001-0001-000000000001',
    'UZZ.AI Interno',
    '99.999.999/0001-99',
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
),
(
    '88888888-0001-0001-0001-000000000007',
    '10000000-0000-0000-0000-000000000001',
    'TRX-007',
    'expense',
    'payment',
    'Aluguel Escritório - Novembro',
    6000.00,
    '2025-11-01',
    '2025-11-05',
    '2025-11-05',
    'paid',
    'bank_transfer',
    '55555555-0001-0001-0001-000000000001',
    '66666666-0001-0001-0001-000000000008',
    '77777777-0001-0001-0001-000000000003',
    NULL,
    'Imobiliária Xpto',
    '11.222.333/0001-44',
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
),
(
    '88888888-0001-0001-0001-000000000008',
    '10000000-0000-0000-0000-000000000001',
    'TRX-008',
    'expense',
    'payment',
    'Impostos - ISS Novembro',
    3500.00,
    '2025-11-25',
    '2025-11-30',
    NULL,
    'pending',
    'bank_transfer',
    '55555555-0001-0001-0001-000000000001',
    '66666666-0001-0001-0001-000000000009',
    '77777777-0001-0001-0001-000000000003',
    NULL,
    'Prefeitura Municipal',
    NULL,
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
);

-- ============================================
-- MOCK DATA - INVOICES
-- ============================================
INSERT INTO invoices (id, tenant_id, invoice_number, invoice_type, series, issue_date, due_date, transaction_id, issuer_name, issuer_document, recipient_name, recipient_document, gross_amount, tax_amount, net_amount, status) VALUES
(
    '99999999-0001-0001-0001-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'NFSe-12345',
    'nfse',
    'A',
    '2025-11-15',
    '2025-11-15',
    '88888888-0001-0001-0001-000000000001',
    'UZZ.AI Tecnologia LTDA',
    '99.999.999/0001-99',
    'Cliente Externo LTDA',
    '12.345.678/0001-90',
    75000.00,
    3750.00,
    71250.00,
    'issued'
),
(
    '99999999-0001-0001-0001-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'NFSe-12346',
    'nfse',
    'A',
    '2025-11-01',
    '2025-11-01',
    '88888888-0001-0001-0001-000000000006',
    'UZZ.AI Tecnologia LTDA',
    '99.999.999/0001-99',
    'UZZ.AI Interno',
    '99.999.999/0001-99',
    41666.67,
    2083.33,
    39583.34,
    'issued'
),
(
    '99999999-0001-0001-0001-000000000003',
    '10000000-0000-0000-0000-000000000001',
    'NFe-789456',
    'nfe',
    '1',
    '2025-11-05',
    '2025-11-05',
    '88888888-0001-0001-0001-000000000003',
    'Amazon Web Services Brasil LTDA',
    '15.436.940/0001-03',
    'UZZ.AI Tecnologia LTDA',
    '99.999.999/0001-99',
    5000.00,
    850.00,
    4150.00,
    'issued'
);

-- ============================================
-- MOCK DATA - INVOICE ITEMS
-- ============================================
INSERT INTO invoice_items (tenant_id, invoice_id, description, quantity, unit_price, total_price, tax_rate, tax_amount) VALUES
('10000000-0000-0000-0000-000000000001', '99999999-0001-0001-0001-000000000001', 'Desenvolvimento Portal Web - Sprint 1', 1, 75000.00, 75000.00, 5.00, 3750.00),
('10000000-0000-0000-0000-000000000001', '99999999-0001-0001-0001-000000000002', 'Desenvolvimento Sistema ERP - Parcela 3', 1, 41666.67, 41666.67, 5.00, 2083.33),
('10000000-0000-0000-0000-000000000001', '99999999-0001-0001-0001-000000000003', 'Servidor EC2 t3.large - 730 horas', 730, 0.85, 620.50, 17.00, 105.49),
('10000000-0000-0000-0000-000000000001', '99999999-0001-0001-0001-000000000003', 'Storage S3 - 500GB', 500, 0.30, 150.00, 17.00, 25.50),
('10000000-0000-0000-0000-000000000001', '99999999-0001-0001-0001-000000000003', 'RDS PostgreSQL db.t3.medium', 1, 4229.50, 4229.50, 17.00, 719.01);

-- ============================================
-- MOCK DATA - DOCUMENTS
-- ============================================
INSERT INTO documents (id, tenant_id, document_type, title, description, file_name, file_url, file_size, mime_type, transaction_id, project_id, uploaded_by, tags, is_confidential) VALUES
(
    'aaaa1111-0001-0001-0001-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'contract',
    'Contrato Portal Web Cliente Externo',
    'Contrato de desenvolvimento do portal web',
    'contrato_portal_web_2025.pdf',
    'https://storage.uzz.ai/docs/contrato_portal_web_2025.pdf',
    2458000,
    'application/pdf',
    '88888888-0001-0001-0001-000000000001',
    '22222222-0001-0001-0001-000000000002',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    ARRAY['contrato', 'juridico', 'cliente'],
    TRUE
),
(
    'aaaa1111-0001-0001-0001-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'invoice',
    'NFSe 12345 - Cliente Externo',
    'Nota fiscal de serviço referente ao projeto portal web',
    'nfse_12345.pdf',
    'https://storage.uzz.ai/docs/nfse_12345.pdf',
    156000,
    'application/pdf',
    '88888888-0001-0001-0001-000000000001',
    '22222222-0001-0001-0001-000000000002',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    ARRAY['nota-fiscal', 'nfse'],
    FALSE
),
(
    'aaaa1111-0001-0001-0001-000000000003',
    '10000000-0000-0000-0000-000000000001',
    'receipt',
    'Comprovante Pagamento AWS',
    'Comprovante de pagamento servidor AWS Novembro',
    'comprovante_aws_nov2025.pdf',
    'https://storage.uzz.ai/docs/comprovante_aws_nov2025.pdf',
    89000,
    'application/pdf',
    '88888888-0001-0001-0001-000000000003',
    '22222222-0001-0001-0001-000000000001',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    ARRAY['comprovante', 'infraestrutura'],
    FALSE
),
(
    'aaaa1111-0001-0001-0001-000000000004',
    '10000000-0000-0000-0000-000000000001',
    'report',
    'Relatório Financeiro Novembro 2025',
    'Relatório financeiro consolidado do mês',
    'relatorio_financeiro_nov2025.pdf',
    'https://storage.uzz.ai/docs/relatorio_financeiro_nov2025.pdf',
    1250000,
    'application/pdf',
    NULL,
    NULL,
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    ARRAY['relatorio', 'financeiro', 'mensal'],
    TRUE
);

-- ============================================
-- MOCK DATA - BUDGETS
-- ============================================
INSERT INTO budgets (id, tenant_id, name, year, month, cost_center_id, account_id, budgeted_amount, spent_amount, status, created_by) VALUES
(
    'bbbb2222-0001-0001-0001-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Orçamento Desenvolvimento - Novembro',
    2025,
    11,
    '77777777-0001-0001-0001-000000000001',
    '66666666-0001-0001-0001-000000000005',
    40000.00,
    35000.00,
    'active',
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
),
(
    'bbbb2222-0001-0001-0001-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'Orçamento Marketing - Novembro',
    2025,
    11,
    '77777777-0001-0001-0001-000000000002',
    '66666666-0001-0001-0001-000000000006',
    10000.00,
    8000.00,
    'active',
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
),
(
    'bbbb2222-0001-0001-0001-000000000003',
    '10000000-0000-0000-0000-000000000001',
    'Orçamento Infraestrutura - Novembro',
    2025,
    11,
    '77777777-0001-0001-0001-000000000001',
    '66666666-0001-0001-0001-000000000007',
    8000.00,
    7500.00,
    'active',
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
),
(
    'bbbb2222-0001-0001-0001-000000000004',
    '10000000-0000-0000-0000-000000000001',
    'Orçamento Administrativo - Novembro',
    2025,
    11,
    '77777777-0001-0001-0001-000000000003',
    '66666666-0001-0001-0001-000000000008',
    12000.00,
    9500.00,
    'active',
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chart_of_accounts_updated_at BEFORE UPDATE ON chart_of_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cost_centers_updated_at BEFORE UPDATE ON cost_centers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
