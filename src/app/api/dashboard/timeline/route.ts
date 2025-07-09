import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';

export const GET = withAuth(async (request, authContext) => {
  try {
    const { companyAccessService } = authContext;
    
    // Get the latest bank statement for the company
    const latestBankStatement = await prisma.bankStatement.findFirst({
      where: {
        bank: {
          companyId: authContext.companyId
        }
      },
      orderBy: {
        statementPeriodEnd: 'desc'
      },
      select: {
        statementPeriodEnd: true,
        bankName: true
      }
    });

    // Use current date if no bank statement found
    const referenceDate = latestBankStatement?.statementPeriodEnd || new Date();
    
    // Get next 3 upcoming supplier payments from reference date
    const supplierPayments = await prisma.cashflowProjection.findMany({
      where: {
        type: 'SUPPLIER_PAYABLE',
        status: 'PROJECTED',
        projectionDate: {
          gte: referenceDate
        },
        Invoice: {
          companyId: authContext.companyId
        }
      },
      include: {
        Invoice: {
          include: {
            Supplier: true
          }
        }
      },
      orderBy: {
        projectionDate: 'asc'
      },
      take: 3
    });

    // Get next 3 upcoming customer payments from reference date
    const customerPayments = await prisma.cashflowProjection.findMany({
      where: {
        type: 'CUSTOMER_RECEIVABLE',
        status: 'PROJECTED',
        projectionDate: {
          gte: referenceDate
        },
        Invoice: {
          companyId: authContext.companyId
        }
      },
      include: {
        Invoice: {
          include: {
            Customer: true
          }
        }
      },
      orderBy: {
        projectionDate: 'asc'
      },
      take: 3
    });

    // Get next 3 upcoming bank payments from reference date
    const bankPayments = await prisma.cashflowProjection.findMany({
      where: {
        type: {
          in: ['BANK_OBLIGATION', 'LOAN_PAYMENT']
        },
        status: 'PROJECTED',
        projectionDate: {
          gte: referenceDate
        },
        BankStatement: {
          bank: {
            companyId: authContext.companyId
          }
        }
      },
      include: {
        BankStatement: {
          include: {
            bank: true
          }
        }
      },
      orderBy: {
        projectionDate: 'asc'
      },
      take: 3
    });

    // Format supplier payments
    const formattedSupplierPayments = supplierPayments.map(payment => ({
      id: payment.id,
      supplier: payment.Invoice?.Supplier?.name || 'Unknown Supplier',
      amount: Math.abs(Number(payment.projectedAmount)),
      dueDate: payment.projectionDate.toISOString().split('T')[0],
      status: payment.status === 'PROJECTED' ? 'Pending' : 'Scheduled',
      confidence: payment.confidence,
      description: payment.description || `Invoice #${payment.Invoice?.invoiceNumber || 'Unknown'}`
    }));

    // Format customer payments
    const formattedCustomerPayments = customerPayments.map(payment => ({
      id: payment.id,
      customer: payment.Invoice?.Customer?.name || 'Unknown Customer',
      amount: Number(payment.projectedAmount),
      dueDate: payment.projectionDate.toISOString().split('T')[0],
      status: payment.status === 'PROJECTED' ? 'Pending' : 'Scheduled',
      confidence: payment.confidence,
      description: payment.description || `Invoice #${payment.Invoice?.invoiceNumber || 'Unknown'}`
    }));

    // Format bank payments
    const formattedBankPayments = bankPayments.map(payment => ({
      id: payment.id,
      bank: payment.BankStatement?.bank?.name || 'Unknown Bank',
      amount: Math.abs(Number(payment.projectedAmount)),
      dueDate: payment.projectionDate.toISOString().split('T')[0],
      type: payment.type === 'LOAN_PAYMENT' ? 'Loan Payment' : 'Bank Obligation',
      confidence: payment.confidence,
      description: payment.description || `${payment.type.replace('_', ' ').toLowerCase()}`
    }));

    console.log(`📊 Dashboard Timeline (company ${authContext.companyId}) generated:`);
    console.log(`   - Supplier payments: ${formattedSupplierPayments.length}`);
    console.log(`   - Customer payments: ${formattedCustomerPayments.length}`);
    console.log(`   - Bank payments: ${formattedBankPayments.length}`);

    return NextResponse.json({
      success: true,
      timeline: {
        suppliers: formattedSupplierPayments,
        customers: formattedCustomerPayments,
        banks: formattedBankPayments
      },
      metadata: {
        companyId: authContext.companyId,
        referenceDate: referenceDate.toISOString(),
        referenceDateFormatted: referenceDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        bankName: latestBankStatement?.bankName || 'No Bank Data',
        limit: 3,
        note: latestBankStatement 
          ? 'Timeline shows projected payments from the latest bank statement date'
          : 'Timeline shows projected payments from current date (no bank statement found)'
      }
    });

  } catch (error) {
    console.error('Dashboard timeline API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard timeline',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}); 