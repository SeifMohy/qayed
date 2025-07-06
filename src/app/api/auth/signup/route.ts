import { NextRequest, NextResponse } from 'next/server';
import { signUpUser, type SignUpData } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signUpData: SignUpData = {
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      companyName: body.companyName,
      industry: body.industry,
      country: body.country,
    };

    console.log('📬 API: Received signup request for:', signUpData.email);

    const result = await signUpUser(signUpData);

    if (result.error) {
      console.error('❌ Signup failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: result.user?.id,
        email: result.user?.email,
      }
    });

  } catch (error: any) {
    console.error('API signup error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      },
      { status: 500 }
    );
  }
} 