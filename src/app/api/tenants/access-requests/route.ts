import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';

/**
 * GET /api/tenants/access-requests
 * Lista solicitações de acesso pendentes para o tenant do admin
 */
export async function GET() {
  try {
    const { tenantId } = await getTenantContext();
    const supabase = await createClient();

    // Buscar solicitações de acesso pendentes para este tenant
    const { data, error } = await supabase
      .from('tenant_access_requests')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching access requests:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in GET /api/tenants/access-requests:', error);

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
 * PATCH /api/tenants/access-requests
 * Aprova ou rejeita uma solicitação de acesso
 * Body: { requestId, action: 'approve' | 'reject', rejectionReason? }
 */
export async function PATCH(request: NextRequest) {
  try {
    const { tenantId, userId } = await getTenantContext();
    const supabase = await createClient();

    const body = await request.json();
    const { requestId, action, rejectionReason } = body;

    if (!requestId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Buscar a solicitação
    const { data: accessRequest, error: fetchError } = await supabase
      .from('tenant_access_requests')
      .select('*')
      .eq('id', requestId)
      .eq('tenant_id', tenantId)
      .single();

    if (fetchError || !accessRequest) {
      return NextResponse.json(
        { success: false, error: 'Access request not found' },
        { status: 404 }
      );
    }

    if (accessRequest.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'This request has already been processed' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // 1. Atualizar o usuário para vincular ao tenant e ativar
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          tenant_id: tenantId,
          is_active: true,
        })
        .eq('id', accessRequest.user_id);

      if (userUpdateError) {
        console.error('Error updating user:', userUpdateError);
        return NextResponse.json(
          { success: false, error: 'Failed to approve user' },
          { status: 500 }
        );
      }

      // 2. Atualizar a solicitação como aprovada
      const { error: requestUpdateError } = await supabase
        .from('tenant_access_requests')
        .update({
          status: 'approved',
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (requestUpdateError) {
        console.error('Error updating access request:', requestUpdateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update request status' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'User approved successfully',
      });
    } else {
      // Rejeitar a solicitação
      const { error: requestUpdateError } = await supabase
        .from('tenant_access_requests')
        .update({
          status: 'rejected',
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason || 'No reason provided',
        })
        .eq('id', requestId);

      if (requestUpdateError) {
        console.error('Error updating access request:', requestUpdateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update request status' },
          { status: 500 }
        );
      }

      // Opcionalmente, desativar ou deletar o usuário
      // Por ora, apenas deixamos inativo
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          is_active: false,
        })
        .eq('id', accessRequest.user_id);

      if (userUpdateError) {
        console.error('Error deactivating user:', userUpdateError);
      }

      return NextResponse.json({
        success: true,
        message: 'Request rejected',
      });
    }
  } catch (error) {
    console.error('Error in PATCH /api/tenants/access-requests:', error);

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
