"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Compass, 
  Sparkles, 
  MessageSquare, 
  User, 
  ShieldAlert, 
  LogOut, 
  RefreshCw
} from "lucide-react";

import { getMe, logout, updateMyPreferences, type AuthUser } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";

import { CommandPalette } from "@/components/command-palette";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [workspace, setWorkspace] = useState<"founder" | "investor">("founder");


  useEffect(() => {
    async function initAuth() {
      try {
        const currentUser = await getMe();
        setUser(currentUser);
        setAuthenticated(true);
        
        const savedWorkspace = localStorage.getItem("fundflow_active_workspace");
        // Server value takes priority; fall back to localStorage then role default
        const serverWS = currentUser.active_workspace;
        if (serverWS === "founder" || serverWS === "investor") {
          setWorkspace(serverWS);
          localStorage.setItem("fundflow_active_workspace", serverWS);
        } else if (savedWorkspace === "founder" || savedWorkspace === "investor") {
          setWorkspace(savedWorkspace);
        } else {
          const defaultWS = currentUser.role === "investor" ? "investor" : "founder";
          setWorkspace(defaultWS);
          localStorage.setItem("fundflow_active_workspace", defaultWS);
        }
      } catch (err) {
        router.replace("/login");
        return; 
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, [router]);

  const handleWorkspaceToggle = () => {
    const nextWS = workspace === "founder" ? "investor" : "founder";
    setWorkspace(nextWS);
    localStorage.setItem("fundflow_active_workspace", nextWS);
    // Persist to DB in background — silent fail if endpoint not yet deployed
    updateMyPreferences({ active_workspace: nextWS }).catch(() => {});
    
    if (nextWS === "founder") {
      router.push("/pitch-feed");
    } else {
      router.push("/startup-discovery");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading || !authenticated) {
    return (
      <div className="flex min-h-screen bg-[#0a0a0a]">
        {/* Sidebar skeleton */}
        <aside className="hidden w-64 shrink-0 border-r border-white/[0.06] px-4 py-8 md:flex md:flex-col justify-between">
          <div className="space-y-8">
            <div className="h-8 w-28 rounded-lg bg-white/[0.06] animate-pulse mx-3" />
            <div className="space-y-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-11 rounded-xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          </div>
          <div className="space-y-3 border-t border-white/[0.06] pt-4">
            <div className="h-11 rounded-xl bg-white/[0.03] animate-pulse" />
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-white/[0.06] animate-pulse shrink-0" />
              <div className="space-y-1 flex-1">
                <div className="h-3 w-24 rounded bg-white/[0.06] animate-pulse" />
                <div className="h-2.5 w-16 rounded bg-white/[0.03] animate-pulse" />
              </div>
            </div>
          </div>
        </aside>

        {/* Main content skeleton */}
        <main className="flex-1 md:pl-0 pb-20 md:pb-0">
          <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 space-y-6">
            {/* Header */}
            <div className="border-b border-white/[0.08] pb-6 space-y-4">
              <div className="space-y-2">
                <div className="h-3 w-28 rounded bg-emerald-500/20 animate-pulse" />
                <div className="h-8 w-40 rounded-xl bg-white/[0.07] animate-pulse" />
              </div>
              <div className="flex gap-3">
                <div className="h-10 flex-1 rounded-xl bg-white/[0.04] animate-pulse" />
                <div className="h-10 w-36 rounded-xl bg-white/[0.04] animate-pulse" />
                <div className="h-10 w-20 rounded-xl bg-emerald-500/10 animate-pulse" />
              </div>
            </div>

            {/* 3 pitch card skeletons */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-white/[0.08] bg-[#0d0d0d] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-white/[0.07] animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-28 rounded-md bg-white/[0.07] animate-pulse" />
                      <div className="h-2.5 w-20 rounded-md bg-white/[0.04] animate-pulse" />
                    </div>
                  </div>
                  <div className="h-5 w-14 rounded-full bg-emerald-500/10 animate-pulse" />
                </div>
                <div className="aspect-video w-full bg-neutral-900" />
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex gap-4">
                    <div className="h-5 w-5 rounded bg-white/[0.06] animate-pulse" />
                    <div className="h-5 w-5 rounded bg-white/[0.06] animate-pulse" />
                  </div>
                  <div className="h-5 w-5 rounded bg-white/[0.06] animate-pulse" />
                </div>
                <div className="px-4 pb-5 space-y-3">
                  <div className="h-3.5 w-full rounded bg-white/[0.05] animate-pulse" />
                  <div className="h-3.5 w-4/5 rounded bg-white/[0.04] animate-pulse" />
                  <div className="border-t border-white/[0.06] pt-4 grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 space-y-2">
                        <div className="h-2.5 w-16 rounded bg-white/[0.05] animate-pulse" />
                        <div className="h-3.5 w-20 rounded bg-white/[0.07] animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Mobile nav skeleton */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-white/[0.06] bg-[#0a0a0a]/90 flex items-center justify-around px-2 md:hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="h-4 w-4 rounded bg-white/[0.06] animate-pulse" />
              <div className="h-2 w-8 rounded bg-white/[0.04] animate-pulse" />
            </div>
          ))}
        </nav>
      </div>
    );
  }

  const explorePath = workspace === "founder" ? "/investor-discovery" : "/startup-discovery";
  const profilePath = workspace === "founder" ? "/startup-profile" : "/investor-profile";

  const menuItems = [
    { label: "Home", href: "/pitch-feed", icon: Home },
    { label: "Explore", href: explorePath, icon: Compass },
    { label: "Matches", href: "/matching", icon: Sparkles },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Profile", href: profilePath, icon: User },
  ];

  if (user?.role === "admin") {
    menuItems.push({ label: "Admin", href: "/admin", icon: ShieldAlert });
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white selection:bg-white/10 font-sans">
      {/* ── BACKGROUND PULSE ANIMATION ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Soft emerald ambient glows */}
        <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-3xl animate-[pulse_10s_ease-in-out_infinite]" />
      </div>

      {/* Sidebar Navigation (Desktop) */}
      <aside className="fixed bottom-0 top-0 left-0 z-40 hidden w-64 border-r border-white/[0.06] bg-[#0a0a0a]/90 backdrop-blur-xl px-4 py-8 md:flex md:flex-col justify-between">
        <div className="space-y-8">
          {/* Logo */}
          <Link href="/pitch-feed" className="flex items-center gap-2.5 px-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#0a0a0a] font-black text-sm tracking-tighter">
              CF
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-white">CoFo</span>
          </Link>

          {/* Nav Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 rounded-xl px-4 py-3 text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/[0.08] text-white font-semibold"
                      : "text-white/50 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400 scale-110" : ""}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          {/* Activity Feed Widget */}
          <div className="pt-4 border-t border-white/[0.06] space-y-3 px-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80 block">Activity Feed</span>
            <div className="space-y-2.5 max-h-[160px] overflow-y-auto no-scrollbar">
              {[
                { label: "Investor viewed your startup profile", time: "2m ago" },
                { label: "New investor match found", time: "1h ago" },
                { label: "Traction credentials verified", time: "1d ago" },
              ].map((activity, i) => (
                <div key={i} className="text-[11px] leading-snug space-y-0.5">
                  <p className="text-white/70 font-medium">{activity.label}</p>
                  <span className="text-[9px] text-white/30 block">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions & User Profile */}
        <div className="space-y-4">
          {/* Workspace Toggle button */}
          <button
            onClick={handleWorkspaceToggle}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] px-4 py-3 text-[12px] font-semibold text-white/80 transition-all duration-200"
          >
            <RefreshCw className="h-3.5 w-3.5 text-emerald-400 animate-spin" style={{ animationDuration: "10s" }} />
            <span className="truncate">
              Switch to {workspace === "founder" ? "Investor" : "Founder"}
            </span>
          </button>

          {/* User Account / Logout */}
          <div className="border-t border-white/[0.06] pt-4">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-3">
                {/* Reads avatar/logo stored by AvatarUploader */}
                <SidebarAvatar user={user} workspace={workspace} />
                <div className="max-w-[120px]">
                  <p className="truncate text-xs font-semibold text-white">
                    {user?.full_name || "User"}
                  </p>
                  <p className="truncate text-[10px] text-white/40 capitalize">
                    {workspace} Mode
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                className="text-white/40 hover:text-red-400 transition-colors p-1"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 md:pl-64 pb-20 md:pb-0">
        <div className={`mx-auto px-4 py-6 md:px-8 transition-all duration-300 ${
          pathname.includes("pitch-feed") || pathname.includes("startup-discovery")
            ? "max-w-6xl"
            : "max-w-4xl"
        }`}>
          {children}
        </div>
      </main>

      {/* Bottom Navigation Bar (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 border-t border-white/[0.06] bg-[#0a0a0a]/90 backdrop-blur-xl md:hidden items-center justify-around px-2">
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-2 text-[10px] transition-all duration-200 ${
                isActive ? "text-emerald-400 font-semibold" : "text-white/50 hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 mb-1 ${isActive ? "scale-110 text-emerald-400" : ""}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleWorkspaceToggle}
          className="flex flex-col items-center justify-center flex-1 py-2 text-[10px] text-emerald-400"
        >
          <RefreshCw className="h-4 w-4 mb-1 text-emerald-400 animate-spin" style={{ animationDuration: "10s" }} />
          <span>Switch</span>
        </button>
      </nav>
      <CommandPalette />
    </div>
  );
}

function SidebarAvatar({
  user,
  workspace,
}: {
  user: { full_name: string | null } | null;
  workspace: "founder" | "investor";
}) {
  const storageKey = workspace === "investor"
    ? "fundflow_investor_avatar"
    : "fundflow_startup_logo";

  const stored = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const shapeClass = workspace === "investor" ? "rounded-full" : "rounded-lg";

  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden ${shapeClass} bg-emerald-500/10 border border-emerald-500/20 font-bold text-emerald-400 text-xs`}
    >
      {stored ? (
        <img src={stored} alt="avatar" className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
