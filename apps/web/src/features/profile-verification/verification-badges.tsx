import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { VerificationBadge } from "@/lib/api/profile-verification";

type VerificationBadgesProps = {
  badges: VerificationBadge[] | string[];
};

export function VerificationBadges({ badges }: VerificationBadgesProps) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <Badge className="gap-1.5" key={badge} variant="outline">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {badge}
        </Badge>
      ))}
    </div>
  );
}
