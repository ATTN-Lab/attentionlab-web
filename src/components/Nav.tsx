"use client";

import type { ViewState } from "./types";

interface NavProps {
  view: ViewState;
  onChange: (v: ViewState) => void;
  visible: boolean;
}

const OPTIONS: { key: ViewState; label: string }[] = [
  { key: "labs", label: "Labs" },
  { key: "bio", label: "Bio" },
  { key: "ai", label: "AI" },
];

export default function Nav({ view, onChange, visible }: NavProps) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200 transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        <div className="font-bold tracking-tight text-base sm:text-lg shrink-0">
          <span className="hidden sm:inline">Attention Labs</span>
          <span className="sm:hidden">ATTN</span>
        </div>
        <div className="flex items-center bg-gray-100 rounded-full p-1">
          {OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onChange(opt.key)}
              className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-full transition-colors ${
                view === opt.key
                  ? "bg-black text-white"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <a
            href="#team"
            className="text-xs sm:text-sm text-gray-600 hover:text-black"
          >
            Team
          </a>
          <a
            href="mailto:temi@attentionlab.ai"
            className="text-xs sm:text-sm text-gray-600 hover:text-black"
          >
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
}
