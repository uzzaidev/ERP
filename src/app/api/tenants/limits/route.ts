import { NextResponse } from 'next/server';
import { getTenantContext, checkTenantLimits } from '@/lib/supabase/tenant';

/**
 * GET /api/tenants/limits
 * Check tenant limits and current usage for the authenticated user's tenant
 */
export async function GET() {
  try {
    const { tenantId } = await getTenantContext();

    const limits = await checkTenantLimits(tenantId);

    return NextResponse.json({ 
      success: true, 
      data: limits 
    });
  } catch (error) {
    console.error('Unexpected error:', error);

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
