import BankStatementUploader from '@/components/upload/BankStatementUploader';
import BankStatementViewer from '@/components/dashboard/BankStatementViewer';


export default function BankStatementsPage() {
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Bank Statement Parser</h1>
          <p className="mt-2 text-gray-600">
            Upload your bank statements to extract and save their text content.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          {/* Bank Statement Uploader */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Upload Statements</h2>
            </div>
            <BankStatementUploader />
          </div>
          
          {/* Bank Statement Viewer */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">View Parsed Statements</h2>
            </div>
            <BankStatementViewer />
          </div>
        </div>
      </div>
    </div>
  );
} 