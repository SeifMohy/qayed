'use client';

import { useState } from 'react';
import { Button } from '@/components/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Calendar,
  DollarSign,
  Repeat,
  AlertCircle,
  Filter,
  MoreHorizontal
} from 'lucide-react';

interface RecurringPayment {
  id: number;
  name: string;
  description?: string;
  amount: number;
  type: 'RECURRING_INFLOW' | 'RECURRING_OUTFLOW';
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'ANNUALLY';
  startDate: string;
  endDate?: string;
  nextDueDate: string;
  dayOfMonth?: number;
  dayOfWeek?: number;
  category?: string;
  currency: string;
  confidence: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    CashflowProjection: number;
  };
}

interface RecurringPaymentsListProps {
  payments: RecurringPayment[];
  onEdit: (payment: RecurringPayment) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, isActive: boolean) => void;
  loading?: boolean;
}

const FREQUENCY_LABELS: Record<string, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Bi-weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  SEMIANNUALLY: 'Semi-annually',
  ANNUALLY: 'Annually'
};

export default function RecurringPaymentsList({
  payments,
  onEdit,
  onDelete,
  onToggleActive,
  loading = false
}: RecurringPaymentsListProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'inflow' | 'outflow'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'amount' | 'nextDue' | 'created'>('nextDue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getNextDueStatus = (nextDueDate: string) => {
    const today = new Date();
    const dueDate = new Date(nextDueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'overdue', text: 'Overdue', className: 'bg-red-100 text-red-800' };
    } else if (diffDays === 0) {
      return { status: 'today', text: 'Today', className: 'bg-orange-100 text-orange-800' };
    } else if (diffDays <= 7) {
      return { status: 'soon', text: `${diffDays}d`, className: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'future', text: `${diffDays}d`, className: 'bg-gray-100 text-gray-800' };
    }
  };

  const filteredPayments = payments.filter(payment => {
    switch (filter) {
      case 'active': return payment.isActive;
      case 'inactive': return !payment.isActive;
      case 'inflow': return payment.type === 'RECURRING_INFLOW';
      case 'outflow': return payment.type === 'RECURRING_OUTFLOW';
      default: return true;
    }
  });

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'nextDue':
        comparison = new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
        break;
      case 'created':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recurring Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5" />
              Recurring Payments
            </CardTitle>
            <CardDescription>
              Manage your recurring income and expenses
            </CardDescription>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="inflow">Income</option>
                <option value="outflow">Expenses</option>
              </select>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {sortedPayments.length === 0 ? (
          <div className="text-center py-8">
            <Repeat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recurring payments</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? 'Start by adding your first recurring payment like salaries or rent.'
                : `No ${filter} recurring payments found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-sm text-green-600 font-medium">Active Income</div>
                <div className="text-lg font-bold text-green-700">
                  {payments.filter(p => p.isActive && p.type === 'RECURRING_INFLOW').length}
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <div className="text-sm text-red-600 font-medium">Active Expenses</div>
                <div className="text-lg font-bold text-red-700">
                  {payments.filter(p => p.isActive && p.type === 'RECURRING_OUTFLOW').length}
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-sm text-blue-600 font-medium">Total Monthly</div>
                <div className="text-lg font-bold text-blue-700">
                  {formatCurrency(
                    payments
                      .filter(p => p.isActive && p.frequency === 'MONTHLY')
                      .reduce((sum, p) => {
                        const amount = Number(p.amount) || 0;
                        return sum + (p.type === 'RECURRING_INFLOW' ? amount : -amount);
                      }, 0)
                  )}
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="text-sm text-yellow-600 font-medium">Due This Week</div>
                <div className="text-lg font-bold text-yellow-700">
                  {payments.filter(p => {
                    if (!p.isActive) return false;
                    const dueStatus = getNextDueStatus(p.nextDueDate);
                    return dueStatus.status === 'today' || dueStatus.status === 'soon';
                  }).length}
                </div>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600 border-b pb-2">
              <div 
                className="col-span-3 cursor-pointer hover:text-gray-900 flex items-center gap-1"
                onClick={() => handleSort('name')}
              >
                Payment
                {sortBy === 'name' && (
                  <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
              <div 
                className="col-span-2 cursor-pointer hover:text-gray-900 flex items-center gap-1"
                onClick={() => handleSort('amount')}
              >
                Amount
                {sortBy === 'amount' && (
                  <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
              <div className="col-span-2">Frequency</div>
              <div 
                className="col-span-2 cursor-pointer hover:text-gray-900 flex items-center gap-1"
                onClick={() => handleSort('nextDue')}
              >
                Next Due
                {sortBy === 'nextDue' && (
                  <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2">Actions</div>
            </div>

            {/* Table Rows */}
            {sortedPayments.map((payment) => {
              const dueStatus = getNextDueStatus(payment.nextDueDate);
              
              return (
                <div key={payment.id} className="grid grid-cols-12 gap-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                  {/* Payment Info */}
                  <div className="col-span-3">
                    <div className="font-medium text-gray-900">{payment.name}</div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={payment.type === 'RECURRING_INFLOW' ? 'text-green-700 border-green-300' : 'text-red-700 border-red-300'}
                      >
                        {payment.type === 'RECURRING_INFLOW' ? 'Income' : 'Expense'}
                      </Badge>
                      {payment.category && (
                        <span className="text-xs text-gray-500">{payment.category}</span>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="col-span-2">
                    <div className={`font-medium ${payment.type === 'RECURRING_INFLOW' ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Number(payment.amount) || 0, payment.currency)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(payment.confidence * 100)}% confidence
                    </div>
                  </div>

                  {/* Frequency */}
                  <div className="col-span-2">
                    <div className="text-sm text-gray-900">
                      {FREQUENCY_LABELS[payment.frequency]}
                    </div>
                    {payment._count && (
                      <div className="text-xs text-gray-500">
                        {payment._count.CashflowProjection} projections
                      </div>
                    )}
                  </div>

                  {/* Next Due */}
                  <div className="col-span-2">
                    <div className="text-sm text-gray-900">
                      {formatDate(payment.nextDueDate)}
                    </div>
                    <Badge variant="outline" className={`text-xs ${dueStatus.className}`}>
                      {dueStatus.text}
                    </Badge>
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <Badge 
                      variant={payment.isActive ? "default" : "outline"}
                      className={payment.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                    >
                      {payment.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center gap-1">
                    <Button
                      variant="outline"
                      onClick={() => onToggleActive(payment.id, !payment.isActive)}
                      className="h-8 w-8 p-0"
                      title={payment.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {payment.isActive ? (
                        <Pause className="h-3 w-3" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => onEdit(payment)}
                      className="h-8 w-8 p-0"
                      title="Edit"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => onDelete(payment.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:border-red-300"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 