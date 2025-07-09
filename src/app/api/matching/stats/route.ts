import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';

export const GET = withAuth(async (request: NextRequest, authContext) => {
  try {
    // Get total invoices for the company
    const totalInvoices = await prisma.invoice.count({
      where: {
        companyId: authContext.companyId
      }
    });

    // Get total transactions for the company
    const totalTransactions = await prisma.transaction.count({
      where: {
        bankStatement: {
          bank: {
            companyId: authContext.companyId
          }
        }
      }
    });

    // Get invoices that don't have any matches OR only have rejected/disputed matches
    const unmatchedInvoices = await prisma.invoice.count({
      where: {
        companyId: authContext.companyId,
        OR: [
          {
            TransactionMatch: {
              none: {}
            }
          },
          {
            TransactionMatch: {
              every: {
                status: {
                  in: ['REJECTED', 'DISPUTED']
                }
              }
            }
          }
        ]
      }
    });

    // Get transactions that don't have any matches OR only have rejected/disputed matches
    const unmatchedTransactions = await prisma.transaction.count({
      where: {
        bankStatement: {
          bank: {
            companyId: authContext.companyId
          }
        },
        OR: [
          {
            TransactionMatch: {
              none: {}
            }
          },
          {
            TransactionMatch: {
              every: {
                status: {
                  in: ['REJECTED', 'DISPUTED']
                }
              }
            }
          }
        ]
      }
    });

    // Get match counts by status - filtered by company
    const pendingMatches = await prisma.transactionMatch.count({
      where: {
        status: 'PENDING',
        AND: [
          {
            OR: [
              {
                Transaction: {
                  bankStatement: {
                    bank: {
                      companyId: authContext.companyId
                    }
                  }
                }
              },
              {
                Invoice: {
                  companyId: authContext.companyId
                }
              }
            ]
          }
        ]
      }
    });

    const approvedMatches = await prisma.transactionMatch.count({
      where: {
        status: 'APPROVED',
        AND: [
          {
            OR: [
              {
                Transaction: {
                  bankStatement: {
                    bank: {
                      companyId: authContext.companyId
                    }
                  }
                }
              },
              {
                Invoice: {
                  companyId: authContext.companyId
                }
              }
            ]
          }
        ]
      }
    });

    const rejectedMatches = await prisma.transactionMatch.count({
      where: {
        status: 'REJECTED',
        AND: [
          {
            OR: [
              {
                Transaction: {
                  bankStatement: {
                    bank: {
                      companyId: authContext.companyId
                    }
                  }
                }
              },
              {
                Invoice: {
                  companyId: authContext.companyId
                }
              }
            ]
          }
        ]
      }
    });

    const disputedMatches = await prisma.transactionMatch.count({
      where: {
        status: 'DISPUTED',
        AND: [
          {
            OR: [
              {
                Transaction: {
                  bankStatement: {
                    bank: {
                      companyId: authContext.companyId
                    }
                  }
                }
              },
              {
                Invoice: {
                  companyId: authContext.companyId
                }
              }
            ]
          }
        ]
      }
    });

    const totalMatches = await prisma.transactionMatch.count({
      where: {
        AND: [
          {
            OR: [
              {
                Transaction: {
                  bankStatement: {
                    bank: {
                      companyId: authContext.companyId
                    }
                  }
                }
              },
              {
                Invoice: {
                  companyId: authContext.companyId
                }
              }
            ]
          }
        ]
      }
    });

    // Get average match score for pending matches
    const avgMatchScore = await prisma.transactionMatch.aggregate({
      where: {
        status: 'PENDING',
        AND: [
          {
            OR: [
              {
                Transaction: {
                  bankStatement: {
                    bank: {
                      companyId: authContext.companyId
                    }
                  }
                }
              },
              {
                Invoice: {
                  companyId: authContext.companyId
                }
              }
            ]
          }
        ]
      },
      _avg: { matchScore: true }
    });

    // Get high confidence matches (passed strict criteria)
    const highConfidenceMatches = await prisma.transactionMatch.count({
      where: {
        status: 'PENDING',
        passedStrictCriteria: true,
        AND: [
          {
            OR: [
              {
                Transaction: {
                  bankStatement: {
                    bank: {
                      companyId: authContext.companyId
                    }
                  }
                }
              },
              {
                Invoice: {
                  companyId: authContext.companyId
                }
              }
            ]
          }
        ]
      }
    });

    const stats = {
      totalInvoices,
      totalTransactions,
      unmatchedInvoices,
      unmatchedTransactions,
      matches: {
        total: totalMatches,
        pending: pendingMatches,
        approved: approvedMatches,
        rejected: rejectedMatches,
        disputed: disputedMatches,
        averageScore: avgMatchScore._avg.matchScore ? Number(avgMatchScore._avg.matchScore) : 0,
        highConfidence: highConfidenceMatches
      }
    };

    console.log(`📊 Matching Stats (company ${authContext.companyId}):`);
    console.log(`   - Total invoices: ${totalInvoices}`);
    console.log(`   - Total transactions: ${totalTransactions}`);
    console.log(`   - Pending matches: ${pendingMatches}`);
    console.log(`   - Approved matches: ${approvedMatches}`);

    return NextResponse.json({
      success: true,
      stats,
      metadata: {
        companyId: authContext.companyId
      }
    });

  } catch (error: any) {
    console.error('Error fetching matching stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch matching statistics'
    }, { status: 500 });
  }
}); 