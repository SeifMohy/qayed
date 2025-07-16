import { useProcessing } from '@/contexts/processing-context';

export default function ProcessingBanner() {
  const { isProcessing } = useProcessing();
  if (!isProcessing) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center px-6 py-4 bg-blue-600 text-white rounded-lg shadow-lg animate-slide-in">
      <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
      <span>Your documents are being processed...</span>
    </div>
  );
}

// Add the following CSS to your global styles (e.g., tailwind.css):
// .animate-slide-in {
//   animation: slide-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
// }
// @keyframes slide-in {
//   from { transform: translateY(100px); opacity: 0; }
//   to { transform: translateY(0); opacity: 1; }
// } 