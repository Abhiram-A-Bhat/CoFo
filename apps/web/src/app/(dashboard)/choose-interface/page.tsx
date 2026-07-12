"use client";

import { useEffect } from "react";
import { ArrowRight, Building2, ShieldCheck, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";

export default function ChooseInterfacePage() {
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("fundflow_active_workspace");
    if (saved === "founder") {
      router.replace("/pitch-feed");
    } else if (saved === "investor") {
      router.replace("/startup-discovery");
    }
  }, [router]);

  const handleSelect = (ws: "founder" | "investor") => {
    localStorage.setItem("fundflow_active_workspace", ws);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-96 bg-[linear-gradient(180deg,rgba(45,212,191,0.12),transparent_72%)]" />
      <Link
        className="absolute right-5 top-5 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
        href="/admin"
      >
        <ShieldCheck className="h-4 w-4" />
        Admin
      </Link>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col justify-center gap-10">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <div className="mx-auto inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
            Choose interface
          </div>
          <h1 className="text-4xl font-semibold tracking-normal sm:text-6xl">
            How do you want to use BridgeCapita today?
          </h1>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            Select the workspace that matches your role. You can return here after login
            whenever you need to switch context.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <InterfaceCard
            body="Manage your startup profile, discover investors, review matches, and message capital partners."
            href="/founder"
            icon={Building2}
            label="I am raising capital"
            title="Founder"
            onClick={() => handleSelect("founder")}
          />
          <InterfaceCard
            body="Manage your investor profile, discover startups, review matches, and message founders."
            href="/investor"
            icon={TrendingUp}
            label="I am deploying capital"
            title="Investor"
            onClick={() => handleSelect("investor")}
          />
        </div>
      </section>
    </main>
  );
}

function InterfaceCard({
  body,
  href,
  icon: Icon,
  label,
  title,
  onClick
}: {
  body: string;
  href: string;
  icon: typeof Building2;
  label: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <Link href={href} onClick={onClick}>
      <Card className="group min-h-[320px] border-white/15 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:bg-card">
        <CardContent className="flex h-full flex-col justify-between gap-8 p-8 sm:p-10">
          <div className="space-y-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
              <Icon className="h-7 w-7" />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
                {label}
              </p>
              <h2 className="text-3xl font-semibold tracking-normal sm:text-4xl">{title}</h2>
              <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                {body}
              </p>
            </div>
          </div>
          <div className="flex items-center text-sm font-medium text-primary">
            Open {title} workspace
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
