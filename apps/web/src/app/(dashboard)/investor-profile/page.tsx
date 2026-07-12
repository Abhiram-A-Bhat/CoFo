import { InvestorProfileForm } from "@/features/investor-profile/investor-profile-form";
import { ProfileVerificationForm } from "@/features/profile-verification/profile-verification-form";

export default function InvestorProfilePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(56,189,248,0.10),transparent_72%)]" />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6">
        <InvestorProfileForm />
        <ProfileVerificationForm />
      </div>
    </main>
  );
}
