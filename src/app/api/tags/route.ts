import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { handleApiError } from '@/lib/api-errors';
import { z } from 'zod';

// Validation schema for creating a tag
const createTagSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome muito longo'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida (use formato #RRGGBB)'),
});

export async function GET() {
  try {
    // Get tenant context from authenticated session
    const { tenantId } = await getTenantContext();

    const supabase = await createClient();

    // Filter tags by tenant_id
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name');

    if (error) {
      console.error('Error fetching tags:', error);
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
    const validatedData = createTagSchema.parse(body);

    // Check if tag with same name already exists for this tenant
    const { data: existingTag } = await supabase
      .from('tags')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('name', validatedData.name)
      .single();

    if (existingTag) {
      return NextResponse.json(
        { success: false, error: 'Já existe uma tag com este nome' },
        { status: 400 }
      );
    }

    // Create the tag
    const { data: tag, error: insertError } = await supabase
      .from('tags')
      .insert({
        tenant_id: tenantId,
        name: validatedData.name,
        color: validatedData.color,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating tag:', insertError);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: tag }, { status: 201 });
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
