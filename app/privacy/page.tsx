"use client";

import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="mx-auto" style={{ maxWidth: 700 }}>
      <div className="mb-4 text-muted" style={{ fontSize: 13 }}>
        <button onClick={() => router.push("/")} className="hover:text-foreground">Home</button>
        {" › "}
        <span className="text-accent">Privacy Policy</span>
      </div>

      <h1
        className="mb-8 text-foreground"
        style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-0.5px" }}
      >
        Privacy Policy
      </h1>

      <div className="space-y-6 text-sm leading-relaxed text-muted">
        <p className="text-xs text-muted">Last updated: February 25, 2026</p>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">1. Information We Collect</h2>
          <p>
            <strong className="text-foreground">Account information:</strong> email address, name, and
            authentication credentials when you sign up.
          </p>
          <p className="mt-2">
            <strong className="text-foreground">Content you provide:</strong> meeting transcripts,
            generated tickets, workspace settings, and onboarding preferences.
          </p>
          <p className="mt-2">
            <strong className="text-foreground">Usage data:</strong> pages visited, features used,
            and anonymized interaction patterns to improve the product.
          </p>
          <p className="mt-2">
            <strong className="text-foreground">Payment information:</strong> processed securely
            by Stripe. We do not store credit card numbers.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">2. How We Use Your Data</h2>
          <p>We use your data to:</p>
          <ul className="ml-4 mt-2 list-disc space-y-1">
            <li>Provide and improve the Service</li>
            <li>Process AI-powered analysis of your transcripts</li>
            <li>Manage your account and subscriptions</li>
            <li>Send transactional emails (welcome, trial, billing)</li>
            <li>Analyze aggregate usage to improve features</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">3. Third-Party Services</h2>
          <p>We share data with these providers, each under their own privacy policies:</p>
          <ul className="ml-4 mt-2 list-disc space-y-1">
            <li><strong className="text-foreground">Supabase</strong> — authentication and database</li>
            <li><strong className="text-foreground">Stripe</strong> — payment processing</li>
            <li><strong className="text-foreground">Anthropic</strong> — AI transcript analysis (your transcripts are sent to Claude for processing)</li>
            <li><strong className="text-foreground">Vercel</strong> — hosting and deployment</li>
            <li><strong className="text-foreground">PostHog</strong> — privacy-friendly product analytics</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">4. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. Transcripts are processed in
            real-time and not stored beyond session duration unless you explicitly save results.
            You can request deletion of your account and all associated data at any time.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="ml-4 mt-2 list-disc space-y-1">
            <li>Access and export your data</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and all data</li>
            <li>Opt out of non-essential communications</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">6. Security</h2>
          <p>
            We implement industry-standard security measures including encrypted data transmission
            (TLS), secure authentication, and access controls. No system is perfectly secure, and
            we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">7. Cookies</h2>
          <p>
            We use essential cookies for authentication and session management. Analytics cookies
            are used only with your consent and can be disabled in your browser settings.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">8. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. We will notify you of material changes via
            email. Continued use of the Service constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">9. Contact</h2>
          <p>
            Privacy questions? Contact us at{" "}
            <span className="text-accent">privacy@fijord.app</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
