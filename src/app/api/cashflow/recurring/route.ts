import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RecurrenceFrequency, CashflowType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    const recurringPayments = await prisma.recurringPayment.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: {
            CashflowProjection: true
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { nextDueDate: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: recurringPayments,
      count: recurringPayments.length
    });
  } catch (error) {
    console.error('Error fetching recurring payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recurring payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      amount,
      type,
      frequency,
      startDate,
      endDate,
      dayOfMonth,
      dayOfWeek,
      category,
      currency = 'USD',
      confidence = 1.0
    } = body;

    // Validate required fields
    if (!name || !amount || !type || !frequency || !startDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate initial next due date
    const nextDueDate = calculateNextDueDate(
      new Date(startDate),
      frequency,
      dayOfMonth,
      dayOfWeek
    );

    const recurringPayment = await prisma.recurringPayment.create({
      data: {
        name,
        description,
        amount,
        type,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        nextDueDate,
        dayOfMonth,
        dayOfWeek,
        category,
        currency,
        confidence
      }
    });

    console.log(`✅ Created recurring payment: ${name}`);
    console.log(`ℹ️  Note: Projections will be generated when the centralized system is refreshed`);

    return NextResponse.json({
      success: true,
      data: recurringPayment,
      message: 'Recurring payment created successfully. Projections will be generated on next refresh.'
    });
  } catch (error) {
    console.error('Error creating recurring payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create recurring payment' },
      { status: 500 }
    );
  }
}

// Helper function to calculate next due date
function calculateNextDueDate(
  startDate: Date,
  frequency: RecurrenceFrequency,
  dayOfMonth?: number | null,
  dayOfWeek?: number | null
): Date {
  // Use a reasonable base date instead of system date (which might be 2025)
  const baseDate = new Date('2024-06-30'); // Use bank statement date as reference
  const actualStartDate = new Date(startDate);
  let nextDate = new Date(actualStartDate);

  // If start date is in the future relative to base date, use it as next due date
  if (nextDate > baseDate) {
    return nextDate;
  }

  // Calculate next occurrence based on frequency, using base date as reference
  switch (frequency) {
    case 'DAILY':
      while (nextDate <= baseDate) {
        nextDate.setDate(nextDate.getDate() + 1);
      }
      break;
    
    case 'WEEKLY':
      while (nextDate <= baseDate) {
        nextDate.setDate(nextDate.getDate() + 7);
      }
      break;
    
    case 'BIWEEKLY':
      while (nextDate <= baseDate) {
        nextDate.setDate(nextDate.getDate() + 14);
      }
      break;
    
    case 'MONTHLY':
      while (nextDate <= baseDate) {
        nextDate.setMonth(nextDate.getMonth() + 1);
        if (dayOfMonth) {
          nextDate.setDate(Math.min(dayOfMonth, getLastDayOfMonth(nextDate)));
        }
      }
      break;
    
    case 'QUARTERLY':
      while (nextDate <= baseDate) {
        nextDate.setMonth(nextDate.getMonth() + 3);
      }
      break;
    
    case 'SEMIANNUALLY':
      while (nextDate <= baseDate) {
        nextDate.setMonth(nextDate.getMonth() + 6);
      }
      break;
    
    case 'ANNUALLY':
      while (nextDate <= baseDate) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
      break;
  }

  return nextDate;
}

// Helper function to get last day of month
function getLastDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
} 