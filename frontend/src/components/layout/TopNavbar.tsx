import React, { useState } from "react";
import { Search, Menu, ChevronDown } from "lucide-react";
import { useAuthStore } from "../../context/useAuthStore";
import { ThemeToggle } from "./ThemeToggle";
import NotificationBell from "../notifications/NotificationBell";
import { CommandPalette } from "../ui/CommandPalette";

export const TopNavbar: React.FC<{ onOpenMobileMenu?: () => void }> = ({ onOpenMobileMenu }) => {
  const { user } = useAuthStore();
  const [cmdOpen, setCmdOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#080D0B]/90 backdrop-blur-md border-b border-[#E5E9E7] dark:border-[#18221D] px-6 sm:px-8 flex items-center justify-between gap-4 select-none transition-colors duration-150">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-1.5 rounded-lg text-[#526159] dark:text-[#8E9C94] hover:bg-[#F4F6F4] dark:hover:bg-[#111714] hover:text-[#1A1D18] dark:hover:text-white"
            aria-label="Toggle mobile menu"
          >
            <Menu size={18} />
          </button>

          {/* Search Box matching reference image */}
          <div className="relative w-full max-w-md">
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="w-full h-10 px-3.5 rounded-xl bg-[#F4F6F4] dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1D2A22] text-xs text-[#526159] dark:text-[#6C7B73] flex items-center justify-between hover:border-[#CBD5E1] dark:hover:border-[#2B3831] hover:text-[#1A1D18] dark:hover:text-[#8E9C94] transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0 truncate">
                <Search size={14} className="text-[#526159] dark:text-[#6C7B73] shrink-0" />
                <span className="truncate">Search assets, employees, work orders...</span>
              </div>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono border border-[#E5E9E7] dark:border-[#1D2A22] rounded bg-white dark:bg-[#111714] text-[#526159] dark:text-[#6C7B73]">
                Ctrl K
              </kbd>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <NotificationBell />

          <div className="h-5 w-px bg-[#E5E9E7] dark:bg-[#18221D] hidden sm:block mx-1" />

          {/* User Profile Pill matching reference */}
          <div className="flex items-center gap-2.5 pl-1 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-[#E8F0EC] dark:bg-[#151C18] border border-[#CBD7CE] dark:border-[#233029] flex items-center justify-center font-bold text-xs text-[#1E6B30] dark:text-white">
              {user?.username?.substring(0, 1).toUpperCase() || "A"}
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-[#1A1D18] dark:text-white capitalize">{user?.username || "Admin"}</span>
              <ChevronDown size={13} className="text-[#526159] dark:text-[#6C7B73]" />
            </div>
          </div>
        </div>
      </header>

      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
};