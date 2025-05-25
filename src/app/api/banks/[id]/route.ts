import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const bankId = parseInt(params.id)
        
        if (isNaN(bankId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid bank ID' },
                { status: 400 }
            )
        }

        const bank = await prisma.bank.findUnique({
            where: {
                id: bankId
            },
            include: {
                bankStatements: {
                    include: {
                        transactions: {
                            orderBy: {
                                transactionDate: 'desc'
                            }
                        }
                    },
                    orderBy: {
                        statementPeriodEnd: 'desc'
                    }
                }
            }
        })

        if (!bank) {
            return NextResponse.json(
                { success: false, error: 'Bank not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            bank
        })
    } catch (error) {
        console.error('Error fetching bank:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch bank' },
            { status: 500 }
        )
    }
} 