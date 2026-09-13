import React from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../../context/useThemeStore";

export const ThemeToggle: React.FC = () => {
  const { resolvedTheme, toggleTheme } = useThemeStore();

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 rounded-xl text-[#526159] dark:text-[#8E9C94] hover:text-[#1A1D18] dark:hover:text-white hover:bg-[#F4F6F4] dark:hover:bg-[#111714] border border-transparent hover:border-[#E5E9E7] dark:hover:border-[#25312B] transition-all"
      title={`Currently in ${isDark ? "dark" : "light"} mode. Click to switch to ${isDark ? "light" : "dark"} mode.`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? <Moon size={16} className="text-[#A3FF5F]" /> : <Sun size={16} className="text-[#D97706]" />}
    </button>
  );
};