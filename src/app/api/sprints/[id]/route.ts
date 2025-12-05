import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { handleApiError } from '@/lib/api-errors';
import { z } from 'zod';

// Validation schema for updating a sprint
const updateSprintSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  goal: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  project_id: z.string().uuid().optional().nullable(),
  status: z.enum(['planned', 'active', 'completed']).optional(),
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
      .from('sprints')
      .select(`
        *,
        project:projects (
          id,
          code,
          name
        )
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      console.error('Error fetching sprint:', error);
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
    const { id: sprintId } = await context.params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateSprintSchema.parse(body);

    // First, verify the sprint exists and belongs to the tenant
    const { data: existingSprint, error: fetchError } = await supabase
      .from('sprints')
      .select('id')
      .eq('id', sprintId)
      .eq('tenant_id', tenantId)
      .single();

    if (fetchError || !existingSprint) {
      return NextResponse.json(
        { success: false, error: 'Sprint não encontrada' },
        { status: 404 }
      );
    }

    // Update the sprint
    const { data: updatedSprint, error: updateError } = await supabase
      .from('sprints')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sprintId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating sprint:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: updatedSprint });
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
    const { id: sprintId } = await context.params;

    // First, verify the sprint exists and belongs to the tenant
    const { data: existingSprint, error: fetchError } = await supabase
      .from('sprints')
      .select('id')
      .eq('id', sprintId)
      .eq('tenant_id', tenantId)
      .single();

    if (fetchError || !existingSprint) {
      return NextResponse.json(
        { success: false, error: 'Sprint não encontrada' },
        { status: 404 }
      );
    }

    // Delete the sprint (tasks will have sprint_id set to NULL due to ON DELETE SET NULL)
    const { error: deleteError } = await supabase
      .from('sprints')
      .delete()
      .eq('id', sprintId)
      .eq('tenant_id', tenantId);

    if (deleteError) {
      console.error('Error deleting sprint:', deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sprint excluída com sucesso' 
    });
  } catch (error) {
    return handleApiError(error);
  }
}
