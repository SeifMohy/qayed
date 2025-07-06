import { prisma } from '../prisma';
import { getUserProfile } from '../auth';

export class CompanyAccessService {
  private supabaseUserId: string;
  private userCompanyId: number | null = null;
  private isInitialized: boolean = false;

  constructor(supabaseUserId: string) {
    this.supabaseUserId = supabaseUserId;
  }

  private async initialize() {
    if (this.isInitialized) return;

    const userProfile = await getUserProfile(this.supabaseUserId);
    if (!userProfile) {
      throw new Error('User not found');
    }

    this.userCompanyId = userProfile.company.id;
    this.isInitialized = true;
  }

  async getCompanyId(): Promise<number> {
    await this.initialize();
    if (!this.userCompanyId) {
      throw new Error('User company not found');
    }
    return this.userCompanyId;
  }

  // Bank access methods
  async getBanks() {
    const companyId = await this.getCompanyId();
    return prisma.bank.findMany({
      where: { companyId },
      include: {
        bankStatements: true,
      }
    });
  }

  async getBank(bankId: number) {
    const companyId = await this.getCompanyId();
    const bank = await prisma.bank.findFirst({
      where: { 
        id: bankId,
        companyId 
      },
      include: {
        bankStatements: true,
      }
    });

    if (!bank) {
      throw new Error('Bank not found or access denied');
    }

    return bank;
  }

  // Customer access methods
  async getCustomers() {
    const companyId = await this.getCompanyId();
    return prisma.customer.findMany({
      where: { companyId },
      include: {
        Invoice: true,
      }
    });
  }

  async getCustomer(customerId: number) {
    const companyId = await this.getCompanyId();
    const customer = await prisma.customer.findFirst({
      where: { 
        id: customerId,
        companyId 
      },
      include: {
        Invoice: true,
      }
    });

    if (!customer) {
      throw new Error('Customer not found or access denied');
    }

    return customer;
  }

  // Supplier access methods
  async getSuppliers() {
    const companyId = await this.getCompanyId();
    return prisma.supplier.findMany({
      where: { companyId },
      include: {
        Invoice: true,
      }
    });
  }

  async getSupplier(supplierId: number) {
    const companyId = await this.getCompanyId();
    const supplier = await prisma.supplier.findFirst({
      where: { 
        id: supplierId,
        companyId 
      },
      include: {
        Invoice: true,
      }
    });

    if (!supplier) {
      throw new Error('Supplier not found or access denied');
    }

    return supplier;
  }

  // Invoice access methods
  async getInvoices() {
    const companyId = await this.getCompanyId();
    return prisma.invoice.findMany({
      where: { companyId },
      include: {
        Customer: true,
        Supplier: true,
        TransactionMatch: true,
      }
    });
  }

  async getInvoice(invoiceId: number) {
    const companyId = await this.getCompanyId();
    const invoice = await prisma.invoice.findFirst({
      where: { 
        id: invoiceId,
        companyId 
      },
      include: {
        Customer: true,
        Supplier: true,
        TransactionMatch: true,
      }
    });

    if (!invoice) {
      throw new Error('Invoice not found or access denied');
    }

    return invoice;
  }

  // Bank Statement access methods
  async getBankStatements() {
    const companyId = await this.getCompanyId();
    return prisma.bankStatement.findMany({
      where: { 
        bank: {
          companyId
        }
      },
      include: {
        bank: true,
        transactions: true,
      }
    });
  }

  async getBankStatement(statementId: number) {
    const companyId = await this.getCompanyId();
    const statement = await prisma.bankStatement.findFirst({
      where: { 
        id: statementId,
        bank: {
          companyId
        }
      },
      include: {
        bank: true,
        transactions: true,
      }
    });

    if (!statement) {
      throw new Error('Bank statement not found or access denied');
    }

    return statement;
  }

