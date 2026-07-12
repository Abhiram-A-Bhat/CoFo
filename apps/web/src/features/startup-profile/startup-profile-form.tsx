"use client";

import { AxiosError } from "axios";
import { Loader2, Upload } from "lucide-react";
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
import { VerificationBadges } from "@/features/profile-verification/verification-badges";
import { AvatarUploader } from "@/components/avatar-uploader";
import { env } from "@/lib/config/env";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { VerificationBadge } from "@/lib/api/profile-verification";
import {
  getMyStartupProfile,
  saveMyStartupProfile,
  uploadMyStartupPitchVideo,
  uploadMyStartupLogo
} from "@/lib/api/startup-profile";
import type { StartupProfile, StartupProfilePayload } from "@/lib/api/startup-profile";

type StartupProfileFormState = {
  startup_name: string;
  industry: string;
  website_url: string;
  headquarters: string;
  founded_year: string;
  stage: string;
  business_model: string;
  target_market: string;
  description: string;
  funding_required: string;
  monthly_revenue: string;
  annual_recurring_revenue: string;
  gross_margin_percent: string;
  net_profit: string;
  burn_rate: string;
  runway_months: string;
  customer_count: string;
  valuation: string;
  revenue_projection_year1: string;
  revenue_projection_year2: string;
  revenue_projection_year3: string;
  profit_projection_year1: string;
  profit_projection_year2: string;
  profit_projection_year3: string;
  patents_filed: string;
  patents_granted: string;
  traction_summary: string;
  use_of_funds: string;
};

const EMPTY_PROFILE: StartupProfileFormState = {
  startup_name: "",
  industry: "",
  website_url: "",
  headquarters: "",
  founded_year: "",
  stage: "",
  business_model: "",
  target_market: "",
  description: "",
  funding_required: "",
  monthly_revenue: "",
  annual_recurring_revenue: "",
  gross_margin_percent: "",
  net_profit: "",
  burn_rate: "",
  runway_months: "",
  customer_count: "",
  valuation: "",
  revenue_projection_year1: "",
  revenue_projection_year2: "",
  revenue_projection_year3: "",
  profit_projection_year1: "",
  profit_projection_year2: "",
  profit_projection_year3: "",
  patents_filed: "",
  patents_granted: "",
  traction_summary: "",
  use_of_funds: ""
};

const COMPANY_FIELDS = [
  { id: "startup_name", label: "Startup name", required: true },
  { id: "industry", label: "Industry", required: true },
  { id: "website_url", label: "Website", type: "url" },
  { id: "headquarters", label: "Headquarters" },
  { id: "founded_year", label: "Founded year", type: "number" },
  { id: "stage", label: "Stage", placeholder: "Pre-seed, Seed, Series A" },
  { id: "business_model", label: "Business model", placeholder: "SaaS, marketplace, usage-based" },
  { id: "target_market", label: "Target market", placeholder: "SMB finance teams, hospitals, developers" }
] satisfies FieldConfig[];

const FINANCIAL_FIELDS = [
  { id: "funding_required", label: "Funding required", required: true, type: "number", isMoney: true },
  { id: "monthly_revenue", label: "Monthly revenue", type: "number", isMoney: true },
  { id: "annual_recurring_revenue", label: "ARR", type: "number", isMoney: true },
  { id: "gross_margin_percent", label: "Gross margin %", type: "number" },
  { id: "net_profit", label: "Net profit", type: "number", isMoney: true },
  { id: "burn_rate", label: "Monthly burn", type: "number", isMoney: true },
  { id: "runway_months", label: "Runway months", type: "number" },
  { id: "customer_count", label: "Customers", type: "number" },
  { id: "valuation", label: "Valuation", type: "number", isMoney: true }
] satisfies FieldConfig[];

const PROJECTION_FIELDS = [
  { id: "revenue_projection_year1", label: "Revenue projection Y1", type: "number", isMoney: true },
  { id: "revenue_projection_year2", label: "Revenue projection Y2", type: "number", isMoney: true },
  { id: "revenue_projection_year3", label: "Revenue projection Y3", type: "number", isMoney: true },
  { id: "profit_projection_year1", label: "Profit projection Y1", type: "number", isMoney: true },
  { id: "profit_projection_year2", label: "Profit projection Y2", type: "number", isMoney: true },
  { id: "profit_projection_year3", label: "Profit projection Y3", type: "number", isMoney: true },
  { id: "patents_filed", label: "Patents filed", type: "number" },
  { id: "patents_granted", label: "Patents granted", type: "number" }
] satisfies FieldConfig[];

