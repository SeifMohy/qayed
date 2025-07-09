import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'

export const GET = withAuth(async (
    request: NextRequest,
    authContext,
    { params }: { params: { id: string } }
) => {
    try {
        const bankId = parseInt(params.id)
        
        if (isNaN(bankId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid bank ID' },
                { status: 400 }
            )
        }

        const { companyAccessService } = authContext;

        // Use CompanyAccessService to get bank with company-scoped filtering
        try {
            const bank = await companyAccessService.getBank(bankId);
            
            return NextResponse.json({
                success: true,
                bank
            })
        } catch (error: any) {
            if (error.message === 'Bank not found or access denied') {
                return NextResponse.json(
                    { success: false, error: 'Bank not found or access denied' },
                    { status: 404 }
                )
            }
            throw error;
        }
    } catch (error) {
        console.error('Error fetching bank:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch bank' },
            { status: 500 }
        )
    }
}); 