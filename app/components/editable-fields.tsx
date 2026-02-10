"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

const PRIORITY_OPTIONS = [
  { value: "High", bg: "#FEF2F2", text: "#B91C1C" },
  { value: "Med", bg: "#FDF6E3", text: "#B5860B" },
  { value: "Low", bg: "#EFF6FF", text: "#1D4ED8" },
];

/* ── EditableText ─────────────────────────────────────────── */

export function EditableText({
  value,
  onChange,
  className = "",
  placeholder = "Click to edit...",
  as: Tag = "span",
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onChange(trimmed);
    else setDraft(value);
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); commit(); }
    if (e.key === "Escape") { setDraft(value); setEditing(false); }
  };

  if (editing) {
    return (
      <div>
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          className={`w-full rounded border border-accent/30 bg-transparent px-1 py-0.5 outline-none focus:ring-1 focus:ring-accent/20 ${className}`}
        />
        <div className="mt-2 flex gap-2">
          <button
            onMouseDown={(e) => { e.preventDefault(); commit(); }}
            className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-accent/90"
          >
            Save
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); setDraft(value); setEditing(false); }}
            className="rounded-md border border-border px-3 py-1 text-xs font-medium text-muted transition-colors hover:bg-background hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <Tag
      onClick={() => setEditing(true)}
      className={`group cursor-pointer rounded px-1 py-0.5 transition-colors hover:bg-[#F5F4F1] ${className}`}
    >
      {value || <span className="italic text-muted">{placeholder}</span>}
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ml-1.5 inline-block opacity-0 transition-opacity group-hover:opacity-40"
      >
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </Tag>
  );
}

/* ── EditableTextarea ─────────────────────────────────────── */

export function EditableTextarea({
  value,
  onChange,
  className = "",
  placeholder = "Click to add...",
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setDraft(value); }, [value]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [editing]);

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== value) onChange(trimmed);
    else setDraft(value);
  };

  const handleKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); commit(); }
    if (e.key === "Escape") { setDraft(value); setEditing(false); }
  };

  if (editing) {
    return (
      <div>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => { setDraft(e.target.value); autoResize(); }}
          onKeyDown={handleKey}
          rows={2}
          className={`w-full resize-none rounded border border-accent/30 bg-transparent px-1 py-0.5 outline-none focus:ring-1 focus:ring-accent/20 ${className}`}
        />
        <div className="mt-2 flex gap-2">
          <button
            onMouseDown={(e) => { e.preventDefault(); commit(); }}
            className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-accent/90"
          >
            Save
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); setDraft(value); setEditing(false); }}
            className="rounded-md border border-border px-3 py-1 text-xs font-medium text-muted transition-colors hover:bg-background hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className={`group cursor-pointer rounded px-1 py-0.5 transition-colors hover:bg-[#F5F4F1] ${className}`}
    >
      {value || <span className="italic text-muted">{placeholder}</span>}
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ml-1.5 inline-block opacity-0 transition-opacity group-hover:opacity-40"
      >
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </div>
  );
}

/* ── EditableList ─────────────────────────────────────────── */

export function EditableList({
  items,
  onChange,
  checkedItems = new Set(),
  onToggleCheck,
  placeholder = "Add an item...",
}: {
  items: string[];
  onChange: (items: string[]) => void;
  checkedItems?: Set<number>;
  onToggleCheck?: (index: number) => void;
  placeholder?: string;
}) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editingIdx !== null) inputRef.current?.focus(); }, [editingIdx]);

  const commitItem = (idx: number) => {
    const trimmed = draft.trim();
    if (trimmed) {
      const updated = [...items];
      updated[idx] = trimmed;
      onChange(updated);
    } else {
      // Empty = remove item
      onChange(items.filter((_, i) => i !== idx));
    }
    setEditingIdx(null);
    setDraft("");
  };

  const handleKey = (e: KeyboardEvent, idx: number) => {
    if (e.key === "Enter") { e.preventDefault(); commitItem(idx); }
    if (e.key === "Escape") { setEditingIdx(null); setDraft(""); }
  };

  const startEdit = (idx: number) => {
    setDraft(items[idx]);
    setEditingIdx(idx);
  };

  const addItem = () => {
    const updated = [...items, ""];
    onChange(updated);
    setDraft("");
    setEditingIdx(updated.length - 1);
  };

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <ul className="flex flex-col gap-2.5">
        {items.map((item, i) => (
          <li key={i} className="group flex items-start gap-3">
            <input
              type="checkbox"
              checked={checkedItems.has(i)}
              onChange={() => onToggleCheck?.(i)}
              className="mt-1 h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-border accent-accent"
            />
            {editingIdx === i ? (
              <div className="flex-1">
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => handleKey(e, i)}
                  className="w-full rounded border border-accent/30 bg-transparent px-1 py-0.5 text-sm leading-relaxed text-foreground outline-none focus:ring-1 focus:ring-accent/20"
                />
                <div className="mt-1.5 flex gap-2">
                  <button
                    onMouseDown={(e) => { e.preventDefault(); commitItem(i); }}
                    className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-accent/90"
                  >
                    Save
                  </button>
                  <button
                    onMouseDown={(e) => { e.preventDefault(); setEditingIdx(null); setDraft(""); }}
                    className="rounded-md border border-border px-3 py-1 text-xs font-medium text-muted transition-colors hover:bg-background hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <span
                onClick={() => startEdit(i)}
                className={`flex-1 cursor-pointer rounded px-1 py-0.5 text-sm leading-relaxed transition-colors hover:bg-[#F5F4F1] ${checkedItems.has(i) ? "text-muted line-through" : "text-foreground"}`}
              >
                {item || <span className="italic text-muted">{placeholder}</span>}
              </span>
            )}
            <button
              onClick={() => removeItem(i)}
              className="mt-0.5 shrink-0 text-muted opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={addItem}
        className="mt-3 flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add criteria
      </button>
    </div>
  );
}

/* ── EditablePriority ─────────────────────────────────────── */

export function EditablePriority({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const current = PRIORITY_OPTIONS.find((p) => p.value === value) || PRIORITY_OPTIONS[2];

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="rounded px-2 py-0.5 text-[11px] font-semibold uppercase transition-opacity hover:opacity-80"
        style={{ backgroundColor: current.bg, color: current.text }}
      >
        {current.value}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          {PRIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-background"
            >
              <span
                className="inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                style={{ backgroundColor: opt.bg, color: opt.text }}
              >
                {opt.value}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
