import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { Kaizen } from '@/types/entities';

/**
 * PUT /api/kaizens/:id
 * Update a kaizen
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenantId, userId } = await getTenantContext();
    const supabase = await createClient();
    const { id } = await params;
    
    // Verify kaizen exists and belongs to tenant
    const { data: existing, error: fetchError } = await supabase
      .from('kaizens')
      .select('tenant_id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Kaizen not found' },
        { status: 404 }
      );
    }
    
    if (existing.tenant_id !== tenantId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const {
      title,
      category,
      context,
      learning,
      goldenRule,
      application,
      relatedTaskId,
      relatedMeetingId,
      relatedProjectId,
    } = body;
    
    // Validate category if provided
    if (category) {
      const validCategories = ['technical', 'process', 'strategic', 'cultural'];
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { success: false, error: 'Invalid category' },
          { status: 400 }
        );
      }
    }
    
    // Update kaizen
    const { data: updateData, error: updateError } = await supabase
      .from('kaizens')
      .update({
        title,
        category,
        context,
        learning,
        golden_rule: goldenRule,
        application,
        related_task_id: relatedTaskId,
        related_meeting_id: relatedMeetingId,
        related_project_id: relatedProjectId,
      })
      .eq('id', id)
      .select(`
        *,
        related_project:projects(id, code, name)
      `)
      .single();
    
    if (updateError) {
      console.error('Error updating kaizen:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }
    
    // Transform to camelCase
    const updatedKaizen: Kaizen = {
      id: updateData.id,
      tenantId: updateData.tenant_id,
      code: updateData.code,
      title: updateData.title,
      category: updateData.category,
      context: updateData.context,
      learning: updateData.learning,
      goldenRule: updateData.golden_rule,
      application: updateData.application,
      relatedTaskId: updateData.related_task_id,
      relatedMeetingId: updateData.related_meeting_id,
      relatedProjectId: updateData.related_project_id,
      relatedProject: updateData.related_project ? {
        id: updateData.related_project.id,
        code: updateData.related_project.code,
        name: updateData.related_project.name,
      } : undefined,
      createdBy: updateData.created_by,
      createdAt: updateData.created_at,
      updatedAt: updateData.updated_at,
    };
    
    return NextResponse.json({ success: true, data: updatedKaizen });
  } catch (error) {
    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/kaizens/:id
 * Delete a kaizen
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenantId } = await getTenantContext();
    const supabase = await createClient();
    const { id } = await params;
    
    // Verify kaizen exists and belongs to tenant
    const { data: existing, error: fetchError } = await supabase
      .from('kaizens')
      .select('tenant_id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Kaizen not found' },
        { status: 404 }
      );
    }
    
    if (existing.tenant_id !== tenantId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Delete kaizen (hard delete, not soft)
    const { error: deleteError } = await supabase
      .from('kaizens')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Error deleting kaizen:', deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
