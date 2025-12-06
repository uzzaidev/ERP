import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { MeetingEffectiveness as Meeting } from '@/types/entities';

/**
 * PUT /api/meetings/:id
 * Update a meeting
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenantId } = await getTenantContext();
    const supabase = await createClient();
    const { id } = await params;
    
    // Verify meeting exists and belongs to tenant
    const { data: existing, error: fetchError } = await supabase
      .from('meetings')
      .select('tenant_id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Meeting not found' },
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
      date,
      participants,
      decisionsCount,
      actionsCount,
      kaizensCount,
      blockersCount,
      notes,
      relatedProjectId,
    } = body;
    
    // Update meeting
    const { data: updateData, error: updateError } = await supabase
      .from('meetings')
      .update({
        title,
        date,
        participants,
        decisions_count: decisionsCount,
        actions_count: actionsCount,
        kaizens_count: kaizensCount,
        blockers_count: blockersCount,
        notes,
        related_project_id: relatedProjectId,
      })
      .eq('id', id)
      .select(`
        *,
        related_project:projects(id, code, name)
      `)
      .single();
    
    if (updateError) {
      console.error('Error updating meeting:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }
    
    // Transform to camelCase
    const updatedMeeting: Meeting = {
      id: updateData.id,
      tenantId: updateData.tenant_id,
      code: updateData.code,
      title: updateData.title,
      date: updateData.date,
      participants: updateData.participants,
      decisionsCount: updateData.decisions_count,
      actionsCount: updateData.actions_count,
      kaizensCount: updateData.kaizens_count,
      blockersCount: updateData.blockers_count,
      effectivenessScore: updateData.effectiveness_score,
      notes: updateData.notes,
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
    
    return NextResponse.json({ success: true, data: updatedMeeting });
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
 * DELETE /api/meetings/:id
 * Delete a meeting
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenantId } = await getTenantContext();
    const supabase = await createClient();
    const { id } = await params;
    
    // Verify meeting exists and belongs to tenant
    const { data: existing, error: fetchError } = await supabase
      .from('meetings')
      .select('tenant_id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Meeting not found' },
        { status: 404 }
      );
    }
    
    if (existing.tenant_id !== tenantId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Delete meeting (hard delete)
    const { error: deleteError } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Error deleting meeting:', deleteError);
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
