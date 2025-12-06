import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';

/**
 * PATCH /api/users/profile
 * Update current user's profile (name, phone, avatar)
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId, tenantId } = await getTenantContext();
    const body = await request.json();

    const { full_name, phone, avatar_url } = body;

    // Validate at least one field is being updated
    if (!full_name && !phone && avatar_url == null) {
      return NextResponse.json(
        { success: false, error: 'At least one field must be provided for update' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Build update object with only provided fields
    const updateData: Record<string, string> = {
      updated_at: new Date().toISOString(),
    };

    if (full_name) updateData.full_name = full_name;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar_url != null) updateData.avatar_url = avatar_url;

    // Update user profile
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .eq('tenant_id', tenantId)
      .select('id, full_name, email, phone, avatar_url, tenant_id')
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
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
