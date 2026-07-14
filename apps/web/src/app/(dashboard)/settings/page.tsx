"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Lock, 
  LogOut, 
  Settings, 
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Bell,
  Eye,
  EyeOff
} from "lucide-react";
import { getMe, logout, updateProfile, type AuthUser } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export default function SettingsPage() {
  const router = useRouter();
  
  // Profile state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  
  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Status states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getMe();
        setUser(currentUser);
        setFullName(currentUser.full_name || "");
        setEmail(currentUser.email);
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to load profile details"));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);
    try {
      const updatedUser = await updateProfile({ full_name: fullName });
      setUser(updatedUser);
      setSuccess("Profile settings updated successfully.");
      // Fire window storage event to alert sidebar to update user full_name instantly
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update profile settings"));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Password validation constraint: min length 8 with at least one capital
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must contain at least one uppercase (capital) letter.");
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({ password: newPassword });
      setSuccess("Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update password"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      if (typeof window !== "undefined") {
        localStorage.removeItem("fundflow_access_token");
      }
      router.push("/login");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to log out"));
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-white/[0.08] pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          User Settings
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-white mt-1">Settings</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Left Tabs (Desktop Menu) */}
        <aside className="md:col-span-1 space-y-1">
          <button
            onClick={() => { setActiveTab("profile"); setError(""); setSuccess(""); }}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-medium transition-all ${
              activeTab === "profile" 
                ? "bg-white/[0.06] text-white font-semibold" 
                : "text-white/50 hover:bg-white/[0.02] hover:text-white"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile Details</span>
          </button>
          
          <button
            onClick={() => { setActiveTab("security"); setError(""); setSuccess(""); }}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-medium transition-all ${
              activeTab === "security" 
                ? "bg-white/[0.06] text-white font-semibold" 
                : "text-white/50 hover:bg-white/[0.02] hover:text-white"
            }`}
          >
            <Lock className="h-4 w-4" />
            <span>Password & Security</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-medium text-red-400/80 hover:bg-red-500/5 hover:text-red-400 transition-all mt-4"
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </button>
        </aside>

        {/* Right Content */}
        <div className="md:col-span-3 space-y-6">
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
              {success}
            </div>
          )}

          {activeTab === "profile" && (
            <Card className="border-white/[0.08] bg-[#0d0d0d]">
              <CardHeader>
                <CardTitle className="text-white">Profile Details</CardTitle>
                <CardDescription className="text-white/40">
                  Update your basic info. Your role cannot be changed directly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-white/60">Email address</Label>
                    <Input
                      id="email"
                      value={email}
                      disabled
                      className="bg-white/[0.02] border-white/10 text-white/50 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-white/60">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="bg-white/[0.04] border-white/10 text-white focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-white/60">Current Role</Label>
                    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                      <Briefcase className="h-4 w-4 text-emerald-400" />
                      <div className="text-[13px]">
                        <span className="font-semibold text-white capitalize">{user?.role}</span>
                        <span className="text-white/40 block text-xs">
                          {user?.role === "founder" 
                            ? "Sourcing capital, posting pitches" 
                            : "Evaluating startups, matching criteria"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-semibold"
                  >
                    {isSaving ? "Saving changes..." : "Save changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="border-white/[0.08] bg-[#0d0d0d]">
              <CardHeader>
                <CardTitle className="text-white">Change Password</CardTitle>
                <CardDescription className="text-white/40">
                  Must be at least 8 characters with at least one capital letter.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSave} className="space-y-4">
                  <div className="space-y-1.5 relative">
                    <Label htmlFor="newPass" className="text-white/60">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPass"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-white/[0.04] border-white/10 text-white focus:border-emerald-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-3 flex items-center text-white/40 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPass" className="text-white/60">Confirm New Password</Label>
                    <Input
                      id="confirmPass"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-white/[0.04] border-white/10 text-white focus:border-emerald-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-semibold"
                  >
                    {isSaving ? "Updating password..." : "Update password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