  // Transaction access methods
  async getTransactions() {
    const companyId = await this.getCompanyId();
    return prisma.transaction.findMany({
      where: { 
        bankStatement: {
          bank: {
            companyId
          }
        }
      },
      include: {
        bankStatement: {
          include: {
            bank: true
          }
        },
        TransactionMatch: true,
      }
    });
  }

  async getTransaction(transactionId: number) {
    const companyId = await this.getCompanyId();
    const transaction = await prisma.transaction.findFirst({
      where: { 
        id: transactionId,
        bankStatement: {
          bank: {
            companyId
          }
        }
      },
      include: {
        bankStatement: {
          include: {
            bank: true
          }
        },
        TransactionMatch: true,
      }
    });

    if (!transaction) {
      throw new Error('Transaction not found or access denied');
    }

    return transaction;
  }

  // Cashflow projection access methods
  async getCashflowProjections() {
    const companyId = await this.getCompanyId();
    return prisma.cashflowProjection.findMany({
      where: {
        OR: [
          {
            Invoice: {
              companyId
            }
          },
          {
            BankStatement: {
              bank: {
                companyId
              }
            }
          }
        ]
      },
      include: {
        Invoice: true,
        BankStatement: {
          include: {
            bank: true
          }
        },
        RecurringPayment: true,
      }
    });
  }

  // Create methods with company validation
  async createBank(data: Omit<any, 'companyId'>) {
    const companyId = await this.getCompanyId();
    return prisma.bank.create({
      data: {
        ...data,
        companyId,
      }
    });
  }

  async createCustomer(data: Omit<any, 'companyId'>) {
    const companyId = await this.getCompanyId();
    return prisma.customer.create({
      data: {
        ...data,
        companyId,
      }
    });
  }

  async createSupplier(data: Omit<any, 'companyId'>) {
    const companyId = await this.getCompanyId();
    return prisma.supplier.create({
      data: {
        ...data,
        companyId,
      }
    });
  }

  async createInvoice(data: Omit<any, 'companyId'>) {
    const companyId = await this.getCompanyId();
    return prisma.invoice.create({
      data: {
        ...data,
        companyId,
      }
    });
  }

  // Update methods with company validation
  async updateBank(bankId: number, data: any) {
    // First verify access
    await this.getBank(bankId);
    
    return prisma.bank.update({
      where: { id: bankId },
      data,
    });
  }

  async updateCustomer(customerId: number, data: any) {
    // First verify access
    await this.getCustomer(customerId);
    
    return prisma.customer.update({
      where: { id: customerId },
      data,
    });
  }

  async updateSupplier(supplierId: number, data: any) {
    // First verify access
    await this.getSupplier(supplierId);
    
    return prisma.supplier.update({
      where: { id: supplierId },
      data,
    });
  }

  async updateInvoice(invoiceId: number, data: any) {
    // First verify access
    await this.getInvoice(invoiceId);
    
    return prisma.invoice.update({
      where: { id: invoiceId },
      data,
    });
  }

  // Delete methods with company validation
  async deleteBank(bankId: number) {
    // First verify access
    await this.getBank(bankId);
    
    return prisma.bank.delete({
      where: { id: bankId },
    });
  }

  async deleteCustomer(customerId: number) {
    // First verify access
    await this.getCustomer(customerId);
    
    return prisma.customer.delete({
      where: { id: customerId },
    });
  }

  async deleteSupplier(supplierId: number) {
    // First verify access
    await this.getSupplier(supplierId);
    
    return prisma.supplier.delete({
      where: { id: supplierId },
    });
  }

  async deleteInvoice(invoiceId: number) {
    // First verify access
    await this.getInvoice(invoiceId);
    
    return prisma.invoice.delete({
      where: { id: invoiceId },
    });
  }
}

// Helper function to create a company access service instance
export async function createCompanyAccessService(supabaseUserId: string): Promise<CompanyAccessService> {
  return new CompanyAccessService(supabaseUserId);
} 