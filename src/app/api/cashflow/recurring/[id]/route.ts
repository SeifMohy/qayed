import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RecurrenceFrequency, CashflowType } from '@prisma/client';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid recurring payment ID' },
        { status: 400 }
      );
    }

    const recurringPayment = await prisma.recurringPayment.findUnique({
      where: { id },
      include: {
        CashflowProjection: {
          where: {
            projectionDate: {
              gte: new Date()
            }
          },
          orderBy: {
            projectionDate: 'asc'
          },
          take: 10
        },
        _count: {
          select: {
            CashflowProjection: true
          }
        }
      }
    });

    if (!recurringPayment) {
      return NextResponse.json(
        { success: false, error: 'Recurring payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: recurringPayment
    });
  } catch (error) {
    console.error('Error fetching recurring payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recurring payment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid recurring payment ID' },
        { status: 400 }
      );
    }

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
      currency,
      confidence,
      isActive
    } = body;

    // Check if recurring payment exists
    const existingPayment = await prisma.recurringPayment.findUnique({
      where: { id }
    });

    if (!existingPayment) {
      return NextResponse.json(
        { success: false, error: 'Recurring payment not found' },
        { status: 404 }
      );
    }

    // Calculate new next due date if frequency or timing changed
    let nextDueDate = existingPayment.nextDueDate;
    if (frequency !== existingPayment.frequency || 
        dayOfMonth !== existingPayment.dayOfMonth || 
        dayOfWeek !== existingPayment.dayOfWeek ||
        startDate !== existingPayment.startDate.toISOString()) {
      nextDueDate = calculateNextDueDate(
        new Date(startDate || existingPayment.startDate),
        frequency || existingPayment.frequency,
        dayOfMonth,
        dayOfWeek
      );
    }

    const updatedPayment = await prisma.recurringPayment.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(amount !== undefined && { amount }),
        ...(type !== undefined && { type }),
        ...(frequency !== undefined && { frequency }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(dayOfMonth !== undefined && { dayOfMonth }),
        ...(dayOfWeek !== undefined && { dayOfWeek }),
        ...(category !== undefined && { category }),
        ...(currency !== undefined && { currency }),
        ...(confidence !== undefined && { confidence }),
        ...(isActive !== undefined && { isActive }),
        nextDueDate
      }
    });

    // Regenerate projections if significant changes were made
    const significantChange = amount !== existingPayment.amount ||
                            type !== existingPayment.type ||
                            frequency !== existingPayment.frequency ||
                            isActive !== existingPayment.isActive;

    if (significantChange) {
      await regenerateProjectionsForRecurring(id);
    }

    return NextResponse.json({
      success: true,
      data: updatedPayment
    });
  } catch (error) {
    console.error('Error updating recurring payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update recurring payment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid recurring payment ID' },
        { status: 400 }
      );
    }

    // Check if recurring payment exists
    const existingPayment = await prisma.recurringPayment.findUnique({
      where: { id }
    });

    if (!existingPayment) {
      return NextResponse.json(
        { success: false, error: 'Recurring payment not found' },
        { status: 404 }
      );
    }

    // Delete associated future projections first
    await prisma.cashflowProjection.deleteMany({
      where: {
        recurringPaymentId: id,
        projectionDate: {
          gte: new Date()
        }
      }
    });

    // Delete the recurring payment
    await prisma.recurringPayment.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Recurring payment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting recurring payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete recurring payment' },
      { status: 500 }
    );
  }
}

// Helper functions (copied from main route for consistency)
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

function getLastDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

async function regenerateProjectionsForRecurring(recurringPaymentId: number) {
  const recurringPayment = await prisma.recurringPayment.findUnique({
    where: { id: recurringPaymentId }
  });

  if (!recurringPayment) {
    return;
  }

  // Use bank statement date as base instead of system date
  const baseDate = new Date('2024-06-30');

  // Delete existing future projections
  await prisma.cashflowProjection.deleteMany({
    where: {
      recurringPaymentId: recurringPayment.id,
      projectionDate: {
        gte: baseDate
      }
    }
  });

  // If inactive, don't generate new projections
  if (!recurringPayment.isActive) {
    console.log(`⏸️  Skipping projection generation for inactive recurring payment: ${recurringPayment.name}`);
    return;
  }

  // Generate new projections for 12 months from base date
  const endProjectionDate = new Date(baseDate);
  endProjectionDate.setFullYear(baseDate.getFullYear() + 1);

  const projections = [];
  let currentDate = new Date(recurringPayment.nextDueDate);

  console.log(`🔄 Regenerating recurring payment projections for "${recurringPayment.name}" from ${currentDate.toISOString().split('T')[0]} to ${endProjectionDate.toISOString().split('T')[0]}`);

  while (currentDate <= endProjectionDate) {
    if (recurringPayment.endDate && currentDate > recurringPayment.endDate) {
      break;
    }

    const projectedAmount = recurringPayment.type === 'RECURRING_INFLOW' 
      ? Number(recurringPayment.amount) 
      : -Math.abs(Number(recurringPayment.amount));

    projections.push({
      projectionDate: new Date(currentDate),
      projectedAmount,
      type: recurringPayment.type,
      status: 'PROJECTED' as const,
      confidence: recurringPayment.confidence,
      description: `${recurringPayment.name} - ${recurringPayment.frequency.toLowerCase()} recurring`,
      recurringPaymentId: recurringPayment.id
    });

    currentDate = getNextOccurrence(currentDate, recurringPayment.frequency, recurringPayment.dayOfMonth, recurringPayment.dayOfWeek);
  }

  if (projections.length > 0) {
    await prisma.cashflowProjection.createMany({
      data: projections
    });
    console.log(`✅ Regenerated ${projections.length} recurring payment projections for "${recurringPayment.name}"`);
  }
}

function getNextOccurrence(
  currentDate: Date,
  frequency: RecurrenceFrequency,
  dayOfMonth?: number | null,
  dayOfWeek?: number | null
): Date {
  const nextDate = new Date(currentDate);

  switch (frequency) {
    case 'DAILY':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    
    case 'WEEKLY':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    
    case 'BIWEEKLY':
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    
    case 'MONTHLY':
      nextDate.setMonth(nextDate.getMonth() + 1);
      if (dayOfMonth) {
        nextDate.setDate(Math.min(dayOfMonth, getLastDayOfMonth(nextDate)));
      }
      break;
    
    case 'QUARTERLY':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    
    case 'SEMIANNUALLY':
      nextDate.setMonth(nextDate.getMonth() + 6);
      break;
    
    case 'ANNUALLY':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }

  return nextDate;
} 