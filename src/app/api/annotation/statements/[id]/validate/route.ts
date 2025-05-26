import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function POST(
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

    // Get statement with transactions
    const statement = await prisma.bankStatement.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: {
            transactionDate: 'asc'
          }
        }
      }
    });

    if (!statement) {
      return NextResponse.json({
        success: false,
        error: 'Statement not found'
      }, { status: 404 });
    }

    // Perform validation calculations
    const validationResult = performBalanceValidation(statement);

    // Update statement with validation result
    const updatedStatement = await prisma.bankStatement.update({
      where: { id },
      data: {
        validationStatus: validationResult.status,
        validationNotes: validationResult.notes,
        validated: validationResult.status === 'passed',
        validatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        statement: convertDecimalsToNumbers(updatedStatement),
        validation: validationResult
      }
    });

  } catch (error: any) {
    console.error('Error validating statement:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to validate statement'
    }, { status: 500 });
  }
}

interface ValidationResult {
  status: 'passed' | 'failed' | 'pending';
  notes: string;
  details: {
    startingBalance: number;
    endingBalance: number;
    calculatedBalance: number;
    totalCredits: number;
    totalDebits: number;
    discrepancy: number;
    transactionCount: number;
  };
}

function performBalanceValidation(statement: any): ValidationResult {
  const startingBalance = Number(statement.startingBalance);
  const endingBalance = Number(statement.endingBalance);
  const transactions = statement.transactions;

  // Calculate totals
  let totalCredits = 0;
  let totalDebits = 0;

  transactions.forEach((transaction: any) => {
    if (transaction.creditAmount) {
      totalCredits += Number(transaction.creditAmount);
    }
    if (transaction.debitAmount) {
      totalDebits += Number(transaction.debitAmount);
    }
  });

  // Calculate expected ending balance
  const calculatedBalance = startingBalance + totalCredits - totalDebits;
  const discrepancy = Math.abs(calculatedBalance - endingBalance);

  // Determine validation status
  const tolerance = 0.01; // Allow 1 cent tolerance for rounding
  const status = discrepancy <= tolerance ? 'passed' : 'failed';

  // Generate notes
  let notes = '';
  if (status === 'passed') {
    notes = `Validation passed. Starting balance (${startingBalance.toFixed(2)}) + Credits (${totalCredits.toFixed(2)}) - Debits (${totalDebits.toFixed(2)}) = Ending balance (${endingBalance.toFixed(2)})`;
  } else {
    notes = `Validation failed. Expected ending balance: ${calculatedBalance.toFixed(2)}, Actual: ${endingBalance.toFixed(2)}, Discrepancy: ${discrepancy.toFixed(2)}`;
  }

  return {
    status,
    notes,
    details: {
      startingBalance,
      endingBalance,
      calculatedBalance,
      totalCredits,
      totalDebits,
      discrepancy,
      transactionCount: transactions.length
    }
  };
}

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