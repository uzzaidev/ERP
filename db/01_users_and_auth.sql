-- ============================================
-- USERS AND AUTHENTICATION MODULE
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP TABLES IF EXIST (in reverse dependency order)
-- ============================================
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ============================================
-- ROLES TABLE
-- ============================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE, -- Cannot be deleted if true
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PERMISSIONS TABLE
-- ============================================
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'projects.view', 'projects.edit', 'finance.view'
    module VARCHAR(50) NOT NULL, -- e.g., 'projects', 'finance', 'users'
    action VARCHAR(50) NOT NULL, -- e.g., 'view', 'create', 'edit', 'delete'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ROLE_PERMISSIONS JUNCTION TABLE
-- ============================================
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure email is unique within a tenant
    UNIQUE(tenant_id, email)
);

-- ============================================
-- USER_ROLES JUNCTION TABLE
-- ============================================
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id),
    UNIQUE(user_id, role_id, tenant_id)
);

-- ============================================
-- AUDIT LOG TABLE
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- e.g., 'user.login', 'project.created', 'task.updated'
    entity_type VARCHAR(50), -- e.g., 'user', 'project', 'task'
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_user_roles_tenant_id ON user_roles(tenant_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================
-- MOCK DATA - ROLES
-- ============================================
INSERT INTO roles (id, name, display_name, description, is_system_role) VALUES
('11111111-1111-1111-1111-111111111111', 'admin', 'Administrador', 'Acesso completo ao sistema', TRUE),
('22222222-2222-2222-2222-222222222222', 'gestor', 'Gestor', 'Gerencia projetos e equipes', TRUE),
('33333333-3333-3333-3333-333333333333', 'financeiro', 'Financeiro', 'Gerencia financeiro e documentos', TRUE),
('44444444-4444-4444-4444-444444444444', 'juridico', 'Jurídico', 'Acessa contratos e documentos legais', TRUE),
('55555555-5555-5555-5555-555555555555', 'dev', 'Desenvolvedor', 'Gerencia tasks e projetos técnicos', TRUE);

-- ============================================
-- MOCK DATA - PERMISSIONS
-- ============================================
INSERT INTO permissions (code, module, action, display_name, description) VALUES
-- Dashboard
('dashboard.view', 'dashboard', 'view', 'Ver Dashboard', 'Visualizar página inicial'),

-- Users
('users.view', 'users', 'view', 'Ver Usuários', 'Visualizar lista de usuários'),
('users.create', 'users', 'create', 'Criar Usuários', 'Criar novos usuários'),
('users.edit', 'users', 'edit', 'Editar Usuários', 'Editar dados de usuários'),
('users.delete', 'users', 'delete', 'Deletar Usuários', 'Remover usuários do sistema'),
('users.manage_roles', 'users', 'manage_roles', 'Gerenciar Roles', 'Atribuir roles aos usuários'),

-- Projects
('projects.view', 'projects', 'view', 'Ver Projetos', 'Visualizar projetos'),
('projects.create', 'projects', 'create', 'Criar Projetos', 'Criar novos projetos'),
('projects.edit', 'projects', 'edit', 'Editar Projetos', 'Editar projetos existentes'),
('projects.delete', 'projects', 'delete', 'Deletar Projetos', 'Remover projetos'),

-- Tasks
('tasks.view', 'tasks', 'view', 'Ver Tasks', 'Visualizar tasks'),
('tasks.create', 'tasks', 'create', 'Criar Tasks', 'Criar novas tasks'),
('tasks.edit', 'tasks', 'edit', 'Editar Tasks', 'Editar tasks existentes'),
('tasks.delete', 'tasks', 'delete', 'Deletar Tasks', 'Remover tasks'),
('tasks.assign', 'tasks', 'assign', 'Atribuir Tasks', 'Atribuir tasks para usuários'),

-- Finance
('finance.view', 'finance', 'view', 'Ver Financeiro', 'Visualizar módulo financeiro'),
('finance.create', 'finance', 'create', 'Criar Registros', 'Criar registros financeiros'),
('finance.edit', 'finance', 'edit', 'Editar Registros', 'Editar registros financeiros'),
('finance.delete', 'finance', 'delete', 'Deletar Registros', 'Remover registros financeiros'),
('finance.approve', 'finance', 'approve', 'Aprovar Transações', 'Aprovar pagamentos e recebimentos'),

-- Documents
('documents.view', 'documents', 'view', 'Ver Documentos', 'Visualizar documentos'),
('documents.upload', 'documents', 'upload', 'Upload Documentos', 'Fazer upload de documentos'),
('documents.delete', 'documents', 'delete', 'Deletar Documentos', 'Remover documentos'),

-- Settings
('settings.view', 'settings', 'view', 'Ver Configurações', 'Visualizar configurações'),
('settings.edit', 'settings', 'edit', 'Editar Configurações', 'Modificar configurações do sistema');

-- ============================================
-- MOCK DATA - ROLE PERMISSIONS
-- ============================================

-- Admin tem todas as permissões
INSERT INTO role_permissions (role_id, permission_id)
SELECT '11111111-1111-1111-1111-111111111111', id FROM permissions;

-- Gestor
INSERT INTO role_permissions (role_id, permission_id)
SELECT '22222222-2222-2222-2222-222222222222', id FROM permissions
WHERE code IN (
    'dashboard.view',
    'users.view',
    'projects.view', 'projects.create', 'projects.edit',
    'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.assign',
    'documents.view', 'documents.upload'
);

-- Financeiro
INSERT INTO role_permissions (role_id, permission_id)
SELECT '33333333-3333-3333-3333-333333333333', id FROM permissions
WHERE code IN (
    'dashboard.view',
    'finance.view', 'finance.create', 'finance.edit', 'finance.approve',
    'documents.view', 'documents.upload',
    'projects.view'
);

-- Jurídico
INSERT INTO role_permissions (role_id, permission_id)
SELECT '44444444-4444-4444-4444-444444444444', id FROM permissions
WHERE code IN (
    'dashboard.view',
    'documents.view', 'documents.upload', 'documents.delete',
    'projects.view',
    'finance.view'
);

-- Dev
INSERT INTO role_permissions (role_id, permission_id)
SELECT '55555555-5555-5555-5555-555555555555', id FROM permissions
WHERE code IN (
    'dashboard.view',
    'projects.view', 'projects.edit',
    'tasks.view', 'tasks.create', 'tasks.edit',
    'documents.view', 'documents.upload'
);

-- ============================================
-- MOCK DATA - USERS
-- ============================================
-- Password: admin123 (hashed with bcrypt)
-- UzzAI Technologies users
INSERT INTO users (id, tenant_id, email, password_hash, full_name, avatar_url, phone, is_active, email_verified) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '10000000-0000-0000-0000-000000000001', 'admin@uzz.ai', '$2b$10$rXQZJ0QYP.QHpZTqW6qR9OXqZ5L5fZ5YJZqZ5L5fZ5YJZqZ5L5fZ5', 'Luis Boff', NULL, '+55 47 99999-0001', TRUE, TRUE),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '10000000-0000-0000-0000-000000000001', 'maria.silva@uzz.ai', '$2b$10$rXQZJ0QYP.QHpZTqW6qR9OXqZ5L5fZ5YJZqZ5L5fZ5YJZqZ5L5fZ5', 'Maria Silva', NULL, '+55 47 99999-0002', TRUE, TRUE),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '10000000-0000-0000-0000-000000000001', 'joao.santos@uzz.ai', '$2b$10$rXQZJ0QYP.QHpZTqW6qR9OXqZ5L5fZ5YJZqZ5L5fZ5YJZqZ5L5fZ5', 'João Santos', NULL, '+55 47 99999-0003', TRUE, TRUE),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '10000000-0000-0000-0000-000000000001', 'ana.costa@uzz.ai', '$2b$10$rXQZJ0QYP.QHpZTqW6qR9OXqZ5L5fZ5YJZqZ5L5fZ5YJZqZ5L5fZ5', 'Ana Costa', NULL, '+55 47 99999-0004', TRUE, TRUE),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '10000000-0000-0000-0000-000000000001', 'pedro.oliveira@uzz.ai', '$2b$10$rXQZJ0QYP.QHpZTqW6qR9OXqZ5L5fZ5YJZqZ5L5fZ5YJZqZ5L5fZ5', 'Pedro Oliveira', NULL, '+55 47 99999-0005', TRUE, TRUE);

