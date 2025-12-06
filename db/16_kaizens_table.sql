-- ============================================
-- KAIZENS TABLE (Continuous Improvement System)
-- ============================================
-- Sprint 8 - Phase 3: Features Únicas
-- Created: 2025-12-06
-- Purpose: Track kaizens (learnings/improvements) by category

-- ============================================
-- DROP TABLE IF EXISTS
-- ============================================
DROP TABLE IF EXISTS kaizens CASCADE;

-- ============================================
-- KAIZENS TABLE
-- ============================================
CREATE TABLE kaizens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Basic Information
    code VARCHAR(50) NOT NULL, -- K-T-001 (T=technical), K-P-001 (P=process), etc.
    title VARCHAR(255) NOT NULL,
    
    -- Category
    category VARCHAR(50) NOT NULL, -- technical, process, strategic, cultural
    
    -- Kaizen Content
    context TEXT, -- What was the situation?
    learning JSONB, -- {do: [], avoid: [], adjust: []}
    golden_rule TEXT, -- Key takeaway/principle
    application TEXT, -- How to apply this learning
    
    -- Relationships
    related_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    related_meeting_id UUID, -- Will reference meetings table when created
    related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Metadata
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique code per tenant
    UNIQUE(tenant_id, code)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_kaizens_tenant_id ON kaizens(tenant_id);
CREATE INDEX idx_kaizens_category ON kaizens(category);
CREATE INDEX idx_kaizens_created_by ON kaizens(created_by);
CREATE INDEX idx_kaizens_related_task ON kaizens(related_task_id);
CREATE INDEX idx_kaizens_related_project ON kaizens(related_project_id);
CREATE INDEX idx_kaizens_created_at ON kaizens(created_at DESC);

-- ============================================
-- RLS (Row Level Security) POLICIES
-- ============================================
ALTER TABLE kaizens ENABLE ROW LEVEL SECURITY;

-- Users can only see kaizens from their tenant
CREATE POLICY kaizens_tenant_isolation ON kaizens
    FOR ALL
    USING (tenant_id IN (
        SELECT tenant_id FROM users WHERE id = auth.uid()
    ));

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_kaizens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_kaizens_updated_at
    BEFORE UPDATE ON kaizens
    FOR EACH ROW
    EXECUTE FUNCTION update_kaizens_updated_at();

-- ============================================
-- FUNCTION: Generate Kaizen Code
-- ============================================
CREATE OR REPLACE FUNCTION generate_kaizen_code(p_tenant_id UUID, p_category VARCHAR)
RETURNS VARCHAR(50) AS $$
DECLARE
    v_category_prefix CHAR(1);
    v_sequence INT;
    v_code VARCHAR(50);
BEGIN
    -- Get category prefix: T=technical, P=process, S=strategic, C=cultural
    v_category_prefix := CASE 
        WHEN p_category = 'technical' THEN 'T'
        WHEN p_category = 'process' THEN 'P'
        WHEN p_category = 'strategic' THEN 'S'
        WHEN p_category = 'cultural' THEN 'C'
        ELSE 'X'
    END;
    
    -- Get next sequence number for this category
    SELECT COALESCE(MAX(
        CAST(
            SUBSTRING(code FROM 'K-[A-Z]-([0-9]+)') AS INTEGER
        )
    ), 0) + 1
    INTO v_sequence
    FROM kaizens
    WHERE tenant_id = p_tenant_id
      AND code LIKE 'K-' || v_category_prefix || '-%';
    
    -- Generate code: K-X-NNN
    v_code := 'K-' || v_category_prefix || '-' || LPAD(v_sequence::TEXT, 3, '0');
    
    RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE kaizens IS 'Kaizens (continuous improvement learnings) by category';
COMMENT ON COLUMN kaizens.code IS 'Unique kaizen identifier: K-{category}-NNN';
COMMENT ON COLUMN kaizens.category IS 'Category: technical, process, strategic, cultural';
COMMENT ON COLUMN kaizens.learning IS 'JSON object: {do: [], avoid: [], adjust: []}';
COMMENT ON COLUMN kaizens.golden_rule IS 'Key principle or takeaway from this kaizen';
COMMENT ON COLUMN kaizens.application IS 'How to apply this learning in practice';

-- ============================================
-- SAMPLE DATA (for development/testing)
-- ============================================
-- This section can be uncommented for local testing
-- INSERT INTO kaizens (tenant_id, code, title, category, context, golden_rule, created_by)
-- VALUES (
--     '00000000-0000-0000-0000-000000000001',
--     'K-T-001',
--     'Always use TypeScript for better type safety',
--     'technical',
--     'After refactoring a module, we found many runtime bugs that could have been caught at compile time',
--     'Type safety prevents runtime errors and makes code more maintainable',
--     '00000000-0000-0000-0000-000000000001'
-- );
