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

<<<<<<< HEAD
export async function POST(request: Request) {
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
=======
export async function POST(request: NextRequest) {
  try {
    // Get tenant context from authenticated session
    const { tenantId, userId } = await getTenantContext();
    const supabase = await createClient();

    // Parse request body
    const body = await request.json();
    const {
      name,
      description,
      status = 'planning',
      priority = 'medium',
      start_date,
      end_date,
      budget,
      client_name,
      client_contact,
      client_email,
      owner_id,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Nome do projeto é obrigatório' },
        { status: 400 }
      );
    }

    // Get the highest project code number for this tenant
    const { data: existingProjects, error: fetchError } = await supabase
      .from('projects')
      .select('code')
      .eq('tenant_id', tenantId)
      .order('code', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Error fetching existing projects:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Erro ao gerar código do projeto' },
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
        { status: 500 }
      );
    }

<<<<<<< HEAD
    const nextNumber = (count || 0) + 1;
    const code = `PROJ-${String(nextNumber).padStart(3, '0')}`;

    // Create the project
=======
    // Generate next project code
    let nextNumber = 1;
    if (existingProjects && existingProjects.length > 0) {
      const lastCode = existingProjects[0].code;
      const match = lastCode.match(/PROJ-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    const code = `PROJ-${String(nextNumber).padStart(3, '0')}`;

    // Create project
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
    const { data: project, error: insertError } = await supabase
      .from('projects')
      .insert({
        tenant_id: tenantId,
        code,
<<<<<<< HEAD
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
=======
        name,
        description,
        status,
        priority,
        start_date,
        end_date,
        budget,
        client_name,
        client_contact,
        client_email,
        owner_id: owner_id || null,
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
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
<<<<<<< HEAD
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
=======
>>>>>>> e14a2144b358425416219dcc49e76be76b968523
    return handleApiError(error);
  }
}
