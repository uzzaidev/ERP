import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { handleApiError } from '@/lib/api-errors';
import { z } from 'zod';

// Validation schema for adding a project member
const addMemberSchema = z.object({
  user_id: z.string().uuid('ID de usuário inválido'),
  role: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().optional()
  ),
  hourly_rate: z.preprocess(
    (val) => val === '' || val === null ? undefined : Number(val),
    z.number().min(0).optional()
  ),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: projectId } = await context.params;
    const { tenantId } = await getTenantContext();

    const supabase = await createClient();

    // First verify project belongs to tenant
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('tenant_id', tenantId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { success: false, error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    // Get project members with user details
    const { data, error } = await supabase
      .from('project_members')
      .select(`
        id,
        role,
        hourly_rate,
        added_at,
        users:users!project_members_user_id_fkey (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('project_id', projectId)
      .eq('tenant_id', tenantId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching project members:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: projectId } = await context.params;
    const { tenantId, userId } = await getTenantContext();

    const supabase = await createClient();

    // Verify project belongs to tenant
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('tenant_id', tenantId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { success: false, error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = addMemberSchema.parse(body);

    // Check if user already is a member
    const { data: existingMember } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', validatedData.user_id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: 'Usuário já é membro deste projeto' },
        { status: 400 }
      );
    }

    // Verify user exists and belongs to same tenant
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', validatedData.user_id)
      .eq('tenant_id', tenantId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Add member to project
    const { data: member, error: insertError } = await supabase
      .from('project_members')
      .insert({
        tenant_id: tenantId,
        project_id: projectId,
        user_id: validatedData.user_id,
        role: validatedData.role,
        hourly_rate: validatedData.hourly_rate,
        added_by: userId,
      })
      .select(`
        id,
        role,
        hourly_rate,
        added_at,
        users:users!project_members_user_id_fkey (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .single();

    if (insertError) {
      console.error('Error adding project member:', insertError);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: projectId } = await context.params;
    const { tenantId } = await getTenantContext();

    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const memberId = searchParams.get('member_id');

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'ID do membro é obrigatório' },
        { status: 400 }
      );
    }

    // Verify project and member belong to tenant
    const { data: member, error: fetchError } = await supabase
      .from('project_members')
      .select('id')
      .eq('id', memberId)
      .eq('project_id', projectId)
      .eq('tenant_id', tenantId)
      .single();

    if (fetchError || !member) {
      return NextResponse.json(
        { success: false, error: 'Membro não encontrado' },
        { status: 404 }
      );
    }

    // Remove member
    const { error: deleteError } = await supabase
      .from('project_members')
      .delete()
      .eq('id', memberId)
      .eq('tenant_id', tenantId);

    if (deleteError) {
      console.error('Error removing project member:', deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Membro removido com sucesso',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
