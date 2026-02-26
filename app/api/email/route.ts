import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getEmailContent, type EmailTemplate } from "@/lib/email-templates";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { template, email, name } = (await req.json()) as {
      template: EmailTemplate;
      email: string;
      name?: string;
    };

    if (!template || !email) {
      return NextResponse.json(
        { error: "template and email are required", code: "MISSING_FIELDS" },
        { status: 400 }
      );
    }

    const content = getEmailContent(template, { name, email });

    // Use Supabase edge function or Auth email hook to send.
    // For now, log and store — swap to Resend/SendGrid in production.
    const { error } = await supabase.from("email_log").insert({
      to_email: email,
      template,
      subject: content.subject,
      sent_at: new Date().toISOString(),
    });

    if (error) {
      console.warn("[email] Failed to log email:", error.message);
    }

    // TODO: Replace with actual email service (Resend, SendGrid, etc.)
    console.log(`[email] Would send "${content.subject}" to ${email}`);

    return NextResponse.json({ sent: true, subject: content.subject });
  } catch (err) {
    console.error("[email]", err);
    return NextResponse.json(
      { error: "Failed to send email", code: "EMAIL_ERROR" },
      { status: 500 }
    );
  }
}
