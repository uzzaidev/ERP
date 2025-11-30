import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
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
        )
      `);

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
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const { id, status, assignee_id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const updateData: { status?: string; assignee_id?: string | null } = {};
    if (status !== undefined) updateData.status = status;
    if (assignee_id !== undefined) updateData.assignee_id = assignee_id;

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
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
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
