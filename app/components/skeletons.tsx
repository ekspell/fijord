"use client";

function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-border ${className ?? ""}`}
      style={style}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card" style={{ padding: 20 }}>
      <div className="mb-3 flex items-center justify-between">
        <Shimmer style={{ width: 180, height: 18 }} />
        <Shimmer style={{ width: 60, height: 20 }} className="rounded-md" />
      </div>
      <Shimmer style={{ width: "100%", height: 14, marginBottom: 6 }} />
      <Shimmer style={{ width: "70%", height: 14, marginBottom: 16 }} />
      <div className="flex gap-4">
        <Shimmer style={{ width: 80, height: 12 }} />
        <Shimmer style={{ width: 80, height: 12 }} />
        <Shimmer style={{ width: 80, height: 12 }} />
      </div>
    </div>
  );
}

export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="flex gap-6 rounded-xl border border-border bg-card" style={{ padding: "16px 20px" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <Shimmer style={{ width: 24, height: 16 }} />
          <Shimmer style={{ width: 50, height: 14 }} />
        </div>
      ))}
    </div>
  );
}

export function BriefSkeleton() {
  return (
    <div>
      <div className="mb-8">
        <Shimmer style={{ width: 100, height: 20, marginBottom: 12 }} className="rounded-full" />
        <Shimmer style={{ width: "60%", height: 22, marginBottom: 4 }} />
        <Shimmer style={{ width: "40%", height: 13 }} />
      </div>
      <div className="rounded-xl" style={{ background: "#2a2a2a", padding: 24, marginBottom: 32 }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
          <Shimmer style={{ width: 40, height: 40, background: "#4a4a4a" }} className="rounded-full" />
          <div>
            <Shimmer style={{ width: 160, height: 15, background: "#4a4a4a", marginBottom: 4 }} />
            <Shimmer style={{ width: 240, height: 13, background: "#4a4a4a" }} />
          </div>
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <Shimmer key={i} style={{ width: "100%", height: 80, marginBottom: 12 }} className="rounded-lg" />
      ))}
    </div>
  );
}

export function TranscriptSkeleton() {
  return (
    <div className="flex flex-col gap-4" style={{ padding: 24 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i}>
          <Shimmer style={{ width: 60, height: 12, marginBottom: 6 }} />
          <Shimmer style={{ width: `${60 + Math.random() * 40}%`, height: 14 }} />
        </div>
      ))}
    </div>
  );
}
