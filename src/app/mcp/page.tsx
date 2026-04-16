import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BBB-Nuke with Claude",
  description:
    "Set up BBB-Nuke as an MCP server in Claude Desktop or Claude Code. Score molecules for blood-brain barrier penetration directly in conversation.",
};

const CONFIG_DESKTOP = `{
  "mcpServers": {
    "bbnuke": {
      "type": "url",
      "url": "https://mcp.attentionlab.ai/mcp"
    }
  }
}`;

const CLAUDE_CODE_CMD = `claude mcp add bbnuke --transport http https://mcp.attentionlab.ai/mcp`;

const EXAMPLE_PROMPTS = [
  "Score the molecule CN1CCC[C@H]1c1cccnc1 for blood-brain barrier penetration.",
  "Here are 20 SMILES from my ADHD analog series. Screen them with BBB-Nuke and flag anything that looks like an efflux liability.",
  "Compare CNS-MPO vs BBB-Nuke scores for this compound and explain the difference.",
  "Draft three analogs of this lead that improve the BBB-Nuke score without losing the core scaffold.",
];

export default function MCPPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-black inline-flex items-center gap-1 mb-10"
        >
          ← Back to Attention Labs
        </Link>

        <div className="text-xs uppercase tracking-[0.2em] text-gray-700 font-semibold mb-3">
          BBB-Nuke × Claude
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Use BBB-Nuke with Claude.
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-12">
          BBB-Nuke ships as a Model Context Protocol server, which means Claude
          can call it as a native tool inside any conversation. Paste a SMILES,
          upload a CSV, or describe an analog series, and Claude reasons over
          the scores, flags efflux liabilities, and drafts the next round — all
          without leaving the chat.
        </p>

        {/* Requirements */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            What you&apos;ll need.
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex gap-3">
              <span className="text-[#3E317D] font-bold">·</span>
              <span>
                <a
                  href="https://claude.ai/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3E317D] hover:text-[#2e245e] underline underline-offset-2"
                >
                  Claude Desktop
                </a>{" "}
                or{" "}
                <a
                  href="https://claude.com/product/claude-code"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3E317D] hover:text-[#2e245e] underline underline-offset-2"
                >
                  Claude Code
                </a>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#3E317D] font-bold">·</span>
              <span>Node.js 18 or later (for the MCP bridge)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#3E317D] font-bold">·</span>
              <span>
                A BBB-Nuke API key —{" "}
                <a
                  href="mailto:temi@attentionlab.ai?subject=BBB-Nuke%20API%20Access"
                  className="text-[#3E317D] hover:text-[#2e245e] underline underline-offset-2"
                >
                  request one
                </a>
              </span>
            </li>
          </ul>
        </section>

        {/* Install — Claude Code */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Claude Code (one-liner).
          </h2>
          <p className="text-gray-600 mb-5">
            Run this in your terminal and you&apos;re done. Claude Code picks
            up the server on its next session.
          </p>
          <pre className="bg-gray-900 text-gray-100 text-sm rounded-xl p-5 overflow-x-auto">
            <code>{CLAUDE_CODE_CMD}</code>
          </pre>
        </section>

        {/* Install — Claude Desktop */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Claude Desktop (config file).
          </h2>
          <p className="text-gray-600 mb-5">
            Open Claude Desktop → Settings → Developer → Edit Config, and add
            the <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">bbb-nuke</code>{" "}
            entry under <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">mcpServers</code>:
          </p>
          <pre className="bg-gray-900 text-gray-100 text-sm rounded-xl p-5 overflow-x-auto">
            <code>{CONFIG_DESKTOP}</code>
          </pre>
          <p className="text-sm text-gray-500 mt-4">
            The config file lives at{" "}
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
              ~/Library/Application Support/Claude/claude_desktop_config.json
            </code>{" "}
            on macOS and{" "}
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
              %APPDATA%\Claude\claude_desktop_config.json
            </code>{" "}
            on Windows. Restart Claude Desktop after saving.
          </p>
        </section>

        {/* Verify */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Verify the server is live.
          </h2>
          <p className="text-gray-600 mb-5">
            Start a new Claude chat and ask:
          </p>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-gray-800 italic">
            &ldquo;What MCP tools do you have available from bbb-nuke?&rdquo;
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Claude should list the BBB-Nuke scoring tools. If nothing shows up,
            jump to Troubleshooting.
          </p>
        </section>

        {/* Example prompts */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Try these prompts.
          </h2>
          <div className="space-y-3">
            {EXAMPLE_PROMPTS.map((p) => (
              <div
                key={p}
                className="rounded-xl border border-gray-200 p-5 text-gray-700 hover:border-[#3E317D] transition-colors"
              >
                {p}
              </div>
            ))}
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Troubleshooting.
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Claude doesn&apos;t see the bbb-nuke tools.
              </h3>
              <p className="text-gray-600 text-sm">
                Fully quit and relaunch Claude Desktop. On Claude Code, run{" "}
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                  claude mcp list
                </code>{" "}
                to confirm the server is registered.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                401 / invalid API key.
              </h3>
              <p className="text-gray-600 text-sm">
                Double-check that{" "}
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                  BBB_NUKE_API_KEY
                </code>{" "}
                is set in the server&apos;s env block (not in your shell). Keys
                are issued per-account and are not interchangeable between dev
                and prod.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Rate limited.
              </h3>
              <p className="text-gray-600 text-sm">
                Default accounts are capped at 1,000 compounds per 24 hours. If
                you need higher throughput or a dedicated quota, contact us
                about Enterprise.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Something else.
              </h3>
              <p className="text-gray-600 text-sm">
                Email{" "}
                <a
                  href="mailto:temi@attentionlab.ai?subject=BBB-Nuke%20MCP%20Support"
                  className="text-[#3E317D] hover:text-[#2e245e] underline underline-offset-2"
                >
                  temi@attentionlab.ai
                </a>{" "}
                with the error and your client (Desktop or Code).
              </p>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="pt-10 border-t border-gray-200">
          <p className="text-gray-600 mb-4">
            Need API access, higher throughput, or an on-prem deployment?
          </p>
          <a
            href="mailto:temi@attentionlab.ai?subject=BBB-Nuke%20Access"
            className="inline-block px-6 py-3 rounded-full bg-[#3E317D] text-white font-semibold hover:bg-[#2e245e] transition-colors"
          >
            temi@attentionlab.ai
          </a>
        </section>
      </div>
    </main>
  );
}
