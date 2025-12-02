-- ============================================
-- PROJECTS AND TASKS MODULE
-- ============================================

-- ============================================
-- DROP TABLES IF EXIST (in reverse dependency order)
-- ============================================
DROP TABLE IF EXISTS task_attachments CASCADE;
DROP TABLE IF EXISTS task_time_logs CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS task_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS sprints CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL, -- e.g., 'PROJ-001'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, on_hold, completed, cancelled
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    start_date DATE,
    end_date DATE,
    estimated_hours DECIMAL(10,2) DEFAULT 0,
    completed_hours DECIMAL(10,2) DEFAULT 0,
    budget DECIMAL(15,2),
    spent DECIMAL(15,2) DEFAULT 0,
    client_name VARCHAR(255),
    client_contact VARCHAR(255),
    client_email VARCHAR(255),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Code must be unique within a tenant
    UNIQUE(tenant_id, code)
);

-- ============================================
-- PROJECT_MEMBERS (Equipe do Projeto)
-- ============================================
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100), -- e.g., 'Developer', 'Designer', 'QA'
    hourly_rate DECIMAL(10,2),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    added_by UUID REFERENCES users(id),
    UNIQUE(project_id, user_id)
);

-- ============================================
-- SPRINTS TABLE
-- ============================================
CREATE TABLE sprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50), -- e.g., 'SPRINT-48'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'planned', -- planned, active, completed
    goal TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, -- e.g., 'TASK-001'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'backlog', -- backlog, todo, in-progress, review, done, blocked
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    task_type VARCHAR(50) DEFAULT 'feature', -- feature, bug, improvement, documentation
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
    parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE, -- Para subtasks
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    estimated_hours DECIMAL(10,2) DEFAULT 0,
    completed_hours DECIMAL(10,2) DEFAULT 0,
    due_date DATE,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Code must be unique within a tenant
    UNIQUE(tenant_id, code)
);

-- ============================================
-- TASK_TAGS (Tags para categorização)
-- ============================================
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#6B7280', -- Hex color
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Tag name must be unique within a tenant
    UNIQUE(tenant_id, name)
);

CREATE TABLE task_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, tag_id)
);

-- ============================================
-- TASK_COMMENTS
-- ============================================
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    mentions UUID[], -- Array of user IDs mentioned
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TASK_TIME_LOGS (Registro de tempo trabalhado)
-- ============================================
CREATE TABLE task_time_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hours DECIMAL(10,2) NOT NULL,
    description TEXT,
    logged_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TASK_ATTACHMENTS
