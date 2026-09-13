import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, AlertCircle, Sun, Moon } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { OpsPilotLogo } from "../../components/common/OpsPilotLogo";
import { useThemeStore } from "../../context/useThemeStore";
import { cn } from "../../utils/cn";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { theme, resolvedTheme, setTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) {
      setError("Please fill in all required registration fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      sessionStorage.setItem("af_reg_payload", JSON.stringify({
        username: username.trim(),
        email: email.trim(),
        password,
        role: "ROLE_EMPLOYEE",
      }));

      addToast("info", "Verification code dispatched to your corporate email.");
      navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}`);
    } catch (err: any) {
      setError("Failed to initiate registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans transition-colors duration-300",
        isDark ? "bg-[#030705] text-[#F3F7F4]" : "bg-[#FAFAF7] text-[#1A1D18]"
      )}
    >
      {/* Top right theme toggle */}
      <div className="absolute top-5 right-5 z-20">
        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all shadow-sm",
            isDark
              ? "bg-[#0D1410] border-[#25312B] text-[#A3FF5F] hover:border-[#A3FF5F]/50"
              : "bg-white border-[#E2E8F0] text-[#2E8540] hover:border-[#2E8540]/50"
          )}
          title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
        >
          {isDark ? (
            <>
              <Moon size={13} className="text-[#A3FF5F]" />
              <span className="text-[#AAB7AF]">Dark</span>
            </>
          ) : (
            <>
              <Sun size={13} className="text-[#D97706]" />
              <span className="text-[#525B56]">Light</span>
            </>
          )}
        </button>
      </div>

      <div
        className={cn(
          "absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none transition-all",
          isDark ? "bg-[#A3FF5F]/5" : "bg-[#2E8540]/10"
        )}
      />

      <div className="w-full max-w-md space-y-6 z-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <OpsPilotLogo size="md" showSubtitle={false} />
          </div>
          <h1
            className={cn(
              "font-heading text-2xl font-bold tracking-tight",
              isDark ? "text-white" : "text-[#1A1D18]"
            )}
          >
            Create Employee Account
          </h1>
          <p className={cn("text-xs", isDark ? "text-[#AAB7AF]" : "text-[#525B56]")}>
            Sign up for corporate IT hardware access and operations tracking
          </p>
        </div>

        <div
          className={cn(
            "p-7 sm:p-8 rounded-[20px] border shadow-2xl space-y-5 transition-all",
            isDark
              ? "bg-[#0D1410]/85 border-[#25312B] backdrop-blur-xl"
              : "bg-white/95 border-[#E2E8F0] backdrop-blur-xl"
          )}
        >
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-control flex items-center gap-2 text-xs text-red-400">
              <AlertCircle size={15} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className={cn("text-xs font-medium block", isDark ? "text-[#AAB7AF]" : "text-[#525B56]")}>
                Username *
              </label>
              <div className="relative">
                <User size={15} className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none", isDark ? "text-[#74827A]" : "text-[#94A3B8]")} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. jdoe"
                  className={cn(
                    "w-full h-11 pl-10 pr-3.5 text-xs rounded-control transition-all focus:outline-none",
                    isDark
                      ? "bg-[#151C18] border border-[#25312B] text-white placeholder-[#56625B] focus:border-[#A3FF5F] focus:ring-1 focus:ring-[#A3FF5F]"
                      : "bg-[#F8FAFC] border border-[#CBD5E1] text-[#1A1D18] placeholder-[#94A3B8] focus:border-[#2E8540] focus:ring-1 focus:ring-[#2E8540]"
                  )}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={cn("text-xs font-medium block", isDark ? "text-[#AAB7AF]" : "text-[#525B56]")}>
                Corporate Email *
              </label>
              <div className="relative">
                <Mail size={15} className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none", isDark ? "text-[#74827A]" : "text-[#94A3B8]")} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. jdoe@company.internal"
                  className={cn(
                    "w-full h-11 pl-10 pr-3.5 text-xs rounded-control transition-all focus:outline-none",
                    isDark
                      ? "bg-[#151C18] border border-[#25312B] text-white placeholder-[#56625B] focus:border-[#A3FF5F] focus:ring-1 focus:ring-[#A3FF5F]"
                      : "bg-[#F8FAFC] border border-[#CBD5E1] text-[#1A1D18] placeholder-[#94A3B8] focus:border-[#2E8540] focus:ring-1 focus:ring-[#2E8540]"
                  )}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={cn("text-xs font-medium block", isDark ? "text-[#AAB7AF]" : "text-[#525B56]")}>
                  Password *
                </label>
                <div className="relative">
                  <Lock size={15} className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none", isDark ? "text-[#74827A]" : "text-[#94A3B8]")} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={cn(
                      "w-full h-11 pl-10 pr-3 text-xs rounded-control transition-all focus:outline-none",
                      isDark
                        ? "bg-[#151C18] border border-[#25312B] text-white placeholder-[#56625B] focus:border-[#A3FF5F] focus:ring-1 focus:ring-[#A3FF5F]"
                        : "bg-[#F8FAFC] border border-[#CBD5E1] text-[#1A1D18] placeholder-[#94A3B8] focus:border-[#2E8540] focus:ring-1 focus:ring-[#2E8540]"
                    )}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={cn("text-xs font-medium block", isDark ? "text-[#AAB7AF]" : "text-[#525B56]")}>
                  Confirm *
                </label>
                <div className="relative">
                  <Lock size={15} className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none", isDark ? "text-[#74827A]" : "text-[#94A3B8]")} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={cn(
                      "w-full h-11 pl-10 pr-3 text-xs rounded-control transition-all focus:outline-none",
                      isDark
                        ? "bg-[#151C18] border border-[#25312B] text-white placeholder-[#56625B] focus:border-[#A3FF5F] focus:ring-1 focus:ring-[#A3FF5F]"
                        : "bg-[#F8FAFC] border border-[#CBD5E1] text-[#1A1D18] placeholder-[#94A3B8] focus:border-[#2E8540] focus:ring-1 focus:ring-[#2E8540]"
                    )}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full h-11 rounded-pill font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 mt-2",
                isDark
                  ? "bg-[#A3FF5F] hover:bg-[#8EF04C] text-[#0B100E] shadow-lime-glow"
                  : "bg-[#2E8540] hover:bg-[#256C34] text-white shadow-md shadow-[#2E8540]/20"
              )}
            >
              {loading ? "Processing..." : "Verify Email & Create Account →"}
            </button>
          </form>

          <div className={cn("pt-2 text-center text-xs", isDark ? "text-[#AAB7AF]" : "text-[#525B56]")}>
            Already have an account?{" "}
            <Link
              to="/login"
              className={cn(
                "font-semibold hover:underline ml-1",
                isDark ? "text-[#A3FF5F]" : "text-[#2E8540]"
              )}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}