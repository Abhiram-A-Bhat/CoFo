import { AuthFormShell } from "@/features/auth/auth-form-shell";
import { SignupForm } from "@/features/auth/signup-form";

export default function SignupPage() {
  return (
    <AuthFormShell
      description="Create your account and start shaping investor-ready fundraising signal."
      footerHref="/login"
      footerLinkText="Log in"
      footerText="Already have an account?"
      title="Create your workspace"
    >
      <SignupForm />
    </AuthFormShell>
  );
}
