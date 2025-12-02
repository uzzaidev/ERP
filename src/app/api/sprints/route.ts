import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';

export async function GET(request: NextRequest) {
  try {
    // Get tenant context from authenticated session
    const { tenantId } = await getTenantContext();
    
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('project_id');

    let query = supabase
      .from('sprints')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('start_date', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching sprints:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
