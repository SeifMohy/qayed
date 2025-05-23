'use client'

import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline'
import type { DataSource } from '@/lib/data-sources'

export type UploadModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  dataSources: DataSource[]
  isUploading: string | null
  onSubmit: () => void
  isUploadDisabled: boolean
  renderSourceContent: (source: DataSource) => ReactNode
  customButtonText?: string
}

export default function UploadModal({
  isOpen,
  onClose,
  title,
  description,
  dataSources,
  isUploading,
  onSubmit,
  isUploadDisabled,
  renderSourceContent,
  customButtonText
}: UploadModalProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <DocumentArrowUpIcon className="h-6 w-6 text-[#595CFF]" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {description}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-5">
                  <div className="space-y-4">
                    {dataSources.map(source => (
                      <div key={source.id} className="border border-gray-200 rounded-md p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-base font-medium text-gray-900">{source.name}</h4>
                            <p className="text-sm text-gray-500">{source.description}</p>
                            <p className="text-xs text-gray-400">Format: {source.format}</p>
                          </div>
                        </div>
                        
                        {renderSourceContent(source)}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={onSubmit}
                      disabled={isUploadDisabled}
                      className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#595CFF] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading === 'processing' ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          {customButtonText || 'Upload Files'}
                        </>
                      )}
                    </button>
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