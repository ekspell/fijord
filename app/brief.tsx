"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useNav } from "@/app/nav-context";
import { useAuth } from "@/app/auth-context";
import UpgradeModal from "@/app/components/upgrade-modal";
import { PAYWALL_ENABLED } from "@/lib/config";
import type { EpicBrief, ExperienceStep, DesignPrinciple, WireframeCard } from "@/lib/mock-epics";
import { EditableText, EditableTextarea } from "@/app/components/editable-fields";
import { EditedBadge } from "@/app/components/edited-badge";

const EMOTION_COLORS: Record<string, { bg: string; text: string }> = {
  red: { bg: "#FEE2E2", text: "#DC2626" },
  yellow: { bg: "#FEF3C7", text: "#D97706" },
  green: { bg: "#E8F0E8", text: "#3D5A3D" },
};

/* ─── Sub-components ─── */

function PersonaCard({ persona, onUpdate }: { persona: EpicBrief["persona"]; onUpdate?: (patch: Partial<EpicBrief["persona"]>) => void }) {
  return (
    <div
      className="rounded-xl"
      style={{ background: "#2a2a2a", padding: 24, marginBottom: 32 }}
    >
      {/* Section label */}
      <div
        className="font-medium uppercase"
        style={{
          fontSize: 11,
          letterSpacing: "0.05em",
          color: "#7a7a7a",
          marginBottom: 16,
        }}
      >
        Who we heard from
      </div>

      {/* Avatar + info */}
      <div className="flex items-start gap-3" style={{ marginBottom: 16 }}>
        <div
          className="flex shrink-0 items-center justify-center rounded-full"
          style={{ width: 40, height: 40, background: "#4a4a4a", color: "#9B9B9B" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <div className="flex-1">
          {onUpdate ? (
            <>
              <EditableText
                value={persona.title}
                onChange={(val) => onUpdate({ title: val })}
                className="[&]:text-white [&]:hover:bg-white/10"
                style={{ fontSize: 15, fontWeight: 500 }}
              />
              <EditableTextarea
                value={persona.description}
                onChange={(val) => onUpdate({ description: val })}
                className="[&]:text-[#A0A0A0] [&]:hover:bg-white/10"
              />
            </>
          ) : (
            <>
              <div className="font-medium" style={{ fontSize: 15, color: "#FFFFFF" }}>
                {persona.title}
              </div>
              <div style={{ fontSize: 13, color: "#A0A0A0", lineHeight: 1.5 }}>
                {persona.description}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Goal + Frustration */}
      <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 16 }}>
        <div className="rounded-lg" style={{ background: "#353535", padding: 14 }}>
          <div
            className="rounded font-medium"
            style={{
              fontSize: 10, padding: "2px 6px", background: "rgba(61,90,61,0.3)",
              color: "#7CB97C", display: "inline-block", marginBottom: 6,
              textTransform: "uppercase", letterSpacing: "0.05em",
            }}
          >
            Goal
          </div>
          {onUpdate ? (
            <EditableTextarea
              value={persona.goal}
              onChange={(val) => onUpdate({ goal: val })}
              className="[&]:text-[#D0D0D0] [&]:hover:bg-white/10"
            />
          ) : (
            <div style={{ fontSize: 13, color: "#D0D0D0", lineHeight: 1.5 }}>
              {persona.goal}
            </div>
          )}
        </div>
        <div className="rounded-lg" style={{ background: "#353535", padding: 14 }}>
          <div
            className="rounded font-medium"
            style={{
              fontSize: 10, padding: "2px 6px", background: "rgba(220,38,38,0.2)",
              color: "#F87171", display: "inline-block", marginBottom: 6,
              textTransform: "uppercase", letterSpacing: "0.05em",
            }}
          >
            Frustration
          </div>
          {onUpdate ? (
            <EditableTextarea
              value={persona.frustration}
              onChange={(val) => onUpdate({ frustration: val })}
              className="[&]:text-[#D0D0D0] [&]:hover:bg-white/10"
            />
          ) : (
            <div style={{ fontSize: 13, color: "#D0D0D0", lineHeight: 1.5 }}>
              {persona.frustration}
            </div>
          )}
        </div>
      </div>

      {/* Key quote */}
      <div
        className="rounded-lg"
        style={{
          background: "#353535",
          padding: "14px 16px",
          borderLeft: "3px solid #555",
        }}
      >
        {onUpdate ? (
          <EditableTextarea
            value={persona.keyQuote}
            onChange={(val) => onUpdate({ keyQuote: val })}
            className="[&]:text-[#D0D0D0] [&]:italic [&]:hover:bg-white/10"
          />
        ) : (
          <div style={{ fontSize: 13, color: "#D0D0D0", fontStyle: "italic", lineHeight: 1.5 }}>
            &ldquo;{persona.keyQuote}&rdquo;
          </div>
        )}
        <div style={{ fontSize: 12, color: "#7a7a7a", marginTop: 6 }}>
          — Customer, end of call
        </div>
      </div>
    </div>
  );
}

function ExperienceStepCard({ step, index, onUpdate }: { step: ExperienceStep; index: number; onUpdate?: (patch: Partial<ExperienceStep>) => void }) {
  const colors = EMOTION_COLORS[step.emotionColor];
  return (
    <div className="rounded-lg border border-border" style={{ padding: 16 }}>
      <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>{step.emoji}</span>
        <span
          className="font-medium"
          style={{ fontSize: 10, color: "#9B9B9B", textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          Step {index + 1}
        </span>
      </div>
      {onUpdate ? (
        <>
          <EditableText
            value={step.title}
            onChange={(val) => onUpdate({ title: val })}
            className="text-foreground"
            style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}
          />
          <EditableTextarea
            value={step.description}
            onChange={(val) => onUpdate({ description: val })}
            className="text-muted"
          />
        </>
      ) : (
        <>
          <div className="font-medium text-foreground" style={{ fontSize: 14, marginBottom: 4 }}>
            {step.title}
          </div>
          <p className="text-muted" style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 10 }}>
            {step.description}
          </p>
        </>
      )}
      <span
        className="rounded-full font-medium"
        style={{ fontSize: 11, padding: "2px 8px", background: colors.bg, color: colors.text, marginTop: onUpdate ? 8 : 0, display: "inline-block" }}
      >
        {step.emotionTag}
      </span>
    </div>
  );
}

