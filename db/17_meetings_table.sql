-- ============================================
-- MEETINGS TABLE (Meeting Effectiveness Score System)
-- ============================================
-- Sprint 9 - Phase 3: Features Únicas
-- Created: 2025-12-06
-- Purpose: Track meetings with effectiveness scoring based on outputs

-- ============================================
-- DROP TABLE IF EXISTS
-- ============================================
DROP TABLE IF EXISTS meetings CASCADE;

-- ============================================
-- MEETINGS TABLE
-- ============================================
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Basic Information
    code VARCHAR(50) NOT NULL, -- MTG-2025-12-06-PROJECT
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    
    -- Participants (array of user IDs)
    participants UUID[],
    
    -- Meeting Outputs (counts)
    decisions_count INT DEFAULT 0,
    actions_count INT DEFAULT 0,
    kaizens_count INT DEFAULT 0,
    blockers_count INT DEFAULT 0,
    
    -- Effectiveness Score (auto-calculated)
    effectiveness_score INT, -- Formula: (decisions×12 + actions×8 + kaizens×15 + blockers×5) / 4
    
    -- Content
    notes TEXT,
    
    -- Relationships
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
CREATE INDEX idx_meetings_tenant_id ON meetings(tenant_id);
CREATE INDEX idx_meetings_date ON meetings(date DESC);
CREATE INDEX idx_meetings_effectiveness_score ON meetings(effectiveness_score DESC);
CREATE INDEX idx_meetings_related_project ON meetings(related_project_id);
CREATE INDEX idx_meetings_participants ON meetings USING GIN(participants);
CREATE INDEX idx_meetings_created_at ON meetings(created_at DESC);

-- ============================================
-- RLS (Row Level Security) POLICIES
-- ============================================
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Users can only see meetings from their tenant
CREATE POLICY meetings_tenant_isolation ON meetings
    FOR ALL
    USING (tenant_id IN (
        SELECT tenant_id FROM users WHERE id = auth.uid()
    ));

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_meetings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_meetings_updated_at
    BEFORE UPDATE ON meetings
    FOR EACH ROW
    EXECUTE FUNCTION update_meetings_updated_at();

-- ============================================
-- FUNCTION: Calculate Effectiveness Score
-- ============================================
CREATE OR REPLACE FUNCTION calculate_meeting_effectiveness_score(
    p_decisions_count INT,
    p_actions_count INT,
    p_kaizens_count INT,
    p_blockers_count INT
)
RETURNS INT AS $$
DECLARE
    v_score INT;
BEGIN
    -- Formula: (decisions×12 + actions×8 + kaizens×15 + blockers×5) / 4
    v_score := (
        (COALESCE(p_decisions_count, 0) * 12) +
        (COALESCE(p_actions_count, 0) * 8) +
        (COALESCE(p_kaizens_count, 0) * 15) +
        (COALESCE(p_blockers_count, 0) * 5)
    ) / 4;
    
    RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-calculate effectiveness score
-- ============================================
CREATE OR REPLACE FUNCTION update_meeting_effectiveness_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.effectiveness_score := calculate_meeting_effectiveness_score(
        NEW.decisions_count,
        NEW.actions_count,
        NEW.kaizens_count,
        NEW.blockers_count
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_meeting_effectiveness_score
    BEFORE INSERT OR UPDATE OF decisions_count, actions_count, kaizens_count, blockers_count
    ON meetings
    FOR EACH ROW
    EXECUTE FUNCTION update_meeting_effectiveness_score();

-- ============================================
-- FUNCTION: Generate Meeting Code
-- ============================================
CREATE OR REPLACE FUNCTION generate_meeting_code(
    p_tenant_id UUID,
    p_date DATE,
    p_project_code VARCHAR DEFAULT NULL
)
RETURNS VARCHAR(50) AS $$
DECLARE
    v_date_str VARCHAR(10);
    v_sequence INT;
    v_code VARCHAR(50);
BEGIN
    -- Format date as YYYY-MM-DD
    v_date_str := TO_CHAR(p_date, 'YYYY-MM-DD');
    
    -- Get next sequence number for this date
    SELECT COALESCE(MAX(
        CAST(
            SUBSTRING(code FROM 'MTG-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]+') AS INTEGER
        )
    ), 0) + 1
    INTO v_sequence
    FROM meetings
    WHERE tenant_id = p_tenant_id
      AND code LIKE 'MTG-' || v_date_str || '-%';
    
    -- Generate code: MTG-YYYY-MM-DD-NNN or MTG-YYYY-MM-DD-PROJECT-NNN
    IF p_project_code IS NOT NULL THEN
        v_code := 'MTG-' || v_date_str || '-' || p_project_code || '-' || LPAD(v_sequence::TEXT, 3, '0');
    ELSE
        v_code := 'MTG-' || v_date_str || '-' || LPAD(v_sequence::TEXT, 3, '0');
    END IF;
    
    RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- UPDATE kaizens TABLE
-- ============================================
-- Add foreign key to meetings (since kaizens table was created before meetings)
ALTER TABLE kaizens ADD CONSTRAINT fk_kaizens_meeting 
    FOREIGN KEY (related_meeting_id) REFERENCES meetings(id) ON DELETE SET NULL;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE meetings IS 'Meetings with effectiveness scoring based on outputs';
COMMENT ON COLUMN meetings.code IS 'Unique meeting identifier: MTG-YYYY-MM-DD-NNN';
COMMENT ON COLUMN meetings.participants IS 'Array of user UUIDs who participated';
COMMENT ON COLUMN meetings.effectiveness_score IS 'Auto-calculated: (decisions×12 + actions×8 + kaizens×15 + blockers×5) / 4';
COMMENT ON COLUMN meetings.decisions_count IS 'Number of decisions made in this meeting';
COMMENT ON COLUMN meetings.actions_count IS 'Number of action items created in this meeting';
COMMENT ON COLUMN meetings.kaizens_count IS 'Number of kaizens captured in this meeting';
COMMENT ON COLUMN meetings.blockers_count IS 'Number of blockers identified in this meeting';

-- ============================================
-- SAMPLE DATA (for development/testing)
-- ============================================
-- This section can be uncommented for local testing
-- INSERT INTO meetings (tenant_id, code, title, date, decisions_count, actions_count, kaizens_count, blockers_count, created_by)
-- VALUES (
--     '00000000-0000-0000-0000-000000000001',
--     'MTG-2025-12-06-001',
--     'Sprint Planning - Q4 2025',
--     '2025-12-06',
--     3, -- 3 decisions
--     5, -- 5 action items
--     2, -- 2 kaizens
--     1, -- 1 blocker
--     '00000000-0000-0000-0000-000000000001'
-- );
-- The effectiveness score will be auto-calculated: (3×12 + 5×8 + 2×15 + 1×5) / 4 = 111 / 4 = 27
