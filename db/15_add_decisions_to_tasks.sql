-- ============================================
-- ADD RELATED_DECISION_IDS TO TASKS TABLE
-- ============================================
-- Sprint 7 - Phase 3: Link ADRs to Tasks
-- Created: 2025-12-06
-- Purpose: Link tasks to architecture decisions (ADRs)

-- Add related_decision_ids column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS related_decision_ids UUID[];

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_related_decisions 
ON tasks USING GIN(related_decision_ids);

-- Add comment
COMMENT ON COLUMN tasks.related_decision_ids IS 'Array of decision UUIDs related to this task';
