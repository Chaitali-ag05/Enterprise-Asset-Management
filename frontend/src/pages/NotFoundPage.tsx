import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 bg-[#F0F4F1] dark:bg-[#151C18] text-[#718278] dark:text-[#87948C] rounded-full flex items-center justify-center mb-6">
        <AlertCircle size={40} />
      </div>
      <h1 className="text-3xl font-bold text-[#1A1D18] dark:text-[#F3F7F4] mb-2">Page Not Found</h1>
      <p className="text-[#718278] dark:text-[#87948C] max-w-md mx-auto mb-8">
        The page you are looking for does not exist, has been moved, or you don't have permission to view it.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 bg-[#1E6B30] hover:bg-[#165526] text-white dark:bg-[#A3FF5F] dark:text-[#080D0B] dark:hover:bg-[#B5FF7D] font-semibold rounded-lg transition-colors text-sm shadow-sm"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}

