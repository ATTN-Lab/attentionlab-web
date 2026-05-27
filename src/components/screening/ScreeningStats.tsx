"use client";

interface StatCardProps {
  value: string;
  label: string;
  sub?: string;
  gradient?: boolean;
}

function StatCard({ value, label, sub, gradient }: StatCardProps) {
  return (
    <div>
      <div
        className={`text-3xl md:text-4xl font-bold ${
          gradient
            ? "bg-gradient-to-r from-[#9d5cff] to-[#5ce5e5] bg-clip-text text-transparent"
            : "text-gray-900"
        }`}
      >
        {value}
      </div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

interface ScreeningStatsProps {
  summary: {
    total_compounds: number;
    p_bbb: {
      mean: number;
      median: number;
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
      mw_median: number;
      logp_mean: number;
      tpsa_mean: number;
    };
    scaffolds: {
      unique_murcko: number | null;
      unique_generic: number | null;
    };
    clusters: {
      n_clusters: number | null;
    };
    by_provenance: Record<string, number>;
  } | null;
}

export default function ScreeningStats({ summary }: ScreeningStatsProps) {
  if (!summary) return null;

  const compact = (n: number) => {
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)} B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)} M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)} K`;
    return n.toLocaleString();
  };
  const pct = (n: number, total: number) =>
    `${((n / total) * 100).toFixed(1)}%`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
      <StatCard
        value={compact(summary.total_compounds)}
        label="Compounds screened"
        gradient
      />
      <StatCard
        value={compact(summary.p_bbb.hits_098)}
        label="BBB+ hits"
        sub={pct(summary.p_bbb.hits_098, summary.total_compounds)}
      />
      <StatCard
        value={summary.scaffolds.unique_murcko != null ? compact(summary.scaffolds.unique_murcko) : "--"}
        label="Unique scaffolds"
      />
      <StatCard
        value={summary.clusters.n_clusters?.toLocaleString() ?? "--"}
        label="Chemical clusters"
      />
      <StatCard
        value={summary.p_bbb.median.toFixed(3)}
        label="Median P(BBB)"
      />
      <StatCard
        value={summary.cns_mpo.median.toFixed(2)}
        label="Median CNS-MPO"
      />
      <StatCard
        value={`${summary.properties.mw_median.toFixed(0)} Da`}
        label="Median MW"
      />
      <StatCard
        value={Object.keys(summary.by_provenance).length.toString()}
        label="Data sources"
        sub={Object.entries(summary.by_provenance)
          .map(([k, v]) => `${k.replace("_", " ")}: ${compact(v)}`)
          .join(" · ")}
      />
    </div>
  );
}
