'use client';

import { useState } from 'react';
import { Button } from '@/components/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { 
  Save, 
  X, 
  DollarSign, 
  Calendar, 
  Repeat,
  AlertCircle 
} from 'lucide-react';

interface RecurringPayment {
  id?: number;
  name: string;
  description?: string;
  amount: number;
  type: 'RECURRING_INFLOW' | 'RECURRING_OUTFLOW';
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'ANNUALLY';
  startDate: string;
  endDate?: string;
  nextDueDate?: string;
  dayOfMonth?: number;
  dayOfWeek?: number;
  category?: string;
  currency: string;
  confidence: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface RecurringPaymentFormData {
  name: string;
  description?: string;
  amount: number;
  type: 'RECURRING_INFLOW' | 'RECURRING_OUTFLOW';
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'ANNUALLY';
  startDate: string;
  endDate?: string;
  dayOfMonth?: number;
  dayOfWeek?: number;
  category?: string;
  currency: string;
  confidence: number;
  isActive: boolean;
}

interface RecurringPaymentFormProps {
  payment?: RecurringPayment;
  onSave: (payment: RecurringPaymentFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const FREQUENCY_OPTIONS = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BIWEEKLY', label: 'Bi-weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'SEMIANNUALLY', label: 'Semi-annually' },
  { value: 'ANNUALLY', label: 'Annually' }
];

const CATEGORY_OPTIONS = [
  'Payroll',
  'Rent',
  'Utilities',
  'Insurance',
  'Loan Payment',
  'Subscription',
  'Marketing',
  'Office Supplies',
  'Professional Services',
  'Other'
];

export default function RecurringPaymentForm({ 
  payment, 
  onSave, 
  onCancel, 
  loading = false 
}: RecurringPaymentFormProps) {
  const [formData, setFormData] = useState<RecurringPaymentFormData>({
    name: payment?.name || '',
    description: payment?.description || '',
    amount: payment?.amount || 0,
    type: payment?.type || 'RECURRING_OUTFLOW',
    frequency: payment?.frequency || 'MONTHLY',
    startDate: payment?.startDate || new Date().toISOString().split('T')[0],
    endDate: payment?.endDate || '',
    dayOfMonth: payment?.dayOfMonth || new Date().getDate(),
    dayOfWeek: payment?.dayOfWeek || new Date().getDay(),
    category: payment?.category || '',
    currency: payment?.currency || 'USD',
    confidence: payment?.confidence || 1.0,
    isActive: payment?.isActive ?? true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [amountInputValue, setAmountInputValue] = useState<string>(
    payment?.amount ? payment.amount.toString() : ''
  );

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAmountChange = (value: string) => {
    setAmountInputValue(value);
    const numericValue = value === '' ? 0 : parseFloat(value) || 0;
    handleChange('amount', numericValue);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Payment name is required';
    }

    if (!formData.amount || formData.amount <= 0 || amountInputValue.trim() === '') {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving recurring payment:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getFrequencyDescription = () => {
    const frequencyLabel = FREQUENCY_OPTIONS.find(f => f.value === formData.frequency)?.label || '';
    
    if (formData.frequency === 'MONTHLY' && formData.dayOfMonth) {
      return `${frequencyLabel} on the ${formData.dayOfMonth}${getOrdinalSuffix(formData.dayOfMonth)}`;
    } else if (formData.frequency === 'WEEKLY' && formData.dayOfWeek !== undefined) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `${frequencyLabel} on ${days[formData.dayOfWeek]}`;
    }
    
    return frequencyLabel;
  };

  const getOrdinalSuffix = (n: number): string => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5" />
          {payment ? 'Edit Recurring Payment' : 'Add Recurring Payment'}
        </CardTitle>
        <CardDescription>
          Set up recurring income or expenses that occur on a regular schedule
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Monthly Salaries, Office Rent"
                className={`w-full border rounded-md px-3 py-2 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Additional details about this payment..."
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select category...</option>
                  {CATEGORY_OPTIONS.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="RECURRING_INFLOW">Income</option>
                  <option value="RECURRING_OUTFLOW">Expense</option>
                </select>
              </div>
            </div>
          </div>

          {/* Amount and Currency */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Amount</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amountInputValue}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className={`w-full border rounded-md pl-10 pr-3 py-2 ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="0.00"
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.amount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="EGP">EGP</option>
                </select>
              </div>
            </div>

            {formData.amount > 0 && amountInputValue !== '' && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">
                  <strong>Preview:</strong> {formatCurrency(formData.amount)} {formData.type === 'RECURRING_INFLOW' ? 'income' : 'expense'} {getFrequencyDescription().toLowerCase()}
                </p>
              </div>
            )}
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Schedule</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency *
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => handleChange('frequency', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {FREQUENCY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional timing fields based on frequency */}
            {formData.frequency === 'MONTHLY' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Month
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dayOfMonth || ''}
                  onChange={(e) => handleChange('dayOfMonth', parseInt(e.target.value) || null)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., 15 for the 15th"
                />
              </div>
            )}

            {formData.frequency === 'WEEKLY' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Week
                </label>
                <select
                  value={formData.dayOfWeek || ''}
                  onChange={(e) => handleChange('dayOfWeek', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confidence Level
                </label>
                <select
                  value={formData.confidence}
                  onChange={(e) => handleChange('confidence', parseFloat(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value={1.0}>High (100%)</option>
                  <option value={0.9}>Very Likely (90%)</option>
                  <option value={0.8}>Likely (80%)</option>
                  <option value={0.7}>Probable (70%)</option>
                  <option value={0.6}>Possible (60%)</option>
                  <option value={0.5}>Uncertain (50%)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => handleChange('isActive', e.target.value === 'active')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Confidence level affects how this payment is weighted in cashflow projections. 
                Higher confidence means more reliable forecasting.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : payment ? 'Update Payment' : 'Create Payment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}