"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ScreeningStats from "@/components/screening/ScreeningStats";

const PointCloudViewer = dynamic(
  () => import("@/components/screening/PointCloudViewer"),
  { ssr: false }
);

const BBBNukeHero = dynamic(
  () => import("@/components/BBBNukeHero"),
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
    hits_098: number;
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

export default function ScreeningContent() {
  const [summary, setSummary] = useState<EdaSummary | null>(null);

  useEffect(() => {
    fetch("/screening/eda_summary.json")
      .then((r) => r.json())
      .then(setSummary)
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-6">
        <div className="text-xs uppercase tracking-[0.2em] text-gray-700 font-semibold mb-3">
          BBB-Nuke
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          1 Billion Compounds.
        </h1>
        <p className="text-xl md:text-2xl font-semibold text-gray-900 max-w-4xl mb-4 leading-snug">
          Largest BBB dataset powered by BBB-Nuke.
        </p>
        <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mb-8">
          We screened 1 billion small molecules from Enamine REAL, PubChem,
          and ZINC for BBB penetration. Every compound was scored for physicochemical properties, pKa,
          CNS-MPO, efflux transporter liability, and final P(BBB). The
          full dataset is{" "}
          <a
            href="https://huggingface.co/datasets/ATTN-Lab/bbbnuke-screening-1B"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-black transition-colors"
          >
            open-sourced on Hugging Face
          </a>
          . The interactive map below shows ~460,000 representative compounds
          projected into chemical space via UMAP, colored by the metric of
          your choice.
        </p>
      </div>

      {/* Stats section */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="text-xs uppercase tracking-[0.2em] text-gray-700 font-semibold mb-6">
          Results at a Glance
        </div>
        <ScreeningStats summary={summary} />
      </div>

      {/* 3D Viewer — full-bleed, dark */}
      <div className="w-full h-[70vh] md:h-[80vh] relative">
        <PointCloudViewer basePath="/screening" />
      </div>

      {/* The Screen */}
      <div className="bg-[#0a0a0f] text-white">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-xs uppercase tracking-[0.3em] text-gray-500 font-semibold mb-4">
            The Screen
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            One billion molecules.<br />
            <span className="bg-gradient-to-r from-[#9d5cff] to-[#5ce5e5] bg-clip-text text-transparent">
              Every single one scored.
            </span>
          </h2>

          {/* Narrative blocks — asymmetric layout */}
          <div className="grid md:grid-cols-12 gap-y-16 md:gap-x-8 mt-20">
            {/* Left column — the scale */}
            <div className="md:col-span-5 md:col-start-1">
              <div className="text-6xl md:text-8xl font-black text-white/[0.04] leading-none mb-4 select-none">
                10<sup>9</sup>
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Three libraries. One unified screen.
              </h3>
              <p className="text-gray-400 leading-relaxed mb-8">
                We pulled from the three largest publicly accessible
                chemical repositories — Enamine REAL, ZINC, and PubChem —
                spanning make-on-demand, commercially available, and bioactive
                chemical space. Together they represent the broadest
                drug-relevant molecular diversity available today.
              </p>
              <div className="space-y-4">
                {[
                  { name: "ZINC", count: "779M", bar: "76%" },
                  { name: "Enamine REAL", count: "182M", bar: "18%" },
                  { name: "PubChem", count: "62M", bar: "6%" },
                ].map((src) => (
                  <div key={src.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300 font-medium">{src.name}</span>
                      <span className="text-gray-500">{src.count}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#9d5cff] to-[#5ce5e5]"
                        style={{ width: src.bar }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column — the process */}
            <div className="md:col-span-6 md:col-start-7 space-y-12">
              <div>
                <div className="w-10 h-[2px] bg-gradient-to-r from-[#9d5cff] to-[#5ce5e5] mb-4" />
                <h3 className="text-xl font-bold mb-3">
                  Streaming at scale
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  GPU workers ran batched graph neural network inference for
                  pKa prediction while CPU workers handled standardization,
                  physicochemical descriptors, CNS-MPO scoring, and efflux
                  transporter classification in parallel. The architecture
                  was designed to saturate every available core — no molecule
                  waits in a queue.
                </p>
              </div>

              <div>
                <div className="w-10 h-[2px] bg-gradient-to-r from-[#9d5cff] to-[#5ce5e5] mb-4" />
                <h3 className="text-xl font-bold mb-3">
                  58 million scaffolds
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Murcko decomposition extracted the core scaffold from every
                  hit, revealing 58.6 million unique molecular frameworks and
                  4.5 million generic scaffolds. This is the structural
                  vocabulary of brain-penetrant chemistry — and most of it
                  has never been synthesized.
                </p>
              </div>

              <div>
                <div className="w-10 h-[2px] bg-gradient-to-r from-[#9d5cff] to-[#5ce5e5] mb-4" />
                <h3 className="text-xl font-bold mb-3">
                  Mapped into chemical space
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  We generated 2048-bit Morgan fingerprints for every compound,
                  reduced them to 50 dimensions via PCA, and clustered into
                  1,000 chemical neighborhoods via K-Means. UMAP then projected
                  a stratified sample into the 2D and 3D coordinates you see
                  in the interactive map above — each point is a real
                  molecule, positioned by its structural similarity to its
                  neighbors.
                </p>
              </div>
            </div>
          </div>

          {/* Open dataset */}
          <div className="mt-24 pt-12 border-t border-white/10">
            <div className="grid md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-5">
                <div className="text-xs uppercase tracking-[0.3em] text-gray-500 font-semibold mb-4">
                  Open Dataset
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  All 1B results.<br />
                  <span className="text-gray-500">Publicly available.</span>
                </h3>
                <p className="text-gray-400 leading-relaxed mb-6">
                  The complete screening results are published as a Parquet
                  dataset on Hugging Face — every compound, every score, every
                  efflux prediction. Stream it directly into your analysis
                  pipeline or download the full archive.
                </p>
                <a
                  href="https://huggingface.co/datasets/ATTN-Lab/bbbnuke-screening-1B"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 120 120" fill="none">
                    <path
                      d="M60 12C33.5 12 12 33.5 12 60s21.5 48 48 48 48-21.5 48-48S86.5 12 60 12z"
                      fill="currentColor"
                      opacity="0.1"
                    />
                    <path
                      d="M39.5 70c0-5.5 4.5-10 10-10s10 4.5 10 10m2 0c0-5.5 4.5-10 10-10s10 4.5 10 10"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    <circle cx="44" cy="48" r="4" fill="currentColor" />
                    <circle cx="76" cy="48" r="4" fill="currentColor" />
                  </svg>
                  View on Hugging Face
                </a>
              </div>

              <div className="md:col-span-6 md:col-start-7">
                <div className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#5ce5e5]" />
                    <span className="text-xs text-gray-400 font-mono">
                      schema — 26 columns per compound
                    </span>
                  </div>
                  <div className="p-5 space-y-3 text-sm font-mono">
                    {[
                      { group: "Identity", cols: "compound_id, smiles_input, smiles_standardized, source, provenance" },
                      { group: "Properties", cols: "mw, logp, tpsa, hbd, hba, heavy_atoms, fsp3" },
                      { group: "pKa & MPO", cols: "pka_representative, cns_mpo_score, passed_mpo_filter" },
                      { group: "Efflux", cols: "efflux_MDR1, efflux_ABCG2, efflux_MRP1, efflux_MRP2, efflux_MRP4, efflux_MATE1, efflux_OAT3" },
                      { group: "Score", cols: "p_bbb, score_total, heuristic_reason, heuristic_veto" },
                    ].map((row) => (
                      <div key={row.group}>
                        <div className="text-[#5ce5e5] text-xs mb-1">
                          {row.group}
                        </div>
                        <div className="text-gray-500 text-xs leading-relaxed">
                          {row.cols}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline — compact inline strip */}
          <div className="mt-24 pt-12 border-t border-white/10">
            <div className="text-xs uppercase tracking-[0.3em] text-gray-500 font-semibold mb-6">
              Pipeline
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {[
                "Standardize",
                "Properties",
                "pKa",
                "CNS-MPO",
                "Efflux",
                "Classifier",
                "P(BBB)",
              ].map((step, i, arr) => (
                <span key={step} className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      i === arr.length - 1
                        ? "bg-gradient-to-r from-[#9d5cff] to-[#5ce5e5] text-white"
                        : "bg-white/5 text-gray-400"
                    }`}
                  >
                    {step}
                  </span>
                  {i < arr.length - 1 && (
                    <svg
                      className="w-3 h-3 text-white/20 shrink-0"
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
      </div>

      {/* Animated graphical abstract */}
      <div className="relative w-full">
        <BBBNukeHero src="/bbb-nuke-hero.html" />
      </div>
    </>
  );
}
