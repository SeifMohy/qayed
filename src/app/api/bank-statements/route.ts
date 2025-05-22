import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET handler to retrieve all bank statements
export async function GET(request: Request) {
  try {
    // Parse URL to check for query parameters
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const supplierId = searchParams.get('supplierId');
    
    // Base query
    const whereClause: any = {};
    
    // Add filters if provided
    if (customerId) {
      whereClause.customerId = parseInt(customerId, 10);
    }
    
    if (supplierId) {
      whereClause.supplierId = parseInt(supplierId, 10);
    }
    
    // Get bank statements with the appropriate filters
    const bankStatements = await prisma.bankStatement.findMany({
      where: whereClause,
      include: {
        Customer: {
          select: {
            id: true,
            name: true
          }
        },
        Supplier: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Get transaction counts for each statement
    const statementsWithCounts = await Promise.all(
      bankStatements.map(async (statement) => {
        const transactionCount = await prisma.transaction.count({
          where: { bankStatementId: statement.id }
        });
        
        // Don't include raw text content in the response to reduce payload size
        const { rawTextContent, ...statementWithoutText } = statement;
        
        return {
          ...statementWithoutText,
          transactionCount
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      bankStatements: statementsWithCounts
    });
    
  } catch (error: any) {
    console.error('Error fetching bank statements:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred while fetching bank statements'
    }, { status: 500 });
  }
} 