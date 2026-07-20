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
import { Textarea } from "@/components/ui/textarea";
import { MoneyInput } from "@/components/ui/money-input";
import { getApiErrorMessage } from "@/lib/api/errors";
import { ProfileCompleteness, getInvestorProfileFields } from "@/components/profile-completeness";
import {
  getMyInvestorProfile,
  saveMyInvestorProfile,
  uploadMyInvestorAvatar
} from "@/lib/api/investor-profile";
import type { VerificationBadge } from "@/lib/api/profile-verification";
import { VerificationBadges } from "@/features/profile-verification/verification-badges";
import { AvatarUploader } from "@/components/avatar-uploader";

export function InvestorProfileForm() {
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [investmentThesis, setInvestmentThesis] = useState("");
  const [ticketSize, setTicketSize] = useState("");
  const [verificationBadges, setVerificationBadges] = useState<VerificationBadge[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadInvestorProfile() {
      try {
        const investorProfile = await getMyInvestorProfile();

        if (!isMounted) {
          return;
        }

        setName(investorProfile.name);
        setOrganization(investorProfile.organization);
        setInvestmentThesis(investorProfile.investment_thesis);
        setTicketSize(investorProfile.ticket_size);
        setAvatarUrl(investorProfile.avatar_url);
        setVerificationBadges(investorProfile.verification_badges);
      } catch (caughtError) {
        if (caughtError instanceof AxiosError && caughtError.response?.status === 404) {
          return;
        }

        if (isMounted) {
          setError(getApiErrorMessage(caughtError, "Unable to load investor profile."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInvestorProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const investorProfile = await saveMyInvestorProfile({
        name,
        organization,
        investment_thesis: investmentThesis,
        ticket_size: ticketSize
      });

      setName(investorProfile.name);
      setOrganization(investorProfile.organization);
      setInvestmentThesis(investorProfile.investment_thesis);
      setTicketSize(investorProfile.ticket_size);
      setVerificationBadges(investorProfile.verification_badges);
      setSuccess("Investor profile saved.");
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to save investor profile."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="w-full max-w-3xl border-white/15">
      <CardHeader className="border-b border-white/10 p-7">
        <div className="flex items-start gap-6">
          <AvatarUploader
            storageKey="fundflow_investor_avatar"
            initials={name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "IN"}
            size="lg"
            shape="circle"
            label="Profile Photo"
            serverSrc={avatarUrl}
            onServerUpload={async (file) => {
              const result = await uploadMyInvestorAvatar(file);
              setAvatarUrl(result.avatar_url);
              return { url: result.avatar_url };
            }}
          />
          <div className="flex-1 space-y-1">
            <div className="mb-2 inline-flex w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
              Investor workspace
            </div>
            <CardTitle className="text-2xl">Investor Profile</CardTitle>
            <CardDescription>
              Define your investment identity and preferred check size.
            </CardDescription>
            <VerificationBadges badges={verificationBadges} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-7">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading
          </div>
        ) : (
          <form className="space-y-6" onSubmit={onSubmit}>
            <ProfileCompleteness fields={getInvestorProfileFields({ name, organization, investment_thesis: investmentThesis, ticket_size: ticketSize } as unknown as Record<string, unknown>)} />
            {error ? <Alert>{error}</Alert> : null}
            {success ? (
              <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
                {success}
              </div>
            ) : null}

            {/* Profile Completion Meter */}
            {(() => {
              const suggestions = [];
              let score = 0;
              
              if (name) score += 25; else suggestions.push("Add your name");
              if (organization) score += 25; else suggestions.push("Add organization or fund name");
              if (investmentThesis) score += 25; else suggestions.push("Add your investment thesis details");
              if (ticketSize) score += 25; else suggestions.push("Specify your check/ticket size");

              return (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Profile Strength</h3>
                      <p className="text-xs text-white/40">Complete your profile to receive relevant startup matches.</p>
                    </div>
                    <span className="text-lg font-bold text-emerald-400">{score}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${score}%` }} 
                    />
                  </div>
                  {suggestions.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-emerald-400/80 uppercase tracking-wider block">Recommended next steps:</span>
                      <ul className="text-xs text-white/50 space-y-1.5 pl-4 list-disc">
                        {suggestions.slice(0, 3).map((sug, i) => (
                          <li key={i}>{sug}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })()}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  maxLength={255}
                  name="name"
                  onChange={(event) => setName(event.target.value)}
                  required
                  value={name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  maxLength={255}
                  name="organization"
                  onChange={(event) => setOrganization(event.target.value)}
                  required
                  value={organization}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="investmentThesis">Investment Thesis</Label>
              <Textarea
                id="investmentThesis"
                maxLength={5000}
                name="investmentThesis"
                onChange={(event) => setInvestmentThesis(event.target.value)}
                required
                value={investmentThesis}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticketSize">Ticket Size</Label>
              <MoneyInput
                id="ticketSize"
                onChange={(val) => setTicketSize(val)}
                required
                value={ticketSize}
              />
            </div>
            <Button className="h-11 w-full sm:w-auto" disabled={isSaving} type="submit">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save profile
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
