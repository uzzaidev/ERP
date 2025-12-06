import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { handleApiError } from '@/lib/api-errors';

/**
 * GET /api/tasks/[id]/comments
 * List all comments for a specific task
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

    // Fetch comments with author information
    const { data: comments, error } = await supabase
      .from('task_comments')
      .select(`
        id,
        tenant_id,
        task_id,
        author_id,
        content,
        mentions,
        created_at,
        updated_at,
        author:users!task_comments_author_id_fkey (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('task_id', taskId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Transform to camelCase for frontend
    const transformedComments = comments.map(comment => ({
      id: comment.id,
      tenantId: comment.tenant_id,
      taskId: comment.task_id,
      authorId: comment.author_id,
      author: Array.isArray(comment.author) ? comment.author[0] : comment.author,
      content: comment.content,
      mentions: comment.mentions,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
    }));

    return NextResponse.json({ success: true, data: transformedComments });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/tasks/[id]/comments
 * Create a new comment on a task
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

    const { content, mentions } = body;

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment content is required' },
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

    // Create the comment
    const { data: comment, error } = await supabase
      .from('task_comments')
      .insert({
        tenant_id: tenantId,
        task_id: taskId,
        author_id: userId,
        content: content.trim(),
        mentions: mentions || []
      })
      .select(`
        id,
        tenant_id,
        task_id,
        author_id,
        content,
        mentions,
        created_at,
        updated_at,
        author:users!task_comments_author_id_fkey (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Transform to camelCase for frontend
    const transformedComment = {
      id: comment.id,
      tenantId: comment.tenant_id,
      taskId: comment.task_id,
      authorId: comment.author_id,
      author: Array.isArray(comment.author) ? comment.author[0] : comment.author,
      content: comment.content,
      mentions: comment.mentions,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
    };

    return NextResponse.json({ success: true, data: transformedComment }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