type FieldConfig = {
  id: keyof StartupProfileFormState;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "number" | "url";
  isMoney?: boolean;
};

export function StartupProfileForm() {
  const [profile, setProfile] = useState<StartupProfileFormState>(EMPTY_PROFILE);
  const [pitchVideoUrl, setPitchVideoUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [verificationBadges, setVerificationBadges] = useState<VerificationBadge[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadStartupProfile() {
      try {
        const startupProfile = await getMyStartupProfile();

        if (!isMounted) {
          return;
        }

        // Merge loaded server profile with local storage draft if available
        const loadedForm = toFormState(startupProfile);
        const savedDraft = localStorage.getItem("fundflow_startup_profile_draft");
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            setProfile({ ...loadedForm, ...parsed });
          } catch (_) {
            setProfile(loadedForm);
          }
        } else {
          setProfile(loadedForm);
        }

        setPitchVideoUrl(startupProfile.pitch_video_url);
        setLogoUrl(startupProfile.logo_url);
        setVerificationBadges(startupProfile.verification_badges);
      } catch (caughtError) {
        if (caughtError instanceof AxiosError && caughtError.response?.status === 404) {
          // If server profile 404, check if there is an offline draft
          const savedDraft = localStorage.getItem("fundflow_startup_profile_draft");
          if (savedDraft && isMounted) {
            try {
              setProfile(JSON.parse(savedDraft));
            } catch (_) {}
          }
          return;
        }

        if (isMounted) {
          setError(getApiErrorMessage(caughtError, "Unable to load startup profile."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadStartupProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // Autosave profile draft state to LocalStorage
  useEffect(() => {
    if (isLoading) return;
    const timeout = setTimeout(() => {
      localStorage.setItem("fundflow_startup_profile_draft", JSON.stringify(profile));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [profile, isLoading]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const startupProfile = await saveMyStartupProfile(toPayload(profile));

      setProfile(toFormState(startupProfile));
      setPitchVideoUrl(startupProfile.pitch_video_url);
      setVerificationBadges(startupProfile.verification_badges);
      localStorage.removeItem("fundflow_startup_profile_draft");
      setSuccess("Startup profile saved successfully.");
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to save startup profile."));
    } finally {
      setIsSaving(false);
    }
  }

  async function onUploadVideo() {
    if (!videoFile) {
      setError("Choose a pitch video first.");
      return;
    }

    setError("");
    setSuccess("");
    setIsUploadingVideo(true);

    try {
      const startupProfile = await uploadMyStartupPitchVideo(videoFile);
      setPitchVideoUrl(startupProfile.pitch_video_url);
      setVerificationBadges(startupProfile.verification_badges);
      setVideoFile(null);
      setSuccess("Pitch video uploaded.");
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to upload pitch video."));
    } finally {
      setIsUploadingVideo(false);
    }
  }

  function updateField(field: keyof StartupProfileFormState, value: string) {
    setProfile((currentProfile) => ({
      ...currentProfile,
      [field]: value
    }));
  }

  return (
    <Card className="w-full max-w-6xl border-white/15">
      <CardHeader className="border-b border-white/10 p-7">
        <div className="flex items-start gap-6">
          <AvatarUploader
            storageKey="fundflow_startup_logo"
            initials={profile.startup_name ? profile.startup_name.slice(0, 2).toUpperCase() : "CO"}
            size="lg"
            shape="rounded"
            label="Company Logo"
            serverSrc={logoUrl}
            onServerUpload={async (file) => {
              const result = await uploadMyStartupLogo(file);
              setLogoUrl(result.logo_url);
              return { url: result.logo_url };
            }}
          />
          <div className="flex-1 space-y-1">
            <div className="mb-2 inline-flex w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
              Founder workspace
            </div>
            <CardTitle className="text-2xl">Investor-Ready Company Profile</CardTitle>
            <CardDescription>
              Capture the financial, traction, legal, and pitch details investors ask for
              before committing time.
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
          <div className="space-y-8">
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
              
              // Company details metrics
              if (profile.startup_name) score += 10; else suggestions.push("Add startup name");
              if (profile.industry) score += 10; else suggestions.push("Select your industry");
              if (profile.website_url) score += 5; else suggestions.push("Add company website URL");
              if (profile.headquarters) score += 5; else suggestions.push("Specify headquarters location");
              if (profile.description) score += 10; else suggestions.push("Write a description of your startup");
              
              // Financial/Funding metrics
              if (profile.funding_required) score += 15; else suggestions.push("Add funding required");
              if (profile.annual_recurring_revenue) score += 10; else suggestions.push("Add Annual Recurring Revenue (ARR)");
              if (profile.runway_months) score += 10; else suggestions.push("Specify runway duration in months");
              if (profile.valuation) score += 10; else suggestions.push("Specify valuation");
              
              // Pitch Video
              if (pitchVideoUrl) score += 15; else suggestions.push("Upload a pitch video");

              return (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Profile Strength</h3>
                      <p className="text-xs text-white/40">Complete your profile to increase investor response rates.</p>
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

            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">3-minute pitch video</h2>
                  <p className="text-sm text-muted-foreground">
                    Upload MP4, WebM, or MOV. Keep it under three minutes for best results.
                  </p>
                </div>
                <Button
                  disabled={isUploadingVideo || !videoFile}
                  onClick={onUploadVideo}
                  type="button"
                >
                  {isUploadingVideo ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload video
                </Button>
              </div>
              <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                <Input
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)}
                  type="file"
                />
                {pitchVideoUrl ? (
                  <video
                    className="aspect-video w-full rounded-lg border border-white/10 bg-black object-cover"
                    controls
                    src={absoluteMediaUrl(pitchVideoUrl)}
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-white/15 bg-black/20 text-sm text-muted-foreground">
                    No pitch video uploaded yet.
                  </div>
                )}
              </div>
            </section>

            <form className="space-y-8" onSubmit={onSubmit}>
              <FormSection
                fields={COMPANY_FIELDS}
                onChange={updateField}
                profile={profile}
                title="Company basics"
              />
              <div className="space-y-2">
                <Label htmlFor="description">Company description</Label>
                <Textarea
                  id="description"
                  maxLength={5000}
                  name="description"
                  onChange={(event) => updateField("description", event.target.value)}
                  required
                  value={profile.description}
                />
              </div>
              <FormSection
                fields={FINANCIAL_FIELDS}
                onChange={updateField}
                profile={profile}
                title="Financial metrics"
              />
              <FormSection
                fields={PROJECTION_FIELDS}
                onChange={updateField}
                profile={profile}
                title="Projections and IP"
              />
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="traction_summary">Traction summary</Label>
                  <Textarea
                    id="traction_summary"
                    maxLength={5000}
                    onChange={(event) => updateField("traction_summary", event.target.value)}
                    placeholder="Growth, pilots, contracts, partnerships, retention, waitlist"
                    value={profile.traction_summary}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="use_of_funds">Use of funds</Label>
                  <Textarea
                    id="use_of_funds"
                    maxLength={5000}
                    onChange={(event) => updateField("use_of_funds", event.target.value)}
                    placeholder="Hiring, product, compliance, sales, infrastructure"
                    value={profile.use_of_funds}
                  />
                </div>
              </div>
              <Button className="h-11 w-full sm:w-auto" disabled={isSaving} type="submit">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save company profile
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FormSection({
  fields,
  onChange,
  profile,
  title
}: {
  fields: FieldConfig[];
  onChange: (field: keyof StartupProfileFormState, value: string) => void;
  profile: StartupProfileFormState;
  title: string;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => (
          <div className="space-y-2" key={field.id}>
            <Label htmlFor={field.id}>{field.label}</Label>
            {field.isMoney ? (
              <div className="space-y-1.5">
                <MoneyInput
                  id={field.id}
                  onChange={(val) => onChange(field.id, val)}
                  placeholder={field.placeholder}
                  required={field.required}
                  value={profile[field.id]}
                />
                {/* Smart Defaults & Fast Select tags */}
                <div className="flex flex-wrap gap-1.5">
                  {["100000", "250000", "500000", "1000000"].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => onChange(field.id, val)}
                      className="rounded bg-white/[0.04] border border-white/10 px-2 py-0.5 text-[10px] text-white/50 hover:text-white hover:border-white/20 transition-all"
                    >
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(val))}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <Input
                id={field.id}
                min={field.type === "number" ? "0" : undefined}
                name={field.id}
                onChange={(event) => onChange(field.id, event.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                step={field.type === "number" ? "1" : undefined}
                type={field.type ?? "text"}
                value={profile[field.id]}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function toFormState(profile: StartupProfile): StartupProfileFormState {
  return {
    startup_name: profile.startup_name,
    industry: profile.industry,
    website_url: profile.website_url ?? "",
    headquarters: profile.headquarters ?? "",
    founded_year: toInput(profile.founded_year),
    stage: profile.stage ?? "",
    business_model: profile.business_model ?? "",
    target_market: profile.target_market ?? "",
    description: profile.description,
    funding_required: profile.funding_required,
    monthly_revenue: profile.monthly_revenue ?? "",
    annual_recurring_revenue: profile.annual_recurring_revenue ?? "",
    gross_margin_percent: profile.gross_margin_percent ?? "",
    net_profit: profile.net_profit ?? "",
    burn_rate: profile.burn_rate ?? "",
    runway_months: toInput(profile.runway_months),
    customer_count: toInput(profile.customer_count),
    valuation: profile.valuation ?? "",
    revenue_projection_year1: profile.revenue_projection_year1 ?? "",
    revenue_projection_year2: profile.revenue_projection_year2 ?? "",
    revenue_projection_year3: profile.revenue_projection_year3 ?? "",
    profit_projection_year1: profile.profit_projection_year1 ?? "",
    profit_projection_year2: profile.profit_projection_year2 ?? "",
    profit_projection_year3: profile.profit_projection_year3 ?? "",
    patents_filed: toInput(profile.patents_filed),
    patents_granted: toInput(profile.patents_granted),
    traction_summary: profile.traction_summary ?? "",
    use_of_funds: profile.use_of_funds ?? ""
  };
}

function toPayload(profile: StartupProfileFormState): StartupProfilePayload {
  return {
    startup_name: profile.startup_name,
    industry: profile.industry,
    website_url: optionalString(profile.website_url),
    headquarters: optionalString(profile.headquarters),
    founded_year: optionalInteger(profile.founded_year),
    stage: optionalString(profile.stage),
    business_model: optionalString(profile.business_model),
    target_market: optionalString(profile.target_market),
    description: profile.description,
    funding_required: profile.funding_required,
    monthly_revenue: optionalDecimal(profile.monthly_revenue),
    annual_recurring_revenue: optionalDecimal(profile.annual_recurring_revenue),
    gross_margin_percent: optionalDecimal(profile.gross_margin_percent),
    net_profit: optionalDecimal(profile.net_profit),
    burn_rate: optionalDecimal(profile.burn_rate),
    runway_months: optionalInteger(profile.runway_months),
    customer_count: optionalInteger(profile.customer_count),
    valuation: optionalDecimal(profile.valuation),
    revenue_projection_year1: optionalDecimal(profile.revenue_projection_year1),
    revenue_projection_year2: optionalDecimal(profile.revenue_projection_year2),
    revenue_projection_year3: optionalDecimal(profile.revenue_projection_year3),
    profit_projection_year1: optionalDecimal(profile.profit_projection_year1),
    profit_projection_year2: optionalDecimal(profile.profit_projection_year2),
    profit_projection_year3: optionalDecimal(profile.profit_projection_year3),
    patents_filed: optionalInteger(profile.patents_filed),
    patents_granted: optionalInteger(profile.patents_granted),
    traction_summary: optionalString(profile.traction_summary),
    use_of_funds: optionalString(profile.use_of_funds)
  };
}

function optionalString(value: string) {
  return value.trim() ? value.trim() : null;
}

function optionalDecimal(value: string) {
  return value.trim() ? value : null;
}

function optionalInteger(value: string) {
  return value.trim() ? Number.parseInt(value, 10) : null;
}

function toInput(value: number | null) {
  return value === null ? "" : String(value);
}

function absoluteMediaUrl(url: string) {
  if (url.startsWith("http")) {
    return url;
  }
  return `${env.apiUrl}${url}`;
}
