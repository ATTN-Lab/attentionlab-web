"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import ScreeningStats from "@/components/screening/ScreeningStats";

const PointCloudViewer = dynamic(
  () => import("@/components/screening/PointCloudViewer"),
  { ssr: false }
);

interface EdaSummary {
  total_compounds: number;
  p_bbb: {
    mean: number;
    median: number;
    std: number;
    hits_05: number;
    hits_07: number;
    hits_09: number;
  };
  cns_mpo: {
    mean: number;
    median: number;
    passed_filter: number | null;
  };
  properties: {
    mw_mean: number;
    logp_mean: number;
    tpsa_mean: number;
    hbd_mean: number;
    hba_mean: number;
  };
  scaffolds: {
    unique_murcko: number | null;
    unique_generic: number | null;
  };
  clusters: {
    n_clusters: number | null;
  };
  by_provenance: Record<string, number>;
}

export default function ScreeningPage() {
  const [summary, setSummary] = useState<EdaSummary | null>(null);

  useEffect(() => {
    fetch("/screening/eda_summary.json")
      .then((r) => r.json())
      .then(setSummary)
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-6">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-black inline-flex items-center gap-1 mb-8"
        >
          ← Back to Attention Labs
        </Link>

        <div className="text-xs uppercase tracking-[0.2em] text-gray-700 font-semibold mb-3">
          BBB-Nuke
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          1 Billion Compounds.
        </h1>
        <p className="text-xl md:text-2xl font-semibold text-gray-900 max-w-4xl mb-4 leading-snug">
          The largest blood-brain barrier permeability screen ever conducted,
          powered by BBB-Nuke v0.12.0.
        </p>
        <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mb-8">
          We screened 1 billion small molecules from Enamine REAL, PubChem,
          and proprietary libraries for BBB penetration using 8 NVIDIA A100
          GPUs. Every compound was scored for physicochemical properties, pKa,
          CNS-MPO, efflux transporter liability, and final P(BBB). The
          interactive map below shows ~460,000 representative compounds
          projected into chemical space via UMAP, colored by the metric of
          your choice.
        </p>
      </div>

      {/* 3D Viewer — full-bleed, dark */}
      <div className="w-full h-[70vh] md:h-[80vh] relative">
        <PointCloudViewer basePath="/screening" />
      </div>

      {/* Stats section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-xs uppercase tracking-[0.2em] text-gray-700 font-semibold mb-6">
          Results at a Glance
        </div>
        <ScreeningStats summary={summary} />
      </div>

      {/* Methods */}
      <div className="border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-700 font-semibold mb-3">
            Methods
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
            How we screened a billion molecules.
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
              <p>
                The screen ran on a Standard_ND96amsr_A100_v4 instance on
                Azure ML — 8 NVIDIA A100 80GB GPUs, 96 CPU cores, and 900GB
                of system RAM. The BBB-Nuke v0.12.0 pipeline was deployed as a
                streaming architecture: 8 GPU workers running batched GCN
                inference for pKa prediction, and 48 CPU workers handling
                standardization, physicochemical properties, CNS-MPO, and
                efflux RF classifiers in parallel.
              </p>
              <p>
                Compounds were drawn from three sources: Enamine REAL
                (make-on-demand chemical space), PubChem (public bioactive
                compounds), and existing proprietary libraries. Each compound
                was standardized via RDKit, scored for 10 physicochemical
                properties, passed through a graph convolutional network for
                pKa prediction, evaluated by 7 efflux transporter RF
                classifiers, and assigned a final P(BBB) by the v5 gradient
                boosting classifier.
              </p>
            </div>

            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
              <p>
                Post-screening analysis included Murcko scaffold decomposition
                to identify core chemical scaffolds, Morgan/ECFP4 fingerprint
                generation for structural similarity, and GPU-accelerated
                clustering via RAPIDS cuML (MiniBatch K-Means with k=1,000
                clusters and HDBSCAN for fine-grained sub-structure).
              </p>
              <p>
                The 3D visualization above uses UMAP (Uniform Manifold
                Approximation and Projection) to project the 2048-dimensional
                fingerprint space into 2D and 3D coordinates. A stratified
                subsample of 500,000 compounds — enriched for high-scoring
                hits and structurally diverse cluster representatives — is
                rendered via WebGL for interactive exploration.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline diagram */}
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-700 font-semibold mb-6">
            Pipeline
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {[
              "Standardize",
              "Properties (10)",
              "pKa (GCN)",
              "CNS-MPO",
              "Efflux (7 RF)",
              "Classifier v5",
              "P(BBB)",
            ].map((step, i, arr) => (
              <span key={step} className="flex items-center gap-3">
                <span
                  className={`px-4 py-2 rounded-lg font-medium ${
                    i === arr.length - 1
                      ? "bg-gradient-to-r from-[#9d5cff] to-[#5ce5e5] text-white"
                      : "bg-white border border-gray-200 text-gray-700"
                  }`}
                >
                  {step}
                </span>
                {i < arr.length - 1 && (
                  <svg
                    className="w-4 h-4 text-gray-300 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

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
