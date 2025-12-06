import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { Decision } from '@/types/entities';

/**
 * GET /api/decisions/[id]
 * Get a single decision by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenantId } = await getTenantContext();
    const supabase = await createClient();
    const { id } = await params;
    
    const { data, error } = await supabase
      .from('decisions')
      .select(`
        *,
        related_project:projects(id, code, name)
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();
    
    if (error) {
      console.error('Error fetching decision:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }
    
    // Transform to camelCase
    const decision: Decision = {
      id: data.id,
      tenantId: data.tenant_id,
      code: data.code,
      title: data.title,
      context: data.context,
      decision: data.decision,
      alternatives: data.alternatives,
      consequences: data.consequences,
      impact: data.impact,
      stakeholders: data.stakeholders,
      relatedTaskIds: data.related_task_ids,
      relatedProjectId: data.related_project_id,
      relatedProject: data.related_project ? {
        id: data.related_project.id,
        code: data.related_project.code,
        name: data.related_project.name,
      } : undefined,
      status: data.status,
      priority: data.priority,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      approvedAt: data.approved_at,
      approvedBy: data.approved_by,
    };
    
    return NextResponse.json({ success: true, data: decision });
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
 * PUT /api/decisions/[id]
 * Update a decision
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenantId, userId } = await getTenantContext();
    const supabase = await createClient();
    const { id } = await params;
    
    // First, verify the decision belongs to this tenant
    const { data: existing, error: fetchError } = await supabase
      .from('decisions')
      .select('tenant_id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Decision not found' },
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
      context,
      decision,
      alternatives,
      consequences,
      impact,
      stakeholders,
      relatedTaskIds,
      relatedProjectId,
      status,
      priority,
    } = body;
    
    // Build update object (only include provided fields)
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (context !== undefined) updateData.context = context;
    if (decision !== undefined) updateData.decision = decision;
    if (alternatives !== undefined) updateData.alternatives = alternatives;
    if (consequences !== undefined) updateData.consequences = consequences;
    if (impact !== undefined) updateData.impact = impact;
    if (stakeholders !== undefined) updateData.stakeholders = stakeholders;
    if (relatedTaskIds !== undefined) updateData.related_task_ids = relatedTaskIds;
    if (relatedProjectId !== undefined) updateData.related_project_id = relatedProjectId;
    if (status !== undefined) {
      updateData.status = status;
      // If status changed to approved, set approved_at and approved_by
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = userId;
      }
    }
    if (priority !== undefined) updateData.priority = priority;
    
    // Update decision
    const { data: updateResult, error: updateError } = await supabase
      .from('decisions')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select(`
        *,
        related_project:projects(id, code, name)
      `)
      .single();
    
    if (updateError) {
      console.error('Error updating decision:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }
    
    // Transform to camelCase
    const updatedDecision: Decision = {
      id: updateResult.id,
      tenantId: updateResult.tenant_id,
      code: updateResult.code,
      title: updateResult.title,
      context: updateResult.context,
      decision: updateResult.decision,
      alternatives: updateResult.alternatives,
      consequences: updateResult.consequences,
      impact: updateResult.impact,
      stakeholders: updateResult.stakeholders,
      relatedTaskIds: updateResult.related_task_ids,
      relatedProjectId: updateResult.related_project_id,
      relatedProject: updateResult.related_project ? {
        id: updateResult.related_project.id,
        code: updateResult.related_project.code,
        name: updateResult.related_project.name,
      } : undefined,
      status: updateResult.status,
      priority: updateResult.priority,
      createdBy: updateResult.created_by,
      createdAt: updateResult.created_at,
      updatedAt: updateResult.updated_at,
      approvedAt: updateResult.approved_at,
      approvedBy: updateResult.approved_by,
    };
    
    return NextResponse.json({ success: true, data: updatedDecision });
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
 * DELETE /api/decisions/[id]
 * Delete a decision
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenantId } = await getTenantContext();
    const supabase = await createClient();
    const { id } = await params;
    
    // First, verify the decision belongs to this tenant
    const { data: existing, error: fetchError } = await supabase
      .from('decisions')
      .select('tenant_id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Decision not found' },
        { status: 404 }
      );
    }
    
    if (existing.tenant_id !== tenantId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Delete decision
    const { error: deleteError } = await supabase
      .from('decisions')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    
    if (deleteError) {
      console.error('Error deleting decision:', deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Decision deleted successfully' });
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
