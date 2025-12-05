import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { handleApiError } from '@/lib/api-errors';
import { z } from 'zod';

// Validation schema for updating a project
const updateProjectSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  description: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().optional()
  ),
  status: z.enum(['active', 'on_hold', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  start_date: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().optional()
  ),
  end_date: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().optional()
  ),
  estimated_hours: z.preprocess(
    (val) => val === '' || val === null ? undefined : Number(val),
    z.number().optional()
  ),
  budget: z.preprocess(
    (val) => val === '' || val === null ? undefined : Number(val),
    z.number().optional()
  ),
  spent: z.preprocess(
    (val) => val === '' || val === null ? undefined : Number(val),
    z.number().optional()
  ),
  client_name: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().optional()
  ),
  client_contact: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().optional()
  ),
  client_email: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().email().optional()
  ),
  owner_id: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().uuid().optional()
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
    const { id } = await context.params;
    const { tenantId } = await getTenantContext();
    
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        owner:users!projects_owner_id_fkey (
          id,
          full_name,
          email,
          avatar_url
        ),
        project_members (
          id,
          role,
          user_id,
          users:users!project_members_user_id_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        )
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { tenantId } = await getTenantContext();
    const supabase = await createClient();
    const { id: projectId } = await context.params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateProjectSchema.parse(body);

    // First, verify the project exists and belongs to the tenant
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('tenant_id', tenantId)
      .single();

    if (fetchError || !existingProject) {
      return NextResponse.json(
        { success: false, error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    // Update the project
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating project:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: updatedProject });
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
    const { tenantId } = await getTenantContext();
    const supabase = await createClient();
    const { id: projectId } = await context.params;

    // First, verify the project exists and belongs to the tenant
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('tenant_id', tenantId)
      .single();

    if (fetchError || !existingProject) {
      return NextResponse.json(
        { success: false, error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    // Delete the project (CASCADE will handle related records)
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('tenant_id', tenantId);

    if (deleteError) {
      console.error('Error deleting project:', deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Projeto excluído com sucesso' 
    });
  } catch (error) {
    return handleApiError(error);
  }
}
