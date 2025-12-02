import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext, checkTenantLimits } from '@/lib/supabase/tenant';
import { randomBytes } from 'crypto';

/**
 * POST /api/tenants/invitations
 * Create a new user invitation
 */
export async function POST(request: NextRequest) {
  try {
    const { tenantId, userId } = await getTenantContext();
    const body = await request.json();

    const { email, role_name, message } = body;

    if (!email || !role_name) {
      return NextResponse.json(
        { success: false, error: 'Email and role_name are required' },
        { status: 400 }
      );
    }

    // Check tenant limits
    const limits = await checkTenantLimits(tenantId);
    if (!limits.canAddUser) {
      return NextResponse.json(
        { success: false, error: 'Tenant has reached maximum user limit' },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // Check if user already exists in this tenant
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists in this tenant' },
        { status: 400 }
      );
    }

    // Check if there's already a pending invitation
    const { data: existingInvitation } = await supabase
      .from('tenant_invitations')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (existingInvitation) {
      return NextResponse.json(
        { success: false, error: 'Pending invitation already exists for this email' },
        { status: 400 }
      );
    }

    // Generate secure token
    const token = randomBytes(32).toString('base64url');

    // Get role ID based on role name
    const { data: role } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role_name)
      .single();

    // Create invitation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const { data, error } = await supabase
      .from('tenant_invitations')
      .insert({
        tenant_id: tenantId,
        email,
        role_id: role?.id,
        role_name,
        token,
        invited_by: userId,
        expires_at: expiresAt.toISOString(),
        message: message || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invitation:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // TODO: Send invitation email with token link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    if (!appUrl) {
      console.error('NEXT_PUBLIC_APP_URL is not set');
      // Return without link in development, but this should be required in production
    }
    
    const invitationLink = appUrl ? `${appUrl}/accept-invitation?token=${token}` : null;

    return NextResponse.json({ 
      success: true, 
      data: {
        ...data,
        invitation_link: invitationLink
      }
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

/**
 * GET /api/tenants/invitations
 * List all invitations for the current tenant
 */
export async function GET() {
  try {
    const { tenantId } = await getTenantContext();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('tenant_invitations')
      .select(`
        *,
        invited_by_user:users!tenant_invitations_invited_by_fkey(
          id,
          full_name,
          email
        )
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invitations:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
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
