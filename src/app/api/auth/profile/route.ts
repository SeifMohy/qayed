import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supabaseUserId } = body;

    if (!supabaseUserId) {
      return NextResponse.json(
        { success: false, error: 'Supabase user ID is required' },
        { status: 400 }
      );
    }

    console.log('📬 API: Getting user profile for:', supabaseUserId);

    const userProfile = await getUserProfile(supabaseUserId);

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: userProfile
    });

  } catch (error: any) {
    console.error('API get profile error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      },
      { status: 500 }
    );
  }
} 