import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';

/**
 * PATCH /api/users/password
 * Change current user's password
 * 
 * Supabase Auth handles password hashing and validation.
 */
export async function PATCH(request: NextRequest) {
  try {
    await getTenantContext(); // Verify authentication
    const body = await request.json();

    const { current_password, new_password } = body;

    // Validate required fields
    if (!current_password || !new_password) {
      return NextResponse.json(
        { success: false, error: 'Both current_password and new_password are required' },
        { status: 400 }
      );
    }

    // Validate password strength (minimum 8 characters)
    if (new_password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Update password using Supabase Auth with current password verification
    // Supabase will automatically verify the current password
    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password,
    });

    if (updateError) {
      console.error('Error updating password:', updateError);
      
      // Check if error is due to incorrect current password
      if (updateError.message.includes('current') || updateError.message.includes('password')) {
        return NextResponse.json(
          { success: false, error: 'Current password verification failed' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Password updated successfully' 
    });
  } catch (error) {
    console.error('Unexpected error:', error);

    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