function ExperienceSection({
  title,
  subtitle,
  steps,
  titleColor,
  onUpdateStep,
}: {
  title: string;
  subtitle: string;
  steps: ExperienceStep[];
  titleColor: string;
  onUpdateStep?: (index: number, patch: Partial<ExperienceStep>) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2" style={{ marginBottom: 14 }}>
        <h3
          className="font-medium"
          style={{
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: titleColor,
          }}
        >
          {title}
        </h3>
        <span className="text-muted" style={{ fontSize: 13 }}>
          — {subtitle}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {steps.map((step, i) => (
          <ExperienceStepCard
            key={i}
            step={step}
            index={i}
            onUpdate={onUpdateStep ? (patch) => onUpdateStep(i, patch) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function ArrowSeparator() {
  return (
    <div className="flex items-center justify-center" style={{ padding: "16px 0" }}>
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: 32, height: 32, background: "#F5F4F0" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      </div>
    </div>
  );
}

function DesignPrinciplesSection({ principles, onUpdatePrinciple }: { principles: EpicBrief["designPrinciples"]; onUpdatePrinciple?: (index: number, patch: Partial<DesignPrinciple>) => void }) {
  return (
    <div style={{ marginTop: 32 }}>
      <h3
        className="font-medium text-muted"
        style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}
      >
        Design Principles <span style={{ fontWeight: 400 }}>(from the call)</span>
      </h3>
      <div className="flex flex-col gap-5">
        {principles.map((p, i) => (
          <div key={i} className="flex gap-3">
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-medium"
              style={{ background: "#E8F0E8", color: "#3D5A3D", fontSize: 12 }}
            >
              {i + 1}
            </div>
            <div className="flex-1">
              {onUpdatePrinciple ? (
                <>
                  <EditableText
                    value={p.title}
                    onChange={(val) => onUpdatePrinciple(i, { title: val })}
                    className="text-foreground"
                    style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}
                  />
                  <EditableTextarea
                    value={p.description}
                    onChange={(val) => onUpdatePrinciple(i, { description: val })}
                    className="text-muted"
                  />
                  <EditableTextarea
                    value={p.quote}
                    onChange={(val) => onUpdatePrinciple(i, { quote: val })}
                    className="text-muted italic"
                  />
                </>
              ) : (
                <>
                  <div className="font-medium text-foreground" style={{ fontSize: 14, marginBottom: 2 }}>{p.title}</div>
                  <p className="text-muted" style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 8 }}>{p.description}</p>
                  <div
                    className="text-muted"
                    style={{ fontSize: 13, fontStyle: "italic", borderLeft: "3px solid #3D5A3D", paddingLeft: 10 }}
                  >
                    &ldquo;{p.quote}&rdquo;
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WireframeSketchSection({ wireframe, onUpdateCard }: { wireframe: EpicBrief["wireframeSketch"]; onUpdateCard?: (cardIndex: number, patch: Partial<WireframeCard> & { itemIndex?: number; itemValue?: string }) => void }) {
  return (
    <div style={{ marginTop: 32 }}>
      <div className="flex items-baseline gap-2" style={{ marginBottom: 14 }}>
        <h3
          className="font-medium text-muted"
          style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          Wireframe Sketch
        </h3>
        <span className="text-muted" style={{ fontSize: 13 }}>
          — {wireframe.subtitle}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {wireframe.cards.map((card, i) => (
          <div key={i} className="rounded-lg border border-border" style={{ padding: 16 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <div
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-medium"
                style={{ background: "#E8F0E8", color: "#3D5A3D", fontSize: 10 }}
              >
                {i + 1}
              </div>
              {onUpdateCard ? (
                <EditableText
                  value={card.title}
                  onChange={(val) => onUpdateCard(i, { title: val })}
                  className="text-foreground"
                  style={{ fontSize: 13, fontWeight: 500 }}
                />
              ) : (
                <div className="font-medium text-foreground" style={{ fontSize: 13 }}>{card.title}</div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {card.items.map((item, j) => (
                <div key={j}>
                  {onUpdateCard ? (
                    <EditableTextarea
                      value={item}
                      onChange={(val) => onUpdateCard(i, { itemIndex: j, itemValue: val })}
                      className="text-muted"
                    />
                  ) : (
                    <div
                      className="rounded-md"
                      style={{ fontSize: 12, padding: "6px 10px", background: "#F5F4F0", border: "1px solid #E8E6E1", color: "#6B6B6B" }}
                    >
                      {item}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpenQuestionsSection({ questions, onUpdateQuestion }: { questions: string[]; onUpdateQuestion?: (index: number, value: string) => void }) {
  return (
    <div style={{ marginTop: 32 }}>
      <h3
        className="font-medium text-muted"
        style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}
      >
        Open Questions
      </h3>
      <div className="flex flex-col gap-3">
        {questions.map((q, i) => (
          <div key={i} className="flex items-start gap-3">
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-medium"
              style={{ background: "#F3E8FF", color: "#7C3AED", fontSize: 12 }}
            >
              ?
            </div>
            {onUpdateQuestion ? (
              <div className="flex-1" style={{ paddingTop: 2 }}>
                <EditableTextarea
                  value={q}
                  onChange={(val) => onUpdateQuestion(i, val)}
                  className="text-muted"
                />
              </div>
            ) : (
              <p className="text-muted" style={{ fontSize: 13, lineHeight: 1.5, paddingTop: 2 }}>{q}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main BriefView ─── */

export default function BriefView() {
  const { result, solutions, transcript, brief, setBrief, setActiveTab, showToast } = useNav();
  const { isPro } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasTriggered = useRef(false);

  const generateBrief = useCallback(async () => {
    if (!result || !solutions.length || !transcript) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          problems: result.problems,
          solutions,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate brief");
      const data: EpicBrief = await res.json();
      setBrief(data);
    } catch {
      showToast("Failed to generate brief — try again");
    } finally {
      setLoading(false);
    }
  }, [result, solutions, transcript, setBrief, showToast]);

  // Auto-generate on mount if brief is null and data exists
  useEffect(() => {
    if (!brief && result && solutions.length > 0 && !hasTriggered.current && isPro) {
      hasTriggered.current = true;
      generateBrief();
    }
  }, [brief, result, solutions, isPro, generateBrief]);

  // Pro gating (skip when paywall disabled)
  if (PAYWALL_ENABLED && !isPro) {
    return (
      <div className="mx-auto" style={{ maxWidth: 900 }}>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="px-6 py-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "#E8F0E8" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3D5A3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="mb-1 text-sm font-medium text-foreground">Briefs is a Pro feature</p>
            <p className="mb-4 text-sm text-muted">Upgrade to auto-generate product briefs from your meeting transcript.</p>
            <button
              onClick={() => setShowUpgrade(true)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ background: "#3D5A3D" }}
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
        {showUpgrade && <UpgradeModal feature="Briefs" onClose={() => setShowUpgrade(false)} />}
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="relative mx-auto mb-6 h-16 w-16">
          <div className="h-16 w-16 animate-spin rounded-full border-[3px] border-border border-t-accent" />
          <svg
            className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-accent"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-medium text-foreground">Generating brief...</h2>
        <p className="text-sm text-muted">Building persona, experience flows, and design principles.</p>
      </div>
    );
  }

  // No brief yet and no data to generate from
  if (!brief) {
    return (
      <div className="mx-auto" style={{ maxWidth: 900 }}>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="px-6 py-10 text-center text-sm text-muted">
            No brief generated yet. Process a transcript first to auto-generate a brief.
          </div>
        </div>
      </div>
    );
  }

  const meetingTitle = result?.meetingTitle ?? "Meeting Brief";

  const updateBrief = (patch: Partial<EpicBrief>) => {
    if (!brief) return;
    setBrief({ ...brief, ...patch, editedAt: new Date().toISOString() });
  };

  const updateExperienceStep = (
    section: "currentExperience" | "desiredExperience",
    index: number,
    patch: Partial<ExperienceStep>,
  ) => {
    if (!brief) return;
    const steps = [...brief[section].steps];
    steps[index] = { ...steps[index], ...patch };
    updateBrief({ [section]: { ...brief[section], steps } });
  };

  const updateDesignPrinciple = (index: number, patch: Partial<DesignPrinciple>) => {
    if (!brief) return;
    const principles = [...brief.designPrinciples];
    principles[index] = { ...principles[index], ...patch };
    updateBrief({ designPrinciples: principles });
  };

  const updateWireframeCard = (
    cardIndex: number,
    patch: Partial<WireframeCard> & { itemIndex?: number; itemValue?: string },
  ) => {
    if (!brief) return;
    const cards = [...brief.wireframeSketch.cards];
    if (patch.title) {
      cards[cardIndex] = { ...cards[cardIndex], title: patch.title };
    } else if (patch.itemIndex !== undefined && patch.itemValue !== undefined) {
      const items = [...cards[cardIndex].items];
      items[patch.itemIndex] = patch.itemValue;
      cards[cardIndex] = { ...cards[cardIndex], items };
    }
    updateBrief({ wireframeSketch: { ...brief.wireframeSketch, cards } });
  };

  const updateOpenQuestion = (index: number, value: string) => {
    if (!brief) return;
    const questions = [...brief.openQuestions];
    questions[index] = value;
    updateBrief({ openQuestions: questions });
  };

  const handleSavePdf = () => {
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    const experienceStepsHtml = (steps: ExperienceStep[]) =>
      steps.map((step, i) => {
        const emotionBg = step.emotionColor === "red" ? "#FEE2E2" : step.emotionColor === "yellow" ? "#FEF3C7" : "#E8F0E8";
        const emotionText = step.emotionColor === "red" ? "#DC2626" : step.emotionColor === "yellow" ? "#D97706" : "#3D5A3D";
        return `<div style="flex:1;border:1px solid #E8E6E1;border-radius:8px;padding:14px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
            <span style="font-size:18px">${step.emoji}</span>
            <span style="font-size:10px;font-weight:500;color:#9B9B9B;text-transform:uppercase;letter-spacing:0.05em">Step ${i + 1}</span>
          </div>
          <div style="font-size:13px;font-weight:500;color:#1a1a1a;margin-bottom:3px">${esc(step.title)}</div>
          <p style="font-size:12px;color:#6B6B6B;line-height:1.5;margin:0 0 8px">${esc(step.description)}</p>
          <span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:${emotionBg};color:${emotionText}">${esc(step.emotionTag)}</span>
        </div>`;
      }).join("");

    const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>${esc(meetingTitle)} — Design Brief</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 40px 32px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  h1 { font-size: 22px; font-weight: 500; margin-bottom: 4px; }
  h2 { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6B6B6B; margin-bottom: 12px; }
  .meta { font-size: 12px; color: #9B9B9B; margin-bottom: 28px; }
  .badge { display: inline-block; font-size: 10px; font-weight: 500; padding: 3px 10px; border-radius: 99px; background: #E8F0E8; color: #3D5A3D; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; }
  .section { margin-bottom: 28px; }
  .persona { background: #2a2a2a; border-radius: 10px; padding: 20px; margin-bottom: 28px; }
  .persona-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #7a7a7a; margin-bottom: 14px; }
  .persona-title { font-size: 14px; font-weight: 500; color: #fff; }
  .persona-desc { font-size: 12px; color: #A0A0A0; line-height: 1.5; }
  .persona-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 14px 0; }
  .persona-card { background: #353535; border-radius: 8px; padding: 12px; }
  .persona-card-label { display: inline-block; font-size: 9px; font-weight: 600; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 5px; }
  .persona-text { font-size: 12px; color: #D0D0D0; line-height: 1.5; }
  .persona-quote { background: #353535; border-radius: 8px; padding: 14px 16px; border-left: 3px solid #555; }
  .persona-quote-text { font-size: 12px; color: #D0D0D0; font-style: italic; line-height: 1.5; }
  .persona-quote-attr { font-size: 11px; color: #7a7a7a; margin-top: 6px; }
  .exp-title { display: flex; align-items: baseline; gap: 6px; margin-bottom: 12px; }
  .exp-title-text { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  .exp-title-sub { font-size: 12px; color: #9B9B9B; }
  .exp-grid { display: flex; gap: 10px; margin-bottom: 8px; }
  .arrow { text-align: center; padding: 12px 0; color: #9B9B9B; }
  .principle { display: flex; gap: 10px; margin-bottom: 14px; }
  .principle-num { width: 22px; height: 22px; border-radius: 50%; background: #E8F0E8; color: #3D5A3D; font-size: 11px; font-weight: 500; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .principle-title { font-size: 13px; font-weight: 500; color: #1a1a1a; margin-bottom: 2px; }
  .principle-desc { font-size: 12px; color: #6B6B6B; line-height: 1.5; margin-bottom: 6px; }
  .principle-quote { font-size: 12px; color: #6B6B6B; font-style: italic; border-left: 3px solid #3D5A3D; padding-left: 10px; }
  .wireframe-grid { display: flex; gap: 10px; }
  .wireframe-card { flex: 1; border: 1px solid #E8E6E1; border-radius: 8px; padding: 14px; }
  .wireframe-title { font-size: 12px; font-weight: 500; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
  .wireframe-item { font-size: 11px; color: #6B6B6B; background: #F5F4F0; border: 1px solid #E8E6E1; border-radius: 5px; padding: 5px 8px; margin-bottom: 4px; }
  .question { display: flex; gap: 10px; margin-bottom: 10px; align-items: flex-start; }
  .question-mark { width: 22px; height: 22px; border-radius: 50%; background: #F3E8FF; color: #7C3AED; font-size: 11px; font-weight: 500; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .question-text { font-size: 12px; color: #6B6B6B; line-height: 1.5; padding-top: 2px; }
  .footer { margin-top: 28px; padding-top: 16px; border-top: 1px solid #E8E6E1; font-size: 11px; color: #9B9B9B; }
  @media print { body { padding: 20px 16px; } }
</style>
</head><body>
<div class="badge">&#10022; Design Brief</div>
<h1>${esc(meetingTitle)}</h1>
<div class="meta">Design brief &middot; Auto-generated from ${esc(brief.generatedFrom)}, ${esc(brief.generatedDate)}</div>

<div class="persona">
  <div class="persona-label">Who we heard from</div>
  <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px">
    <div style="width:36px;height:36px;border-radius:50%;background:#4a4a4a;color:#9B9B9B;display:flex;align-items:center;justify-content:center;flex-shrink:0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
    </div>
    <div>
      <div class="persona-title">${esc(brief.persona.title)}</div>
      <div class="persona-desc">${esc(brief.persona.description)}</div>
    </div>
  </div>
  <div class="persona-grid">
    <div class="persona-card">
      <div class="persona-card-label" style="background:rgba(61,90,61,0.3);color:#7CB97C">Goal</div>
      <div class="persona-text">${esc(brief.persona.goal)}</div>
    </div>
    <div class="persona-card">
      <div class="persona-card-label" style="background:rgba(220,38,38,0.2);color:#F87171">Frustration</div>
      <div class="persona-text">${esc(brief.persona.frustration)}</div>
    </div>
  </div>
  <div class="persona-quote">
    <div class="persona-quote-text">&ldquo;${esc(brief.persona.keyQuote)}&rdquo;</div>
    <div class="persona-quote-attr">&mdash; Customer, end of call</div>
  </div>
</div>

<div class="section">
  <div class="exp-title">
    <span class="exp-title-text" style="color:#D97706">Current Experience</span>
    <span class="exp-title-sub">&mdash; ${esc(brief.currentExperience.subtitle)}</span>
  </div>
  <div class="exp-grid">${experienceStepsHtml(brief.currentExperience.steps)}</div>
</div>

<div class="arrow">&darr;</div>

<div class="section">
  <div class="exp-title">
    <span class="exp-title-text" style="color:#3D5A3D">Desired Experience</span>
    <span class="exp-title-sub">&mdash; ${esc(brief.desiredExperience.subtitle)}</span>
  </div>
  <div class="exp-grid">${experienceStepsHtml(brief.desiredExperience.steps)}</div>
</div>

<div class="section">
  <h2>Design Principles <span style="font-weight:400">(from the call)</span></h2>
  ${brief.designPrinciples.map((p, i) => `<div class="principle">
    <div class="principle-num">${i + 1}</div>
    <div>
      <div class="principle-title">${esc(p.title)}</div>
      <div class="principle-desc">${esc(p.description)}</div>
      <div class="principle-quote">&ldquo;${esc(p.quote)}&rdquo;</div>
    </div>
  </div>`).join("")}
</div>

<div class="section">
  <div class="exp-title">
    <span class="exp-title-text" style="color:#6B6B6B">Wireframe Sketch</span>
    <span class="exp-title-sub">&mdash; ${esc(brief.wireframeSketch.subtitle)}</span>
  </div>
  <div class="wireframe-grid">
    ${brief.wireframeSketch.cards.map((card, i) => `<div class="wireframe-card">
      <div class="wireframe-title">
        <div style="width:18px;height:18px;border-radius:50%;background:#E8F0E8;color:#3D5A3D;font-size:9px;font-weight:500;display:flex;align-items:center;justify-content:center">${i + 1}</div>
        ${esc(card.title)}
      </div>
      ${card.items.map((item) => `<div class="wireframe-item">${esc(item)}</div>`).join("")}
    </div>`).join("")}
  </div>
</div>

<div class="section">
  <h2>Open Questions</h2>
  ${brief.openQuestions.map((q) => `<div class="question">
    <div class="question-mark">?</div>
    <div class="question-text">${esc(q)}</div>
  </div>`).join("")}
</div>

<div class="footer">Generated from <strong>${brief.sourceCount} discovery call${brief.sourceCount !== 1 ? "s" : ""}</strong>. Additional calls will refine this brief.${brief.editedAt ? ` &middot; Edited ${esc(new Date(brief.editedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }))}` : ""} &middot; Fijord</div>
</body></html>`;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Pop-up blocked — please allow pop-ups and try again");
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.addEventListener("afterprint", () => printWindow.close());
    setTimeout(() => printWindow.print(), 300);
  };

  return (
    <div className="mx-auto" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
          <span
            className="inline-flex items-center gap-1 rounded-full font-medium"
            style={{
              fontSize: 11, padding: "3px 10px", background: "#E8F0E8", color: "#3D5A3D",
              textTransform: "uppercase", letterSpacing: "0.05em",
            }}
          >
            &#10022; Design Brief
          </span>
          <span className="text-muted" style={{ fontSize: 12 }}>
            Auto-generated from transcript
          </span>
          {brief.editedAt && <EditedBadge editedAt={brief.editedAt} />}
        </div>
        <h2
          className="text-foreground"
          style={{ fontSize: 28, fontWeight: 500, marginBottom: 6, lineHeight: 1.3 }}
        >
          {meetingTitle}
        </h2>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>
          Design brief &middot; Auto-generated from {brief.generatedFrom}, {brief.generatedDate}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("Scope")}
            className="inline-flex items-center rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
          >
            View tickets
          </button>
          <button
            onClick={handleSavePdf}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-foreground"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Save as PDF
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        {/* Persona */}
        <PersonaCard
          persona={brief.persona}
          onUpdate={(patch) => updateBrief({ persona: { ...brief.persona, ...patch } })}
        />

        {/* Current Experience */}
        <ExperienceSection
          title="Current Experience"
          subtitle={brief.currentExperience.subtitle}
          steps={brief.currentExperience.steps}
          titleColor="#D97706"
          onUpdateStep={(i, patch) => updateExperienceStep("currentExperience", i, patch)}
        />
        <ArrowSeparator />
        {/* Desired Experience */}
        <ExperienceSection
          title="Desired Experience"
          subtitle={brief.desiredExperience.subtitle}
          steps={brief.desiredExperience.steps}
          titleColor="#3D5A3D"
          onUpdateStep={(i, patch) => updateExperienceStep("desiredExperience", i, patch)}
        />

        {/* Design Principles */}
        <DesignPrinciplesSection
          principles={brief.designPrinciples}
          onUpdatePrinciple={updateDesignPrinciple}
        />

        {/* Wireframe Sketch */}
        <WireframeSketchSection
          wireframe={brief.wireframeSketch}
          onUpdateCard={updateWireframeCard}
        />

        {/* Open Questions */}
        <OpenQuestionsSection
          questions={brief.openQuestions}
          onUpdateQuestion={updateOpenQuestion}
        />

        {/* Footer */}
        <div
          className="flex items-center justify-between rounded-lg"
          style={{ marginTop: 32, padding: "14px 16px", background: "#F5F4F0", border: "1px solid #E8E6E1" }}
        >
          <span className="text-muted" style={{ fontSize: 13 }}>
            Generated from <strong className="text-foreground">{brief.sourceCount} discovery call{brief.sourceCount !== 1 ? "s" : ""}</strong>. Additional calls will refine this brief.
          </span>
          <button
            onClick={() => setActiveTab("Scope")}
            className="text-muted transition-colors hover:text-foreground"
            style={{ fontSize: 13 }}
          >
            View tickets
          </button>
        </div>
      </div>
    </div>
  );
}
