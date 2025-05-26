import { Suspense } from 'react';
import AnnotationStatementsTable from '@/components/annotation/AnnotationStatementsTable';

export default function AnnotationStatementsPage() {
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Bank Statement Annotation</h1>
          <p className="mt-2 text-gray-600">
            Review and validate uploaded bank statements to ensure data accuracy.
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Statements for Review</h2>
          </div>
          <Suspense fallback={
            <div className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          }>
            <AnnotationStatementsTable />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 