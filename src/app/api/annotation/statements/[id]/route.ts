import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { isFacilityAccount } from '@/utils/bankStatementUtils';
import { cleanupOrphanedBank } from '@/lib/services/bankCleanupService';
import { CompanyAccessService } from '@/lib/services/companyAccessService';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Helper function to convert Decimal values to numbers for client consumption
function convertDecimalsToNumbers(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (obj instanceof Decimal) {
    return obj.toNumber();
  }
  
  // Handle Decimal objects that come as {s, e, d} format
  if (obj && typeof obj === 'object' && 's' in obj && 'e' in obj && 'd' in obj && Array.isArray(obj.d)) {
    try {
      // Convert the Decimal object format to a number
      const sign = obj.s === 1 ? 1 : -1;
      const exponent = obj.e;
      const digits = obj.d;
      
      // Reconstruct the number from the Decimal format
      // Each element in the digits array represents a group of digits
      let digitString = '';
      for (let i = 0; i < digits.length; i++) {
        if (i === 0) {
          digitString += digits[i].toString();
        } else {
          // Pad subsequent digits to 7 characters
          digitString += digits[i].toString().padStart(7, '0');
        }
      }
      
      // Apply the exponent to determine decimal place
      const totalDigits = digitString.length;
      const decimalPlace = exponent + 1;
      
      let result;
      if (decimalPlace <= 0) {
        result = parseFloat('0.' + '0'.repeat(-decimalPlace) + digitString);
      } else if (decimalPlace >= totalDigits) {
        result = parseFloat(digitString + '0'.repeat(decimalPlace - totalDigits));
      } else {
        const integerPart = digitString.substring(0, decimalPlace);
        const fractionalPart = digitString.substring(decimalPlace);
        result = parseFloat(integerPart + '.' + fractionalPart);
      }
      
      return sign * result;
    } catch (error) {
      console.warn('Failed to convert decimal object:', obj);
      return 0; // Return 0 as fallback
    }
  }
  
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertDecimalsToNumbers);
  }
  
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertDecimalsToNumbers(value);
    }
    return converted;
  }
  
  return obj;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid statement ID'
      }, { status: 400 });
    }

    const statement = await prisma.bankStatement.findUnique({
      where: { id },
      include: {
        bank: true,
        transactions: {
          orderBy: {
            id: 'asc'
          }
        },
      }
    });

    if (!statement) {
      return NextResponse.json({
        success: false,
        error: 'Statement not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: convertDecimalsToNumbers(statement)
    });

  } catch (error: any) {
    console.error('Error fetching statement:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch statement'
    }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid statement ID'
      }, { status: 400 });
    }

    const body = await request.json();
    const {
      bankName,
      accountNumber,
      statementPeriodStart,
      statementPeriodEnd,
      accountType,
      accountCurrency,
      startingBalance,
      endingBalance,
      validationStatus,
      validationNotes,
      validated,
      validatedBy,
      tenor,
      availableLimit,
      interestRate
    } = body;

    // Fetch statement and its bank to get companyId
    const existingStatement = await prisma.bankStatement.findUnique({
      where: { id },
      include: { bank: true }
    });

    if (!existingStatement) {
      return NextResponse.json({
        success: false,
        error: 'Statement not found'
      }, { status: 404 });
    }

    if (existingStatement.locked) {
      return NextResponse.json({
        success: false,
        error: 'Statement is locked and cannot be modified'
      }, { status: 403 });
    }

    // Get companyId from the bank
    const companyId = existingStatement.bank.companyId;

    // Track if facility-related fields are being updated
    const isFacilityFieldsUpdate = (
      tenor !== undefined || 
      availableLimit !== undefined || 
      interestRate !== undefined ||
      accountType !== undefined ||
      endingBalance !== undefined
    );

    // Handle bank name updates specially - update both Bank record and all related statements
    if (bankName !== undefined && bankName !== existingStatement.bankName) {
      const trimmedBankName = bankName.trim();
      
      if (trimmedBankName.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Bank name cannot be empty'
        }, { status: 400 });
      }

      // Use a transaction to update bank name across all related records
      const result = await prisma.$transaction(async (tx) => {
        // Store the old bank ID for potential cleanup
        const oldBankId = existingStatement.bankId;
        
        // Find or create the bank with the new name (with company scope)
        let targetBank = await tx.bank.findFirst({
          where: { 
            name: trimmedBankName,
            companyId: companyId
          }
        });

        if (!targetBank) {
          // Create new bank if it doesn't exist - now with company ID
          targetBank = await tx.bank.create({
            data: { 
              name: trimmedBankName,
              companyId: companyId
            }
          });
        }

        // Update all bank statements that have the same bankId as the current statement
        const updatedStatements = await tx.bankStatement.updateMany({
          where: { bankId: oldBankId },
          data: { 
            bankName: trimmedBankName,
            bankId: targetBank.id
          }
        });

        // Check if the old bank has any remaining bank statements and clean up if orphaned
        if (oldBankId !== targetBank.id) {
          await cleanupOrphanedBank(oldBankId, tx);
        }

        // Now update the current statement with any other changes
        const updateData: any = {};
        if (accountNumber !== undefined) updateData.accountNumber = accountNumber;
        if (statementPeriodStart !== undefined) updateData.statementPeriodStart = new Date(statementPeriodStart);
        if (statementPeriodEnd !== undefined) updateData.statementPeriodEnd = new Date(statementPeriodEnd);
        if (accountType !== undefined) updateData.accountType = accountType;
        if (accountCurrency !== undefined) updateData.accountCurrency = accountCurrency;
        if (startingBalance !== undefined) updateData.startingBalance = new Decimal(startingBalance);
        if (endingBalance !== undefined) updateData.endingBalance = new Decimal(endingBalance);
        if (validationStatus !== undefined) updateData.validationStatus = validationStatus;
        if (validationNotes !== undefined) updateData.validationNotes = validationNotes;
        if (tenor !== undefined) updateData.tenor = tenor;
        if (availableLimit !== undefined) updateData.availableLimit = availableLimit ? new Decimal(availableLimit) : null;
        if (interestRate !== undefined) updateData.interestRate = interestRate;
        if (validated !== undefined) {
          updateData.validated = validated;
          if (validated) {
            updateData.validatedAt = new Date();
            if (validatedBy) updateData.validatedBy = validatedBy;
          }
        }

        const updatedStatement = await tx.bankStatement.update({
          where: { id },
          data: updateData,
          include: {
            bank: true,
            transactions: {
              orderBy: {
                id: 'asc'
              }
            },
          }
        });

        // If accountCurrency was updated, cascade the change to all transactions
        if (accountCurrency !== undefined && accountCurrency !== existingStatement.accountCurrency) {
          const updatedTransactions = await tx.transaction.updateMany({
            where: { bankStatementId: id },
            data: { currency: accountCurrency }
          });
          console.log(`🔄 Updated currency for ${updatedTransactions.count} transactions to ${accountCurrency}`);
        }

        return {
          statement: updatedStatement,
          updatedStatementsCount: updatedStatements.count
        };
      });

      // Update facility projections if this is a facility account and facility fields were updated
      if (isFacilityFieldsUpdate) {
        const updatedEndingBalance = endingBalance !== undefined ? parseFloat(endingBalance.toString()) : parseFloat(result.statement.endingBalance.toString());
        const updatedAccountType = accountType !== undefined ? accountType : result.statement.accountType;
        
        if (isFacilityAccount(updatedAccountType, updatedEndingBalance)) {
          console.log(`Facility ${id} updated - projections will be refreshed when centralized service is next run`);
        }
      }

      return NextResponse.json({
        success: true,
        data: convertDecimalsToNumbers(result.statement),
        message: `Bank name updated. ${result.updatedStatementsCount} statements updated with the new bank name.`
      });
    }

    // Handle regular updates (no bank name change) using transaction for currency cascading
    const result = await prisma.$transaction(async (tx) => {
      const updateData: any = {};
      
      if (accountNumber !== undefined) updateData.accountNumber = accountNumber;
      if (statementPeriodStart !== undefined) updateData.statementPeriodStart = new Date(statementPeriodStart);
      if (statementPeriodEnd !== undefined) updateData.statementPeriodEnd = new Date(statementPeriodEnd);
      if (accountType !== undefined) updateData.accountType = accountType;
      if (accountCurrency !== undefined) updateData.accountCurrency = accountCurrency;
      if (startingBalance !== undefined) updateData.startingBalance = new Decimal(startingBalance);
      if (endingBalance !== undefined) updateData.endingBalance = new Decimal(endingBalance);
      if (validationStatus !== undefined) updateData.validationStatus = validationStatus;
      if (validationNotes !== undefined) updateData.validationNotes = validationNotes;
      if (tenor !== undefined) updateData.tenor = tenor;
      if (availableLimit !== undefined) updateData.availableLimit = availableLimit ? new Decimal(availableLimit) : null;
      if (interestRate !== undefined) updateData.interestRate = interestRate;
      if (validated !== undefined) {
        updateData.validated = validated;
        if (validated) {
          updateData.validatedAt = new Date();
          if (validatedBy) updateData.validatedBy = validatedBy;
        }
      }

      // Update statement
      const updatedStatement = await tx.bankStatement.update({
        where: { id },
        data: updateData,
        include: {
          bank: true,
          transactions: {
            orderBy: {
              id: 'asc'
            }
          },
        }
      });

      // If accountCurrency was updated, cascade the change to all transactions
      if (accountCurrency !== undefined && accountCurrency !== existingStatement.accountCurrency) {
        const updatedTransactions = await tx.transaction.updateMany({
          where: { bankStatementId: id },
          data: { currency: accountCurrency }
        });
        console.log(`🔄 Updated currency for ${updatedTransactions.count} transactions to ${accountCurrency}`);
      }

      return updatedStatement;
    });

    // Update facility projections if this is a facility account and facility fields were updated
    if (isFacilityFieldsUpdate) {
      const updatedEndingBalance = parseFloat(result.endingBalance.toString());
      if (isFacilityAccount(result.accountType, updatedEndingBalance)) {
        console.log(`Facility ${id} updated - projections will be refreshed when centralized service is next run`);
      }
    }

    return NextResponse.json({
      success: true,
      data: convertDecimalsToNumbers(result)
    });

  } catch (error: any) {
    console.error('Error updating statement:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'A bank with this name already exists'
      }, { status: 409 });
    }
    
    // Handle foreign key constraint violations
    if (error.code === 'P2003') {
      return NextResponse.json({
        success: false,
        error: 'Invalid reference to related data'
      }, { status: 400 });
    }
    
    // Handle record not found errors
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: 'Record not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred while updating statement'
    }, { status: 500 });
  }
} 