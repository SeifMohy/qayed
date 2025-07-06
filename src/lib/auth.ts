import { supabase } from './supabase';
import { prisma } from './prisma';
import type { User } from '@supabase/supabase-js';

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  industry?: string;
  country?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  company: {
    id: number;
    name: string;
    currency: string;
  };
}

export interface AuthError {
  message: string;
  code?: string;
}

// Sign up new user with company creation
export async function signUpUser(signUpData: SignUpData): Promise<{ user: User | null; error: AuthError | null }> {
  console.log('🔄 Starting signup process for:', signUpData.email);
  console.log('📋 Signup data:', { ...signUpData, password: '[HIDDEN]' });
  
  try {
    // Create user in Supabase Auth
    console.log('📤 Calling Supabase auth signup...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: signUpData.email,
      password: signUpData.password,
      options: {
        data: {
          first_name: signUpData.firstName,
          last_name: signUpData.lastName,
          company_name: signUpData.companyName,
        }
      }
    });

    console.log('📥 Supabase auth response:', {
      user: authData.user ? { id: authData.user.id, email: authData.user.email } : null,
      session: authData.session ? 'Session exists' : 'No session',
      error: authError
    });

    if (authError) {
      console.log('Supabase auth error:', authError);
      
      let errorMessage = authError.message;
      
      // Handle specific error types
      if (authError.message.includes('rate_limit') || authError.message.includes('request this after')) {
        errorMessage = 'Too many signup attempts. Please wait a moment and try again.';
      } else if (authError.message.includes('invalid') && authError.message.includes('email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (authError.message.includes('already registered')) {
        errorMessage = 'An account with this email already exists. Please try logging in instead.';
      }
      
      return { user: null, error: { message: errorMessage, code: authError.message } };
    }

    if (!authData.user) {
      return { user: null, error: { message: 'Failed to create user' } };
    }

    // Create company and user in our database
    console.log('📀 Starting database operations...');
    try {
      // First, check if company already exists
      console.log('🔍 Checking if company exists:', signUpData.companyName);
      let company = await prisma.company.findFirst({
        where: { 
          name: signUpData.companyName.trim(),
          isActive: true 
        }
      });

      if (company) {
        console.log('🏢 Found existing company:', { id: company.id, name: company.name });
      } else {
        console.log('🏢 Creating new company:', signUpData.companyName);
        console.log('📊 Company data to create:', {
          name: signUpData.companyName,
          industry: signUpData.industry || null,
          country: signUpData.country || null,
        });
        
        company = await prisma.company.create({
          data: {
            name: signUpData.companyName.trim(),
            industry: signUpData.industry || null,
            country: signUpData.country || null,
          }
        });
        console.log('✅ New company created:', { id: company.id, name: company.name });
      }

      console.log('👤 Creating user for company:', company.id);
      // Generate UUID that works in both browser and Node.js
      const newUserId = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      await prisma.user.create({
        data: {
          id: newUserId,
          email: signUpData.email,
          firstName: signUpData.firstName,
          lastName: signUpData.lastName,
          role: 'ADMIN' as const,
          companyId: company.id,
          supabaseUserId: authData.user.id,
        }
      });
      console.log('✅ User created:', { id: newUserId, email: signUpData.email, companyId: company.id });

      console.log('🎉 Signup completed successfully!');
      return { user: authData.user, error: null };
    } catch (dbError: any) {
      console.error('❌ Database error during signup:', {
        error: dbError,
        message: dbError.message,
        code: dbError.code,
        meta: dbError.meta,
        stack: dbError.stack,
        supabaseUserId: authData.user.id,
        companyName: signUpData.companyName
      });
      
      // Return more specific error messages based on the error type
      let errorMessage = 'Failed to create company profile.';
      
      if (dbError.code === 'P2002') {
        // Check which field has the unique constraint violation
        if (dbError.meta?.target?.includes('email')) {
          errorMessage = 'An account with this email already exists.';
        } else if (dbError.meta?.target?.includes('supabaseUserId')) {
          errorMessage = 'This Supabase account is already linked to another user.';
        } else {
          errorMessage = `Duplicate entry: ${dbError.meta?.target || 'unknown field'}`;
        }
      } else if (dbError.code === 'P2003') {
        errorMessage = 'Database constraint error. Please try again.';
      } else if (dbError.code === 'P2025') {
        errorMessage = 'Required record not found. Please try again.';
      } else if (dbError.message?.includes('company')) {
        errorMessage = `Failed to create company: ${dbError.message}`;
      } else if (dbError.message?.includes('user')) {
        errorMessage = `Failed to create user profile: ${dbError.message}`;
      } else {
        // Include more details for debugging
        errorMessage = `Database error (${dbError.code || 'unknown'}): ${dbError.message}`;
      }
      
      return { user: null, error: { message: errorMessage, code: dbError.code } };
    }
  } catch (error: any) {
    return { user: null, error: { message: error.message || 'An unexpected error occurred' } };
  }
}

// Sign in user
export async function signInUser(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: { message: error.message, code: error.message } };
    }

    // Update last login time
    if (data.user) {
      await prisma.user.update({
        where: { supabaseUserId: data.user.id },
        data: { lastLoginAt: new Date() }
      });
    }

    return { user: data.user, error: null };
  } catch (error: any) {
    return { user: null, error: { message: error.message || 'An unexpected error occurred' } };
  }
}

// Sign out user
export async function signOutUser(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: { message: error.message, code: error.message } };
    }
    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message || 'An unexpected error occurred' } };
  }
}

// Get current user session
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      throw error;
    }
    return session;
  } catch (error: any) {
    console.error('Error getting session:', error);
    return null;
  }
}

// Get user profile with company information
export async function getUserProfile(supabaseUserId: string): Promise<UserProfile | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { supabaseUserId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            currency: true,
          }
        }
      }
    });

    if (!user) {
      console.warn(`User profile not found for Supabase user ID: ${supabaseUserId}. This could indicate an incomplete signup process.`);
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      company: user.company,
    };
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

// Reset password
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { error: { message: error.message, code: error.message } };
    }

    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message || 'An unexpected error occurred' } };
  }
}

// Check if user has access to company data
export async function checkCompanyAccess(supabaseUserId: string, companyId: number): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { supabaseUserId },
      select: { companyId: true, isActive: true }
    });

    return user?.isActive === true && user?.companyId === companyId;
  } catch (error: any) {
    console.error('Error checking company access:', error);
    return false;
  }
} 