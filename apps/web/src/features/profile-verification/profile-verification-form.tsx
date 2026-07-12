"use client";

import { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  getMyProfileVerification,
  saveMyProfileVerification,
  type VerificationBadge
} from "@/lib/api/profile-verification";
import { VerificationBadges } from "@/features/profile-verification/verification-badges";

export function ProfileVerificationForm() {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [companyRegistration, setCompanyRegistration] = useState("");
  const [badges, setBadges] = useState<VerificationBadge[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadVerification() {
      try {
        const verification = await getMyProfileVerification();

        if (!isMounted) {
          return;
        }

        setLinkedinUrl(verification.linkedin_url ?? "");
        setWebsiteUrl(verification.website_url ?? "");
        setCompanyRegistration(verification.company_registration ?? "");
        setBadges(verification.verification_badges);
      } catch (caughtError) {
        if (caughtError instanceof AxiosError && caughtError.response?.status === 404) {
          return;
        }

        if (isMounted) {
          setError(getApiErrorMessage(caughtError, "Unable to load verification."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadVerification();

    return () => {
      isMounted = false;
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!linkedinUrl.trim() && !websiteUrl.trim() && !companyRegistration.trim()) {
      setError("Submit at least one verification signal.");
      return;
    }

    setIsSaving(true);

    try {
      const verification = await saveMyProfileVerification({
        linkedin_url: linkedinUrl.trim() || undefined,
        website_url: websiteUrl.trim() || undefined,
        company_registration: companyRegistration.trim() || undefined
      });

      setLinkedinUrl(verification.linkedin_url ?? "");
      setWebsiteUrl(verification.website_url ?? "");
      setCompanyRegistration(verification.company_registration ?? "");
      setBadges(verification.verification_badges);
      setSuccess("Verification submitted.");
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to submit verification."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="w-full max-w-3xl border-white/15">
      <CardHeader className="border-b border-white/10 p-7">
        <div className="mb-2 inline-flex w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
          Verification
        </div>
        <CardTitle className="text-2xl">Profile Verification</CardTitle>
        <CardDescription>
          Submit LinkedIn, website, and company registration details to display trust badges.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-7">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading verification
          </div>
        ) : (
          <form className="space-y-6" onSubmit={onSubmit}>
            {error ? <Alert>{error}</Alert> : null}
            {success ? (
              <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
                {success}
              </div>
            ) : null}
            <VerificationBadges badges={badges} />
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn</Label>
                <Input
                  id="linkedinUrl"
                  maxLength={500}
                  onChange={(event) => setLinkedinUrl(event.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  type="url"
                  value={linkedinUrl}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website</Label>
                <Input
                  id="websiteUrl"
                  maxLength={500}
                  onChange={(event) => setWebsiteUrl(event.target.value)}
                  placeholder="https://company.com"
                  type="url"
                  value={websiteUrl}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyRegistration">Company Registration</Label>
              <Input
                id="companyRegistration"
                maxLength={255}
                onChange={(event) => setCompanyRegistration(event.target.value)}
                placeholder="Registration or incorporation number"
                value={companyRegistration}
              />
            </div>
            <Button className="h-11 w-full sm:w-auto" disabled={isSaving} type="submit">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit verification
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
