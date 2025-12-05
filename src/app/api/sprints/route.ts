import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { handleApiError } from '@/lib/api-errors';
import { z } from 'zod';

// Validation schema for creating a sprint
const createSprintSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  goal: z.string().optional(),
  start_date: z.string().min(1, 'Data de início é obrigatória'),
  end_date: z.string().min(1, 'Data de término é obrigatória'),
  project_id: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().uuid().optional()
  ),
  status: z.enum(['planned', 'active', 'completed']).default('planned'),
});

export async function GET(request: NextRequest) {
  try {
    // Get tenant context from authenticated session
    const { tenantId } = await getTenantContext();
    
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('project_id');

    let query = supabase
      .from('sprints')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('start_date', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching sprints:', error);
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

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await getTenantContext();
    const supabase = await createClient();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createSprintSchema.parse(body);

    // Generate sprint code (SPR-XXX)
    // Get the count of sprints for this tenant to generate the next code
    const { count, error: countError } = await supabase
      .from('sprints')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    if (countError) {
      console.error('Error counting sprints:', countError);
      return NextResponse.json(
        { success: false, error: countError.message },
        { status: 500 }
      );
    }

    const nextNumber = (count || 0) + 1;
    const code = `SPR-${String(nextNumber).padStart(3, '0')}`;

    // Create the sprint
    const { data: sprint, error: insertError } = await supabase
      .from('sprints')
      .insert({
        tenant_id: tenantId,
        code,
        name: validatedData.name,
        goal: validatedData.goal,
        start_date: validatedData.start_date,
        end_date: validatedData.end_date,
        project_id: validatedData.project_id || null,
        status: validatedData.status,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating sprint:', insertError);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: sprint }, { status: 201 });
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
