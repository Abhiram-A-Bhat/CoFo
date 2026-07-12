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
  AlertCircle
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
  listAdminVerifications, 
  approveAdminVerification, 
  rejectAdminVerification, 
  listAdminAnnouncements, 
  createAdminAnnouncement, 
  deleteAdminAnnouncement, 
  getAdminSettings, 
  updateAdminSettings,
  type AdminVerificationRequest,
  type AdminAnnouncement,
  type AdminMatchSettings
} from "@/lib/api/admin";
import type { AuthUser } from "@/lib/api/auth";

type ActiveTab = "users" | "verifications" | "settings" | "announcements";

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("users");
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [verifications, setVerifications] = useState<AdminVerificationRequest[]>([]);
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [settings, setSettings] = useState<AdminMatchSettings>({
    industry_weight: 0.4,
    ticket_weight: 0.4,
    model_weight: 0.2
  });
  
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editActive, setEditActive] = useState(true);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load initial data for active tab
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError("");
      setSuccess("");
      try {
        if (activeTab === "users") {
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
        }
      } catch (caughtError) {
        setError(getApiErrorMessage(caughtError, "Failed to load admin data."));
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [activeTab]);

  const handleUpdateUser = async (userId: string) => {
    try {
      setError("");
      setSuccess("");
      await updateAdminUser(userId, { role: editRole, is_active: editActive });
      setUsers(users.map(u => u.id === userId ? { ...u, role: editRole as AuthUser["role"], is_active: editActive } : u));
      setEditingUserId(null);
      setSuccess("User updated successfully.");
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Failed to update user."));
    }
  };

  const handleApproveVerification = async (verificationId: string) => {
    try {
      setError("");
      setSuccess("");
      await approveAdminVerification(verificationId);
      setVerifications(verifications.map(v => v.id === verificationId ? { ...v, verification_badges: [...v.verification_badges, "Verified Profile"] } : v));
      setSuccess("Profile verified successfully.");
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Failed to approve verification."));
    }
  };

  const handleRejectVerification = async (verificationId: string) => {
    try {
      setError("");
      setSuccess("");
      await rejectAdminVerification(verificationId, "Incomplete profile details provided.");
      setVerifications(verifications.filter(v => v.id !== verificationId));
      setSuccess("Verification rejected and cleared.");
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
      setSuccess("Announcement published.");
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Failed to create announcement."));
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      setError("");
      setSuccess("");
      await deleteAdminAnnouncement(id);
      setAnnouncements(announcements.filter(a => a.id !== id));
      setSuccess("Announcement removed.");
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Failed to delete announcement."));
    }
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-80 bg-[linear-gradient(180deg,rgba(45,212,191,0.10),transparent_72%)]" />
      <section className="relative mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Workspace
            </div>
            <h1 className="text-4xl font-semibold tracking-normal">Platform Control Center</h1>
            <p className="text-sm text-muted-foreground">
              Manage platform settings, verifications, system announcements, and users.
            </p>
          </div>
        </div>

        {error ? <Alert><AlertCircle className="mr-2 h-4 w-4 inline" />{error}</Alert> : null}
        {success ? (
          <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
            {success}
          </div>
        ) : null}

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          <Button 
            variant={activeTab === "users" ? "default" : "outline"} 
            onClick={() => setActiveTab("users")}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Users
          </Button>
          <Button 
            variant={activeTab === "verifications" ? "default" : "outline"} 
            onClick={() => setActiveTab("verifications")}
            className="flex items-center gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Verifications Queue
          </Button>
          <Button 
            variant={activeTab === "settings" ? "default" : "outline"} 
            onClick={() => setActiveTab("settings")}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Match Settings
          </Button>
          <Button 
            variant={activeTab === "announcements" ? "default" : "outline"} 
            onClick={() => setActiveTab("announcements")}
            className="flex items-center gap-2"
          >
            <Megaphone className="h-4 w-4" />
            Announcements
          </Button>
        </div>

        {/* Tab content */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Users Tab */}
            {activeTab === "users" && (
              <Card className="border-white/15">
                <CardHeader>
                  <CardTitle>User Directory</CardTitle>
                  <CardDescription>Edit roles and suspend or activate accounts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {users.map((user) => (
                    <div 
                      key={user.id}
                      className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.full_name || "No name registered"}</p>
                          <Badge variant={user.is_active ? "default" : "secondary"}>
                            {user.is_active ? "Active" : "Suspended"}
                          </Badge>
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
                            {editActive ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                            {editActive ? "Suspend" : "Activate"}
                          </Button>
                          <Button size="sm" onClick={() => handleUpdateUser(user.id)}>Save</Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingUserId(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="uppercase tracking-wider">{user.role}</Badge>
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
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Verifications Tab */}
            {activeTab === "verifications" && (
              <Card className="border-white/15">
                <CardHeader>
                  <CardTitle>Profile Verification Queue</CardTitle>
                  <CardDescription>Review credentials submitted by startups and investors for trust badges.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {verifications.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
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
                            <h3 className="font-semibold text-lg">{req.full_name || "Registration Info"}</h3>
                            <p className="text-sm text-muted-foreground">{req.email}</p>
                          </div>
                          <div className="flex gap-2">
                            {req.verification_badges.includes("Verified Profile") ? (
                              <Badge className="bg-primary/20 text-primary border-primary/30">Verified</Badge>
                            ) : (
                              <>
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  onClick={() => handleApproveVerification(req.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  <Check className="mr-1 h-3.5 w-3.5" /> Approve
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleRejectVerification(req.id)}
                                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                >
                                  <X className="mr-1 h-3.5 w-3.5" /> Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 text-sm bg-black/10 p-3 rounded-lg border border-white/5">
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold uppercase">LinkedIn URL</p>
                            {req.linkedin_url ? (
                              <a href={req.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block">
                                {req.linkedin_url}
                              </a>
                            ) : (
                              <span className="text-muted-foreground/60 italic">Not submitted</span>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold uppercase">Website URL</p>
                            {req.website_url ? (
                              <a href={req.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block">
                                {req.website_url}
                              </a>
                            ) : (
                              <span className="text-muted-foreground/60 italic">Not submitted</span>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold uppercase">Company Reg. ID</p>
                            {req.company_registration ? (
                              <span className="font-mono block truncate">{req.company_registration}</span>
                            ) : (
                              <span className="text-muted-foreground/60 italic">Not submitted</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            {/* Match settings Tab */}
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
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <Label htmlFor="industry_weight">Industry Overlap (Sector Fit)</Label>
                          <span className="text-primary font-medium">{(settings.industry_weight * 100).toFixed(0)}%</span>
                        </div>
                        <input 
                          id="industry_weight"
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.05"
                          className="w-full accent-primary h-2 bg-white/10 rounded-lg cursor-pointer"
                          value={settings.industry_weight}
                          onChange={(e) => setSettings({ ...settings, industry_weight: Number(e.target.value) })}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <Label htmlFor="ticket_weight">Ticket Size & Funding Target Alignment</Label>
                          <span className="text-primary font-medium">{(settings.ticket_weight * 100).toFixed(0)}%</span>
                        </div>
                        <input 
                          id="ticket_weight"
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.05"
                          className="w-full accent-primary h-2 bg-white/10 rounded-lg cursor-pointer"
                          value={settings.ticket_weight}
                          onChange={(e) => setSettings({ ...settings, ticket_weight: Number(e.target.value) })}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <Label htmlFor="model_weight">Thesis Keywords overlap</Label>
                          <span className="text-primary font-medium">{(settings.model_weight * 100).toFixed(0)}%</span>
                        </div>
                        <input 
                          id="model_weight"
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.05"
                          className="w-full accent-primary h-2 bg-white/10 rounded-lg cursor-pointer"
                          value={settings.model_weight}
                          onChange={(e) => setSettings({ ...settings, model_weight: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                      <p className="text-xs text-muted-foreground">
                        Total Sum: {((settings.industry_weight + settings.ticket_weight + settings.model_weight) * 100).toFixed(0)}% (Weights will be normalized to 100% on calculation)
                      </p>
                      <Button type="submit">Save Match Settings</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Announcements Tab */}
            {activeTab === "announcements" && (
              <div className="grid gap-6 md:grid-cols-[1.2fr_1.8fr]">
                <Card className="border-white/15 h-fit">
                  <CardHeader>
                    <CardTitle>Create Broadcast</CardTitle>
                    <CardDescription>Post news seen by all users on their workspaces.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="announcementText">Announcement message</Label>
                        <Input 
                          id="announcementText"
                          placeholder="e.g. Schedule database maintenance at 12:00 AM UTC..."
                          value={newAnnouncement}
                          onChange={(e) => setNewAnnouncement(e.target.value)}
                          required
                        />
                      </div>
                      <Button className="w-full flex items-center justify-center gap-1.5" type="submit">
                        <Plus className="h-4 w-4" />
                        Broadcast News
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-white/15">
                  <CardHeader>
                    <CardTitle>Broadcast History</CardTitle>
                    <CardDescription>Active platform-wide system announcements.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {announcements.length === 0 ? (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        No active announcements.
                      </div>
                    ) : (
                      announcements.map((ann) => (
                        <div 
                          key={ann.id}
                          className="flex items-start justify-between gap-4 border border-white/10 bg-white/[0.01] p-4 rounded-xl"
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
                            className="text-red-500 hover:text-red-700 hover:bg-red-500/10 h-8 w-8 p-0"
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
          </div>
        )}
      </section>
    </main>
  );
}
