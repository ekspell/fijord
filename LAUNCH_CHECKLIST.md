# LAUNCH_CHECKLIST.md

Complete these tasks to get Fijord ready for paying users.

---

## 1. Environment Setup

Add these to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## 2. Stripe Integration

### 2.1 Create Stripe Products
In Stripe Dashboard (test mode), create:
- Product: "Fijord Pro"
- Price: $14/user/month (recurring)
- Save the price ID (price_xxx)

### 2.2 Checkout Endpoint
Create `/app/api/stripe/checkout/route.ts`:
- Accept user email and price ID
- Create Stripe Checkout Session
- Return session URL
- Include trial_period_days: 7 for new users

### 2.3 Webhook Endpoint
Create `/app/api/stripe/webhook/route.ts`:
- Verify Stripe signature
- Handle events:
  - `checkout.session.completed` → update user to Pro in Supabase
  - `customer.subscription.updated` → sync status
  - `customer.subscription.deleted` → downgrade to Starter
  - `invoice.payment_failed` → flag account, send email

### 2.4 Billing Portal
Create `/app/api/stripe/portal/route.ts`:
- Create Stripe Billing Portal session
- User can manage/cancel subscription

### 2.5 Wire Up Upgrade Buttons
- "Continue with Pro" on pricing page → checkout
- Upgrade modal CTA → checkout
- "Manage subscription" in settings → billing portal

---

## 3. Trial Logic

### 3.1 Track Trial Start
When user signs up:
```sql
-- In Supabase users table
trial_started_at: timestamp (now)
tier: 'pro' (starts with pro during trial)
```

### 3.2 Check Trial Status
Create utility function:
```ts
function getTrialDaysRemaining(user) {
  const trialStart = new Date(user.trial_started_at)
  const now = new Date()
  const daysPassed = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24))
  return Math.max(0, 7 - daysPassed)
}

function isTrialExpired(user) {
  return getTrialDaysRemaining(user) === 0 && user.tier !== 'pro_paid'
}
```

### 3.3 Auto-Downgrade
Create cron job or check on login:
- If trial expired and not subscribed → set tier to 'starter'

### 3.4 Trial UI
- Show "X days left in trial" badge in sidebar
- Show "Trial ends today" banner on day 7
- Show "Trial ended" modal after expiry with upgrade CTA

---

## 4. Paywall Enforcement

### 4.1 Middleware Check
In pages that require Pro, check:
```ts
if (user.tier === 'starter') {
  // Show upgrade modal or redirect
}
```

### 4.2 Block These on Starter
- `/signals` → show upgrade modal
- `/epic/[id]/brief` tab → show upgrade modal  
- Creating 4th+ epic → show upgrade modal
- Connecting Pro integrations → show upgrade modal
- Accessing meetings older than 2 weeks → show upgrade modal

### 4.3 Upgrade Modal Content
- "Upgrade to Pro to unlock [feature]"
- Show what they get: Signals, Briefs, unlimited epics, all integrations
- "$14/month" with CTA
- "Maybe later" dismiss option

---

## 5. Legal Pages

### 5.1 Terms of Service
Create `/app/terms/page.tsx`:
- Basic SaaS terms
- Payment/refund policy
- Usage guidelines
- Limitation of liability

### 5.2 Privacy Policy  
Create `/app/privacy/page.tsx`:
- What data we collect
- How we use it
- Third parties (Stripe, Supabase, AI providers)
- User rights (delete account, export data)

### 5.3 Footer Links
Add Terms and Privacy links to:
- Landing page footer
- Signup page
- Settings page

---

## 6. Transactional Emails

Use Supabase Auth emails or integrate Resend/SendGrid:

### 6.1 Welcome Email
Trigger: After signup
Content:
- Welcome to Fijord
- You have 7 days of Pro free
- Quick start guide link

### 6.2 Trial Ending Email
Trigger: Day 5 of trial
Content:
- Your trial ends in 2 days
- Upgrade to keep Pro features
- CTA button

### 6.3 Trial Ended Email
Trigger: Day 8 (trial expired, not subscribed)
Content:
- Your trial has ended
- You're now on Starter
- Here's what you're missing
- Upgrade CTA

### 6.4 Payment Failed Email
Trigger: Stripe invoice.payment_failed
Content:
- Payment failed
- Update payment method link
- Account will downgrade in X days

---

## 7. Error Handling

### 7.1 Toast System
Create toast component for:
- Success: "Transcript processed", "Exported to Linear"
- Error: "Something went wrong. Try again."
- Warning: "Trial ends in 2 days"

### 7.2 Error Boundaries
Wrap pages in error boundaries with:
- Friendly error message
- "Try again" button
- Link to support

### 7.3 API Error Handling
All API routes should return:
- Consistent error format: `{ error: "message", code: "ERROR_CODE" }`
- Appropriate status codes

---

## 8. Analytics

### 8.1 Setup PostHog or Mixpanel
Add to `.env`:
```
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
```

### 8.2 Track Key Events
- `user_signed_up`
- `trial_started`
- `transcript_processed`
- `ticket_exported`
- `upgrade_modal_shown`
- `upgrade_completed`
- `subscription_cancelled`

### 8.3 Add Analytics Provider
Wrap app in analytics provider, track page views automatically.

---

## 9. Final Testing Checklist

Before going live, manually test:

- [ ] Sign up with email
- [ ] Sign up with Google
- [ ] Magic link login works
- [ ] Trial badge shows "7 days"
- [ ] Can process transcript
- [ ] Can export to Linear (if connected)
- [ ] Can access Signals during trial
- [ ] Can access Briefs during trial
- [ ] After "trial expires" (manually set date), Signals blocked
- [ ] Upgrade button → Stripe checkout
- [ ] Complete test payment
- [ ] User tier updates to Pro
- [ ] Billing portal accessible
- [ ] Cancel subscription → downgraded
- [ ] Terms/Privacy pages load
- [ ] Works on mobile

---

## 10. Go Live

### 10.1 Switch to Live Keys
Replace in `.env`:
- `sk_test_xxx` → `sk_live_xxx`
- `pk_test_xxx` → `pk_live_xxx`
- Update webhook secret for live endpoint

### 10.2 Set Up Live Webhook
In Stripe Dashboard → Webhooks:
- Add endpoint: `https://fijord.app/api/stripe/webhook`
- Select events: checkout.session.completed, customer.subscription.*, invoice.payment_failed

### 10.3 Final Deploy
```bash
git checkout main
git merge preview
git push
```

### 10.4 Monitor
- Watch Stripe dashboard for first payments
- Check Vercel logs for errors
- Monitor PostHog for user behavior

---

## Quick Reference: User Tiers in Database

```sql
-- Supabase users table
id: uuid
email: string
tier: 'starter' | 'pro' | 'pro_paid'  -- pro = trial, pro_paid = subscribed
trial_started_at: timestamp
stripe_customer_id: string | null
subscription_status: 'active' | 'cancelled' | 'past_due' | null
current_period_end: timestamp | null
```
