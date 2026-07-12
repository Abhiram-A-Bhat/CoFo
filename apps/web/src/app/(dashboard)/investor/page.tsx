import { WorkspaceHome } from "@/features/workspaces/workspace-home";

export default function InvestorPage() {
  return (
    <WorkspaceHome
      eyebrow="Investor interface"
      title="Investor workspace"
      body="Manage your investor profile, discover startups, review matches, and message founders."
      links={[
        {
          title: "Pitch feed",
          body: "Scroll founder pitch videos and inspect investor-grade company metrics.",
          href: "/pitch-feed"
        },
        {
          title: "Investor profile",
          body: "Define your investment identity and preferred check size.",
          href: "/investor-profile"
        },
        {
          title: "Startup discovery",
          body: "Search startups by company, industry, description, and funding range.",
          href: "/startup-discovery"
        },
        {
          title: "Matches",
          body: "Review startup matches ranked by thesis and ticket fit.",
          href: "/matching"
        },
        {
          title: "Messages",
          body: "Continue direct conversations with founders.",
          href: "/messages"
        }
      ]}
    />
  );
}
