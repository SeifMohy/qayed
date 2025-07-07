import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import StatementAnnotationView from '@/components/annotation/StatementAnnotationView';

interface PageProps {
  params: {
    id: string;
  };
}

export default function StatementAnnotationPage({ params }: PageProps) {
  const statementId = parseInt(params.id);

  if (isNaN(statementId)) {
    notFound();
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        }>
          <StatementAnnotationView statementId={statementId} />
        </Suspense>
      </div>
    </div>
  );
} 