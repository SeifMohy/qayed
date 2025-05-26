import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to convert Decimal values to numbers for client consumption
function convertDecimalsToNumbers(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'all') {
      where.validationStatus = status;
    }
    
    if (search) {
      where.OR = [
        { bankName: { contains: search, mode: 'insensitive' } },
        { accountNumber: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get statements with pagination
    const [statements, total] = await Promise.all([
      prisma.bankStatement.findMany({
        where,
        include: {
          bank: true,
          transactions: {
            select: {
              id: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.bankStatement.count({ where })
    ]);

    // Format response
    const formattedStatements = statements.map(statement => ({
      id: statement.id,
      bankName: statement.bankName,
      accountNumber: statement.accountNumber,
      statementPeriodStart: statement.statementPeriodStart,
      statementPeriodEnd: statement.statementPeriodEnd,
      validationStatus: statement.validationStatus,
      validated: statement.validated,
      parsed: statement.parsed,
      locked: statement.locked,
      transactionCount: statement.transactions.length,
      createdAt: statement.createdAt,
      updatedAt: statement.updatedAt,
      validatedAt: statement.validatedAt,
      validatedBy: statement.validatedBy,
      fileName: statement.fileName
    }));

    return NextResponse.json({
      success: true,
      data: convertDecimalsToNumbers({
        statements: formattedStatements,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      })
    });

  } catch (error: any) {
    console.error('Error fetching statements for annotation:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch statements'
    }, { status: 500 });
  }
} 