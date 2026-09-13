import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";

export default function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#FAFAF7] dark:bg-[#080D0B] font-sans antialiased text-[#1A1D18] dark:text-[#F3F7F4] select-none relative overflow-x-hidden transition-colors duration-150">
      {/* Top-Right Ambient Crystal Light Wave Accent */}
      <div className="absolute top-0 right-0 w-96 h-80 pointer-events-none z-0 select-none opacity-25 dark:opacity-40 overflow-hidden">
        <div
          className="w-full h-full"
          style={{
            background: "radial-gradient(ellipse at 85% 15%, rgba(46, 133, 64, 0.12) 0%, rgba(13, 148, 136, 0.06) 35%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
      </div>

      {/* Desktop Fixed Sidebar */}
      <div className="hidden md:block shrink-0 sticky top-0 h-screen z-40">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-64 max-w-xs bg-white dark:bg-[#080D0B] shadow-2xl z-10 animate-in slide-in-from-left">
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Flow */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <TopNavbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}