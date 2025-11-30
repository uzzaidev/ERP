import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/auth';

/**
 * GET /api/auth/me
 * Retorna o usuário autenticado atual
 */
export async function GET() {
  try {
    const { user, error } = await getCurrentUser();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
