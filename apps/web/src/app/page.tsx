"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import AnimatedCounter from "@/components/AnimatedCounter";
import { getMe } from "@/lib/api/auth";
import {
  ArrowRight,
  TrendingUp,
  Users,
  Zap,
  Shield,
  BarChart2,
  MessageSquare,
  ChevronRight,
  CheckCircle,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { WaveBackground } from "@/components/wave-background";



// ─────────────────────────────────────────────
// SCROLL-REVEAL WRAPPER
// ─────────────────────────────────────────────
function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          obs.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// FAQ ACCORDION
// ─────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [open]);

  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 hover:bg-white/[0.04] transition-colors group"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-[15px] font-semibold">{q}</h3>
        <ChevronDown
          className={`h-4 w-4 mt-0.5 shrink-0 text-white/30 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>
      <div
        style={{ maxHeight: open ? height : 0 }}
        className="overflow-hidden transition-all duration-400 ease-in-out"
      >
        <div ref={contentRef} className="pt-3">
          <p className="text-[13px] leading-relaxed text-white/40">{a}</p>
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const stats = [
  { value: "₹100Cr+", numericValue: 100, suffix: "Cr+", prefix: "₹", label: "Capital being sought" },
  { value: "3", numericValue: 3, suffix: "", prefix: "", label: "Avg. days to first match" },
  { value: "500+", numericValue: 500, suffix: "+", prefix: "", label: "Founders onboarded" },
  { value: "200+", numericValue: 200, suffix: "+", prefix: "", label: "Active investors" },
];

const features = [
  {
    icon: BarChart2,
    title: "Structured profiles",
    description:
      "Capture every signal investors look for — traction, financials, runway, patents — in one organised workspace. No more scattered decks.",
  },
  {
    icon: Users,
    title: "Smart discovery",
    description:
      "Search across thousands of founders and investors filtered by thesis, ticket size, industry, and stage. Find the right fit, not just any fit.",
  },
  {
    icon: Zap,
    title: "Fit-ranked matching",
    description:
      "Our matching engine ranks opportunities by real fundraising signals — so you spend time on conversations that actually move.",
  },
  {
    icon: MessageSquare,
    title: "Direct messaging",
    description:
      "Reach out to founders or investors the moment a match lands. No cold emails, no middlemen. Warm intros built into the product.",
  },
  {
    icon: Shield,
    title: "Verified identities",
    description:
      "Profile verification adds trust to every interaction. Know exactly who you're talking to before you pick up the phone.",
  },
  {
    icon: TrendingUp,
    title: "Progress tracking",
    description:
      "Track where your raises and deals stand at every stage — from profile to match to message to term sheet.",
  },
];

const testimonials = [
  {
    quote:
      "We cut our investor shortlist time from weeks to three days. The match quality was genuinely surprising.",
    name: "Rohan Mehta",
    role: "Founder, NovaPay",
    avatar: "RM",
  },
  {
    quote:
      "As an early-stage investor, I see a lot of noise. BridgeCapita filters it down to deals that actually fit my thesis.",
    name: "Anika Sharma",
    role: "Partner, Inflection Capital",
    avatar: "AS",
  },
  {
    quote:
      "Set up our profile on a Tuesday, had three qualified conversations by Thursday. That's the product doing its job.",
    name: "Vikram Joshi",
    role: "Co-founder, ClearRoute",
    avatar: "VJ",
  },
];

const faqs = [
  {
    q: "Who is BridgeCapita built for?",
    a: "Startup founders actively raising capital and investors — angels, VCs, and family offices — who want a sharper deal discovery workflow.",
  },
  {
    q: "How does matching work?",
    a: "We compare structured profile data — industry, stage, ticket size, thesis language, and traction signals — to surface the highest-fit opportunities first.",
  },
  {
    q: "Is it free to get started?",
    a: "Yes. Creating a profile and browsing matches is free. You only need an account to unlock messaging and full match details.",
  },
  {
    q: "How is this different from LinkedIn?",
    a: "LinkedIn is a network. BridgeCapita is a workflow tool. We focus entirely on the fundraising process — structured profiles, ranked discovery, and warm introductions in one place.",
  },
];

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────
export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [targetWorkspace, setTargetWorkspace] = useState("/pitch-feed");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("fundflow_access_token") : null;
    if (token) {
      getMe()
        .then((user) => {
          setIsLoggedIn(true);
          const saved = localStorage.getItem("fundflow_active_workspace");
          if (user.role === "unassigned") {
            setTargetWorkspace("/choose-interface");
          } else if (saved === "investor" || (user.role === "investor" && !saved)) {
            setTargetWorkspace("/startup-discovery");
          } else {
            setTargetWorkspace("/pitch-feed");
          }
        })
        .catch(() => {
          setIsLoggedIn(false);
        });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white/10">
      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#0a0a0a] font-black text-sm tracking-tighter select-none">
              BC
            </div>
            <span className="text-[15px] font-semibold tracking-tight">BridgeCapita</span>
          </Link>

          {/* Nav links — desktop */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] text-white/50 font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Stories</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href={targetWorkspace}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-500 px-4 text-[13px] font-semibold text-black hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                Go to Workspace <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:block text-[13px] font-medium text-white/60 hover:text-white transition-colors px-3 py-1.5"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-4 text-[13px] font-semibold text-[#0a0a0a] hover:bg-white/90 transition-colors"
                >
                  Get started <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "max-h-64 border-t border-white/[0.06]" : "max-h-0"
          }`}
        >
          <nav className="flex flex-col gap-1 px-5 py-4">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-[14px] text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors">Features</a>
            <a href="#how" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-[14px] text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors">How it works</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-[14px] text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors">Stories</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-[14px] text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors">FAQ</a>
            <div className="mt-2 pt-3 border-t border-white/[0.06] flex gap-3">
              <Link href="/login" className="flex-1 text-center px-3 py-2.5 rounded-lg text-[14px] text-white/60 border border-white/10 hover:text-white transition-colors">Log in</Link>
              <Link href="/signup" className="flex-1 text-center px-3 py-2.5 rounded-lg text-[14px] font-semibold text-[#0a0a0a] bg-white hover:bg-white/90 transition-colors">Sign up</Link>
            </div>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        {/* Animated Three.js wave background */}
        <div className="absolute inset-0 z-0">
          <WaveBackground />
          {/* Fading dark overlay to guarantee readability of white text */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/30 via-transparent to-[#0a0a0a]" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-5 pt-24 pb-28 lg:px-8 lg:pt-32 lg:pb-36 text-center">
          <ScrollReveal>
            {/* Eyebrow pill */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[12px] font-medium text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Now live — connecting founders and investors
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-[-0.03em] leading-[1.05] sm:text-6xl lg:text-[72px]">
              The fundraising platform
              <br />
              <span className="text-white/40">built for both sides</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="mx-auto mt-7 max-w-xl text-[17px] leading-relaxed text-white/50">
              BridgeCapita connects founders and investors through structured profiles, ranked discovery, and direct messaging — in one focused workspace.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              {isLoggedIn ? (
                <>
                  <Link
                    href={targetWorkspace}
                    className="group inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-500 px-7 text-[15px] font-semibold text-black hover:bg-emerald-400 transition-all hover:shadow-[0_0_32px_rgba(16,185,129,0.3)]"
                  >
                    Go to Workspace <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    href="/matching"
                    className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-7 text-[15px] font-medium text-white/70 hover:bg-white/[0.08] hover:text-white transition-all"
                  >
                    View Matches
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="group inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 text-[15px] font-semibold text-[#0a0a0a] hover:bg-white/90 transition-all hover:shadow-[0_0_32px_rgba(255,255,255,0.15)]"
                  >
                    Create free account <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-7 text-[15px] font-medium text-white/70 hover:bg-white/[0.08] hover:text-white transition-all"
                  >
                    Sign in to your workspace
                  </Link>
                </>
              )}
            </div>
          </ScrollReveal>

          {/* Animated Stats bar */}
          <ScrollReveal delay={400}>
            <div className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-px sm:grid-cols-4 rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.04]">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col items-center justify-center py-6 px-4">
                  <span className="text-2xl font-bold tracking-tight">
                    {s.prefix}<AnimatedCounter value={s.numericValue} />{s.suffix}
                  </span>
                  <span className="mt-1 text-[12px] text-white/40 font-medium">{s.label}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="border-b border-white/[0.06] py-28 px-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="mb-16 max-w-xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-4">Platform</p>
              <h2 className="text-4xl font-bold tracking-tight leading-[1.1]">
                Everything in one place.
                <br />
                <span className="text-white/30">Nothing that doesn&apos;t belong.</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3 rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.04]">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <ScrollReveal key={f.title} delay={i * 80}>
                  <div className="group p-8 hover:bg-white/[0.03] transition-colors duration-300 h-full">
                    <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/60 group-hover:border-white/20 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-[15px] font-semibold text-white">{f.title}</h3>
                    <p className="text-[13px] leading-relaxed text-white/40">{f.description}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="border-b border-white/[0.06] py-28 px-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="mb-16 max-w-xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-4">Process</p>
              <h2 className="text-4xl font-bold tracking-tight leading-tight">
                From profile to meeting
                <br />
                <span className="text-white/30">in three steps.</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Build your profile",
                desc: "Founders fill in company, financials, traction, and pitch. Investors set their thesis, sectors, and ticket range. Structured inputs — not free-text essays.",
                checks: ["Company overview & stage", "Financial snapshot & runway", "Investment thesis or pitch deck"],
              },
              {
                step: "02",
                title: "Get matched",
                desc: "Our engine compares your profile against every counterpart and surfaces the highest-fit opportunities. Updated in real time as new profiles join.",
                checks: ["Industry & thesis alignment", "Ticket size compatibility", "Traction and signal match"],
              },
              {
                step: "03",
                title: "Start the conversation",
                desc: "Message directly from a match card. No cold outreach, no gatekeepers. Both sides see each other's full profiles before replying.",
                checks: ["In-product direct messaging", "Full profile access before reply", "Verified identity on both sides"],
              },
            ].map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 120}>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-colors group h-full">
                  <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] border border-white/10 text-[11px] font-bold tracking-[0.2em] text-white/40 group-hover:bg-white/[0.08] group-hover:text-white/60 transition-all">
                    {item.step}
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{item.title}</h3>
                  <p className="mb-6 text-[13px] leading-relaxed text-white/40">{item.desc}</p>
                  <ul className="space-y-2.5">
                    {item.checks.map((c) => (
                      <li key={c} className="flex items-center gap-2.5 text-[13px] text-white/50">
                        <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="border-b border-white/[0.06] py-28 px-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="mb-16 max-w-xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-4">Stories</p>
              <h2 className="text-4xl font-bold tracking-tight">
                Used by people
                <br />
                <span className="text-white/30">doing real deals.</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid gap-5 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 100}>
                <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-colors h-full">
                  <p className="text-[15px] leading-relaxed text-white/70 font-medium">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-8 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-white/[0.12] to-white/[0.04] text-[11px] font-bold text-white/60">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold">{t.name}</p>
                      <p className="text-[12px] text-white/40">{t.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="border-b border-white/[0.06] py-28 px-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="mb-16 max-w-xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-4">FAQ</p>
              <h2 className="text-4xl font-bold tracking-tight">
                Common questions,
                <br />
                <span className="text-white/30">straight answers.</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid gap-4 md:grid-cols-2 max-w-5xl">
            {faqs.map((faq, i) => (
              <ScrollReveal key={faq.q} delay={i * 80}>
                <FAQItem q={faq.q} a={faq.a} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-28 px-5 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-5xl font-bold tracking-[-0.03em] leading-[1.05] sm:text-6xl">
              Ready to raise
              <br />
              with clarity?
            </h2>
            <p className="mx-auto mt-6 max-w-md text-[16px] text-white/40 leading-relaxed">
              Join founders and investors who&apos;ve replaced messy spreadsheets and cold outreach with a focused, structured workspace.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="group inline-flex h-12 items-center gap-2 rounded-xl bg-white px-8 text-[15px] font-semibold text-[#0a0a0a] hover:bg-white/90 transition-all hover:shadow-[0_0_32px_rgba(255,255,255,0.15)]"
              >
                Create your account <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center rounded-xl border border-white/10 px-8 text-[15px] font-medium text-white/50 hover:text-white hover:border-white/20 transition-all"
              >
                Already have an account?
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] px-5 py-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-[#0a0a0a] font-black text-xs">
              BC
            </div>
            <span className="text-[13px] font-medium text-white/40">BridgeCapita</span>
          </div>
          <p className="text-[12px] text-white/25">
            © {new Date().getFullYear()} BridgeCapita. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[12px] text-white/30">
            <a href="#features" className="hover:text-white/60 transition-colors">Features</a>
            <a href="#faq" className="hover:text-white/60 transition-colors">FAQ</a>
            <Link href="/login" className="hover:text-white/60 transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
