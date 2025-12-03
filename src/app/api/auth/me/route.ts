import { NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { handleApiError } from '@/lib/api-errors';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/auth/me
 * Retorna o usuário autenticado atual com contexto do tenant
 */
export async function GET() {
  try {
    const context = await getTenantContext();

    // Se tenant não veio nos dados, buscar separadamente
    if (!context.user.tenant && context.user.tenant_id) {
      const supabase = await createClient();
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('id, name, slug, plan, status, max_users, max_projects')
        .eq('id', context.user.tenant_id)
        .single();

      if (tenantData) {
        context.user.tenant = tenantData;
      }
    }

    return NextResponse.json({
      success: true,
      user: context.user
    });
  } catch (error) {
    return handleApiError(error);
  }
}
