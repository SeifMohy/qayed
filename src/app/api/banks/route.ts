import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Get the most recent bank statement date across all banks to use as reference
        const latestBankStatement = await prisma.bankStatement.findFirst({
            orderBy: {
                statementPeriodEnd: 'desc'
            },
            select: {
                statementPeriodEnd: true,
                bankName: true,
                accountNumber: true
            }
        });

        const referenceDate = latestBankStatement?.statementPeriodEnd || new Date();

        const banks = await prisma.bank.findMany({
            include: {
                bankStatements: {
                    include: {
                        transactions: true
                    },
                    orderBy: {
                        statementPeriodEnd: 'desc'
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        })

        // Process banks to determine their update status
        const banksWithStatus = banks.map(bank => {
            // Find the latest statement for this bank
            const latestStatement = bank.bankStatements.length > 0 
                ? bank.bankStatements[0] 
                : null;

            let updateStatus = 'current';
            let daysBehind = 0;

            if (latestStatement) {
                const statementDate = new Date(latestStatement.statementPeriodEnd);
                const timeDiff = referenceDate.getTime() - statementDate.getTime();
                daysBehind = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

                if (daysBehind > 7) {
                    updateStatus = 'needs_update';
                } else if (daysBehind > 3) {
                    updateStatus = 'slightly_behind';
                }
            } else {
                updateStatus = 'no_data';
            }

            return {
                ...bank,
                updateStatus,
                daysBehind,
                latestStatementDate: latestStatement?.statementPeriodEnd || null
            };
        });

        return NextResponse.json({
            success: true,
            banks: banksWithStatus,
            metadata: {
                referenceDate: referenceDate.toISOString(),
                referenceDateFormatted: referenceDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                bankName: latestBankStatement?.bankName || 'Multiple Banks',
                accountNumber: latestBankStatement?.accountNumber || '',
                note: 'Bank balances and data as of the latest available bank statement date',
                totalBanks: banksWithStatus.length,
                banksNeedingUpdate: banksWithStatus.filter(b => b.updateStatus === 'needs_update').length,
                banksSlightlyBehind: banksWithStatus.filter(b => b.updateStatus === 'slightly_behind').length
            }
        })
    } catch (error) {
        console.error('Error fetching banks:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch banks' },
            { status: 500 }
        )
    }
} 