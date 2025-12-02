import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';

export async function GET() {
  try {
    // Get tenant context from authenticated session
    const { tenantId } = await getTenantContext();
    
    const supabase = await createClient();
    
    // Filter tags by tenant_id
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name');

    if (error) {
      console.error('Error fetching tags:', error);
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
