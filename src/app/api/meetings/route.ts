import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { Meeting } from '@/types/entities';

/**
 * GET /api/meetings
 * List all meetings for the current tenant
 */
export async function GET(request: NextRequest) {
  try {
    const { tenantId } = await getTenantContext();
    const supabase = await createClient();
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('project_id');
    const minScore = searchParams.get('min_score');
    
    // Build query
    let query = supabase
      .from('meetings')
      .select(`
        *,
        related_project:projects(id, code, name)
      `)
      .eq('tenant_id', tenantId)
      .order('date', { ascending: false });
    
    // Apply filters
    if (projectId) {
      query = query.eq('related_project_id', projectId);
    }
    if (minScore) {
      query = query.gte('effectiveness_score', parseInt(minScore));
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching meetings:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    // Transform to camelCase for frontend
    const meetings: Meeting[] = (data || []).map((m: Record<string, unknown>) => {
      const relatedProject = m.related_project as { id: string; code: string; name: string } | null;
      
      return {
        id: m.id as string,
        tenantId: m.tenant_id as string,
        code: m.code as string,
        title: m.title as string,
        date: m.date as string,
        participants: m.participants as string[] | undefined,
        decisionsCount: (m.decisions_count as number) || 0,
        actionsCount: (m.actions_count as number) || 0,
        kaizensCount: (m.kaizens_count as number) || 0,
        blockersCount: (m.blockers_count as number) || 0,
        effectivenessScore: m.effectiveness_score as number | undefined,
        notes: m.notes as string | undefined,
        relatedProjectId: m.related_project_id as string | undefined,
        relatedProject: relatedProject ? {
          id: relatedProject.id,
          code: relatedProject.code,
          name: relatedProject.name,
        } : undefined,
        createdBy: m.created_by as string | undefined,
        createdAt: m.created_at as string,
        updatedAt: m.updated_at as string,
      };
    });
    
    return NextResponse.json({ success: true, data: meetings });
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
 * POST /api/meetings
 * Create a new meeting
 */
export async function POST(request: NextRequest) {
  try {
    const { tenantId, userId } = await getTenantContext();
    const supabase = await createClient();
    
    const body = await request.json();
    const {
      title,
      date,
      participants,
      decisionsCount = 0,
      actionsCount = 0,
      kaizensCount = 0,
      blockersCount = 0,
      notes,
      relatedProjectId,
    } = body;
    
    // Validation
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }
    
    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date is required' },
        { status: 400 }
      );
    }
    
    // Get project code if project is linked
    let projectCode = null;
    if (relatedProjectId) {
      const { data: projectData } = await supabase
        .from('projects')
        .select('code')
        .eq('id', relatedProjectId)
        .eq('tenant_id', tenantId)
        .single();
      
      if (projectData) {
        projectCode = projectData.code;
      }
    }
    
    // Generate meeting code
    const { data: codeData, error: codeError } = await supabase.rpc(
      'generate_meeting_code',
      { 
        p_tenant_id: tenantId,
        p_date: date,
        p_project_code: projectCode
      }
    );
    
    if (codeError) {
      console.error('Error generating meeting code:', codeError);
      return NextResponse.json(
        { success: false, error: 'Failed to generate meeting code' },
        { status: 500 }
      );
    }
    
    const code = codeData;
    
    // Insert meeting
    const { data: insertData, error: insertError } = await supabase
      .from('meetings')
      .insert({
        tenant_id: tenantId,
        code,
        title,
        date,
        participants,
        decisions_count: decisionsCount,
        actions_count: actionsCount,
        kaizens_count: kaizensCount,
        blockers_count: blockersCount,
        notes,
        related_project_id: relatedProjectId,
        created_by: userId,
      })
      .select(`
        *,
        related_project:projects(id, code, name)
      `)
      .single();
    
    if (insertError) {
      console.error('Error creating meeting:', insertError);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }
    
    // Transform to camelCase
    const newMeeting: Meeting = {
      id: insertData.id,
      tenantId: insertData.tenant_id,
      code: insertData.code,
      title: insertData.title,
      date: insertData.date,
      participants: insertData.participants,
      decisionsCount: insertData.decisions_count,
      actionsCount: insertData.actions_count,
      kaizensCount: insertData.kaizens_count,
      blockersCount: insertData.blockers_count,
      effectivenessScore: insertData.effectiveness_score,
      notes: insertData.notes,
      relatedProjectId: insertData.related_project_id,
      relatedProject: insertData.related_project ? {
        id: insertData.related_project.id,
        code: insertData.related_project.code,
        name: insertData.related_project.name,
      } : undefined,
      createdBy: insertData.created_by,
      createdAt: insertData.created_at,
      updatedAt: insertData.updated_at,
    };
    
    return NextResponse.json(
      { success: true, data: newMeeting },
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
