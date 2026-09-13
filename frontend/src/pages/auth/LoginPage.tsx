import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Sun, Moon, ChevronDown } from "lucide-react";
import { authApi } from "../../api/authApi";
import { useAuthStore } from "../../context/useAuthStore";
import { useThemeStore } from "../../context/useThemeStore";
import { useToast } from "../../context/ToastContext";
import { OpsPilotLogo } from "../../components/common/OpsPilotLogo";
import { RotatingBallsOrbit } from "../../components/3d/RotatingBallsOrbit";
import { cn } from "../../utils/cn";

export default function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuthStore();
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const isDark = resolvedTheme === "dark";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      setError("Please enter your corporate email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await authApi.login({ usernameOrEmail: usernameOrEmail.trim(), password });
      login(res);
      addToast("success", "Authenticated successfully. Welcome to OpsPilot.");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials or unauthorized access.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div
      className={cn(
        "min-h-screen w-full flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden font-sans select-none transition-colors duration-200",
        isDark ? "bg-[#030705] text-[#F3F7F4]" : "bg-[#FAFAF7] text-[#1A1D18]"
      )}
    >
      {/* 1. Ambient Background Atmosphere (Pure Off-White in Light, Obsidian Glow in Dark) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {isDark ? (
          <>
            <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#A3FF5F]/[0.05] blur-[140px]" />
            <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-[#55D6BE]/[0.04] blur-[130px]" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 30%, rgba(3, 7, 5, 0.65) 75%, rgba(3, 7, 5, 0.95) 100%)",
              }}
            />
          </>
        ) : (
          <>
            <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[#2E8540]/[0.07] blur-[130px]" />
            <div className="absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full bg-[#0D9488]/[0.05] blur-[120px]" />
          </>
        )}
      </div>

      {/* 2. High-Contrast 3D Glass Sculpture & Smooth Continuous Orbit at 60fps */}
      <RotatingBallsOrbit isDark={isDark} />

      {/* Top Header Bar */}
      <header className="flex items-center justify-between z-20 w-full max-w-7xl mx-auto">
        <OpsPilotLogo size="md" />

        <div className="flex items-center gap-3">
          {/* Pill-shaped Segmented Light/Dark Toggle */}
          <div
            onClick={toggleTheme}
            className={cn(
              "h-8 px-1.5 py-1 rounded-full border flex items-center gap-1 cursor-pointer transition-colors shadow-xs select-none",
              isDark
                ? "border-[#233029] bg-[#0E1511]/90 backdrop-blur-md hover:border-[#A3FF5F]/40"
                : "border-[#D0DCD3] bg-[#EAEFEA] hover:border-[#2E8540]/40"
            )}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            <div
              className={cn(
                "p-1 rounded-full transition-all",
                !isDark
                  ? "bg-white text-[#2E8540] shadow-2xs font-bold"
                  : "text-[#59655E] hover:text-[#C5D2CB]"
              )}
            >
              <Sun size={12} />
            </div>
            <div
              className={cn(
                "p-1 rounded-full transition-all",
                isDark
                  ? "bg-[#1E2C24] text-[#A3FF5F] shadow-2xs font-bold"
                  : "text-[#74827A] hover:text-[#1A1D18]"
              )}
            >
              <Moon size={12} />
            </div>
          </div>

          {/* Language Selector Pill with Chevron */}
          <div
            className={cn(
              "h-8 px-3.5 rounded-full border text-xs flex items-center gap-1.5 cursor-pointer transition-colors select-none",
              isDark
                ? "border-[#233029] bg-[#0E1511]/90 backdrop-blur-md text-[#C5D2CB] hover:border-[#2B3831]"
                : "border-[#D0DCD3] bg-[#EAEFEA] text-[#1A1D18] hover:border-[#CBD5E1]"
            )}
          >
            <span className="font-medium text-xs">EN</span>
            <ChevronDown size={12} className={isDark ? "text-[#87948C]" : "text-[#74827A]"} />
          </div>
        </div>
      </header>

      {/* Main Split Content Area */}
      <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto py-4 z-10 relative">
        {/* Left Hero Typography & Tagline (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col justify-between min-h-[460px] lg:min-h-[520px] relative">
          <div className="space-y-4 max-w-lg z-10">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight leading-[1.08]">
              <span className={cn("block", isDark ? "text-[#F3F7F4]" : "text-[#1A1D18]")}>
                Smarter asset
              </span>
              <span className={cn("block font-extrabold", isDark ? "text-[#A3FF5F]" : "text-[#1E6B30]")}>
                operations for
              </span>
              <span className={cn("block font-extrabold", isDark ? "text-[#A3FF5F]" : "text-[#1E6B30]")}>
                a stronger tomorrow.
              </span>
            </h1>

            <p className={cn("text-sm sm:text-base max-w-md leading-relaxed pt-2", isDark ? "text-[#8E9C94]" : "text-[#24352D] font-medium")}>
              Track, manage and maintain your enterprise assets — all in one place.
            </p>
          </div>

          {/* Bottom-left Tagline with Thin Rule Line */}
          <div className="flex items-center gap-4 text-[10px] font-mono tracking-[0.25em] uppercase mt-12 z-10">
            <span className={isDark ? "text-[#6F7D75]" : "text-[#526159] font-semibold"}>BUILT FOR EFFICIENCY</span>
            <div className={cn("w-12 h-px", isDark ? "bg-[#233029]" : "bg-[#CBD5E1]")} />
          </div>
        </div>

        {/* Right Login Card (5 Columns) */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto lg:ml-auto z-10">
          <div
            className={cn(
              "p-8 sm:p-10 rounded-[22px] border relative space-y-6 transition-all duration-200",
              isDark
                ? "bg-[#0D1410]/85 backdrop-blur-2xl border-white/[0.08] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),_inset_0_1px_1px_rgba(255,255,255,0.06)]"
                : "bg-white/95 backdrop-blur-xl border-[#E5E9E7] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)]"
            )}
          >
            {/* Card Brand Header */}
            <div className="space-y-4">
              <OpsPilotLogo size="md" showSubtitle={false} />

              <div>
                <h2 className={cn("font-heading text-2xl sm:text-[26px] font-bold tracking-tight", isDark ? "text-[#F3F7F4]" : "text-[#1A1D18]")}>
                  Welcome back
                </h2>
                <p className={cn("text-xs sm:text-sm mt-1", isDark ? "text-[#8E9C94]" : "text-[#526159]")}>
                  Sign in to your account to continue
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-red-500/15 border border-rose-200 dark:border-red-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-600 dark:text-red-400">
                <AlertCircle size={16} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className={cn("text-xs font-medium block", isDark ? "text-[#C5D2CB]" : "text-[#1A1D18]")}>
                  Email address
                </label>
                <div className="relative">
                  <Mail size={16} className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none", isDark ? "text-[#59655E]" : "text-[#74827A]")} />
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={cn(
                      "w-full h-11 pl-10 pr-3.5 text-sm rounded-xl border focus:outline-none transition-all",
                      isDark
                        ? "bg-[#090F0C]/90 border-[#233029] text-[#F3F7F4] placeholder-[#506057] focus:border-[#A3FF5F] focus:ring-1 focus:ring-[#A3FF5F]"
                        : "bg-[#F8FAF9] border-[#E5E9E7] text-[#1A1D18] placeholder-[#8E9C94] focus:border-[#2E8540] focus:ring-1 focus:ring-[#2E8540]"
                    )}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className={cn("text-xs font-medium block", isDark ? "text-[#C5D2CB]" : "text-[#1A1D18]")}>
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none", isDark ? "text-[#59655E]" : "text-[#74827A]")} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={cn(
                      "w-full h-11 pl-10 pr-10 text-sm rounded-xl border focus:outline-none transition-all",
                      isDark
                        ? "bg-[#090F0C]/90 border-[#233029] text-[#F3F7F4] placeholder-[#506057] focus:border-[#A3FF5F] focus:ring-1 focus:ring-[#A3FF5F]"
                        : "bg-[#F8FAF9] border-[#E5E9E7] text-[#1A1D18] placeholder-[#8E9C94] focus:border-[#2E8540] focus:ring-1 focus:ring-[#2E8540]"
                    )}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={cn("absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors", isDark ? "text-[#59655E] hover:text-[#F3F7F4]" : "text-[#74827A] hover:text-[#1A1D18]")}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className={cn("flex items-center gap-2 cursor-pointer transition-colors", isDark ? "text-[#8E9C94] hover:text-[#C5D2CB]" : "text-[#526159] hover:text-[#1A1D18]")}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={cn(
                      "w-4 h-4 rounded focus:ring-offset-0",
                      isDark
                        ? "bg-[#090F0C] border-[#233029] text-[#A3FF5F] focus:ring-[#A3FF5F]"
                        : "bg-white border-[#CBD5E1] text-[#2E8540] focus:ring-[#2E8540]"
                    )}
                  />
                  <span className="text-xs">Remember me</span>
                </label>

                <a href="#forgot" className={cn("hover:underline font-medium text-xs", isDark ? "text-[#A3FF5F]" : "text-[#2E8540]")}>
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full h-11 rounded-xl font-semibold text-sm tracking-wide hover:opacity-95 flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 mt-2",
                  isDark
                    ? "bg-gradient-to-r from-[#B9FF85] via-[#A3FF5F] to-[#6DE338] text-[#080D0B] shadow-[0_4px_22px_rgba(163,255,95,0.38)] hover:shadow-[0_6px_28px_rgba(163,255,95,0.5)]"
                    : "bg-[#2E8540] hover:bg-[#236C33] text-white shadow-[0_4px_16px_rgba(46,133,64,0.3)] hover:shadow-[0_6px_20px_rgba(46,133,64,0.4)]"
                )}
              >
                {loading ? "Authenticating..." : "Sign in →"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center pt-0.5">
              <div className={cn("w-full border-t", isDark ? "border-[#233029]" : "border-[#E5E9E7]")} />
              <span className={cn("px-3 text-[10px] font-mono uppercase tracking-widest absolute", isDark ? "bg-[#0D1410] text-[#59655E]" : "bg-white text-[#74827A]")}>
                OR
              </span>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className={cn(
                "w-full h-11 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-center gap-3 transition-colors",
                isDark
                  ? "border-[#233029] bg-[#0E1612]/60 hover:bg-[#151C18] hover:border-white/[0.12] text-[#F3F7F4]"
                  : "border-[#E5E9E7] bg-[#F8FAF9] hover:bg-[#F0F4F1] hover:border-[#CBD5E1] text-[#1A1D18]"
              )}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Registration Footer */}
            <div className={cn("text-center text-xs pt-0.5", isDark ? "text-[#8E9C94]" : "text-[#526159]")}>
              Don't have an account?{" "}
              <Link to="/register" className={cn("hover:underline font-semibold ml-1", isDark ? "text-[#A3FF5F]" : "text-[#2E8540]")}>
                Register
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full max-w-7xl mx-auto text-center z-10 pt-2">
        <p className={cn("text-[11px] font-mono", isDark ? "text-[#4A554F]" : "text-[#74827A]")}>
          OpsPilot Enterprise Asset & Operations System · Production Authorized Access Only
        </p>
      </footer>
    </div>
  );
}