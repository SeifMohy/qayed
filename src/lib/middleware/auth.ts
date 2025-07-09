import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { CompanyAccessService } from '@/lib/services/companyAccessService';

// Initialize server-side Supabase client for token validation
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface AuthContext {
  supabaseUserId: string;
  companyId: number;
  companyAccessService: CompanyAccessService;
}

export interface AuthError {
  message: string;
  status: number;
}

/**
 * Extract authentication context from request
 * This function tries multiple approaches to get the supabaseUserId:
 * 1. From Authorization header (access token - PRIMARY FOR LOCAL STORAGE)
 * 2. From cookies (session-based)
 * 3. From request body (for POST/PUT requests)
 * 4. From query parameters (for GET requests)
 */
export async function getAuthContext(request: NextRequest): Promise<{ authContext: AuthContext | null; error: AuthError | null }> {
  try {
    let supabaseUserId: string | null = null;

    // Method 1: Try to get from Authorization header (PRIMARY FOR LOCAL STORAGE)
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        console.log('🔑 Attempting authentication with Bearer token...');
        
        try {
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (user && !error) {
            supabaseUserId = user.id;
            console.log('✅ Authentication successful via Bearer token for user:', supabaseUserId);
          } else if (error) {
            console.log('⚠️ Bearer token authentication failed:', error.message);
          }
        } catch (tokenError) {
          console.log('⚠️ Bearer token validation error:', tokenError);
        }
      } else if (authHeader.startsWith('supabase-user-id ')) {
        // Custom header format for user ID
        supabaseUserId = authHeader.substring(17);
        console.log('✅ Authentication successful via custom header for user:', supabaseUserId);
      }
    }

    // Method 2: Try to get from cookies (session-based)
    if (!supabaseUserId) {
      try {
        const cookieStore = {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // This is a read-only operation for getting the user
            // We don't need to set cookies here
          },
          remove(name: string, options: any) {
            // This is a read-only operation for getting the user
            // We don't need to remove cookies here
          },
        };

        const supabaseWithCookies = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: cookieStore,
          }
        );

        const { data: { user }, error } = await supabaseWithCookies.auth.getUser();
        if (user && !error) {
          supabaseUserId = user.id;
          console.log('✅ Authentication successful via cookies for user:', supabaseUserId);
        } else if (error) {
          console.log('⚠️ Cookie authentication failed:', error.message);
        }
      } catch (cookieError) {
        console.log('⚠️ Cookie authentication error:', cookieError);
      }
    }

    // Method 3: Try to get from request body (for POST/PUT requests)
    if (!supabaseUserId && (request.method === 'POST' || request.method === 'PUT')) {
      try {
        // Clone request to avoid consuming the body
        const clonedRequest = request.clone();
        const body = await clonedRequest.json();
        if (body.supabaseUserId) {
          supabaseUserId = body.supabaseUserId;
          console.log('✅ Authentication successful via request body for user:', supabaseUserId);
        }
      } catch (error) {
        // Body might not be JSON or might be already consumed
        console.log('⚠️ Could not parse request body for supabaseUserId:', error);
      }
    }

    // Method 4: Try to get from query parameters (for GET requests)
    if (!supabaseUserId) {
      const searchParams = new URL(request.url).searchParams;
      const queryUserId = searchParams.get('supabaseUserId');
      if (queryUserId) {
        supabaseUserId = queryUserId;
        console.log('✅ Authentication successful via query parameter for user:', supabaseUserId);
      }
    }

    // Method 5: Try to get from custom headers (for user ID)
    if (!supabaseUserId) {
      const userIdHeader = request.headers.get('X-Supabase-User-Id');
      if (userIdHeader) {
        supabaseUserId = userIdHeader;
        console.log('✅ Authentication successful via X-Supabase-User-Id header for user:', supabaseUserId);
      }
    }

    if (!supabaseUserId) {
      console.log('❌ Authentication failed: No valid authentication method found');
      console.log('📋 Available headers:', Object.fromEntries(request.headers.entries()));
      return {
        authContext: null,
        error: {
          message: 'Authentication required. Please log in and try again.',
          status: 401
        }
      };
    }

    // Initialize CompanyAccessService
    const companyAccessService = new CompanyAccessService(supabaseUserId);
    
    try {
      const companyId = await companyAccessService.getCompanyId();
      
      console.log('✅ Company access verified for user:', supabaseUserId, 'company:', companyId);
      
      return {
        authContext: {
          supabaseUserId,
          companyId,
          companyAccessService
        },
        error: null
      };
    } catch (error) {
      console.log('❌ Company access failed for user:', supabaseUserId, 'error:', error);
      return {
        authContext: null,
        error: {
          message: 'User company not found. Please ensure your account is properly configured.',
          status: 403
        }
      };
    }

  } catch (error) {
    console.error('❌ Critical authentication error:', error);
    return {
      authContext: null,
      error: {
        message: 'Authentication failed. Please try again.',
        status: 500
      }
    };
  }
}

/**
 * Middleware wrapper for API routes that require authentication
 * Usage: export const GET = withAuth(async (request, authContext) => { ... });
 */
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, authContext: AuthContext, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    const { authContext, error } = await getAuthContext(request);
    
    if (error || !authContext) {
      console.log('❌ Authentication middleware blocked request:', {
        url: request.url,
        method: request.method,
        error: error?.message,
        hasAuthHeader: !!request.headers.get('Authorization'),
        hasUserIdHeader: !!request.headers.get('X-Supabase-User-Id')
      });
      
      return new Response(
        JSON.stringify({
          success: false,
          error: error?.message || 'Authentication required',
          hint: 'Make sure to include authentication token in Authorization header or user ID in X-Supabase-User-Id header'
        }),
        {
          status: error?.status || 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Authentication middleware approved request:', {
      url: request.url,
      method: request.method,
      userId: authContext.supabaseUserId,
      companyId: authContext.companyId
    });

    return handler(request, authContext, ...args);
  };
}

/**
 * Helper function to get company ID from request (simpler version)
 * Use this for routes that just need the company ID
 */
export async function getCompanyIdFromRequest(request: NextRequest): Promise<{ companyId: number | null; error: AuthError | null }> {
  const { authContext, error } = await getAuthContext(request);
  
  if (error || !authContext) {
    return { companyId: null, error };
  }

  return { companyId: authContext.companyId, error: null };
} 