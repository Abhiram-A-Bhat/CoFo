"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Inner component that safely uses useSearchParams inside a Suspense boundary.
 */
function GoogleCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      const messages: Record<string, string> = {
        google_denied: "Google sign-in was cancelled.",
        google_token_failed: "Failed to complete Google sign-in. Please try again.",
        google_userinfo_failed: "Could not retrieve your Google account info.",
        google_no_email: "Your Google account did not share an email address.",
        google_login_failed: "Sign-in failed. Please try again.",
      };
      const msg = encodeURIComponent(messages[error] ?? "Google sign-in failed.");
      router.replace(`/login?google_error=${msg}`);
      return;
    }

    if (token) {
      localStorage.setItem("fundflow_access_token", token);
      router.replace("/choose-interface");
    } else {
      router.replace("/login?google_error=" + encodeURIComponent("No token received."));
    }
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Completing sign-in…</p>
    </div>
  );
}

/**
 * Main page wrapped in a Suspense boundary to satisfy Next.js static generation rules.
 */
export default function GoogleCompletePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading authentication…</p>
          </div>
        }
      >
        <GoogleCompleteContent />
      </Suspense>
    </div>
  );
}