-- Empresa Demo A users
INSERT INTO users (id, tenant_id, email, password_hash, full_name, avatar_url, phone, is_active, email_verified) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-bbbbbbbbbbbb', '10000000-0000-0000-0000-000000000002', 'admin@empresaa.com.br', '$2b$10$rXQZJ0QYP.QHpZTqW6qR9OXqZ5L5fZ5YJZqZ5L5fZ5YJZqZ5L5fZ5', 'Carlos Souza', NULL, '+55 11 98888-0002', TRUE, TRUE),
('bbbbbbbb-bbbb-bbbb-bbbb-cccccccccccc', '10000000-0000-0000-0000-000000000002', 'gestor@empresaa.com.br', '$2b$10$rXQZJ0QYP.QHpZTqW6qR9OXqZ5L5fZ5YJZqZ5L5fZ5YJZqZ5L5fZ5', 'Paula Santos', NULL, '+55 11 98888-0003', TRUE, TRUE),
('cccccccc-cccc-cccc-cccc-dddddddddddd', '10000000-0000-0000-0000-000000000002', 'financeiro@empresaa.com.br', '$2b$10$rXQZJ0QYP.QHpZTqW6qR9OXqZ5L5fZ5YJZqZ5L5fZ5YJZqZ5L5fZ5', 'Roberto Lima', NULL, '+55 11 98888-0004', TRUE, TRUE);

