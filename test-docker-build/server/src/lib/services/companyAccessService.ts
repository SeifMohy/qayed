import { prisma } from '../prisma.js';

// Get user's company ID from supabase user ID
export async function getUserCompanyId(supabaseUserId: string): Promise<number | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { supabaseUserId },
      select: { companyId: true }
    });

    return user?.companyId || null;
  } catch (error) {
    console.error('Error getting user company ID:', error);
    return null;
  }
}

// Verify user has access to company
export async function verifyUserCompanyAccess(supabaseUserId: string, companyId: number): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { supabaseUserId },
      select: { companyId: true }
    });

    return user?.companyId === companyId;
  } catch (error) {
    console.error('Error verifying user company access:', error);
    return false;
  }
}

// Get or create company for user
export async function getOrCreateUserCompany(supabaseUserId: string, companyName?: string): Promise<number> {
  try {
    // First try to get existing user
    const existingUser = await prisma.user.findUnique({
      where: { supabaseUserId },
      select: { companyId: true }
    });

    if (existingUser?.companyId) {
      return existingUser.companyId;
    }

    // If no company exists, create one
    const company = await prisma.company.create({
      data: {
        name: companyName || 'Default Company',
        // Add other default company fields as needed
      }
    });

    // Update user with company ID
    await prisma.user.update({
      where: { supabaseUserId },
      data: { companyId: company.id }
    });

    return company.id;
  } catch (error) {
    console.error('Error getting or creating user company:', error);
    throw error;
  }
} 