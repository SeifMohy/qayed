import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

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
            transactionDate: 'asc'
          }
        },
        Customer: true,
        Supplier: true
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
      validatedBy
    } = body;

    // Check if statement exists and is not locked
    const existingStatement = await prisma.bankStatement.findUnique({
      where: { id }
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

    // Prepare update data
    const updateData: any = {};
    
    if (bankName !== undefined) updateData.bankName = bankName;
    if (accountNumber !== undefined) updateData.accountNumber = accountNumber;
    if (statementPeriodStart !== undefined) updateData.statementPeriodStart = new Date(statementPeriodStart);
    if (statementPeriodEnd !== undefined) updateData.statementPeriodEnd = new Date(statementPeriodEnd);
    if (accountType !== undefined) updateData.accountType = accountType;
    if (accountCurrency !== undefined) updateData.accountCurrency = accountCurrency;
    if (startingBalance !== undefined) updateData.startingBalance = new Decimal(startingBalance);
    if (endingBalance !== undefined) updateData.endingBalance = new Decimal(endingBalance);
    if (validationStatus !== undefined) updateData.validationStatus = validationStatus;
    if (validationNotes !== undefined) updateData.validationNotes = validationNotes;
    if (validated !== undefined) {
      updateData.validated = validated;
      if (validated) {
        updateData.validatedAt = new Date();
        if (validatedBy) updateData.validatedBy = validatedBy;
      }
    }

    // Update statement
    const updatedStatement = await prisma.bankStatement.update({
      where: { id },
      data: updateData,
      include: {
        bank: true,
        transactions: {
          orderBy: {
            transactionDate: 'asc'
          }
        },
        Customer: true,
        Supplier: true
      }
    });

    return NextResponse.json({
      success: true,
      data: convertDecimalsToNumbers(updatedStatement)
    });

  } catch (error: any) {
    console.error('Error updating statement:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update statement'
    }, { status: 500 });
  }
} 