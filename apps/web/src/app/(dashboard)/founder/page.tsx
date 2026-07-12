import { WorkspaceHome } from "@/features/workspaces/workspace-home";

export default function FounderPage() {
  return (
    <WorkspaceHome
      eyebrow="Founder interface"
      title="Founder workspace"
      body="Manage your startup profile, discover aligned investors, review matches, and message capital partners."
      links={[
        {
          title: "Pitch feed",
          body: "Watch and search startup pitches in a short-form investor feed.",
          href: "/pitch-feed"
        },
        {
          title: "Startup profile",
          body: "Maintain financials, projections, patents, traction, and your pitch video.",
          href: "/startup-profile"
        },
        {
          title: "Investor discovery",
          body: "Find and filter investors by thesis, organization, and check size.",
          href: "/investor-discovery"
        },
        {
          title: "Matches",
          body: "Review investor matches ranked by fundraising fit.",
          href: "/matching"
        },
        {
          title: "Messages",
          body: "Continue direct conversations with investors.",
          href: "/messages"
        }
      ]}
    />
  );
}