-- Startup Beta users
INSERT INTO users (id, tenant_id, email, password_hash, full_name, avatar_url, phone, is_active, email_verified) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-dddddddddddd', '10000000-0000-0000-0000-000000000003', 'admin@startupbeta.io', '$2b$10$rXQZJ0QYP.QHpZTqW6qR9OXqZ5L5fZ5YJZqZ5L5fZ5YJZqZ5L5fZ5', 'Felipe Costa', NULL, '+55 21 97777-0002', TRUE, TRUE),
('bbbbbbbb-bbbb-bbbb-bbbb-eeeeeeeeeeee', '10000000-0000-0000-0000-000000000003', 'dev@startupbeta.io', '$2b$10$rXQZJ0QYP.QHpZTqW6qR9OXqZ5L5fZ5YJZqZ5L5fZ5YJZqZ5L5fZ5', 'Julia Martins', NULL, '+55 21 97777-0003', TRUE, TRUE);

-- ============================================
-- MOCK DATA - USER ROLES
-- ============================================
-- UzzAI Technologies user roles
INSERT INTO user_roles (user_id, role_id, tenant_id, assigned_by) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000001', NULL), -- Luis = Admin
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '10000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), -- Maria = Gestor
('cccccccc-cccc-cccc-cccc-cccccccccccc', '55555555-5555-5555-5555-555555555555', '10000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), -- João = Dev
('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', '10000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), -- Ana = Financeiro
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444', '10000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'); -- Pedro = Jurídico

-- Empresa Demo A user roles
INSERT INTO user_roles (user_id, role_id, tenant_id, assigned_by) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000002', NULL), -- Carlos = Admin
('bbbbbbbb-bbbb-bbbb-bbbb-cccccccccccc', '22222222-2222-2222-2222-222222222222', '10000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-bbbbbbbbbbbb'), -- Paula = Gestor
('cccccccc-cccc-cccc-cccc-dddddddddddd', '33333333-3333-3333-3333-333333333333', '10000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-bbbbbbbbbbbb'); -- Roberto = Financeiro

-- Startup Beta user roles
INSERT INTO user_roles (user_id, role_id, tenant_id, assigned_by) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-dddddddddddd', '11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000003', NULL), -- Felipe = Admin
('bbbbbbbb-bbbb-bbbb-bbbb-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555', '10000000-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-dddddddddddd'); -- Julia = Dev

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
