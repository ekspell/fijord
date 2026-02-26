const BRAND = {
  name: "Fijord",
  color: "#3D5A3D",
  url: "https://fijord.app",
};

function layout(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF9F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:480px;margin:0 auto;padding:40px 24px">
    <div style="text-align:center;margin-bottom:32px">
      <span style="font-size:18px;font-weight:600;color:#1a1a1a">${BRAND.name}</span>
    </div>
    ${content}
    <div style="margin-top:40px;padding-top:24px;border-top:1px solid #E8E6E1;text-align:center;font-size:12px;color:#6b6b6b">
      <p>&copy; 2026 ${BRAND.name} &middot; <a href="${BRAND.url}/terms" style="color:#6b6b6b">Terms</a> &middot; <a href="${BRAND.url}/privacy" style="color:#6b6b6b">Privacy</a></p>
    </div>
  </div>
</body>
</html>`;
}

function button(text: string, href: string) {
  return `<div style="text-align:center;margin:24px 0">
    <a href="${href}" style="display:inline-block;padding:12px 28px;background:${BRAND.color};color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500">${text}</a>
  </div>`;
}

export type EmailTemplate = "welcome" | "trial_ending" | "trial_ended" | "payment_failed";

export function getEmailContent(template: EmailTemplate, data: { name?: string; email?: string } = {}) {
  const name = data.name || "there";

  switch (template) {
    case "welcome":
      return {
        subject: "Welcome to Fijord",
        html: layout(`
          <h1 style="font-size:22px;font-weight:500;color:#1a1a1a;margin-bottom:8px">Welcome to Fijord, ${name}!</h1>
          <p style="font-size:14px;color:#6b6b6b;line-height:1.6">
            You're all set with a 7-day free trial of Fijord Pro. Here's what you can do:
          </p>
          <ul style="font-size:14px;color:#6b6b6b;line-height:1.8;padding-left:20px">
            <li>Paste a meeting transcript and extract problems in seconds</li>
            <li>Generate solutions and structured tickets automatically</li>
            <li>Organize work on your Scope board and Staging kanban</li>
            <li>Export tickets directly to Linear or Jira</li>
          </ul>
          ${button("Get started", BRAND.url)}
          <p style="font-size:13px;color:#6b6b6b">Your Pro trial ends in 7 days. You can upgrade anytime from the Pricing page.</p>
        `),
      };

    case "trial_ending":
      return {
        subject: "Your Fijord trial ends in 2 days",
        html: layout(`
          <h1 style="font-size:22px;font-weight:500;color:#1a1a1a;margin-bottom:8px">Your trial ends in 2 days</h1>
          <p style="font-size:14px;color:#6b6b6b;line-height:1.6">
            Hi ${name}, your Fijord Pro trial is almost over. Upgrade now to keep access to:
          </p>
          <ul style="font-size:14px;color:#6b6b6b;line-height:1.8;padding-left:20px">
            <li>Emerging Signals — detect patterns across meetings</li>
            <li>Auto-generated Briefs for your epics</li>
            <li>Unlimited epics and all integrations</li>
          </ul>
          ${button("Upgrade to Pro — $14/mo", `${BRAND.url}/pricing`)}
          <p style="font-size:13px;color:#6b6b6b">If you don't upgrade, you'll be moved to the free Starter plan.</p>
        `),
      };

    case "trial_ended":
      return {
        subject: "Your Fijord trial has ended",
        html: layout(`
          <h1 style="font-size:22px;font-weight:500;color:#1a1a1a;margin-bottom:8px">Your trial has ended</h1>
          <p style="font-size:14px;color:#6b6b6b;line-height:1.6">
            Hi ${name}, your 7-day Pro trial is over and you're now on the Starter plan. You can still
            process transcripts and use 3 epics, but Signals, Briefs, and advanced integrations are locked.
          </p>
          ${button("Upgrade to Pro", `${BRAND.url}/pricing`)}
          <p style="font-size:13px;color:#6b6b6b">Questions? Reply to this email or contact hello@fijord.app.</p>
        `),
      };

    case "payment_failed":
      return {
        subject: "Payment failed for Fijord Pro",
        html: layout(`
          <h1 style="font-size:22px;font-weight:500;color:#1a1a1a;margin-bottom:8px">Payment failed</h1>
          <p style="font-size:14px;color:#6b6b6b;line-height:1.6">
            Hi ${name}, we weren't able to process your payment for Fijord Pro. Please update your payment
            method to keep your Pro access.
          </p>
          ${button("Update payment method", `${BRAND.url}/pricing`)}
          <p style="font-size:13px;color:#6b6b6b">If your payment isn't updated within 7 days, your account will be downgraded to the Starter plan.</p>
        `),
      };
  }
}
