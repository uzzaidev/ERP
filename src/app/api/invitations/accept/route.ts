import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateTenantUsage } from '@/lib/supabase/tenant';

/**
 * POST /api/invitations/accept
 * Accept an invitation and create user account
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, full_name } = body;

    if (!token || !password || !full_name) {
      return NextResponse.json(
        { success: false, error: 'Token, password, and full_name are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Find invitation by token
    const { data: invitation, error: invitationError } = await supabase
      .from('tenant_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (invitationError || !invitation) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired invitation' },
        { status: 400 }
      );
    }

    // Check if invitation has expired
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < new Date()) {
      // Mark as expired
      await supabase
        .from('tenant_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id);

      return NextResponse.json(
        { success: false, error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invitation.email,
      password,
      options: {
        data: {
          full_name,
          tenant_id: invitation.tenant_id,
        },
      },
    });

    if (authError || !authData.user) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json(
        { success: false, error: authError?.message || 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create user record in users table
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        tenant_id: invitation.tenant_id,
        email: invitation.email,
        full_name,
        is_active: true,
        email_verified: true,
      });

    if (userError) {
      console.error('Error creating user record:', userError);
      return NextResponse.json(
        { success: false, error: 'Failed to create user record' },
        { status: 500 }
      );
    }

    // Assign role to user if role_id is specified
    if (invitation.role_id) {
      await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role_id: invitation.role_id,
          tenant_id: invitation.tenant_id,
          assigned_by: invitation.invited_by,
        });
    }

    // Mark invitation as accepted
    await supabase
      .from('tenant_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: authData.user.id,
      })
      .eq('id', invitation.id);

    // Update tenant usage statistics
    await updateTenantUsage(invitation.tenant_id);

    return NextResponse.json({
      success: true,
      data: {
        user: authData.user,
        tenant_id: invitation.tenant_id,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/invitations/accept?token=xxx
 * Validate invitation token and get invitation details
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: invitation, error } = await supabase
      .from('tenant_invitations')
      .select(`
        *,
        tenant:tenants(
          id,
          name,
          slug
        )
      `)
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (error || !invitation) {
      return NextResponse.json(
        { success: false, error: 'Invalid invitation' },
        { status: 404 }
      );
    }

    // Check if expired
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        email: invitation.email,
        role_name: invitation.role_name,
        tenant: invitation.tenant,
        expires_at: invitation.expires_at,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
