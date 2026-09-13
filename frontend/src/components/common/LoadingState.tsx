import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  minHeight?: string;
}

export default function LoadingState({ message = "Loading...", minHeight = "min-h-[400px]" }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${minHeight} bg-[#111714] border border-[#25312B] rounded-xl shadow-card`}>
      <Loader2 size={32} className="animate-spin text-[#A3FF5F] mb-4" />
      <p className="text-sm font-medium text-[#C0CCC5]">{message}</p>
    </div>
  );
}

