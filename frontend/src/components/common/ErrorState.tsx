import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  minHeight?: string;
}

export default function ErrorState({ 
  title = "Something went wrong", 
  message, 
  onRetry,
  minHeight = "min-h-[400px]" 
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${minHeight} bg-[#111714] border border-[#25312B] rounded-xl text-center shadow-card px-4`}>
      <div className="w-14 h-14 bg-danger/10 text-danger rounded-xl flex items-center justify-center mb-4 border border-danger/20">
        <AlertTriangle size={28} />
      </div>
      <h3 className="text-base font-semibold text-[#F3F7F4] mb-2">{title}</h3>
      <p className="text-sm text-[#87948C] max-w-sm mx-auto mb-6">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 bg-[#151C18] hover:bg-[#19221D] border border-[#25312B] hover:border-[#A3FF5F]/40 text-[#F3F7F4] font-medium text-sm rounded-lg transition-all"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

