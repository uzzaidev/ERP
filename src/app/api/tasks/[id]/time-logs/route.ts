import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { handleApiError } from '@/lib/api-errors';

/**
 * GET /api/tasks/[id]/time-logs
 * List all time logs for a specific task
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenantId } = await getTenantContext();
    const supabase = await createClient();
    const { id: taskId } = await params;

    // First verify the task belongs to the tenant
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, tenant_id')
      .eq('id', taskId)
      .eq('tenant_id', tenantId)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { success: false, error: 'Task not found or access denied' },
        { status: 404 }
      );
    }

    // Fetch time logs with user information
    const { data: timeLogs, error } = await supabase
      .from('task_time_logs')
      .select(`
        id,
        task_id,
        user_id,
        hours,
        description,
        logged_date,
        created_at,
        user:users!task_time_logs_user_id_fkey (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('task_id', taskId)
      .eq('tenant_id', tenantId)
      .order('logged_date', { ascending: false });

    if (error) {
      console.error('Error fetching time logs:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: timeLogs });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/tasks/[id]/time-logs
 * Create a new time log entry for a task
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenantId, userId } = await getTenantContext();
    const supabase = await createClient();
    const { id: taskId } = await params;
    const body = await request.json();

    const { hours, description, logged_date } = body;

    // Validate required fields
    if (!hours || hours <= 0) {
      return NextResponse.json(
        { success: false, error: 'Hours must be greater than 0' },
        { status: 400 }
      );
    }

    if (hours > 24) {
      return NextResponse.json(
        { success: false, error: 'Hours cannot exceed 24 per day' },
        { status: 400 }
      );
    }

    // First verify the task belongs to the tenant
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, tenant_id')
      .eq('id', taskId)
      .eq('tenant_id', tenantId)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { success: false, error: 'Task not found or access denied' },
        { status: 404 }
      );
    }

    // Create the time log
    const { data: timeLog, error } = await supabase
      .from('task_time_logs')
      .insert({
        tenant_id: tenantId,
        task_id: taskId,
        user_id: userId,
        hours: parseFloat(hours),
        description: description || null,
        logged_date: logged_date || new Date().toISOString().split('T')[0]
      })
      .select(`
        id,
        task_id,
        user_id,
        hours,
        description,
        logged_date,
        created_at,
        user:users!task_time_logs_user_id_fkey (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating time log:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Update the task's completed_hours
    const { error: updateError } = await supabase.rpc('update_task_completed_hours', {
      p_task_id: taskId
    });

    if (updateError) {
      console.warn('Error updating task completed hours:', updateError);
      // Don't fail the request if this fails, it's a secondary operation
    }

    return NextResponse.json({ success: true, data: timeLog }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
