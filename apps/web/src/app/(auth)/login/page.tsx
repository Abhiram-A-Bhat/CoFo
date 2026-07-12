import { AuthFormShell } from "@/features/auth/auth-form-shell";
import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <AuthFormShell
      description="Enter your credentials to continue to your fundraising workspace."
      footerHref="/signup"
      footerLinkText="Create an account"
      footerText="New to BridgeCapita?"
      title="Welcome back"
    >
      <LoginForm />
    </AuthFormShell>
  );
}
