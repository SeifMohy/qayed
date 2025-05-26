'use client';

import { useState, useEffect } from 'react';

interface BankStatement {
  id: number;
  bankName: string;
  accountNumber: string;
  statementPeriodStart: string | Date;
  statementPeriodEnd: string | Date;
  accountType?: string;
  accountCurrency?: string;
  startingBalance: number;
  endingBalance: number;
  validationStatus: 'pending' | 'passed' | 'failed';
  validated: boolean;
  parsed: boolean;
  locked: boolean;
}

interface StatementMetadataFormProps {
  statement: BankStatement;
  onUpdate: (data: Partial<BankStatement>) => Promise<void>;
  disabled?: boolean;
  saving?: boolean;
}

// Helper function to safely convert date to YYYY-MM-DD format
function formatDateForInput(dateValue: string | Date): string {
  if (!dateValue) return '';
  
  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

export default function StatementMetadataForm({ 
  statement, 
  onUpdate, 
  disabled = false, 
  saving = false 
}: StatementMetadataFormProps) {
  const [formData, setFormData] = useState({
    bankName: statement.bankName,
    accountNumber: statement.accountNumber,
    statementPeriodStart: formatDateForInput(statement.statementPeriodStart),
    statementPeriodEnd: formatDateForInput(statement.statementPeriodEnd),
    accountType: statement.accountType || '',
    accountCurrency: statement.accountCurrency || 'USD',
    startingBalance: String(statement.startingBalance),
    endingBalance: String(statement.endingBalance)
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when statement changes
  useEffect(() => {
    setFormData({
      bankName: statement.bankName,
      accountNumber: statement.accountNumber,
      statementPeriodStart: formatDateForInput(statement.statementPeriodStart),
      statementPeriodEnd: formatDateForInput(statement.statementPeriodEnd),
      accountType: statement.accountType || '',
      accountCurrency: statement.accountCurrency || 'USD',
      startingBalance: String(statement.startingBalance),
      endingBalance: String(statement.endingBalance)
    });
    setHasChanges(false);
  }, [statement]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    }

    if (!formData.statementPeriodStart) {
      newErrors.statementPeriodStart = 'Statement start date is required';
    }

    if (!formData.statementPeriodEnd) {
      newErrors.statementPeriodEnd = 'Statement end date is required';
    }

    if (formData.statementPeriodStart && formData.statementPeriodEnd) {
      const startDate = new Date(formData.statementPeriodStart);
      const endDate = new Date(formData.statementPeriodEnd);
      
      if (startDate >= endDate) {
        newErrors.statementPeriodEnd = 'End date must be after start date';
      }
    }

    const startingBalance = parseFloat(formData.startingBalance);
    if (isNaN(startingBalance)) {
      newErrors.startingBalance = 'Starting balance must be a valid number';
    }

    const endingBalance = parseFloat(formData.endingBalance);
    if (isNaN(endingBalance)) {
      newErrors.endingBalance = 'Ending balance must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const updateData = {
      bankName: formData.bankName.trim(),
      accountNumber: formData.accountNumber.trim(),
      statementPeriodStart: formData.statementPeriodStart,
      statementPeriodEnd: formData.statementPeriodEnd,
      accountType: formData.accountType.trim() || undefined,
      accountCurrency: formData.accountCurrency,
      startingBalance: parseFloat(formData.startingBalance),
      endingBalance: parseFloat(formData.endingBalance)
    };

    try {
      await onUpdate(updateData);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save changes:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      bankName: statement.bankName,
      accountNumber: statement.accountNumber,
      statementPeriodStart: formatDateForInput(statement.statementPeriodStart),
      statementPeriodEnd: formatDateForInput(statement.statementPeriodEnd),
      accountType: statement.accountType || '',
      accountCurrency: statement.accountCurrency || 'USD',
      startingBalance: String(statement.startingBalance),
      endingBalance: String(statement.endingBalance)
    });
    setHasChanges(false);
    setErrors({});
  };

  const inputClassName = (fieldName: string) => {
    const baseClass = "mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
    const errorClass = errors[fieldName] ? "border-red-300" : "border-gray-300";
    const disabledClass = disabled ? "bg-gray-50 text-gray-500" : "bg-white";
    
    return `${baseClass} ${errorClass} ${disabledClass}`;
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Bank Name */}
        <div>
          <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
            Bank Name
          </label>
          <input
            type="text"
            id="bankName"
            value={formData.bankName}
            onChange={(e) => handleInputChange('bankName', e.target.value)}
            disabled={disabled}
            className={inputClassName('bankName')}
          />
          {errors.bankName && (
            <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
          )}
        </div>

        {/* Account Number */}
        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">
            Account Number
          </label>
          <input
            type="text"
            id="accountNumber"
            value={formData.accountNumber}
            onChange={(e) => handleInputChange('accountNumber', e.target.value)}
            disabled={disabled}
            className={inputClassName('accountNumber')}
          />
          {errors.accountNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
          )}
        </div>

        {/* Statement Start Date */}
        <div>
          <label htmlFor="statementPeriodStart" className="block text-sm font-medium text-gray-700">
            Statement Start Date
          </label>
          <input
            type="date"
            id="statementPeriodStart"
            value={formData.statementPeriodStart}
            onChange={(e) => handleInputChange('statementPeriodStart', e.target.value)}
            disabled={disabled}
            className={inputClassName('statementPeriodStart')}
          />
          {errors.statementPeriodStart && (
            <p className="mt-1 text-sm text-red-600">{errors.statementPeriodStart}</p>
          )}
        </div>

        {/* Statement End Date */}
        <div>
          <label htmlFor="statementPeriodEnd" className="block text-sm font-medium text-gray-700">
            Statement End Date
          </label>
          <input
            type="date"
            id="statementPeriodEnd"
            value={formData.statementPeriodEnd}
            onChange={(e) => handleInputChange('statementPeriodEnd', e.target.value)}
            disabled={disabled}
            className={inputClassName('statementPeriodEnd')}
          />
          {errors.statementPeriodEnd && (
            <p className="mt-1 text-sm text-red-600">{errors.statementPeriodEnd}</p>
          )}
        </div>

        {/* Account Type */}
        <div>
          <label htmlFor="accountType" className="block text-sm font-medium text-gray-700">
            Account Type
          </label>
          <select
            id="accountType"
            value={formData.accountType}
            onChange={(e) => handleInputChange('accountType', e.target.value)}
            disabled={disabled}
            className={inputClassName('accountType')}
          >
            <option value="">Select account type</option>
            <option value="Checking">Checking</option>
            <option value="Savings">Savings</option>
            <option value="Business">Business</option>
            <option value="Credit">Credit</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Account Currency */}
        <div>
          <label htmlFor="accountCurrency" className="block text-sm font-medium text-gray-700">
            Currency
          </label>
          <select
            id="accountCurrency"
            value={formData.accountCurrency}
            onChange={(e) => handleInputChange('accountCurrency', e.target.value)}
            disabled={disabled}
            className={inputClassName('accountCurrency')}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="EGP">EGP</option>
            <option value="CAD">CAD</option>
            <option value="AUD">AUD</option>
            <option value="JPY">JPY</option>
          </select>
        </div>

        {/* Starting Balance */}
        <div>
          <label htmlFor="startingBalance" className="block text-sm font-medium text-gray-700">
            Starting Balance
          </label>
          <input
            type="number"
            step="0.01"
            id="startingBalance"
            value={formData.startingBalance}
            onChange={(e) => handleInputChange('startingBalance', e.target.value)}
            disabled={disabled}
            className={inputClassName('startingBalance')}
          />
          {errors.startingBalance && (
            <p className="mt-1 text-sm text-red-600">{errors.startingBalance}</p>
          )}
        </div>

        {/* Ending Balance */}
        <div>
          <label htmlFor="endingBalance" className="block text-sm font-medium text-gray-700">
            Ending Balance
          </label>
          <input
            type="number"
            step="0.01"
            id="endingBalance"
            value={formData.endingBalance}
            onChange={(e) => handleInputChange('endingBalance', e.target.value)}
            disabled={disabled}
            className={inputClassName('endingBalance')}
          />
          {errors.endingBalance && (
            <p className="mt-1 text-sm text-red-600">{errors.endingBalance}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {!disabled && (
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasChanges || saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
} 