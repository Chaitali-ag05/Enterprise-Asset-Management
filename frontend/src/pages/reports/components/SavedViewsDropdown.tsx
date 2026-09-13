import React, { useState, useEffect, useRef } from "react";
import { Bookmark, BookmarkPlus, Check, Trash2, X, ChevronDown } from "lucide-react";
import { useAuthStore } from "../../../context/useAuthStore";
import { useToast } from "../../../context/ToastContext";
import type { ReportTabId, ReportSavedView } from "../types";
import {
  getSavedViews,
  saveReportView,
  deleteReportView,
  validateAndApplySavedFilters,
} from "../utils/savedViewsStorage";
import { cn } from "../../../utils/cn";

export interface SavedViewsDropdownProps<T extends Record<string, any>> {
  tabId: ReportTabId;
  currentFilters: T;
  onApplyFilters: (filters: T) => void;
  availableOptions: {
    departments?: string[];
    categories?: string[];
    vendors?: string[];
    technicians?: string[];
    statuses?: string[];
  };
}

export function SavedViewsDropdown<T extends Record<string, any>>({
  tabId,
  currentFilters,
  onApplyFilters,
  availableOptions,
}: SavedViewsDropdownProps<T>) {
  const { user } = useAuthStore();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [views, setViews] = useState<ReportSavedView[]>([]);
  const [newViewName, setNewViewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userId = user?.username || "default";

  const loadViews = () => {
    setViews(getSavedViews(userId, tabId));
  };

  useEffect(() => {
    loadViews();
  }, [tabId, userId]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsSaving(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newViewName.trim()) return;

    saveReportView(userId, tabId, newViewName.trim(), currentFilters);
    addToast("success", `Saved view "${newViewName.trim()}" created.`);
    setNewViewName("");
    setIsSaving(false);
    loadViews();
  };

  const handleApply = (view: ReportSavedView) => {
    const { cleanFilters, droppedWarnings } = validateAndApplySavedFilters(
      view.filters,
      availableOptions
    );

    onApplyFilters(cleanFilters as T);

    if (droppedWarnings.length > 0) {
      addToast(
        "warning",
        `Some saved filters (${droppedWarnings.join(", ")}) are no longer in your scope and were discarded.`
      );
    } else {
      addToast("success", `Applied view "${view.name}".`);
    }

    setIsOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, viewId: string, name: string) => {
    e.stopPropagation();
    deleteReportView(userId, viewId);
    addToast("info", `Removed view "${name}".`);
    loadViews();
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-9 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs select-none",
          isOpen
            ? "bg-[#E8F8EE] dark:bg-[#14261B] border-[#2E8540] dark:border-[#A3FF5F] text-[#1E6B30] dark:text-[#A3FF5F]"
            : "bg-white dark:bg-[#111714] border-[#E5E9E7] dark:border-[#25312B] text-[#526159] dark:text-[#8E9C94] hover:text-[#1A1D18] dark:hover:text-white hover:border-[#CBD5E1] dark:hover:border-[#33463B]"
        )}
      >
        <Bookmark size={13} className="shrink-0 text-[#2E8540] dark:text-[#A3FF5F]" />
        <span>Saved Views</span>
        {views.length > 0 && (
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#E5E9E7] dark:bg-[#1F2E26] text-[#1A1D18] dark:text-[#F3F7F4]">
            {views.length}
          </span>
        )}
        <ChevronDown size={12} className="opacity-60 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#25312B] shadow-lg dark:shadow-popover z-50 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between border-b border-[#E5E9E7] dark:border-[#18221D] pb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1D18] dark:text-[#F3F7F4]">
              <Bookmark size={14} className="text-[#2E8540] dark:text-[#A3FF5F]" />
              <span>Saved Filter Views</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-[#74827A] hover:text-[#1A1D18] dark:hover:text-white"
            >
              <X size={13} />
            </button>
          </div>

          {/* Create new view form */}
          {isSaving ? (
            <form onSubmit={handleSave} className="space-y-2 bg-[#F8FAF9] dark:bg-[#151C18] p-2.5 rounded-lg border border-[#E5E9E7] dark:border-[#23332B]">
              <label className="text-[11px] font-medium text-[#1A1D18] dark:text-[#F3F7F4] block">
                Name this filter view:
              </label>
              <input
                type="text"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                placeholder="e.g. IT Laptops Active"
                autoFocus
                className="w-full h-8 px-2.5 text-xs rounded-lg bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#27382F] text-[#1A1D18] dark:text-[#F3F7F4] focus:outline-none focus:border-[#2E8540] dark:focus:border-[#A3FF5F]"
              />
              <div className="flex items-center justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsSaving(false)}
                  className="px-2 py-1 text-xs text-[#526159] dark:text-[#8E9C94] hover:text-[#1A1D18]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newViewName.trim()}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#2E8540] hover:bg-[#236C33] text-white dark:bg-[#A3FF5F] dark:hover:bg-[#8EF04C] dark:text-[#080D0B] disabled:opacity-40 transition-colors shadow-2xs"
                >
                  Save View
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsSaving(true)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-dashed border-[#CBD5E1] dark:border-[#27382F] hover:border-[#2E8540] dark:hover:border-[#A3FF5F] text-xs font-medium text-[#2E8540] dark:text-[#A3FF5F] flex items-center justify-center gap-1.5 transition-colors"
            >
              <BookmarkPlus size={13} />
              <span>Save current filters as view</span>
            </button>
          )}

          {/* List of saved views */}
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {views.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#74827A] dark:text-[#6C7B73]">
                No saved views for this tab yet.
              </div>
            ) : (
              views.map((v) => (
                <div
                  key={v.id}
                  onClick={() => handleApply(v)}
                  className="group flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAF9] dark:hover:bg-[#151C18] border border-transparent hover:border-[#E5E9E7] dark:hover:border-[#25312B] cursor-pointer transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-medium text-[#1A1D18] dark:text-[#F3F7F4] truncate">
                      {v.name}
                    </p>
                    <p className="text-[10px] font-mono text-[#74827A] dark:text-[#6C7B73]">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, v.id, v.name)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:text-rose-500 text-[#74827A] dark:text-[#6C7B73] transition-all"
                      title="Delete saved view"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
