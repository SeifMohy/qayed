import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile } from '@/lib/auth';
import { handleBuildTimeUnavailability } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check if database is available (handles build-time scenarios)
    const buildTimeResponse = handleBuildTimeUnavailability();
    if (buildTimeResponse) {
      return buildTimeResponse;
    }

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
    
    // Handle specific database connection errors during build
    if (error.message?.includes('PrismaClientInitializationError') || 
        error.message?.includes('database') || 
        error.code === 'P1001') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection error. Please try again later.' 
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      },
      { status: 500 }
    );
  }
} 