-- ============================================
CREATE TABLE task_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER, -- in bytes
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_projects_tenant_id ON projects(tenant_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_project_members_tenant_id ON project_members(tenant_id);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_sprints_tenant_id ON sprints(tenant_id);
CREATE INDEX idx_sprints_project_id ON sprints(project_id);
CREATE INDEX idx_sprints_status ON sprints(status);
CREATE INDEX idx_tasks_tenant_id ON tasks(tenant_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_sprint_id ON tasks(sprint_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX idx_tags_tenant_id ON tags(tenant_id);
CREATE INDEX idx_task_tags_tenant_id ON task_tags(tenant_id);
CREATE INDEX idx_task_comments_tenant_id ON task_comments(tenant_id);
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_time_logs_tenant_id ON task_time_logs(tenant_id);
CREATE INDEX idx_task_time_logs_task_id ON task_time_logs(task_id);
CREATE INDEX idx_task_time_logs_user_id ON task_time_logs(user_id);
CREATE INDEX idx_task_attachments_tenant_id ON task_attachments(tenant_id);
CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);

-- ============================================
-- MOCK DATA - TAGS
-- ============================================
-- Tags for UzzAI Technologies (tenant 1)
INSERT INTO tags (id, tenant_id, name, color) VALUES
('11111111-0001-0001-0001-000000000001', '10000000-0000-0000-0000-000000000001', 'frontend', '#3B82F6'),
('11111111-0001-0001-0001-000000000002', '10000000-0000-0000-0000-000000000001', 'backend', '#10B981'),
('11111111-0001-0001-0001-000000000003', '10000000-0000-0000-0000-000000000001', 'mobile', '#8B5CF6'),
('11111111-0001-0001-0001-000000000004', '10000000-0000-0000-0000-000000000001', 'ui', '#F59E0B'),
('11111111-0001-0001-0001-000000000005', '10000000-0000-0000-0000-000000000001', 'design', '#EC4899'),
('11111111-0001-0001-0001-000000000006', '10000000-0000-0000-0000-000000000001', 'bug', '#EF4444'),
('11111111-0001-0001-0001-000000000007', '10000000-0000-0000-0000-000000000001', 'urgent', '#DC2626'),
('11111111-0001-0001-0001-000000000008', '10000000-0000-0000-0000-000000000001', 'auth', '#6366F1'),
('11111111-0001-0001-0001-000000000009', '10000000-0000-0000-0000-000000000001', 'database', '#14B8A6'),
('11111111-0001-0001-0001-000000000010', '10000000-0000-0000-0000-000000000001', 'api', '#84CC16');

-- ============================================
-- MOCK DATA - PROJECTS
-- ============================================
-- Projects for UzzAI Technologies (tenant 1)
INSERT INTO projects (id, tenant_id, code, name, description, status, priority, start_date, end_date, estimated_hours, completed_hours, budget, spent, client_name, owner_id, created_by) VALUES
(
    '22222222-0001-0001-0001-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'ERP-2025',
    'Sistema ERP UZZ.AI',
    'Desenvolvimento completo do sistema ERP unificado com módulos de projetos, financeiro, estoque e inteligência artificial',
    'active',
    'critical',
    '2025-01-01',
    '2025-12-31',
    2000,
    450,
    500000.00,
    95000.00,
    'UZZ.AI Interno',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
),
(
    '22222222-0001-0001-0001-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'WEB-PORTAL',
    'Portal Web Cliente',
    'Portal web para clientes acessarem projetos, documentos e faturas',
    'active',
    'high',
    '2025-10-01',
    '2025-12-31',
    400,
    120,
    150000.00,
    35000.00,
    'Cliente Externo LTDA',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
),
(
    '22222222-0001-0001-0001-000000000003',
    '10000000-0000-0000-0000-000000000001',
    'MOBILE-APP',
    'App Mobile Gerencial',
    'Aplicativo mobile para gestores acompanharem projetos e equipe em tempo real',
    'on_hold',
    'medium',
    '2025-11-01',
    '2026-03-31',
    800,
    0,
    200000.00,
    0,
    'UZZ.AI Interno',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
);

-- ============================================
-- MOCK DATA - PROJECT MEMBERS
-- ============================================
INSERT INTO project_members (tenant_id, project_id, user_id, role, hourly_rate, added_by) VALUES
-- ERP Project
('10000000-0000-0000-0000-000000000001', '22222222-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tech Lead', 150.00, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('10000000-0000-0000-0000-000000000001', '22222222-0001-0001-0001-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Full Stack Developer', 100.00, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('10000000-0000-0000-0000-000000000001', '22222222-0001-0001-0001-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Project Manager', 120.00, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('10000000-0000-0000-0000-000000000001', '22222222-0001-0001-0001-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Business Analyst', 90.00, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

-- Portal Web
('10000000-0000-0000-0000-000000000001', '22222222-0001-0001-0001-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Project Manager', 120.00, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('10000000-0000-0000-0000-000000000001', '22222222-0001-0001-0001-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Frontend Developer', 100.00, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

-- Mobile App
('10000000-0000-0000-0000-000000000001', '22222222-0001-0001-0001-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Project Manager', 120.00, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- ============================================
-- MOCK DATA - SPRINTS
-- ============================================
INSERT INTO sprints (id, tenant_id, project_id, name, code, start_date, end_date, status, goal) VALUES
('33333333-0001-0001-0001-000000000001', '10000000-0000-0000-0000-000000000001', '22222222-0001-0001-0001-000000000001', 'Sprint 48 - Nov 2025', 'SPRINT-48', '2025-11-18', '2025-12-01', 'active', 'Implementar módulo de autenticação e kanban board'),
('33333333-0001-0001-0001-000000000002', '10000000-0000-0000-0000-000000000001', '22222222-0001-0001-0001-000000000001', 'Sprint 47 - Nov 2025', 'SPRINT-47', '2025-11-04', '2025-11-17', 'completed', 'Design system e componentes base'),
('33333333-0001-0001-0001-000000000003', '10000000-0000-0000-0000-000000000001', '22222222-0001-0001-0001-000000000001', 'Sprint 46 - Out 2025', 'SPRINT-46', '2025-10-21', '2025-11-03', 'completed', 'Setup inicial do projeto e arquitetura'),
('33333333-0001-0001-0001-000000000004', '10000000-0000-0000-0000-000000000001', '22222222-0001-0001-0001-000000000002', 'Sprint 1 - Portal', 'PORTAL-S1', '2025-11-01', '2025-11-15', 'completed', 'Estrutura inicial e login'),
('33333333-0001-0001-0001-000000000005', '10000000-0000-0000-0000-000000000001', '22222222-0001-0001-0001-000000000002', 'Sprint 2 - Portal', 'PORTAL-S2', '2025-11-16', '2025-11-30', 'active', 'Dashboard e listagem de projetos');

-- ============================================
-- MOCK DATA - TASKS
-- ============================================
INSERT INTO tasks (id, tenant_id, code, title, description, status, priority, task_type, project_id, sprint_id, assignee_id, reporter_id, estimated_hours, completed_hours, created_at) VALUES
(
    '44444444-0001-0001-0001-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'TASK-001',
    'Implementar autenticacao com Supabase',
    'Configurar Supabase Auth com JWT e integrar com Doppler para gerenciamento de secrets',
    'in-progress',
    'high',
    'feature',
    '22222222-0001-0001-0001-000000000001',
    '33333333-0001-0001-0001-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    8,
    5,
    '2025-11-25 09:00:00'
),
(
    '44444444-0001-0001-0001-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'TASK-002',
    'Criar componentes do Kanban Board',
    'Desenvolver KanbanCard, KanbanColumn e KanbanFilters com filtros por sprint e pessoa',
    'done',
    'high',
    'feature',
    '22222222-0001-0001-0001-000000000001',
    '33333333-0001-0001-0001-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    6,
    6,
    '2025-11-27 14:00:00'
),
(
    '44444444-0001-0001-0001-000000000003',
    '10000000-0000-0000-0000-000000000001',
    'TASK-003',
    'Configurar Capacitor para mobile',
    'Setup inicial do Capacitor e helper de API para detectar Desktop vs Mobile',
    'review',
    'medium',
    'feature',
    '22222222-0001-0001-0001-000000000001',
    '33333333-0001-0001-0001-000000000001',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    10,
    9,
    '2025-11-26 11:00:00'
),
(
    '44444444-0001-0001-0001-000000000004',
    '10000000-0000-0000-0000-000000000001',
    'TASK-004',
    'Refatorar sidebar para ser colapsavel',
    'Adicionar funcionalidade de expandir/colapsar sidebar com estado no Zustand',
    'todo',
    'low',
    'improvement',
    '22222222-0001-0001-0001-000000000001',
    '33333333-0001-0001-0001-000000000001',
    NULL,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    3,
    0,
    '2025-11-29 09:00:00'
),
(
    '44444444-0001-0001-0001-000000000005',
    '10000000-0000-0000-0000-000000000001',
    'TASK-005',
    'Implementar RAG Insights',
    'Criar modulo de IA para insights automaticos usando RAG',
    'backlog',
    'medium',
    'feature',
    '22222222-0001-0001-0001-000000000001',
    NULL,
    NULL,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    20,
    0,
    '2025-11-20 08:00:00'
),
(
    '44444444-0001-0001-0001-000000000006',
    '10000000-0000-0000-0000-000000000001',
    'TASK-006',
    'Design system com cores mais claras',
    'Ajustar paleta de cores para ter background menos escuro e melhor legibilidade',
    'done',
    'medium',
    'improvement',
    '22222222-0001-0001-0001-000000000001',
    '33333333-0001-0001-0001-000000000002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    4,
    4,
    '2025-11-15 10:00:00'
),
(
    '44444444-0001-0001-0001-000000000007',
    '10000000-0000-0000-0000-000000000001',
    'TASK-007',
    'Corrigir bug no filtro de sprints',
    'Filtro não está mostrando sprints completados',
    'backlog',
    'high',
    'bug',
    '22222222-0001-0001-0001-000000000001',
    NULL,
    NULL,
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    2,
    0,
    '2025-11-29 16:00:00'
),
(
    '44444444-0001-0001-0001-000000000008',
    '10000000-0000-0000-0000-000000000001',
    'PORTAL-001',
    'Criar página de login do portal',
    'Design e implementação da tela de login para clientes',
    'done',
    'high',
    'feature',
    '22222222-0001-0001-0001-000000000002',
    '33333333-0001-0001-0001-000000000004',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    6,
    6,
    '2025-11-01 10:00:00'
),
(
    '44444444-0001-0001-0001-000000000009',
    '10000000-0000-0000-0000-000000000001',
    'PORTAL-002',
    'Implementar dashboard do cliente',
    'Dashboard com cards de projetos ativos e documentos recentes',
    'in-progress',
    'high',
    'feature',
    '22222222-0001-0001-0001-000000000002',
    '33333333-0001-0001-0001-000000000005',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    10,
    4,
    '2025-11-18 09:00:00'
),
(
    '44444444-0001-0001-0001-000000000010',
    '10000000-0000-0000-0000-000000000001',
    'PORTAL-003',
    'Criar API de listagem de projetos',
    'Endpoint para listar projetos do cliente com filtros e paginação',
    'todo',
    'medium',
    'feature',
    '22222222-0001-0001-0001-000000000002',
    '33333333-0001-0001-0001-000000000005',
    NULL,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    8,
    0,
    '2025-11-20 14:00:00'
);

-- ============================================
-- MOCK DATA - TASK TAGS
-- ============================================
INSERT INTO task_tags (tenant_id, task_id, tag_id) VALUES
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000001', '11111111-0001-0001-0001-000000000002'), -- backend
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000001', '11111111-0001-0001-0001-000000000008'), -- auth
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000002', '11111111-0001-0001-0001-000000000001'), -- frontend
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000002', '11111111-0001-0001-0001-000000000004'), -- ui
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000003', '11111111-0001-0001-0001-000000000003'), -- mobile
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000004', '11111111-0001-0001-0001-000000000001'), -- frontend
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000004', '11111111-0001-0001-0001-000000000004'), -- ui
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000005', '11111111-0001-0001-0001-000000000002'), -- backend
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000005', '11111111-0001-0001-0001-000000000010'), -- api
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000006', '11111111-0001-0001-0001-000000000005'), -- design
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000006', '11111111-0001-0001-0001-000000000004'), -- ui
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000007', '11111111-0001-0001-0001-000000000006'), -- bug
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000007', '11111111-0001-0001-0001-000000000007'), -- urgent
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000008', '11111111-0001-0001-0001-000000000001'), -- frontend
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000009', '11111111-0001-0001-0001-000000000001'), -- frontend
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000009', '11111111-0001-0001-0001-000000000004'), -- ui
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000010', '11111111-0001-0001-0001-000000000002'), -- backend
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000010', '11111111-0001-0001-0001-000000000010'); -- api

-- ============================================
-- MOCK DATA - TASK COMMENTS
-- ============================================
INSERT INTO task_comments (tenant_id, task_id, author_id, content, mentions) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    '44444444-0001-0001-0001-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Ja configurei o client do Supabase, falta integrar com o Doppler',
    ARRAY[]::UUID[]
),
(
    '10000000-0000-0000-0000-000000000001',
    '44444444-0001-0001-0001-000000000002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Componentes concluídos e testados. @maria.silva pode revisar?',
    ARRAY['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb']::UUID[]
),
(
    '10000000-0000-0000-0000-000000000001',
    '44444444-0001-0001-0001-000000000002',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Revisado e aprovado! Excelente trabalho @luis.boff',
    ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa']::UUID[]
),
(
    '10000000-0000-0000-0000-000000000001',
    '44444444-0001-0001-0001-000000000003',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Setup do Capacitor completo. Preciso que @luis.boff revise antes de mergear',
    ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa']::UUID[]
);

-- ============================================
-- MOCK DATA - TIME LOGS
-- ============================================
INSERT INTO task_time_logs (tenant_id, task_id, user_id, hours, description, logged_date) VALUES
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 3, 'Setup inicial do Supabase client', '2025-11-25'),
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, 'Integração com Doppler', '2025-11-28'),
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 4, 'Desenvolvimento dos componentes', '2025-11-27'),
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, 'Testes e ajustes finais', '2025-11-30'),
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 5, 'Configuração do Capacitor', '2025-11-26'),
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 4, 'Helper de detecção de plataforma', '2025-11-29'),
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000006', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 4, 'Ajuste completo das cores', '2025-11-15'),
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000008', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 6, 'Implementação completa do login', '2025-11-05'),
('10000000-0000-0000-0000-000000000001', '44444444-0001-0001-0001-000000000009', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 4, 'Dashboard parcialmente implementado', '2025-11-20');

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sprints_updated_at BEFORE UPDATE ON sprints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON task_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
