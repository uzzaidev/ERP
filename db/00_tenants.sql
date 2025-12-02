-- ============================================
-- MULTI-TENANT FOUNDATION MODULE
-- ============================================
-- This module must be executed FIRST before all other modules
-- It creates the tenant (company) infrastructure for multi-tenancy

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP TABLES IF EXIST (in reverse dependency order)
-- ============================================
DROP TABLE IF EXISTS tenant_invitations CASCADE;
DROP TABLE IF EXISTS tenant_usage_stats CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- ============================================
-- TENANTS TABLE (Companies)
-- ============================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- URL-friendly identifier
    document VARCHAR(50), -- CNPJ/Tax ID
    email VARCHAR(255),
    phone VARCHAR(20),
    
    -- Address
    address_street VARCHAR(255),
    address_number VARCHAR(20),
    address_complement VARCHAR(100),
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100),
    address_state VARCHAR(50),
    address_zip VARCHAR(20),
    address_country VARCHAR(3) DEFAULT 'BRA',
    
    -- Branding
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#1ABC9C',
    secondary_color VARCHAR(7) DEFAULT '#0F172A',
    
    -- Settings
    currency VARCHAR(3) DEFAULT 'BRL',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    language VARCHAR(10) DEFAULT 'pt-BR',
    fiscal_year_start_month INTEGER DEFAULT 1,
    
    -- Subscription/Status
    plan VARCHAR(50) DEFAULT 'trial', -- trial, basic, professional, enterprise
    status VARCHAR(50) DEFAULT 'active', -- active, suspended, cancelled
    trial_ends_at TIMESTAMP,
    subscription_ends_at TIMESTAMP,
    
    -- Limits based on plan
    max_users INTEGER DEFAULT 5,
    max_projects INTEGER DEFAULT 10,
    storage_limit_mb INTEGER DEFAULT 1000,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID, -- Will reference users(id) after users table is created
    
    -- Constraints
    CONSTRAINT check_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
    CONSTRAINT check_plan CHECK (plan IN ('trial', 'basic', 'professional', 'enterprise')),
    CONSTRAINT check_status CHECK (status IN ('active', 'suspended', 'cancelled'))
);

-- ============================================
-- TENANT_INVITATIONS TABLE
-- ============================================
CREATE TABLE tenant_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role_id UUID, -- Will reference roles(id) after roles table is created
    role_name VARCHAR(50) NOT NULL, -- Stored for reference: admin, gestor, financeiro, etc.
    
    -- Invitation details
    token VARCHAR(255) UNIQUE NOT NULL, -- Unique token for invitation link
    invited_by UUID, -- Will reference users(id)
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, expired, cancelled
    accepted_at TIMESTAMP,
    accepted_by UUID, -- Will reference users(id)
    expires_at TIMESTAMP NOT NULL,
    
    -- Metadata
    message TEXT, -- Optional message from inviter
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_invitation_status CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    UNIQUE(tenant_id, email, status) -- Prevent duplicate pending invitations
);

-- ============================================
-- TENANT_USAGE_STATS TABLE (for tracking limits)
-- ============================================
CREATE TABLE tenant_usage_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Current usage
    users_count INTEGER DEFAULT 0,
    projects_count INTEGER DEFAULT 0,
    tasks_count INTEGER DEFAULT 0,
    storage_used_mb DECIMAL(15,2) DEFAULT 0,
    
    -- Last calculated
    last_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_created_at ON tenants(created_at);

CREATE INDEX idx_tenant_invitations_tenant_id ON tenant_invitations(tenant_id);
CREATE INDEX idx_tenant_invitations_email ON tenant_invitations(email);
CREATE INDEX idx_tenant_invitations_token ON tenant_invitations(token);
CREATE INDEX idx_tenant_invitations_status ON tenant_invitations(status);
CREATE INDEX idx_tenant_invitations_expires_at ON tenant_invitations(expires_at);

CREATE INDEX idx_tenant_usage_stats_tenant_id ON tenant_usage_stats(tenant_id);

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

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_invitations_updated_at BEFORE UPDATE ON tenant_invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_usage_stats_updated_at BEFORE UPDATE ON tenant_usage_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION TO GENERATE INVITATION TOKEN
-- ============================================
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS VARCHAR(255) AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION TO CHECK TENANT LIMITS
-- ============================================
CREATE OR REPLACE FUNCTION check_tenant_user_limit(p_tenant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_max_users INTEGER;
    v_current_users INTEGER;
BEGIN
    -- Get max users allowed for tenant
    SELECT max_users INTO v_max_users
    FROM tenants
    WHERE id = p_tenant_id;
    
    -- Get current user count
    SELECT users_count INTO v_current_users
    FROM tenant_usage_stats
    WHERE tenant_id = p_tenant_id;
    
    -- Return true if under limit
    RETURN (v_current_users < v_max_users);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- MOCK DATA - TENANTS
-- ============================================
-- Creating sample companies for testing
INSERT INTO tenants (id, name, slug, document, email, phone, plan, status, max_users, max_projects) VALUES
('10000000-0000-0000-0000-000000000001', 'UzzAI Technologies', 'uzzai-tech', '12.345.678/0001-90', 'contato@uzzai.dev', '+55 47 99999-0001', 'enterprise', 'active', 50, 100),
('10000000-0000-0000-0000-000000000002', 'Empresa Demo A', 'empresa-demo-a', '98.765.432/0001-10', 'contato@empresaa.com.br', '+55 11 98888-0001', 'professional', 'active', 20, 50),
('10000000-0000-0000-0000-000000000003', 'Startup Beta', 'startup-beta', '11.222.333/0001-44', 'contato@startupbeta.io', '+55 21 97777-0001', 'basic', 'active', 10, 20);

-- ============================================
-- MOCK DATA - TENANT USAGE STATS
-- ============================================
INSERT INTO tenant_usage_stats (tenant_id, users_count, projects_count, tasks_count, storage_used_mb) VALUES
('10000000-0000-0000-0000-000000000001', 5, 3, 10, 250.5),
('10000000-0000-0000-0000-000000000002', 3, 2, 5, 100.0),
('10000000-0000-0000-0000-000000000003', 2, 1, 3, 50.0);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE tenants IS 'Stores company/organization information for multi-tenancy';
COMMENT ON TABLE tenant_invitations IS 'Manages user invitations to join a tenant with specific role';
COMMENT ON TABLE tenant_usage_stats IS 'Tracks usage metrics for enforcing tenant limits';
COMMENT ON COLUMN tenants.slug IS 'URL-friendly unique identifier for the tenant';
COMMENT ON COLUMN tenants.plan IS 'Subscription plan: trial, basic, professional, enterprise';
COMMENT ON COLUMN tenant_invitations.token IS 'Unique token used in invitation link';
COMMENT ON COLUMN tenant_invitations.role_name IS 'Role to be assigned when invitation is accepted';
