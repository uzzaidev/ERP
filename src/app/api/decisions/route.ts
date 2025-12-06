import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { Decision } from '@/types/entities';

/**
 * GET /api/decisions
 * List all decisions for the current tenant
 */
export async function GET(request: NextRequest) {
  try {
    const { tenantId } = await getTenantContext();
    const supabase = await createClient();
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const projectId = searchParams.get('project_id');
    
    // Build query
    let query = supabase
      .from('decisions')
      .select(`
        *,
        related_project:projects(id, code, name)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }
    if (projectId) {
      query = query.eq('related_project_id', projectId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching decisions:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    // Transform to camelCase for frontend
    const decisions: Decision[] = (data || []).map((d: any) => ({
      id: d.id,
      tenantId: d.tenant_id,
      code: d.code,
      title: d.title,
      context: d.context,
      decision: d.decision,
      alternatives: d.alternatives,
      consequences: d.consequences,
      impact: d.impact,
      stakeholders: d.stakeholders,
      relatedTaskIds: d.related_task_ids,
      relatedProjectId: d.related_project_id,
      relatedProject: d.related_project ? {
        id: d.related_project.id,
        code: d.related_project.code,
        name: d.related_project.name,
      } : undefined,
      status: d.status,
      priority: d.priority,
      createdBy: d.created_by,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      approvedAt: d.approved_at,
      approvedBy: d.approved_by,
    }));
    
    return NextResponse.json({ success: true, data: decisions });
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
 * POST /api/decisions
 * Create a new decision
 */
export async function POST(request: NextRequest) {
  try {
    const { tenantId, userId } = await getTenantContext();
    const supabase = await createClient();
    
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
      status = 'draft',
      priority = 'medium',
    } = body;
    
    // Validation
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }
    
    // Generate decision code
    const { data: codeData, error: codeError } = await supabase.rpc(
      'generate_decision_code',
      { p_tenant_id: tenantId }
    );
    
    if (codeError) {
      console.error('Error generating decision code:', codeError);
      return NextResponse.json(
        { success: false, error: 'Failed to generate decision code' },
        { status: 500 }
      );
    }
    
    const code = codeData;
    
    // Insert decision
    const { data: insertData, error: insertError } = await supabase
      .from('decisions')
      .insert({
        tenant_id: tenantId,
        code,
        title,
        context,
        decision,
        alternatives,
        consequences,
        impact,
        stakeholders,
        related_task_ids: relatedTaskIds,
        related_project_id: relatedProjectId,
        status,
        priority,
        created_by: userId,
      })
      .select(`
        *,
        related_project:projects(id, code, name)
      `)
      .single();
    
    if (insertError) {
      console.error('Error creating decision:', insertError);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }
    
    // Transform to camelCase
    const newDecision: Decision = {
      id: insertData.id,
      tenantId: insertData.tenant_id,
      code: insertData.code,
      title: insertData.title,
      context: insertData.context,
      decision: insertData.decision,
      alternatives: insertData.alternatives,
      consequences: insertData.consequences,
      impact: insertData.impact,
      stakeholders: insertData.stakeholders,
      relatedTaskIds: insertData.related_task_ids,
      relatedProjectId: insertData.related_project_id,
      relatedProject: insertData.related_project ? {
        id: insertData.related_project.id,
        code: insertData.related_project.code,
        name: insertData.related_project.name,
      } : undefined,
      status: insertData.status,
      priority: insertData.priority,
      createdBy: insertData.created_by,
      createdAt: insertData.created_at,
      updatedAt: insertData.updated_at,
      approvedAt: insertData.approved_at,
      approvedBy: insertData.approved_by,
    };
    
    return NextResponse.json(
      { success: true, data: newDecision },
      { status: 201 }
    );
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
