import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware/auth'

export const GET = withAuth(async (request: NextRequest, authContext) => {
    try {
        const { companyAccessService } = authContext;

        // Get the most recent bank statement date across user's company banks to use as reference
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
                bankName: true,
                accountNumber: true
            }
        });

        const referenceDate = latestBankStatement?.statementPeriodEnd || new Date();

        // Get banks using CompanyAccessService for company-scoped filtering
        const banks = await companyAccessService.getBanks();

        // Process banks to determine their update status
        const banksWithStatus = banks.map(bank => {
            // Find the latest statement for this bank
            const latestStatement = bank.bankStatements.length > 0 
                ? bank.bankStatements.sort((a, b) => 
                    new Date(b.statementPeriodEnd).getTime() - new Date(a.statementPeriodEnd).getTime()
                  )[0] 
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
}); 