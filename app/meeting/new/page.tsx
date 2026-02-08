"use client";

import Link from "next/link";
import { useState, useCallback } from "react";

export default function NewMeeting() {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    // TODO: handle file upload
  }, []);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <span className="text-foreground">New meeting</span>
      </nav>

      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-foreground">
          Process a product conversation
        </h1>
        <p className="mt-2 text-sm text-muted">
          Record a meeting or upload a transcript to extract issues, evidence,
          and suggested work.
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center">
        {/* Record button */}
        <button className="flex items-center gap-2.5 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-foreground/90">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="4" fill="#EF4444" />
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Record using Granola
        </button>

        {/* Divider */}
        <div className="my-6 flex w-full items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Drop zone */}
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
            isDragOver
              ? "border-accent bg-accent/5"
              : "border-accent/40 hover:border-accent hover:bg-accent/5"
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5 12.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V12.5" stroke="#3D5A3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14.1667 6.66667L10 2.5L5.83334 6.66667" stroke="#3D5A3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 2.5V12.5" stroke="#3D5A3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">
            Drop a transcript or document here
          </p>
          <p className="mt-1 text-xs text-muted">
            Supports .txt, .md, .pdf, .docx
          </p>
          <input type="file" className="hidden" accept=".txt,.md,.pdf,.docx" />
        </label>
      </div>
    </div>
  );
}
