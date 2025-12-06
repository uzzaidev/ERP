import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { isAdmin } from '@/lib/auth/permissions';

/**
 * GET /api/tenants/invite-code
 * Get tenant invite code/information for admins
 * This allows admins to share their tenant ID/slug for manual invitations
 */
export async function GET() {
  try {
    const { userId, tenantId } = await getTenantContext();

    // Check if user is admin
    const userIsAdmin = await isAdmin(userId, tenantId);

    if (!userIsAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only administrators can access invite codes' },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // Get tenant information
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('id, name, slug, plan, status')
      .eq('id', tenantId)
      .single();

    if (error || !tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Generate invite URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${appUrl}/registro?tenant=${tenant.slug}`;

    return NextResponse.json({
      success: true,
      data: {
        tenant_id: tenant.id,
        tenant_name: tenant.name,
        tenant_slug: tenant.slug,
        invite_url: inviteUrl,
        plan: tenant.plan,
        status: tenant.status,
      },
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
