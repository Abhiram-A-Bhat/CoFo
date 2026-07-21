import { AuthFormShell } from "@/features/auth/auth-form-shell";
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthFormShell
      description="Enter your email address and we'll send you a 6-digit OTP code to verify identity and reset password."
      footerHref="/signup"
      footerLinkText="Create an account"
      footerText="New to BridgeCapita?"
      title="Reset password"
    >
      <ForgotPasswordForm />
    </AuthFormShell>
  );
}
