import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { handleApiError } from '@/lib/api-errors';

export async function GET(request: NextRequest) {
  try {
    // Get tenant context from authenticated session
    const { tenantId } = await getTenantContext();
    
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    
    const projectId = searchParams.get('project_id');
    const sprintId = searchParams.get('sprint_id');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assigned_to');

    let query = supabase
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
        task_tags (
          tag:tags (
            id,
            name,
            color
          )
        ),
        task_comments (
          id,
          author_id,
          content,
          created_at,
          author:users!task_comments_author_id_fkey (
            id,
            full_name,
            email
          )
        )
      `)
      .eq('tenant_id', tenantId);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    if (sprintId) {
      query = query.eq('sprint_id', sprintId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (assignedTo) {
      query = query.eq('assignee_id', assignedTo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
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

export async function POST(request: NextRequest) {
  try {
    // Get tenant context from authenticated session
    const { tenantId, userId } = await getTenantContext();
    
    const supabase = await createClient();
    const body = await request.json();
    
    const {
      title,
      description,
      status = 'backlog',
      priority = 'medium',
      task_type = 'feature',
      assignee_id,
      project_id,
      sprint_id,
      due_date,
      estimated_hours = 0,
      related_decision_ids,
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    // Generate task code (TASK-XXX format)
    // Get the count of tasks for this tenant to generate the next code
    const { count, error: countError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    if (countError) {
      console.error('Error counting tasks:', countError);
      return NextResponse.json(
        { success: false, error: 'Error generating task code' },
        { status: 500 }
      );
    }

    const taskNumber = (count || 0) + 1;
    const code = `TASK-${taskNumber.toString().padStart(3, '0')}`;

    // Prepare task data
    const taskData = {
      tenant_id: tenantId,
      code,
      title,
      description: description || null,
      status,
      priority,
      task_type,
      assignee_id: assignee_id || null,
      project_id: project_id || null,
      sprint_id: sprint_id || null,
      reporter_id: userId,
      due_date: due_date || null,
      estimated_hours: estimated_hours || 0,
      completed_hours: 0,
      related_decision_ids: related_decision_ids || null,
    };

    // Insert task into database
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
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
      console.error('Error creating task:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Get tenant context from authenticated session
    const { tenantId } = await getTenantContext();
    
    const supabase = await createClient();
    const body = await request.json();
    
    const { id, status, assignee_id, completed_hours } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      );
    }

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

    const updateData: { status?: string; assignee_id?: string | null; completed_hours?: number } = {};
    if (status !== undefined) updateData.status = status;
    if (assignee_id !== undefined) updateData.assignee_id = assignee_id;
    if (completed_hours !== undefined) updateData.completed_hours = completed_hours;

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
          name
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
