"use client";

export function EditedBadge({ editedAt }: { editedAt: string }) {
  const date = new Date(editedAt);
  const now = new Date();
  const sameYear = date.getFullYear() === now.getFullYear();

  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-border font-medium text-muted"
      style={{ fontSize: 11, padding: "2px 8px" }}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
      Edited {formatted}
    </span>
  );
}
