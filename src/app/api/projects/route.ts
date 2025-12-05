import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { handleApiError } from '@/lib/api-errors';
import { z } from 'zod';

// Validation schema for creating a project
const createProjectSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  status: z.enum(['active', 'on_hold', 'completed', 'cancelled']).default('active'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  estimated_hours: z.number().optional(),
  budget: z.number().optional(),
  client_name: z.string().optional(),
  client_contact: z.string().optional(),
  client_email: z.string().email().optional().or(z.literal('')),
  owner_id: z.string().uuid().optional(),
});

export async function GET() {
  try {
    // Get tenant context from authenticated session
    const { tenantId } = await getTenantContext();

    const supabase = await createClient();

    // Filter projects by tenant_id
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_members (
          user_id,
          role,
          users:users!project_members_user_id_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        )
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
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
    const { tenantId, userId } = await getTenantContext();
    const supabase = await createClient();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

    // Generate project code (PROJ-XXX)
    // Get the count of projects for this tenant to generate the next code
    const { count, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    if (countError) {
      console.error('Error counting projects:', countError);
      return NextResponse.json(
        { success: false, error: countError.message },
        { status: 500 }
      );
    }

    const nextNumber = (count || 0) + 1;
    const code = `PROJ-${String(nextNumber).padStart(3, '0')}`;

    // Create the project
    const { data: project, error: insertError } = await supabase
      .from('projects')
      .insert({
        tenant_id: tenantId,
        code,
        name: validatedData.name,
        description: validatedData.description,
        status: validatedData.status,
        priority: validatedData.priority,
        start_date: validatedData.start_date,
        end_date: validatedData.end_date,
        estimated_hours: validatedData.estimated_hours || 0,
        budget: validatedData.budget,
        client_name: validatedData.client_name,
        client_contact: validatedData.client_contact,
        client_email: validatedData.client_email,
        owner_id: validatedData.owner_id || userId,
        created_by: userId,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating project:', insertError);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: project }, { status: 201 });
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
