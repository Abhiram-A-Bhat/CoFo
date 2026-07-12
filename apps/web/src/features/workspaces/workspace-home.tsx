"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Megaphone, X } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";

type WorkspaceLink = {
  title: string;
  body: string;
  href: string;
};

type WorkspaceHomeProps = {
  eyebrow: string;
  title: string;
  body: string;
  links: WorkspaceLink[];
};

type Announcement = {
  id: string;
  content: string;
  created_at: string;
};

export function WorkspaceHome({ eyebrow, title, body, links }: WorkspaceHomeProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [closedIds, setClosedIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const res = await apiClient.get<Announcement[]>("/auth/announcements");
        setAnnouncements(res.data);
      } catch (err) {
        // Suppress auth or fetch errors silently
      }
    }
    loadAnnouncements();
  }, []);

  const activeAnnouncements = announcements.filter(a => !closedIds.includes(a.id));

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-80 bg-[linear-gradient(180deg,rgba(45,212,191,0.10),transparent_72%)]" />
      <section className="relative mx-auto max-w-6xl space-y-8">
        
        {/* System Announcements */}
        {activeAnnouncements.length > 0 && (
          <div className="space-y-3">
            {activeAnnouncements.map((ann) => (
              <div 
                key={ann.id}
                className="relative flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3.5 pr-10 text-sm text-foreground shadow-sm transition-all duration-300"
              >
                <Megaphone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-xs uppercase tracking-wider text-primary">System Announcement</span>
                  <p className="text-sm leading-6 text-muted-foreground">{ann.content}</p>
                </div>
                <button 
                  onClick={() => setClosedIds([...closedIds, ann.id])}
                  className="absolute right-3 top-3.5 text-muted-foreground/60 hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="max-w-3xl space-y-4">
          <div className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
            {eyebrow}
          </div>
          <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">{title}</h1>
          <p className="text-sm leading-7 text-muted-foreground">{body}</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <Link href={link.href} key={link.href}>
              <Card className="h-full border-white/15 transition-transform duration-200 hover:-translate-y-1 hover:border-primary/25">
                <CardContent className="space-y-3 p-6">
                  <div className="h-1.5 w-10 rounded-full bg-primary" />
                  <h2 className="text-lg font-semibold">{link.title}</h2>
                  <p className="text-sm leading-6 text-muted-foreground">{link.body}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
