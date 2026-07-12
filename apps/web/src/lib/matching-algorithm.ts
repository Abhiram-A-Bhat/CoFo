import type { StartupDiscoveryItem } from "@/lib/api/startup-discovery";
import type { AuthUser } from "@/lib/api/auth";
import type { InvestorProfile } from "@/lib/api/investor-profile";

export type MatchResult = {
  score: number; // 0 to 100
  reasons: string[];
};

export function calculateMatchScore(
  startup: StartupDiscoveryItem,
  user: AuthUser | null,
  investorProfile: InvestorProfile | null
): MatchResult {
  let score = 50; // Base score
  const reasons: string[] = [];

  if (!user) {
    return { score, reasons: ["Sign in to calculate match metrics"] };
  }

  // 1. Industry Alignment (up to +20 or -15)
  const userInterests = user.investment_interests || [];
  const startupIndustry = startup.industry ? startup.industry.toLowerCase() : "";

  const hasIndustryMatch = userInterests.some(
    (interest) => interest.toLowerCase() === startupIndustry || startupIndustry.includes(interest.toLowerCase())
  );

  if (hasIndustryMatch) {
    score += 20;
    reasons.push(`Aligned with your interest in ${startup.industry}`);
  } else if (userInterests.length > 0) {
    score -= 10; // Slight penalty for non-interest sectors
  }

  // 2. Ticket Size & Funding Required Alignment (up to +20 or -15)
  if (investorProfile?.ticket_size) {
    const investorTicket = parseNumericValue(investorProfile.ticket_size);
    const startupAsk = parseNumericValue(startup.funding_required);

    if (investorTicket > 0 && startupAsk > 0) {
      const ratio = investorTicket / startupAsk;
      // Ideally, the investor's ticket size covers 10% to 50% of the round asks, or overlaps it
      if (ratio >= 0.1 && ratio <= 0.6) {
        score += 20;
        reasons.push("Check size is optimal for this funding round (10% - 60% coverage)");
      } else if (ratio > 0.6 && ratio <= 1.0) {
        score += 15;
        reasons.push("You can lead or anchor this funding round");
      } else if (ratio > 1.0) {
        score += 10;
        reasons.push("Ticket size exceeds total funding required");
      } else {
        score -= 10;
        reasons.push("Round ask is too large for your typical ticket size");
      }
    }
  }

  // 3. Stage & Maturity Boost (up to +15)
  if (startup.stage) {
    const stage = startup.stage.toLowerCase();
    if (stage.includes("seed") || stage.includes("early")) {
      score += 5;
    } else if (stage.includes("series a") || stage.includes("growth")) {
      score += 10;
    }
  }

  // 4. Financial Traction Boost (up to +15)
  const monthlyRevenue = parseNumericValue(startup.monthly_revenue);
  const arr = parseNumericValue(startup.annual_recurring_revenue);

  if (arr > 100000 || monthlyRevenue > 8000) {
    score += 15;
    reasons.push("Demonstrating strong recurring revenue (ARR > $100k)");
  } else if (arr > 0 || monthlyRevenue > 0) {
    score += 5;
    reasons.push("Early commercial traction / monthly revenue");
  }

  // 5. Verification Validation Boost (up to +10)
  if (startup.verification_badges && startup.verification_badges.length > 0) {
    const badgesCount = startup.verification_badges.length;
    score += Math.min(badgesCount * 5, 10);
    reasons.push(`${badgesCount} verified profile credential${badgesCount > 1 ? "s" : ""}`);
  }

  // Bound the score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, score));

  // Fallback reason if none generated
  if (reasons.length === 0) {
    reasons.push("General investment profile matching");
  }

  return { score: finalScore, reasons };
}

// Utility to parse money / string figures to numeric values
function parseNumericValue(val: string | null | undefined): number {
  if (!val) return 0;
  // Strip non-numeric characters except digits
  const clean = val.replace(/[^0-9.]/g, "");
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;

  // Handle unit scaling if raw labels are used (e.g. "10L", "1Cr", "100k", "1M")
  const lowVal = val.toLowerCase();
  if (lowVal.includes("cr")) return num * 10000000;
  if (lowVal.includes("lakh") || lowVal.includes("l")) return num * 100000;
  if (lowVal.includes("m")) return num * 1000000;
  if (lowVal.includes("k")) return num * 1000;

  return num;
}
