import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';

/**
 * DELETE /api/tenants/invitations/[id]
 * Cancel/delete a pending invitation
 */
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { tenantId } = await getTenantContext();
    const invitationId = params.id;

    if (!invitationId) {
      return NextResponse.json(
        { success: false, error: 'Invitation ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify the invitation belongs to the user's tenant
    const { data: invitation, error: fetchError } = await supabase
      .from('tenant_invitations')
      .select('tenant_id, status')
      .eq('id', invitationId)
      .single();

    if (fetchError || !invitation) {
      return NextResponse.json(
        { success: false, error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Verify tenant ownership
    if (invitation.tenant_id !== tenantId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Only pending invitations can be cancelled
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `Cannot cancel invitation with status: ${invitation.status}` },
        { status: 400 }
      );
    }

    // Update status to cancelled instead of hard delete (better for audit trail)
    const { error: updateError } = await supabase
      .from('tenant_invitations')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitationId)
      .eq('tenant_id', tenantId);

    if (updateError) {
      console.error('Error cancelling invitation:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation cancelled successfully',
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
