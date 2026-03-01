/** Feature flags — controlled via environment variables */

export const PAYWALL_ENABLED = process.env.NEXT_PUBLIC_PAYWALL_ENABLED === "true";
