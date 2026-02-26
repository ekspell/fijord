"use client";

import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="mx-auto" style={{ maxWidth: 700 }}>
      <div className="mb-4 text-muted" style={{ fontSize: 13 }}>
        <button onClick={() => router.push("/")} className="hover:text-foreground">Home</button>
        {" › "}
        <span className="text-accent">Terms of Service</span>
      </div>

      <h1
        className="mb-8 text-foreground"
        style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-0.5px" }}
      >
        Terms of Service
      </h1>

      <div className="space-y-6 text-sm leading-relaxed text-muted">
        <p className="text-xs text-muted">Last updated: February 25, 2026</p>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Fijord (&quot;the Service&quot;), operated by Fijord Inc. (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;),
            you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">2. Description of Service</h2>
          <p>
            Fijord is an AI-powered product management tool that helps teams extract problems from meeting
            transcripts, generate solutions, and organize work into structured tickets and roadmaps.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">3. Accounts</h2>
          <p>
            You must provide accurate information when creating an account. You are responsible for
            maintaining the security of your account and all activity that occurs under it. Notify us
            immediately of any unauthorized access.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">4. Subscriptions &amp; Payment</h2>
          <p>
            The Service offers free (Starter) and paid (Pro) plans. Pro subscriptions are billed monthly
            or annually through Stripe. All payments are non-refundable except where required by law.
            You may cancel at any time; access continues through the end of the billing period.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">5. Free Trial</h2>
          <p>
            New users receive a 7-day free trial of Pro features. At the end of the trial, your account
            will be downgraded to the Starter plan unless you subscribe to Pro.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">6. Acceptable Use</h2>
          <p>
            You agree not to misuse the Service, including but not limited to: attempting to gain
            unauthorized access, transmitting malware, scraping data, or using the Service for any
            illegal purpose. We reserve the right to suspend or terminate accounts that violate these terms.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">7. Intellectual Property</h2>
          <p>
            You retain ownership of all content you upload to Fijord, including transcripts and generated
            tickets. We retain ownership of the Service, its design, and underlying technology. AI-generated
            outputs are provided for your use but come with no guarantee of accuracy.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">8. Limitation of Liability</h2>
          <p>
            The Service is provided &quot;as is&quot; without warranties of any kind. To the maximum extent
            permitted by law, Fijord Inc. shall not be liable for any indirect, incidental, special, or
            consequential damages arising from your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">9. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. We will notify you of material changes via email
            or an in-app notice. Continued use of the Service after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">10. Contact</h2>
          <p>
            Questions about these terms? Contact us at{" "}
            <span className="text-accent">hello@fijord.app</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
