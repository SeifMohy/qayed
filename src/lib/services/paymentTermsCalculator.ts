import type { PaymentTermsData } from '@/types/paymentTerms';
import type { ExpectedPayment } from '@/types/cashflow';

export class PaymentTermsCalculator {
  /**
   * Calculate expected payment dates and amounts from an invoice and payment terms
   */
  static calculateExpectedPayments(
    invoiceAmount: number,
    invoiceDate: Date,
    paymentTerms: PaymentTermsData
  ): ExpectedPayment[] {
    const payments: ExpectedPayment[] = [];
    let remainingAmount = invoiceAmount;

    // Handle down payment first
    if (paymentTerms.downPayment?.required) {
      const downPaymentDate = this.calculateDownPaymentDate(invoiceDate, paymentTerms.downPayment);
      const downPaymentAmount = paymentTerms.downPayment.percentage 
        ? invoiceAmount * (paymentTerms.downPayment.percentage / 100)
        : paymentTerms.downPayment.amount || 0;
        
      if (downPaymentAmount > 0) {
        payments.push({
          date: downPaymentDate.toISOString(),
          amount: downPaymentAmount,
          description: 'Down payment',
          type: 'down_payment'
        });
        remainingAmount -= downPaymentAmount;
      }
    }

    // Handle installments or final payment
    if (paymentTerms.installments && paymentTerms.installments.length > 0) {
      // Process installments
      paymentTerms.installments.forEach((installment, index) => {
        const installmentDate = new Date(invoiceDate);
        installmentDate.setDate(installmentDate.getDate() + installment.dueDays);
        
        const installmentAmount = installment.percentage
          ? invoiceAmount * (installment.percentage / 100)
          : installment.amount || 0;
          
        if (installmentAmount > 0) {
          payments.push({
            date: installmentDate.toISOString(),
            amount: installmentAmount,
            description: installment.description || `Installment ${index + 1}`,
            type: 'installment',
            installmentId: installment.id
          });
          remainingAmount -= installmentAmount;
        }
      });
    }

    // Handle remaining amount as final payment
    if (remainingAmount > 0.01) { // Small threshold for floating point precision
      const finalPaymentDays = this.extractPaymentDays(paymentTerms.paymentPeriod);
      const finalPaymentDate = new Date(invoiceDate);
      finalPaymentDate.setDate(finalPaymentDate.getDate() + finalPaymentDays);
      
      const paymentType = paymentTerms.installments && paymentTerms.installments.length > 0 
        ? 'final_payment' 
        : 'full_payment';
      
      payments.push({
        date: finalPaymentDate.toISOString(),
        amount: remainingAmount,
        description: paymentType === 'final_payment' ? 'Final payment' : 'Full payment',
        type: paymentType
      });
    }

    return payments;
  }

  /**
   * Extract number of days from payment period string
   */
  private static extractPaymentDays(paymentPeriod: string): number {
    if (paymentPeriod === 'Due on receipt') return 0;
    if (paymentPeriod.includes('Net ')) {
      return parseInt(paymentPeriod.replace('Net ', '')) || 30;
    }
    return 30; // Default fallback
  }

  /**
   * Calculate the due date for down payment
   */
  private static calculateDownPaymentDate(invoiceDate: Date, downPayment: any): Date {
    const dueDate = new Date(invoiceDate);
    
    if (downPayment.dueDate === 'Due on signing' || downPayment.dueDate === 'Due on receipt') {
      return dueDate;
    }
    
    if (downPayment.dueDate.includes('Net ')) {
      const days = parseInt(downPayment.dueDate.replace('Net ', '')) || 0;
      dueDate.setDate(dueDate.getDate() + days);
    }
    
    return dueDate;
  }

  /**
   * Calculate installment schedule for complex payment terms
   */
  static calculateInstallmentSchedule(
    totalAmount: number,
    invoiceDate: Date,
    installments: any[]
  ): ExpectedPayment[] {
    return installments.map((installment, index) => {
      const installmentDate = new Date(invoiceDate);
      installmentDate.setDate(installmentDate.getDate() + installment.dueDays);
      
      const amount = installment.percentage
        ? totalAmount * (installment.percentage / 100)
        : installment.amount || 0;
      
      return {
        date: installmentDate.toISOString(),
        amount,
        description: installment.description || `Installment ${index + 1}`,
        type: 'installment',
        installmentId: installment.id
      };
    });
  }

  /**
   * Validate payment terms and return any issues
   */
  static validatePaymentTerms(paymentTerms: PaymentTermsData): string[] {
    const issues: string[] = [];

    // Check if down payment and installments add up correctly
    if (paymentTerms.downPayment?.required && paymentTerms.installments) {
      const downPaymentPercentage = paymentTerms.downPayment.percentage || 0;
      const installmentPercentages = paymentTerms.installments.reduce(
        (sum, installment) => sum + (installment.percentage || 0), 0
      );
      
      const totalPercentage = downPaymentPercentage + installmentPercentages;
      if (totalPercentage > 100) {
        issues.push('Total payment percentages exceed 100%');
      }
      if (totalPercentage < 99 && totalPercentage > 0) {
        issues.push('Payment percentages do not add up to 100%');
      }
    }

    // Check for duplicate installment IDs
    if (paymentTerms.installments) {
      const installmentIds = paymentTerms.installments.map(i => i.id);
      const uniqueIds = [...new Set(installmentIds)];
      if (installmentIds.length !== uniqueIds.length) {
        issues.push('Duplicate installment IDs found');
      }
    }

    return issues;
  }

  /**
   * Generate a human-readable summary of payment terms
   */
  static getPaymentTermsSummary(paymentTerms: PaymentTermsData): string {
    let summary = `Payment Period: ${paymentTerms.paymentPeriod}`;
    
    if (paymentTerms.downPayment?.required) {
      const amount = paymentTerms.downPayment.percentage 
        ? `${paymentTerms.downPayment.percentage}%` 
        : paymentTerms.downPayment.amount 
          ? `$${paymentTerms.downPayment.amount}` 
          : 'TBD';
      summary += `\nDown Payment: ${amount} (${paymentTerms.downPayment.dueDate})`;
    }

    if (paymentTerms.installments && paymentTerms.installments.length > 0) {
      summary += '\nInstallments:';
      paymentTerms.installments.forEach((inst, index) => {
        const amount = inst.percentage 
          ? `${inst.percentage}%` 
          : inst.amount 
            ? `$${inst.amount}` 
            : 'TBD';
        summary += `\n  ${index + 1}. ${amount} due in ${inst.dueDays} days`;
        if (inst.description) summary += ` (${inst.description})`;
      });
    }

    return summary;
  }
} 