import type { ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "../../utils/cn";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = true
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#111714] w-full max-w-md rounded-2xl shadow-2xl border border-[#25312B] overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-[#25312B]">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", isDestructive ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-[#A3FF5F]/10 text-[#A3FF5F] border border-[#A3FF5F]/20")}>
              <AlertTriangle size={20} />
            </div>
            <h3 className="font-semibold text-[#F3F7F4]">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-[#87948C] hover:text-[#F3F7F4] transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="text-[#C0CCC5] text-sm leading-relaxed">
            {message}
          </div>
        </div>
        <div className="p-4 bg-[#0D1210] border-t border-[#25312B] flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 font-medium text-[#C0CCC5] hover:text-[#F3F7F4] hover:bg-[#151C18] border border-[#25312B] rounded-lg transition-colors text-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "px-4 py-2 font-medium rounded-lg transition-colors text-sm",
              isDestructive 
                ? "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30" 
                : "bg-[#A3FF5F] text-[#080D0B] font-semibold hover:bg-[#8EF04C]"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

