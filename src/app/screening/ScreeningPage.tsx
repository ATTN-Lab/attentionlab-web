"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const ScreeningContent = dynamic(
  () => import("@/components/screening/ScreeningContent"),
  { ssr: false }
);

export default function ScreeningPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Back link */}
      <div className="max-w-6xl mx-auto px-6 pt-10">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-black inline-flex items-center gap-1 mb-8"
        >
          ← Back to Attention Labs
        </Link>
      </div>

      <ScreeningContent />

      {/* CTA */}
      <div className="border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Run BBB-Nuke on your compounds.
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Score any molecule for blood-brain barrier penetration. Available
            as a REST API, MCP server for Claude, or on-premise enterprise
            deployment.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:temi@attentionlab.ai?subject=BBB-Nuke%20API%20Access"
              className="px-6 py-3 rounded-full bg-[#3E317D] text-white font-semibold hover:bg-[#2e245e] transition-colors"
            >
              Get API Access
            </a>
            <a
              href="/mcp"
              className="px-6 py-3 rounded-full border-2 border-[#3E317D] text-[#3E317D] font-semibold hover:bg-[#3E317D] hover:text-white transition-colors"
            >
              Use with Claude
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 text-center text-sm text-gray-500">
        <a href="mailto:temi@attentionlab.ai" className="hover:text-black">
          Contact
        </a>
        <span className="mx-3">·</span>
        <a
          href="https://x.com/attentionlabsAI"
          className="hover:text-black"
          target="_blank"
          rel="noopener noreferrer"
        >
          X
        </a>
        <span className="mx-3">·</span>
        <a
          href="https://linkedin.com/company/attention-labs-ai"
          className="hover:text-black"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
        <span className="mx-3">·</span>
        <a
          href="https://github.com/ATTN-Lab"
          className="hover:text-black"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <span className="mx-3">·</span>
        <span>© 2026 Attention Labs</span>
      </footer>
    </main>
  );
}
