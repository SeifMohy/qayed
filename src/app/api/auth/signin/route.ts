import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    console.log('📬 API: Updating last login for user:', supabaseUserId);

    // First check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { supabaseUserId },
      include: { company: true }
    });

    if (!existingUser) {
      console.error('❌ User not found in database for supabaseUserId:', supabaseUserId);
      return NextResponse.json({
        success: false,
        error: 'User profile not found. Please complete your registration.',
        code: 'USER_NOT_FOUND'
      }, { status: 404 });
    }

    // Update last login time in database
    await prisma.user.update({
      where: { supabaseUserId },
      data: { lastLoginAt: new Date() }
    });

    console.log('✅ Last login updated for user:', existingUser.email);

    return NextResponse.json({
      success: true,
      message: 'Last login updated',
      user: {
        id: existingUser.id,
        email: existingUser.email,
        companyId: existingUser.companyId
      }
    });

  } catch (error: any) {
    console.error('API signin error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      },
      { status: 500 }
    );
  }
} 