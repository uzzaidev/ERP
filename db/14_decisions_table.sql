-- ============================================
-- DECISIONS TABLE (ADRs - Architecture Decision Records)
-- ============================================
-- Sprint 7 - Phase 3: Features Únicas
-- Created: 2025-12-06
-- Purpose: Track architecture and business decisions with full context

-- ============================================
-- DROP TABLE IF EXISTS
-- ============================================
DROP TABLE IF EXISTS decisions CASCADE;

-- ============================================
-- DECISIONS TABLE
-- ============================================
CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Basic Information
    code VARCHAR(50) NOT NULL, -- D-2025-001, D-2025-002, etc.
    title VARCHAR(255) NOT NULL,
    
    -- Decision Context
    context TEXT, -- Why was this decision needed? What problem are we solving?
    decision TEXT, -- What was decided?
    
    -- Analysis
    alternatives JSONB, -- Array of alternatives considered: [{option, pros[], cons[]}]
    consequences JSONB, -- Expected outcomes: {benefits[], trade_offs[], reversibility}
    impact JSONB, -- Impact assessment: {cost, timeline, quality, technical_debt}
    
    -- Stakeholders
    stakeholders JSONB, -- Who was involved: {decided_by, consulted[], informed[]}
    
    -- Relationships
    related_task_ids UUID[], -- Tasks related to this decision
    related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Status & Priority
    status VARCHAR(50) DEFAULT 'draft', -- draft, approved, implemented, deprecated, superseded
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    
    -- Metadata
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Unique code per tenant
    UNIQUE(tenant_id, code)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_decisions_tenant_id ON decisions(tenant_id);
CREATE INDEX idx_decisions_status ON decisions(status);
CREATE INDEX idx_decisions_priority ON decisions(priority);
CREATE INDEX idx_decisions_created_by ON decisions(created_by);
CREATE INDEX idx_decisions_related_project ON decisions(related_project_id);
CREATE INDEX idx_decisions_related_tasks ON decisions USING GIN(related_task_ids);
CREATE INDEX idx_decisions_created_at ON decisions(created_at DESC);

-- ============================================
-- RLS (Row Level Security) POLICIES
-- ============================================
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

-- Users can only see decisions from their tenant
CREATE POLICY decisions_tenant_isolation ON decisions
    FOR ALL
    USING (tenant_id IN (
        SELECT tenant_id FROM users WHERE id = auth.uid()
    ));

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_decisions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decisions_updated_at
    BEFORE UPDATE ON decisions
    FOR EACH ROW
    EXECUTE FUNCTION update_decisions_updated_at();

-- ============================================
-- FUNCTION: Generate Decision Code
-- ============================================
CREATE OR REPLACE FUNCTION generate_decision_code(p_tenant_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    v_year INT;
    v_sequence INT;
    v_code VARCHAR(50);
BEGIN
    -- Get current year
    v_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(
        CAST(
            SUBSTRING(code FROM 'D-[0-9]{4}-([0-9]+)') AS INTEGER
        )
    ), 0) + 1
    INTO v_sequence
    FROM decisions
    WHERE tenant_id = p_tenant_id
      AND code LIKE 'D-' || v_year || '-%';
    
    -- Generate code: D-YYYY-NNN
    v_code := 'D-' || v_year || '-' || LPAD(v_sequence::TEXT, 3, '0');
    
    RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE decisions IS 'Architecture Decision Records (ADRs) - Track important decisions with full context';
COMMENT ON COLUMN decisions.code IS 'Unique decision identifier: D-YYYY-NNN';
COMMENT ON COLUMN decisions.alternatives IS 'JSON array of alternatives: [{option, pros[], cons[]}]';
COMMENT ON COLUMN decisions.consequences IS 'JSON object: {benefits[], trade_offs[], reversibility}';
COMMENT ON COLUMN decisions.impact IS 'JSON object: {cost, timeline, quality, technical_debt}';
COMMENT ON COLUMN decisions.stakeholders IS 'JSON object: {decided_by, consulted[], informed[]}';
COMMENT ON COLUMN decisions.related_task_ids IS 'Array of task UUIDs related to this decision';

-- ============================================
-- SAMPLE DATA (for development/testing)
-- ============================================
-- This section can be uncommented for local testing
-- INSERT INTO decisions (tenant_id, code, title, context, decision, status, created_by)
-- VALUES (
--     '00000000-0000-0000-0000-000000000001',
--     'D-2025-001',
--     'Escolha de Banco de Dados',
--     'Precisamos escolher um banco de dados escalável para o sistema ERP',
--     'Decidimos usar PostgreSQL com Supabase devido à robustez e suporte a JSONB',
--     'approved',
--     '00000000-0000-0000-0000-000000000001'
-- );
