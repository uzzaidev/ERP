import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';

export async function GET() {
  try {
    // Get tenant context from authenticated session
    const { tenantId } = await getTenantContext();
    
    const supabase = await createClient();
    
    // Filter projects by tenant_id
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_members (
          user_id,
          role,
          users:users!project_members_user_id_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        )
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
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
