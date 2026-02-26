export type UserTier = "starter" | "pro" | "pro_paid";

export type TierInfo = {
  tier: UserTier;
  trialStartedAt: string | null;
  stripeCustomerId: string | null;
  subscriptionStatus: "active" | "cancelled" | "past_due" | null;
  currentPeriodEnd: string | null;
};

export function getTrialDaysRemaining(trialStartedAt: string | null): number {
  if (!trialStartedAt) return 0;
  const trialStart = new Date(trialStartedAt);
  const now = new Date();
  const daysPassed = Math.floor(
    (now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, 7 - daysPassed);
}

export function isTrialExpired(tierInfo: TierInfo): boolean {
  return (
    getTrialDaysRemaining(tierInfo.trialStartedAt) === 0 &&
    tierInfo.tier !== "pro_paid"
  );
}

export function isProUser(tierInfo: TierInfo): boolean {
  if (tierInfo.tier === "pro_paid") return true;
  if (tierInfo.tier === "pro" && !isTrialExpired(tierInfo)) return true;
  return false;
}
