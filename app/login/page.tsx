"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-context";

/* ─── Fijord Arrow Mark ─── */

function FijordMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20.69 10.97L18.34 8.67L9.49 8.66L7 11.78V11.84H16.6L7.16 21.29L8.69 22.81L13.55 17.94V21.74L13.6 21.74L15.65 19.68L15.69 15.82L18.14 13.37V22.97H18.2L20.3 20.87V10.97Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ─── Steps ─── */

type Step = "email" | "check" | "code";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithMagicLink, verifyCode } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendLink() {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      await loginWithMagicLink(email.trim(), false);
      setStep("check");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      const lower = msg.toLowerCase();
      if (lower.includes("rate") || lower.includes("limit") || lower.includes("seconds")) {
        setError("A link was already sent. Please check your email or wait a minute before trying again.");
      } else if (lower.includes("signups not allowed") || lower.includes("otp_disabled")) {
        setError("No account found with this email. Please sign up first.");
      } else {
        setError("No account found. Please sign up first.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    if (code.length < 6) return;
    setLoading(true);
    setError("");
    try {
      await verifyCode(email.trim(), code);
      router.push("/");
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setLoading(true);
    setError("");
    try {
      await loginWithMagicLink(email.trim(), false);
      setError("");
    } catch {
      setError("Failed to resend. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    setError("");
    if (step === "code") setStep("check");
    else if (step === "check") { setStep("email"); setCode(""); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm px-6">

        {/* ─── Step 1: Enter email ─── */}
        {step === "email" && (
          <div className="flex flex-col items-center">
            <FijordMark size={36} />
            <h1 className="mt-5 mb-2 text-xl font-medium text-foreground">
              Sign in to Fijord
            </h1>
            <p className="mb-6 text-center text-sm text-muted">
              We&apos;ll send a sign-in link to your email
            </p>

            <div className="mb-3 w-full">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && email.trim() && handleSendLink()}
                placeholder="e.g. jane@acme.co"
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-foreground/30 focus:outline-none"
                autoFocus
              />
            </div>

            <button
              onClick={handleSendLink}
              disabled={!email.trim() || loading}
              className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Sending..." : "Send sign-in link"}
            </button>

            {error && <p className="mt-3 text-center text-sm text-accent-red">{error}</p>}

            <p className="mt-8 text-center text-sm text-muted">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => router.push("/signup")}
                className="font-medium text-accent hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        )}

        {/* ─── Step 2: Check your email ─── */}
        {step === "check" && (
          <div className="flex flex-col items-center">
            <FijordMark size={48} />
            <h1 className="mt-5 mb-2 text-xl font-medium text-foreground">
              Check your email
            </h1>
            <p className="mb-8 text-center text-sm text-muted">
              We sent a secure sign-in link to{" "}
              <span className="text-foreground">{email}</span>
            </p>

            <p className="text-center text-sm text-muted">
              Don&apos;t see it?{" "}
              <button
                onClick={handleResend}
                disabled={loading}
                className="font-medium text-accent hover:underline disabled:opacity-50"
              >
                Send a new link
              </button>
            </p>

            {error && <p className="mt-3 text-center text-sm text-accent-red">{error}</p>}

            <button
              onClick={() => setStep("code")}
              className="mt-5 text-sm text-muted underline transition-colors hover:text-foreground"
            >
              Enter code manually
            </button>

            <button
              onClick={goBack}
              className="mt-4 text-sm text-muted transition-colors hover:text-foreground"
            >
              &larr; Go back
            </button>
          </div>
        )}

        {/* ─── Step 3: Enter code ─── */}
        {step === "code" && (
          <div className="flex flex-col items-center">
            <FijordMark size={36} />
            <h1 className="mt-5 mb-2 text-xl font-medium text-foreground">
              Check your email
            </h1>
            <p className="mb-6 text-center text-sm text-muted">
              We sent a secure sign-in link to{" "}
              <span className="text-foreground">{email}</span>
            </p>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && code.length === 6 && handleVerifyCode()}
              placeholder="Enter 6-digit code"
              className="mb-4 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-center text-sm tracking-widest text-foreground placeholder:tracking-normal placeholder:text-muted/50 focus:border-foreground/30 focus:outline-none"
              autoFocus
            />

            <button
              onClick={handleVerifyCode}
              disabled={code.length < 6 || loading}
              className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Verifying..." : "Verify code"}
            </button>

            {error && <p className="mt-3 text-center text-sm text-accent-red">{error}</p>}

            <p className="mt-5 text-center text-sm text-muted">
              Didn&apos;t receive the email?{" "}
              <button
                onClick={handleResend}
                disabled={loading}
                className="font-medium text-accent hover:underline"
              >
                Click to resend
              </button>
            </p>

            <button
              onClick={goBack}
              className="mt-4 text-sm text-muted transition-colors hover:text-foreground"
            >
              &larr; Go back
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
