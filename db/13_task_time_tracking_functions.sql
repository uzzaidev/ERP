-- ============================================
-- TASK TIME TRACKING FUNCTIONS
-- ============================================

-- Function to update task's completed_hours based on time logs
CREATE OR REPLACE FUNCTION update_task_completed_hours(p_task_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tasks
  SET completed_hours = (
    SELECT COALESCE(SUM(hours), 0)
    FROM task_time_logs
    WHERE task_id = p_task_id
  )
  WHERE id = p_task_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update completed_hours when time log is added/updated/deleted
CREATE OR REPLACE FUNCTION trigger_update_task_completed_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_task_completed_hours(OLD.task_id);
    RETURN OLD;
  ELSE
    PERFORM update_task_completed_hours(NEW.task_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS task_time_logs_update_completed_hours ON task_time_logs;

-- Create trigger on task_time_logs
CREATE TRIGGER task_time_logs_update_completed_hours
AFTER INSERT OR UPDATE OR DELETE ON task_time_logs
FOR EACH ROW
EXECUTE FUNCTION trigger_update_task_completed_hours();

-- ============================================
-- NOTES
-- ============================================
-- This migration creates:
-- 1. A function to recalculate and update task's completed_hours
-- 2. A trigger that automatically updates completed_hours when time logs change
-- 
-- This ensures that task.completed_hours is always in sync with the sum of time_logs.hours
