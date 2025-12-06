import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { handleApiError } from '@/lib/api-errors';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const { tenantId } = await getTenantContext();
    
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        project:projects (
          id,
          code,
          name
        ),
        sprint:sprints (
          id,
          name,
          start_date,
          end_date
        ),
        assignee:users!tasks_assignee_id_fkey (
          id,
          full_name,
          email,
          avatar_url
        ),
        reporter:users!tasks_reporter_id_fkey (
          id,
          full_name,
          email
        ),
        task_tags (
          tag:tags (
            id,
            name,
            color
          )
        )
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      console.error('Error fetching task:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const { tenantId } = await getTenantContext();
    
    const supabase = await createClient();
    const body = await request.json();
    
    const {
      title,
      description,
      status,
      priority,
      task_type,
      assignee_id,
      project_id,
      sprint_id,
      due_date,
      estimated_hours,
      related_decision_ids,
    } = body;

    // First, verify the task belongs to the user's tenant
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('tenant_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingTask) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    if (existingTask.tenant_id !== tenantId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (task_type !== undefined) updateData.task_type = task_type;
    if (assignee_id !== undefined) updateData.assignee_id = assignee_id || null;
    if (project_id !== undefined) updateData.project_id = project_id || null;
    if (sprint_id !== undefined) updateData.sprint_id = sprint_id || null;
    if (due_date !== undefined) updateData.due_date = due_date || null;
    if (estimated_hours !== undefined) updateData.estimated_hours = estimated_hours;
    if (related_decision_ids !== undefined) updateData.related_decision_ids = related_decision_ids || null;

    // Update task
    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select(`
        *,
        project:projects (
          id,
          code,
          name
        ),
        sprint:sprints (
          id,
          name,
          start_date,
          end_date
        ),
        assignee:users!tasks_assignee_id_fkey (
          id,
          full_name,
          email,
          avatar_url
        ),
        reporter:users!tasks_reporter_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const { tenantId } = await getTenantContext();

    const supabase = await createClient();
    const body = await request.json();

    // First, verify the task belongs to the user's tenant
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('tenant_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingTask) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    if (existingTask.tenant_id !== tenantId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Build update object for partial updates
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.assignee_id !== undefined) updateData.assignee_id = body.assignee_id || null;
    if (body.completed_hours !== undefined) updateData.completed_hours = body.completed_hours;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.due_date !== undefined) updateData.due_date = body.due_date || null;
    if (body.estimated_hours !== undefined) updateData.estimated_hours = body.estimated_hours;

    // Update task
    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select(`
        *,
        project:projects (
          id,
          code,
          name
        ),
        sprint:sprints (
          id,
          name,
          start_date,
          end_date
        ),
        assignee:users!tasks_assignee_id_fkey (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const { tenantId } = await getTenantContext();

    const supabase = await createClient();

    // First, verify the task belongs to the user's tenant
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('tenant_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingTask) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    if (existingTask.tenant_id !== tenantId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete task (hard delete - consider soft delete in production)
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('Error deleting task:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
