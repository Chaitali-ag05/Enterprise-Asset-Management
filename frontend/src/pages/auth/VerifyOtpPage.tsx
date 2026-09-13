import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { AlertCircle, Sun, Moon } from "lucide-react";
import { authApi } from "../../api/authApi";
import { useAuthStore } from "../../context/useAuthStore";
import { useToast } from "../../context/ToastContext";
import { OpsPilotLogo } from "../../components/common/OpsPilotLogo";
import { useThemeStore } from "../../context/useThemeStore";
import { cn } from "../../utils/cn";

export default function VerifyOtpPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addToast } = useToast();
  const { theme, resolvedTheme, setTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const regDataStr = sessionStorage.getItem("af_reg_payload");
      if (regDataStr) {
        const payload = JSON.parse(regDataStr);
        await authApi.register(payload);
        sessionStorage.removeItem("af_reg_payload");
        const res = await authApi.login({ usernameOrEmail: payload.username, password: payload.password });
        login(res);
        addToast("success", "Account verified and registered successfully.");
        navigate("/dashboard");
      } else {
        addToast("success", "Code verified. Please log in.");
        navigate("/login");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setTimer(60);
    setOtp(["", "", "", "", "", ""]);
    addToast("info", "New verification code dispatched.");
    inputRefs.current[0]?.focus();
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
          "absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none transition-all",
          isDark ? "bg-[#55D6BE]/5" : "bg-[#2E8540]/10"
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
            Verify Email Address
          </h1>
          <p className={cn("text-xs", isDark ? "text-[#AAB7AF]" : "text-[#525B56]")}>
            Enter the 6-digit verification code dispatched to:
          </p>
          <p
            className={cn(
              "font-mono text-xs font-semibold",
              isDark ? "text-[#A3FF5F]" : "text-[#2E8540]"
            )}
          >
            {email || "corporate email"}
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

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex items-center justify-between gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className={cn(
                    "w-11 h-12 text-center font-mono text-base font-bold rounded-control border transition-all focus:outline-none",
                    isDark
                      ? "border-[#25312B] bg-[#151C18] text-white focus:border-[#A3FF5F] focus:ring-1 focus:ring-[#A3FF5F]"
                      : "border-[#CBD5E1] bg-[#F8FAFC] text-[#1A1D18] focus:border-[#2E8540] focus:ring-1 focus:ring-[#2E8540]"
                  )}
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full h-11 rounded-pill font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50",
                isDark
                  ? "bg-[#A3FF5F] hover:bg-[#8EF04C] text-[#0B100E] shadow-lime-glow"
                  : "bg-[#2E8540] hover:bg-[#256C34] text-white shadow-md shadow-[#2E8540]/20"
              )}
            >
              {loading ? "Verifying..." : "Verify Code & Activate →"}
            </button>
          </form>

          <div className={cn("pt-2 text-center text-xs flex items-center justify-between", isDark ? "text-[#AAB7AF]" : "text-[#525B56]")}>
            <Link
              to="/login"
              className={cn(
                "transition-colors",
                isDark ? "text-[#AAB7AF] hover:text-white" : "text-[#525B56] hover:text-[#1A1D18]"
              )}
            >
              ← Return to Login
            </Link>

            {timer > 0 ? (
              <span className={cn("font-mono text-2xs", isDark ? "text-[#74827A]" : "text-[#94A3B8]")}>
                Resend in {timer}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className={cn(
                  "font-semibold hover:underline",
                  isDark ? "text-[#A3FF5F]" : "text-[#2E8540]"
                )}
              >
                Resend Code
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}