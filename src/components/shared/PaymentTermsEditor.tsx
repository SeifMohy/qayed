'use client'

import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import {
  PaymentTermsData,
  PaymentTermsInstallment,
  PaymentTermsDownPayment,
  PAYMENT_PERIOD_OPTIONS,
  DOWN_PAYMENT_DUE_OPTIONS,
  PaymentPeriodOption,
  DownPaymentDueOption
} from '@/types/paymentTerms'

interface PaymentTermsEditorProps {
  value?: PaymentTermsData;
  onChange: (terms: PaymentTermsData) => void;
  className?: string;
}

export default function PaymentTermsEditor({ value, onChange, className }: PaymentTermsEditorProps) {
  const [terms, setTerms] = useState<PaymentTermsData>({
    paymentPeriod: 'Net 30',
    downPayment: {
      required: false,
      dueDate: 'Due on signing'
    },
    installments: []
  })
  
  const isUpdatingFromProps = useRef(false)

  // Initialize from value prop
  useEffect(() => {
    if (value) {
      isUpdatingFromProps.current = true
      setTerms(value)
      // Reset the flag after state update
      setTimeout(() => {
        isUpdatingFromProps.current = false
      }, 0)
    }
  }, [value])

  // Update parent when terms change (but not when updating from props)
  useEffect(() => {
    if (!isUpdatingFromProps.current) {
      onChange(terms)
    }
  }, [terms, onChange])

  const updatePaymentPeriod = (period: PaymentPeriodOption) => {
    setTerms(prev => ({ ...prev, paymentPeriod: period }))
  }

  const updateDownPayment = (updates: Partial<PaymentTermsDownPayment>) => {
    setTerms(prev => ({
      ...prev,
      downPayment: { ...prev.downPayment!, ...updates }
    }))
  }

  const addInstallment = () => {
    const newInstallment: PaymentTermsInstallment = {
      id: uuidv4(),
      dueDays: 30,
      percentage: 50
    }
    setTerms(prev => ({
      ...prev,
      installments: [...(prev.installments || []), newInstallment]
    }))
  }

  const updateInstallment = (id: string, updates: Partial<PaymentTermsInstallment>) => {
    setTerms(prev => ({
      ...prev,
      installments: prev.installments?.map(inst =>
        inst.id === id ? { ...inst, ...updates } : inst
      ) || []
    }))
  }

  const removeInstallment = (id: string) => {
    setTerms(prev => ({
      ...prev,
      installments: prev.installments?.filter(inst => inst.id !== id) || []
    }))
  }

  const getTermsSummary = () => {
    let summary = `Payment Period: ${terms.paymentPeriod}`
    
    if (terms.downPayment?.required) {
      const amount = terms.downPayment.percentage 
        ? `${terms.downPayment.percentage}%` 
        : terms.downPayment.amount 
          ? `$${terms.downPayment.amount}` 
          : 'TBD'
      summary += `\nDown Payment: ${amount} (${terms.downPayment.dueDate})`
    }

    if (terms.installments && terms.installments.length > 0) {
      summary += '\nInstallments:'
      terms.installments.forEach((inst, index) => {
        const amount = inst.percentage 
          ? `${inst.percentage}%` 
          : inst.amount 
            ? `$${inst.amount}` 
            : 'TBD'
        summary += `\n  ${index + 1}. ${amount} due in ${inst.dueDays} days`
        if (inst.description) summary += ` (${inst.description})`
      })
    }

    return summary
  }

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Payment Period */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Period
        </label>
        <select
          value={terms.paymentPeriod}
          onChange={(e) => updatePaymentPeriod(e.target.value as PaymentPeriodOption)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#595CFF] focus:border-[#595CFF]"
        >
          {PAYMENT_PERIOD_OPTIONS.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Down Payment */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="downPaymentRequired"
            checked={terms.downPayment?.required || false}
            onChange={(e) => updateDownPayment({ required: e.target.checked })}
            className="h-4 w-4 text-[#595CFF] focus:ring-[#595CFF] border-gray-300 rounded"
          />
          <label htmlFor="downPaymentRequired" className="ml-2 text-sm font-medium text-gray-700">
            Down payment required?
          </label>
        </div>

        {terms.downPayment?.required && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Percentage
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 25"
                  value={terms.downPayment.percentage || ''}
                  onChange={(e) => updateDownPayment({ 
                    percentage: e.target.value ? Number(e.target.value) : undefined,
                    amount: undefined 
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#595CFF] focus:border-[#595CFF]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fixed Amount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g., 1000"
                  value={terms.downPayment.amount || ''}
                  onChange={(e) => updateDownPayment({ 
                    amount: e.target.value ? Number(e.target.value) : undefined,
                    percentage: undefined 
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#595CFF] focus:border-[#595CFF]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <select
                value={terms.downPayment.dueDate}
                onChange={(e) => updateDownPayment({ dueDate: e.target.value as DownPaymentDueOption })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#595CFF] focus:border-[#595CFF]"
              >
                {DOWN_PAYMENT_DUE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Installment Plan */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Installment Plan</h3>
          <button
            type="button"
            onClick={addInstallment}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-[#595CFF] hover:bg-[#484adb] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#595CFF]"
          >
            <PlusIcon className="h-3 w-3 mr-1" />
            Add Payment
          </button>
        </div>

        {terms.installments && terms.installments.length > 0 ? (
          <div className="space-y-3">
            {terms.installments.map((installment, index) => (
              <div key={installment.id} className="border border-gray-100 rounded p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Payment {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeInstallment(installment.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Percentage
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g., 50"
                      value={installment.percentage || ''}
                      onChange={(e) => updateInstallment(installment.id, { 
                        percentage: e.target.value ? Number(e.target.value) : undefined,
                        amount: undefined 
                      })}
                      className="block w-full px-2 py-1 text-sm border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-[#595CFF] focus:border-[#595CFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Fixed Amount ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g., 2500"
                      value={installment.amount || ''}
                      onChange={(e) => updateInstallment(installment.id, { 
                        amount: e.target.value ? Number(e.target.value) : undefined,
                        percentage: undefined 
                      })}
                      className="block w-full px-2 py-1 text-sm border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-[#595CFF] focus:border-[#595CFF]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Due Days (from invoice)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g., 30"
                      value={installment.dueDays}
                      onChange={(e) => updateInstallment(installment.id, { 
                        dueDays: Number(e.target.value) || 0 
                      })}
                      className="block w-full px-2 py-1 text-sm border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-[#595CFF] focus:border-[#595CFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., First payment"
                      value={installment.description || ''}
                      onChange={(e) => updateInstallment(installment.id, { 
                        description: e.target.value 
                      })}
                      className="block w-full px-2 py-1 text-sm border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-[#595CFF] focus:border-[#595CFF]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No installments configured</p>
        )}
      </div>

      {/* Live Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Payment Terms Summary</h3>
        <pre className="text-xs text-blue-800 whitespace-pre-wrap font-mono">
          {getTermsSummary()}
        </pre>
      </div>
    </div>
  )
} 