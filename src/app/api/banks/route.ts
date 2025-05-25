import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const banks = await prisma.bank.findMany({
            include: {
                bankStatements: {
                    include: {
                        transactions: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        })

        return NextResponse.json({
            success: true,
            banks
        })
    } catch (error) {
        console.error('Error fetching banks:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch banks' },
            { status: 500 }
        )
    }
} 