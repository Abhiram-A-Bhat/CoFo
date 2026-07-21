"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound, Mail, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { forgotPassword, verifyOtp, resetPassword } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useToast } from "@/lib/toast-context";

export function ForgotPasswordForm() {
  const router = useRouter();
  const toast = useToast();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError("");
    setIsLoading(true);
    try {
      await forgotPassword(email);
      toast.success("OTP sent successfully to your email!");
      setStep(2);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Failed to send OTP email."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await verifyOtp(email, otpCode);
      toast.success("OTP verified successfully!");
      setStep(3);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Invalid or expired OTP."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await resetPassword({
        email,
        otp_code: otpCode,
        new_password: newPassword,
      });
      toast.success("Password reset successfully! Log in with your new password.");
      router.push("/login");
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Failed to reset password. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
          {error}
        </div>
      ) : null}

      {step === 1 && (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-[13px] font-medium text-white/60">
              Enter your email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-white/30" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                disabled={isLoading}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-10 pr-4 py-3 text-[14px] text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full rounded-xl bg-emerald-500 py-3 text-[14px] font-semibold text-black hover:bg-emerald-400 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Sending OTP..." : "Request Reset OTP"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="otp" className="block text-[13px] font-medium text-white/60">
              Enter the 6-Digit OTP sent to your email
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-4.5 w-4.5 text-white/30" />
              <input
                id="otp"
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                disabled={isLoading}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-10 pr-4 py-3 text-[14px] text-white placeholder:text-white/20 outline-none tracking-widest text-center font-bold focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || otpCode.length !== 6}
            className="w-full rounded-xl bg-emerald-500 py-3 text-[14px] font-semibold text-black hover:bg-emerald-400 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="new-password" className="block text-[13px] font-medium text-white/60">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-white/30" />
              <input
                id="new-password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 chars + 1 uppercase"
                disabled={isLoading}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-10 pr-4 py-3 text-[14px] text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="block text-[13px] font-medium text-white/60">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-white/30" />
              <input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                disabled={isLoading}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-10 pr-4 py-3 text-[14px] text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !newPassword || !confirmPassword}
            className="w-full rounded-xl bg-emerald-500 py-3 text-[14px] font-semibold text-black hover:bg-emerald-400 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Resetting..." : "Save Password & Login"}
          </button>
        </form>
      )}

      {/* Footer Back Link */}
      <div className="text-center pt-2">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="h-3 w-3" /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}
