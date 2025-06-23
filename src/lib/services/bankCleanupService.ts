import { prisma } from '@/lib/prisma';

/**
 * Checks if a bank has any associated bank statements and removes it if orphaned
 * @param bankId - The ID of the bank to check
 * @param transaction - Optional Prisma transaction client
 * @returns Promise<{ removed: boolean, bankName?: string }>
 */
export async function cleanupOrphanedBank(
  bankId: number, 
  transaction?: any
): Promise<{ removed: boolean, bankName?: string }> {
  const tx = transaction || prisma;
  
  try {
    // Check if the bank has any remaining bank statements
    const remainingStatements = await tx.bankStatement.count({
      where: { bankId }
    });

    if (remainingStatements === 0) {
      // Get the bank name for logging before deletion
      const bank = await tx.bank.findUnique({
        where: { id: bankId }
      });
      
      if (!bank) {
        console.log(`⚠️ Bank with ID ${bankId} not found, may have already been deleted`);
        return { removed: false };
      }
      
      // Delete the orphaned bank record
      await tx.bank.delete({
        where: { id: bankId }
      });
      
      console.log(`🗑️ Removed orphaned bank record: "${bank.name}" (ID: ${bankId})`);
      return { removed: true, bankName: bank.name };
    } else {
      console.log(`⚠️ Bank (ID: ${bankId}) still has ${remainingStatements} statements, keeping it`);
      return { removed: false };
    }
  } catch (error: any) {
    console.error(`Error during bank cleanup for bank ID ${bankId}:`, error);
    // Don't throw error to prevent transaction rollback
    return { removed: false };
  }
}

/**
 * Checks for and removes multiple orphaned banks
 * @param bankIds - Array of bank IDs to check
 * @param transaction - Optional Prisma transaction client
 * @returns Promise<{ removedCount: number, removedBanks: string[] }>
 */
export async function cleanupOrphanedBanks(
  bankIds: number[], 
  transaction?: any
): Promise<{ removedCount: number, removedBanks: string[] }> {
  const removedBanks: string[] = [];
  let removedCount = 0;
  
  for (const bankId of bankIds) {
    const result = await cleanupOrphanedBank(bankId, transaction);
    if (result.removed) {
      removedCount++;
      if (result.bankName) {
        removedBanks.push(result.bankName);
      }
    }
  }
  
  return { removedCount, removedBanks };
}

/**
 * Performs a full system cleanup of all orphaned banks
 * This should be used sparingly and preferably during maintenance
 * @returns Promise<{ removedCount: number, removedBanks: string[] }>
 */
export async function cleanupAllOrphanedBanks(): Promise<{ removedCount: number, removedBanks: string[] }> {
  try {
    // Find all banks that have no bank statements
    const orphanedBanks = await prisma.bank.findMany({
      where: {
        bankStatements: {
          none: {}
        }
      },
      select: {
        id: true,
        name: true
      }
    });
    
    if (orphanedBanks.length === 0) {
      console.log('No orphaned banks found');
      return { removedCount: 0, removedBanks: [] };
    }
    
    console.log(`Found ${orphanedBanks.length} orphaned banks to clean up`);
    
    // Delete all orphaned banks
    const deleteResult = await prisma.bank.deleteMany({
      where: {
        id: {
          in: orphanedBanks.map(bank => bank.id)
        }
      }
    });
    
    const removedBanks = orphanedBanks.map(bank => bank.name);
    
    console.log(`🗑️ Cleaned up ${deleteResult.count} orphaned banks: ${removedBanks.join(', ')}`);
    
    return { 
      removedCount: deleteResult.count, 
      removedBanks 
    };
  } catch (error: any) {
    console.error('Error during full orphaned banks cleanup:', error);
    throw error;
  }
} 