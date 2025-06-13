'use client'

import { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface EditEntityDialogProps {
  isOpen: boolean
  onClose: () => void
  entityType: 'customer' | 'supplier'
  entity: {
    id: number
    name: string
    country?: string | null
  }
  onSave: (data: { name: string; country?: string }) => Promise<{ success: boolean; message: string; reconciledInvoices?: number }>
  isLoading?: boolean
}

export default function EditEntityDialog({
  isOpen,
  onClose,
  entityType,
  entity,
  onSave,
  isLoading = false
}: EditEntityDialogProps) {
  const [formData, setFormData] = useState({
    name: entity.name,
    country: entity.country || ''
  })
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }

    try {
      const result = await onSave({
        name: formData.name.trim(),
        country: formData.country.trim() || undefined
      })

      if (result.success) {
        setSuccessMessage(result.message)
        // Close dialog after 2 seconds if successful
        setTimeout(() => {
          onClose()
          setSuccessMessage(null)
        }, 2000)
      } else {
        setError(result.message)
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update')
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
      setError(null)
      setSuccessMessage(null)
      // Reset form data
      setFormData({
        name: entity.name,
        country: entity.country || ''
      })
    }
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Edit {entityType === 'customer' ? 'Customer' : 'Supplier'}
                    </Dialog.Title>
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Update the {entityType} information. If another {entityType} with the same name exists, their invoices will be merged automatically.
                      </p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                      <div className="mt-4 rounded-md bg-green-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">
                              {successMessage}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="mt-4 rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-red-800">
                              {error}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                          Name *
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder={`Enter ${entityType} name`}
                            disabled={isLoading}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">
                          Country
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            name="country"
                            id="country"
                            value={formData.country}
                            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="Enter country"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isLoading || !!successMessage}
                        >
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleClose}
                          disabled={isLoading}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
} 