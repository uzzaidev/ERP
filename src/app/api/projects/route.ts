import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { handleApiError } from '@/lib/api-errors';

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
        { status: 500 }
      );
    }

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
    const { data: project, error: insertError } = await supabase
      .from('projects')
      .insert({
        tenant_id: tenantId,
        code,
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
    return handleApiError(error);
  }
}
