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

/* ─── Google Icon ─── */

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

/* ─── Steps ─── */

type Step = "choose" | "email" | "check" | "code";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogle, loginWithMagicLink, verifyCode } = useAuth();
  const [step, setStep] = useState<Step>("choose");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogle() {
    setLoading(true);
    setError("");
    try {
      await loginWithGoogle();
      router.push("/");
    } catch {
      setError("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendLink() {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      await loginWithMagicLink(email.trim());
      setStep("check");
    } catch {
      setError("Failed to send link. Please try again.");
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
      await loginWithMagicLink(email.trim());
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
    else if (step === "email") setStep("choose");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm px-6">

        {/* ─── Step 1: Choose method ─── */}
        {step === "choose" && (
          <div className="flex flex-col items-center">
            <FijordMark size={36} />
            <h1 className="mt-5 mb-8 text-xl font-medium text-foreground">
              Sign in to Fijord
            </h1>

            <button
              onClick={handleGoogle}
              disabled={loading}
              className="mb-0 flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background disabled:opacity-50"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="my-5 flex w-full items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <button
              onClick={() => setStep("email")}
              className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Continue with email
            </button>

            {error && <p className="mt-4 text-center text-sm text-accent-red">{error}</p>}

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

        {/* ─── Step 2: Enter email ─── */}
        {step === "email" && (
          <div className="flex flex-col items-center">
            <FijordMark size={36} />
            <h1 className="mt-5 mb-6 text-xl font-medium text-foreground">
              Sign in to Fijord
            </h1>

            <button
              onClick={handleGoogle}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background disabled:opacity-50"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="my-5 flex w-full items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

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
              {loading ? "Sending..." : "Continue with email"}
            </button>

            {error && <p className="mt-3 text-center text-sm text-accent-red">{error}</p>}

            <button
              onClick={goBack}
              className="mt-5 text-sm text-muted transition-colors hover:text-foreground"
            >
              &larr; Go back
            </button>
          </div>
        )}

        {/* ─── Step 3: Check your email ─── */}
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

            <button
              onClick={() => setStep("code")}
              className="text-sm text-muted underline transition-colors hover:text-foreground"
            >
              Enter code manually
            </button>

            <button
              onClick={goBack}
              className="mt-5 text-sm text-muted transition-colors hover:text-foreground"
            >
              &larr; Go back
            </button>
          </div>
        )}

        {/* ─── Step 4: Enter code ─── */}
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
              {loading ? "Verifying..." : "Continue with email"}
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
