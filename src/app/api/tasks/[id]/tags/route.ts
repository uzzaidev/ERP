import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { handleApiError } from '@/lib/api-errors';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: taskId } = await context.params;
    const { tenantId } = await getTenantContext();

    const supabase = await createClient();
    const body = await request.json();
    const { tag_id } = body;

    if (!tag_id) {
      return NextResponse.json(
        { success: false, error: 'ID da tag é obrigatório' },
        { status: 400 }
      );
    }

    // Verify task belongs to tenant
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', taskId)
      .eq('tenant_id', tenantId)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { success: false, error: 'Tarefa não encontrada' },
        { status: 404 }
      );
    }

    // Verify tag belongs to tenant
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .select('id')
      .eq('id', tag_id)
      .eq('tenant_id', tenantId)
      .single();

    if (tagError || !tag) {
      return NextResponse.json(
        { success: false, error: 'Tag não encontrada' },
        { status: 404 }
      );
    }

    // Check if tag already assigned to task
    const { data: existing } = await supabase
      .from('task_tags')
      .select('id')
      .eq('task_id', taskId)
      .eq('tag_id', tag_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Tag já está associada a esta tarefa' },
        { status: 400 }
      );
    }

    // Add tag to task
    const { data, error: insertError } = await supabase
      .from('task_tags')
      .insert({
        tenant_id: tenantId,
        task_id: taskId,
        tag_id: tag_id,
      })
      .select(`
        id,
        tag:tags (
          id,
          name,
          color
        )
      `)
      .single();

    if (insertError) {
      console.error('Error adding tag to task:', insertError);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: taskId } = await context.params;
    const { tenantId } = await getTenantContext();

    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const tagId = searchParams.get('tag_id');

    if (!tagId) {
      return NextResponse.json(
        { success: false, error: 'ID da tag é obrigatório' },
        { status: 400 }
      );
    }

    // Delete task_tag association
    const { error: deleteError } = await supabase
      .from('task_tags')
      .delete()
      .eq('task_id', taskId)
      .eq('tag_id', tagId)
      .eq('tenant_id', tenantId);

    if (deleteError) {
      console.error('Error removing tag from task:', deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tag removida da tarefa',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
