import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET handler to retrieve all bank statements grouped by banks
export async function GET(request: Request) {
  try {
    // Parse URL to check for query parameters
    const { searchParams } = new URL(request.url);
    const groupByBank = searchParams.get('groupByBank') === 'true';

    if (groupByBank) {
      // Get banks with their statements for the matching page
      const banks = await prisma.bank.findMany({
        include: {
          bankStatements: {
            include: {
              _count: {
                select: {
                  transactions: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      // Process banks and their statements
      const banksWithStatements = banks
        .filter((bank: any) => bank.bankStatements.length > 0) // Only include banks with statements
        .map((bank: any) => {
          const statements = bank.bankStatements.map((statement: any) => {
            const { rawTextContent, _count, ...statementWithoutText } = statement;
            return {
              ...statementWithoutText,
              transactionCount: _count.transactions
            };
          });

          return {
            id: bank.id,
            name: bank.name,
            createdAt: bank.createdAt,
            updatedAt: bank.updatedAt,
            bankStatements: statements,
            totalStatements: statements.length,
            totalTransactions: statements.reduce((sum: number, stmt: any) => sum + stmt.transactionCount, 0)
          };
        });

      return NextResponse.json({
        success: true,
        banks: banksWithStatements
      });
    } else {
      // Original functionality - get bank statements with transaction counts
      const bankStatements = await prisma.bankStatement.findMany({
        include: {
          _count: {
            select: {
              transactions: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Process statements and include transaction counts
      const statementsWithCounts = bankStatements.map((statement: any) => {
        // Don't include raw text content in the response to reduce payload size
        const { rawTextContent, _count, ...statementWithoutText } = statement;

        return {
          ...statementWithoutText,
          transactionCount: _count.transactions
        };
      });

      return NextResponse.json({
        success: true,
        bankStatements: statementsWithCounts
      });
    }
  } catch (error: any) {
    console.error('Error fetching bank statements:', error);

    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred while fetching bank statements'
    }, { status: 500 });
  }
} 