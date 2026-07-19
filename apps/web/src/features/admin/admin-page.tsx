"use client";

import { useEffect, useState } from "react";
import {
  Users,
  ShieldCheck,
  Settings,
  Megaphone,
  UserCheck,
  Check,
  X,
  Plus,
  Trash2,
  Lock,
  Unlock,
  AlertCircle,
  FileText,
  Building2,
  DollarSign,
  Calendar,
  Search,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Activity,
  Award,
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  listAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  listAdminVerifications,
  approveAdminVerification,
  rejectAdminVerification,
  listAdminAnnouncements,
  createAdminAnnouncement,
  deleteAdminAnnouncement,
  getAdminSettings,
  updateAdminSettings,
  listAdminPitches,
  deleteAdminPitch,
  type AdminVerificationRequest,
  type AdminAnnouncement,
  type AdminMatchSettings,
  type AdminPitch,
} from "@/lib/api/admin";
import type { AuthUser } from "@/lib/api/auth";

type ActiveTab = "dashboard" | "users" | "verifications" | "posts" | "announcements" | "settings";


/* ── confirmation dialog ─────────────────────────────────────────── */
function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-white/15 bg-[#111] p-6 shadow-2xl">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
        <h3 className="mb-1 font-semibold">Confirm Action</h3>
        <p className="mb-6 text-sm text-muted-foreground">{message}</p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-red-600 text-white hover:bg-red-700"
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── main component ──────────────────────────────────────────────── */
export function AdminPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");

  // Data states
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [verifications, setVerifications] = useState<AdminVerificationRequest[]>([]);
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [pitches, setPitches] = useState<AdminPitch[]>([]);
  const [settings, setSettings] = useState<AdminMatchSettings>({
    industry_weight: 0.4,
    ticket_weight: 0.4,
    model_weight: 0.2,
  });

  // UI states
  const [userSearch, setUserSearch] = useState("");
  const [pitchSearch, setPitchSearch] = useState("");
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editActive, setEditActive] = useState(true);

  // Rejection reason inline UI
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Confirm dialog
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null);

  // Feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load tab data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError("");
      setSuccess("");
      try {
        if (activeTab === "dashboard") {
          const [uRes, vRes, pRes] = await Promise.all([
            listAdminUsers(),
            listAdminVerifications(),
            listAdminPitches(),
          ]);
          setUsers(uRes.items);
          setVerifications(vRes);
          setPitches(pRes);
        } else if (activeTab === "users") {
          const response = await listAdminUsers();
          setUsers(response.items);
        } else if (activeTab === "verifications") {
          const data = await listAdminVerifications();
          setVerifications(data);
        } else if (activeTab === "announcements") {
          const data = await listAdminAnnouncements();
          setAnnouncements(data);
        } else if (activeTab === "settings") {
          const data = await getAdminSettings();
          setSettings(data);
        } else if (activeTab === "posts") {
          const data = await listAdminPitches();
          setPitches(data);
        }
      } catch (caughtError) {
        setError(getApiErrorMessage(caughtError, "Failed to load admin data."));
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [activeTab]);

  /* ── handlers ─────────────────────────────────────────────────── */
  const handleUpdateUser = async (userId: string) => {
    try {
      setError("");
      setSuccess("");
      await updateAdminUser(userId, { role: editRole, is_active: editActive });
      setUsers(
        users.map((u) =>
          u.id === userId
            ? { ...u, role: editRole as AuthUser["role"], is_active: editActive }
            : u
        )
      );
      setEditingUserId(null);
      setSuccess("User updated successfully.");
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Failed to update user."));
    }
  };

  const handleDeleteUser = (user: AuthUser) => {
    setConfirm({
      message: `Permanently delete "${user.full_name || user.email}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          setError("");
          await deleteAdminUser(user.id);
          setUsers(users.filter((u) => u.id !== user.id));
          setSuccess("User account deleted.");
        } catch (caughtError) {
          setError(getApiErrorMessage(caughtError, "Failed to delete user."));
        }
      },
    });
  };

  const handleApproveVerification = async (verificationId: string) => {
    try {
      setError("");
      setSuccess("");
      await approveAdminVerification(verificationId);
      setVerifications(
        verifications.map((v) =>
          v.id === verificationId
            ? { ...v, verification_badges: [...v.verification_badges, "Verified Profile"] }
            : v
        )
      );
      setSuccess("Profile verified successfully.");
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Failed to approve verification."));
    }
  };

  const handleRejectVerification = async (verificationId: string, reason: string) => {
    try {
      setError("");
      setSuccess("");
      await rejectAdminVerification(
        verificationId,
        reason.trim() || "Verification request rejected by admin."
      );
      setVerifications(verifications.filter((v) => v.id !== verificationId));
      setRejectingId(null);
      setRejectionReason("");
      setSuccess("Verification rejected.");
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Failed to reject verification."));
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;
    try {
      setError("");
      setSuccess("");
      const ann = await createAdminAnnouncement(newAnnouncement);
      setAnnouncements([ann, ...announcements]);
      setNewAnnouncement("");
      setSuccess("Announcement published to all users.");
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Failed to create announcement."));
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      setError("");
      setSuccess("");
      await deleteAdminAnnouncement(id);
      setAnnouncements(announcements.filter((a) => a.id !== id));
      setSuccess("Announcement removed.");
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Failed to delete announcement."));
    }
  };

  const handleDeletePitch = (pitch: AdminPitch) => {
    setConfirm({
      message: `Remove pitch "${pitch.startup_name}" by ${pitch.founder_email}? This will delete the startup profile permanently.`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          setError("");
          await deleteAdminPitch(pitch.id);
          setPitches(pitches.filter((p) => p.id !== pitch.id));
          setSuccess("Pitch removed.");
        } catch (caughtError) {
          setError(getApiErrorMessage(caughtError, "Failed to delete pitch."));
        }
      },
    });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");
      const updated = await updateAdminSettings(settings);
      setSettings(updated);
      setSuccess("Matchmaking weights updated successfully.");
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Failed to update settings."));
    }
  };

  /* ── derived ─────────────────────────────────────────────────── */
  const filteredUsers = userSearch
    ? users.filter(
        (u) =>
          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
          (u.full_name ?? "").toLowerCase().includes(userSearch.toLowerCase())
      )
    : users;

  const filteredPitches = pitchSearch
    ? pitches.filter(
        (p) =>
          p.startup_name.toLowerCase().includes(pitchSearch.toLowerCase()) ||
          p.founder_email.toLowerCase().includes(pitchSearch.toLowerCase())
      )
    : pitches;

  /* ── tab config ─────────────────────────────────────────────── */
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "users", label: "Users", icon: <Users className="h-4 w-4" />, count: users.length },
    { id: "verifications", label: "Verifications", icon: <UserCheck className="h-4 w-4" />, count: verifications.filter((v) => !v.verification_badges.includes("Verified Profile")).length },
    { id: "posts", label: "Posts", icon: <FileText className="h-4 w-4" />, count: pitches.length },
    { id: "announcements", label: "Announcements", icon: <Megaphone className="h-4 w-4" /> },
    { id: "settings", label: "Match Settings", icon: <Settings className="h-4 w-4" /> },
  ];

  /* ── render ─────────────────────────────────────────────────── */
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-80 bg-[linear-gradient(180deg,rgba(45,212,191,0.10),transparent_72%)]" />

      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <section className="relative mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin Workspace
          </div>
          <h1 className="text-4xl font-semibold tracking-normal">Platform Control Center</h1>
          <p className="text-sm text-muted-foreground">
            Manage users, review verifications, moderate content, broadcast announcements, and tune matchmaking.
          </p>
        </div>

        {/* Feedback banners */}
        {error ? (
          <Alert>
            <AlertCircle className="mr-2 inline h-4 w-4" />
            {error}
          </Alert>
        ) : null}
        {success ? (
          <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
            {success}
          </div>
        ) : null}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : (
          <div className="space-y-6">

            {/* ── DASHBOARD TAB ────────────────────────────────────── */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Metric Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-white/10 bg-white/[0.01]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{users.length}</div>
                      <p className="text-xs text-muted-foreground">
                        {users.filter(u => u.is_active).length} active accounts
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-white/10 bg-white/[0.01]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Startups (Founders)</CardTitle>
                      <Building2 className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {users.filter(u => u.role === "founder").length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {pitches.length} startup pitch profiles
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-white/10 bg-white/[0.01]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Investors</CardTitle>
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {users.filter(u => u.role === "investor").length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {users.filter(u => u.role === "investor" && u.is_active).length} active allocators
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-white/10 bg-white/[0.01]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Pending Verifications</CardTitle>
                      <Award className="h-4 w-4 text-amber-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {verifications.filter(v => !v.verification_badges.includes("Verified Profile")).length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Requires admin review
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Visualizations grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* User Distribution Chart */}
                  <Card className="border-white/10 bg-white/[0.01]">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">User Role Distribution</CardTitle>
                      <CardDescription>Breakdown of platform participants</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(() => {
                        const total = users.length || 1;
                        const founders = users.filter(u => u.role === "founder").length;
                        const investors = users.filter(u => u.role === "investor").length;
                        const admins = users.filter(u => u.role === "admin").length;
                        const unassigned = users.filter(u => u.role === "unassigned").length;

                        const fPct = Math.round((founders / total) * 100);
                        const iPct = Math.round((investors / total) * 100);
                        const aPct = Math.round((admins / total) * 100);
                        const uPct = Math.round((unassigned / total) * 100);

                        return (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5"><Building2 className="h-3 w-3 text-emerald-400" /> Founders ({founders})</span>
                                <span className="font-semibold text-white">{fPct}%</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${fPct}%` }} />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5"><TrendingUp className="h-3 w-3 text-blue-400" /> Investors ({investors})</span>
                                <span className="font-semibold text-white">{iPct}%</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${iPct}%` }} />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-amber-400" /> Admins ({admins})</span>
                                <span className="font-semibold text-white">{aPct}%</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${aPct}%` }} />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5"><Activity className="h-3 w-3 text-purple-400" /> Unassigned ({unassigned})</span>
                                <span className="font-semibold text-white">{uPct}%</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${uPct}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  {/* Industry Matchmaking Sector Breakdown */}
                  <Card className="border-white/10 bg-white/[0.01]">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Startup Sector Breakdown</CardTitle>
                      <CardDescription>Industries represented in current pitches</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(() => {
                        const sectors: Record<string, number> = {};
                        pitches.forEach((p) => {
                          const sec = p.industry || "Other";
                          sectors[sec] = (sectors[sec] || 0) + 1;
                        });

                        const sorted = Object.entries(sectors).sort((a, b) => b[1] - a[1]);
                        const maxCount = sorted[0]?.[1] || 1;

                        if (sorted.length === 0) {
                          return <div className="text-center text-xs text-muted-foreground py-8">No pitches registered yet.</div>;
                        }

                        return sorted.slice(0, 4).map(([sec, count]) => {
                          const widthPct = Math.round((count / maxCount) * 100);
                          return (
                            <div key={sec} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-white">{sec}</span>
                                <span className="text-muted-foreground">{count} {count === 1 ? 'pitch' : 'pitches'}</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${widthPct}%` }} />
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </CardContent>
                  </Card>
                </div>

                {/* Recents list */}
                <Card className="border-white/10 bg-white/[0.01]">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Recent Activity Log</CardTitle>
                    <CardDescription>Latest pitch entries and verification queues</CardDescription>
                  </CardHeader>
                  <CardContent className="divide-y divide-white/5">
                    {pitches.slice(0, 4).map((p) => (
                      <div key={p.id} className="flex items-center justify-between py-3 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Building2 className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="font-medium text-white">{p.startup_name}</span>
                            <span className="text-muted-foreground block text-[10px]">Registered in {p.industry}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-emerald-400/80 border-emerald-500/20">
                          ₹{Number(p.funding_required).toLocaleString('en-IN')} Raise
                        </Badge>
                      </div>
                    ))}
                    {verifications.slice(0, 2).map((v) => (
                      <div key={v.id} className="flex items-center justify-between py-3 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Award className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="font-medium text-white">{v.full_name || v.email}</span>
                            <span className="text-muted-foreground block text-[10px]">Requested profile verification</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-amber-400/80 border-amber-500/20">
                          Pending Review
                        </Badge>
                      </div>
                    ))}
                    {pitches.length === 0 && verifications.length === 0 && (
                      <div className="text-center text-xs text-muted-foreground py-8">No activity logged.</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── USERS TAB ───────────────────────────────────────── */}
            {activeTab === "users" && (
              <Card className="border-white/15">
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>User Directory</CardTitle>
                    <CardDescription>Edit roles, suspend accounts, or permanently delete users.</CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      className="pl-9"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredUsers.length === 0 && (
                    <div className="py-8 text-center text-sm text-muted-foreground">No users found.</div>
                  )}
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{user.full_name || "No name registered"}</p>
                          <Badge variant={user.is_active ? "default" : "secondary"}>
                            {user.is_active ? "Active" : "Suspended"}
                          </Badge>
                          {user.role === "admin" && (
                            <Badge className="border-amber-500/40 bg-amber-500/10 text-amber-400">
                              Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>

                      {editingUserId === user.id ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                          >
                            <option value="founder">Founder</option>
                            <option value="investor">Investor</option>
                            <option value="admin">Admin</option>
                          </select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditActive(!editActive)}
                            className="flex items-center gap-1.5"
                          >
                            {editActive ? (
                              <Lock className="h-3.5 w-3.5" />
                            ) : (
                              <Unlock className="h-3.5 w-3.5" />
                            )}
                            {editActive ? "Suspend" : "Activate"}
                          </Button>
                          <Button size="sm" onClick={() => handleUpdateUser(user.id)}>
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUserId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="uppercase tracking-wider">
                            {user.role}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingUserId(user.id);
                              setEditRole(user.role);
                              setEditActive(user.is_active);
                            }}
                          >
                            Edit Access
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                            title="Delete user"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* ── VERIFICATIONS TAB ───────────────────────────────── */}
            {activeTab === "verifications" && (
              <Card className="border-white/15">
                <CardHeader>
                  <CardTitle>Profile Verification Queue</CardTitle>
                  <CardDescription>
                    Review credentials submitted by startups and investors for trust badges.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {verifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No verification requests pending.
                    </div>
                  ) : (
                    verifications.map((req) => (
                      <div
                        key={req.id}
                        className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5"
                      >
                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {req.full_name || "Registration Info"}
                            </h3>
                            <p className="text-sm text-muted-foreground">{req.email}</p>
                          </div>
                          <div className="flex gap-2">
                            {req.verification_badges.includes("Verified Profile") ? (
                              <Badge className="bg-primary/20 text-primary border-primary/30">
                                Verified
                              </Badge>
                            ) : (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleApproveVerification(req.id)}
                                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                  <Check className="mr-1 h-3.5 w-3.5" /> Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setRejectingId(rejectingId === req.id ? null : req.id);
                                    setRejectionReason("");
                                  }}
                                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                >
                                  <X className="mr-1 h-3.5 w-3.5" /> Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Inline rejection reason panel */}
                        {rejectingId === req.id && (
                          <div className="flex flex-col gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                            <p className="text-xs font-medium text-red-400">
                              Reason for rejection <span className="text-white/30">(optional)</span>
                            </p>
                            <textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="e.g. Incomplete profile, missing LinkedIn URL…"
                              rows={2}
                              className="w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20 transition-all"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleRejectVerification(req.id, rejectionReason)}
                                className="bg-red-600 text-white hover:bg-red-700"
                              >
                                Confirm Rejection
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => { setRejectingId(null); setRejectionReason(""); }}
                                className="text-white/50 hover:text-white"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="grid gap-3 rounded-lg border border-white/5 bg-black/10 p-3 text-sm sm:grid-cols-3">
                          <div>
                            <p className="mb-0.5 text-xs font-semibold uppercase text-muted-foreground">
                              LinkedIn URL
                            </p>
                            {req.linkedin_url ? (
                              <a
                                href={req.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block truncate text-primary hover:underline"
                              >
                                {req.linkedin_url}
                              </a>
                            ) : (
                              <span className="italic text-muted-foreground/60">Not submitted</span>
                            )}
                          </div>
                          <div>
                            <p className="mb-0.5 text-xs font-semibold uppercase text-muted-foreground">
                              Website URL
                            </p>
                            {req.website_url ? (
                              <a
                                href={req.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block truncate text-primary hover:underline"
                              >
                                {req.website_url}
                              </a>
                            ) : (
                              <span className="italic text-muted-foreground/60">Not submitted</span>
                            )}
                          </div>
                          <div>
                            <p className="mb-0.5 text-xs font-semibold uppercase text-muted-foreground">
                              Company Reg. ID
                            </p>
                            {req.company_registration ? (
                              <span className="block truncate font-mono">
                                {req.company_registration}
                              </span>
                            ) : (
                              <span className="italic text-muted-foreground/60">Not submitted</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            {/* ── POSTS TAB ───────────────────────────────────────── */}
            {activeTab === "posts" && (
              <Card className="border-white/15">
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>Startup Posts / Pitches</CardTitle>
                    <CardDescription>
                      Review all pitch posts on the platform. Remove any that violate guidelines.
                    </CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search pitches..."
                      className="pl-9"
                      value={pitchSearch}
                      onChange={(e) => setPitchSearch(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredPitches.length === 0 && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No pitches found.
                    </div>
                  )}
                  {filteredPitches.map((pitch) => (
                    <div
                      key={pitch.id}
                      className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04] sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          <p className="font-semibold">{pitch.startup_name}</p>
                          <Badge variant="outline" className="uppercase text-xs tracking-wider">
                            {pitch.stage}
                          </Badge>
                          <Badge variant="secondary">{pitch.industry}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            ₹{Number(pitch.funding_required).toLocaleString("en-IN")} required
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(pitch.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Posted by{" "}
                          <span className="font-medium text-foreground/70">
                            {pitch.founder_name || pitch.founder_email}
                          </span>{" "}
                          · {pitch.founder_email}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1.5 self-start text-red-500 hover:bg-red-500/10 hover:text-red-400"
                        onClick={() => handleDeletePitch(pitch)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* ── ANNOUNCEMENTS TAB ───────────────────────────────── */}
            {activeTab === "announcements" && (
              <div className="grid gap-6 md:grid-cols-[1.2fr_1.8fr]">
                <Card className="h-fit border-white/15">
                  <CardHeader>
                    <CardTitle>Create Broadcast</CardTitle>
                    <CardDescription>
                      Post news seen by all users on their workspaces.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="announcementText">Announcement message</Label>
                        <Input
                          id="announcementText"
                          placeholder="e.g. Scheduled maintenance at 12:00 AM UTC..."
                          value={newAnnouncement}
                          onChange={(e) => setNewAnnouncement(e.target.value)}
                          required
                        />
                      </div>
                      <Button
                        className="flex w-full items-center justify-center gap-1.5"
                        type="submit"
                      >
                        <Plus className="h-4 w-4" />
                        Broadcast to All Users
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-white/15">
                  <CardHeader>
                    <CardTitle>Broadcast History</CardTitle>
                    <CardDescription>Active platform-wide system announcements.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {announcements.length === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        No active announcements.
                      </div>
                    ) : (
                      announcements.map((ann) => (
                        <div
                          key={ann.id}
                          className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.01] p-4"
                        >
                          <div className="space-y-1">
                            <p className="text-sm">{ann.content}</p>
                            <p className="text-xs text-muted-foreground">
                              Posted on {new Date(ann.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 shrink-0 p-0 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── SETTINGS TAB ────────────────────────────────────── */}
            {activeTab === "settings" && (
              <Card className="border-white/15">
                <CardHeader>
                  <CardTitle>Startup-Investor Matchmaking System</CardTitle>
                  <CardDescription>
                    Adjust parameters used by the engine to prioritize match suggestions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div className="space-y-4">
                      {[
                        { id: "industry_weight", label: "Industry Overlap (Sector Fit)", key: "industry_weight" as const },
                        { id: "ticket_weight", label: "Ticket Size & Funding Target Alignment", key: "ticket_weight" as const },
                        { id: "model_weight", label: "Thesis Keywords Overlap", key: "model_weight" as const },
                      ].map(({ id, label, key }) => (
                        <div key={id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <Label htmlFor={id}>{label}</Label>
                            <span className="font-medium text-primary">
                              {(settings[key] * 100).toFixed(0)}%
                            </span>
                          </div>
                          <input
                            id={id}
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            className="h-2 w-full cursor-pointer rounded-lg bg-white/10 accent-primary"
                            value={settings[key]}
                            onChange={(e) =>
                              setSettings({ ...settings, [key]: Number(e.target.value) })
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                      <p className="text-xs text-muted-foreground">
                        Total:{" "}
                        {(
                          (settings.industry_weight +
                            settings.ticket_weight +
                            settings.model_weight) *
                          100
                        ).toFixed(0)}
                        % (normalized to 100% during calculation)
                      </p>
                      <Button type="submit">Save Match Settings</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
