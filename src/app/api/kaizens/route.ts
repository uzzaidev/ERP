import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { KaizenImprovement as Kaizen } from '@/types/entities';

/**
 * GET /api/kaizens
 * List all kaizens for the current tenant
 */
export async function GET(request: NextRequest) {
  try {
    const { tenantId } = await getTenantContext();
    const supabase = await createClient();
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const projectId = searchParams.get('project_id');
    
    // Build query
    let query = supabase
      .from('kaizens')
      .select(`
        *,
        related_project:projects(id, code, name)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    if (projectId) {
      query = query.eq('related_project_id', projectId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching kaizens:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    // Transform to camelCase for frontend
    const kaizens: Kaizen[] = (data || []).map((k: Record<string, unknown>) => {
      const relatedProject = k.related_project as { id: string; code: string; name: string } | null;
      
      return {
        id: k.id as string,
        tenantId: k.tenant_id as string,
        code: k.code as string,
        title: k.title as string,
        category: k.category as Kaizen['category'],
        context: k.context as string | undefined,
        learning: k.learning as Kaizen['learning'],
        goldenRule: k.golden_rule as string | undefined,
        application: k.application as string | undefined,
        relatedTaskId: k.related_task_id as string | undefined,
        relatedMeetingId: k.related_meeting_id as string | undefined,
        relatedProjectId: k.related_project_id as string | undefined,
        relatedProject: relatedProject ? {
          id: relatedProject.id,
          code: relatedProject.code,
          name: relatedProject.name,
        } : undefined,
        createdBy: k.created_by as string | undefined,
        createdAt: k.created_at as string,
        updatedAt: k.updated_at as string,
      };
    });
    
    return NextResponse.json({ success: true, data: kaizens });
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
 * POST /api/kaizens
 * Create a new kaizen
 */
export async function POST(request: NextRequest) {
  try {
    const { tenantId, userId } = await getTenantContext();
    const supabase = await createClient();
    
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
    
    // Validation
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category is required' },
        { status: 400 }
      );
    }
    
    // Validate category
    const validCategories = ['technical', 'process', 'strategic', 'cultural'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }
    
    // Generate kaizen code
    const { data: codeData, error: codeError } = await supabase.rpc(
      'generate_kaizen_code',
      { p_tenant_id: tenantId, p_category: category }
    );
    
    if (codeError) {
      console.error('Error generating kaizen code:', codeError);
      return NextResponse.json(
        { success: false, error: 'Failed to generate kaizen code' },
        { status: 500 }
      );
    }
    
    const code = codeData;
    
    // Insert kaizen
    const { data: insertData, error: insertError } = await supabase
      .from('kaizens')
      .insert({
        tenant_id: tenantId,
        code,
        title,
        category,
        context,
        learning,
        golden_rule: goldenRule,
        application,
        related_task_id: relatedTaskId,
        related_meeting_id: relatedMeetingId,
        related_project_id: relatedProjectId,
        created_by: userId,
      })
      .select(`
        *,
        related_project:projects(id, code, name)
      `)
      .single();
    
    if (insertError) {
      console.error('Error creating kaizen:', insertError);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }
    
    // Transform to camelCase
    const newKaizen: Kaizen = {
      id: insertData.id,
      tenantId: insertData.tenant_id,
      code: insertData.code,
      title: insertData.title,
      category: insertData.category,
      context: insertData.context,
      learning: insertData.learning,
      goldenRule: insertData.golden_rule,
      application: insertData.application,
      relatedTaskId: insertData.related_task_id,
      relatedMeetingId: insertData.related_meeting_id,
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
      { success: true, data: newKaizen },
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
