"use client";

import { useEffect, useRef, useState } from "react";
import type { ViewState } from "./types";

const SectionShell = ({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) => (
  <section className="py-20 border-b border-gray-100">
    <div className="max-w-5xl mx-auto px-6">
      {eyebrow && (
        <div className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-3">
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
        {title}
      </h2>
      <div className="text-gray-600 text-lg leading-relaxed max-w-3xl">
        {children}
      </div>
    </div>
  </section>
);

interface BenchmarkRow {
  name: string;
  value: number;
  highlight?: boolean;
}

const BenchmarkChart = ({
  title,
  yLabel,
  rows,
  yMin = 0,
  yMax = 1,
  yTicks = 5,
  format,
}: {
  title: string;
  yLabel: string;
  rows: BenchmarkRow[];
  yMin?: number;
  yMax?: number;
  yTicks?: number;
  format: (v: number) => string;
}) => {
  // Chart geometry
  const W = 440;
  const H = 300;
  const M = { top: 30, right: 20, bottom: 60, left: 60 };
  const plotW = W - M.left - M.right;
  const plotH = H - M.top - M.bottom;

  const barCount = rows.length;
  const bandW = plotW / barCount;
  const barW = bandW * 0.55;

  const yScale = (v: number) =>
    M.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = yMin + ((yMax - yMin) * i) / yTicks;
    return { v, y: yScale(v) };
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setAnimated(true);
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={containerRef}>
      <div className="text-sm font-semibold text-gray-900 text-center mb-2">
        {title}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        fontFamily="var(--font-inter), sans-serif"
      >
        {/* Y-axis label (rotated) */}
        <text
          x={18}
          y={M.top + plotH / 2}
          transform={`rotate(-90 18 ${M.top + plotH / 2})`}
          textAnchor="middle"
          fontSize={12}
          fill="#374151"
        >
          {yLabel}
        </text>

        {/* Y gridlines + ticks + labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={M.left}
              x2={M.left + plotW}
              y1={t.y}
              y2={t.y}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
            <line
              x1={M.left - 4}
              x2={M.left}
              y1={t.y}
              y2={t.y}
              stroke="#6b7280"
              strokeWidth={1}
            />
            <text
              x={M.left - 8}
              y={t.y + 4}
              textAnchor="end"
              fontSize={11}
              fill="#6b7280"
            >
              {format(t.v)}
            </text>
          </g>
        ))}

        {/* Axes */}
        <line
          x1={M.left}
          x2={M.left}
          y1={M.top}
          y2={M.top + plotH}
          stroke="#374151"
          strokeWidth={1.5}
        />
        <line
          x1={M.left}
          x2={M.left + plotW}
          y1={M.top + plotH}
          y2={M.top + plotH}
          stroke="#374151"
          strokeWidth={1.5}
        />

        {/* Gradient for highlighted bar */}
        <defs>
          <linearGradient id={`barGrad-${title}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9d5cff" />
            <stop offset="100%" stopColor="#3E317D" />
          </linearGradient>
        </defs>

        {/* Bars */}
        {rows.map((r, i) => {
          const cx = M.left + bandW * (i + 0.5);
          const bx = cx - barW / 2;
          const targetY = yScale(r.value);
          const targetH = M.top + plotH - targetY;
          const baselineY = M.top + plotH;
          const by = animated ? targetY : baselineY;
          const bh = animated ? targetH : 0;
          const labelY = animated ? targetY - 6 : baselineY - 6;
          const delay = 0.1 + i * 0.12;
          const transition = `y 900ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, height 900ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`;
          return (
            <g key={r.name}>
              <rect
                x={bx}
                y={by}
                width={barW}
                height={bh}
                fill={r.highlight ? `url(#barGrad-${title})` : "#d1d5db"}
                rx={2}
                style={{ transition }}
              />
              {/* Value label above bar */}
              <text
                x={cx}
                y={labelY}
                textAnchor="middle"
                fontSize={11}
                fontWeight={r.highlight ? 700 : 500}
                fill={r.highlight ? "#3E317D" : "#4b5563"}
                opacity={animated ? 1 : 0}
                style={{
                  transition: `y 900ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, opacity 400ms ease ${delay + 0.6}s`,
                }}
              >
                {format(r.value)}
              </text>
              {/* X-axis label */}
              <text
                x={cx}
                y={M.top + plotH + 18}
                textAnchor="middle"
                fontSize={11}
                fontWeight={r.highlight ? 700 : 400}
                fill={r.highlight ? "#111827" : "#6b7280"}
              >
                {r.name}
              </text>
            </g>
          );
        })}

        {/* X-axis label */}
        <text
          x={M.left + plotW / 2}
          y={H - 8}
          textAnchor="middle"
          fontSize={12}
          fill="#374151"
        >
          Model
        </text>
      </svg>
    </div>
  );
};

const Placeholder = ({ h = 120 }: { h?: number }) => (
  <div
    className="mt-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-300 text-sm"
    style={{ height: h }}
  >
    placeholder
  </div>
);

function LabsView({
  onChangeView,
}: {
  onChangeView: (v: ViewState) => void;
}) {
  return (
    <>
      <SectionShell eyebrow="North Star" title="Enhance human intelligence.">
        The human mind is the last great frontier. We build the AI to
        discover the drugs that expand what it can do. We leverage AI to
        unlock discoveries essential to addressing unmet need in brain
        disorders, pushing the boundaries of human capacity and experience.
      </SectionShell>

      <section className="py-20 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-10">
            Two trajectories. One mission.
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Attention Bio */}
            <div className="group relative rounded-2xl p-[2px] bg-gradient-to-r from-[#9d5cff]/40 to-[#5ce5e5]/40 hover:from-[#9d5cff] hover:to-[#5ce5e5] active:from-[#9d5cff] active:to-[#5ce5e5] transition-all duration-300">
              <div className="h-full p-8 rounded-[14px] bg-white">
                <div className="text-xs uppercase tracking-[0.2em] text-gray-700 font-semibold mb-2">
                  Attention Bio
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  Drug therapies for the mind.
                </h3>
                <p className="text-gray-600 mb-6">
                  We design drug therapies for the hardest problems in the brain,
                  from ADHD in childhood to cognitive decline in old age.
                </p>
                <button
                  onClick={() => onChangeView("bio")}
                  className="text-sm font-semibold text-[#3E317D] hover:text-[#2e245e]"
                >
                  Explore →
                </button>
              </div>
            </div>

            {/* Attention AI */}
            <div className="group relative rounded-2xl p-[2px] bg-gradient-to-r from-[#9d5cff]/40 to-[#5ce5e5]/40 hover:from-[#9d5cff] hover:to-[#5ce5e5] active:from-[#9d5cff] active:to-[#5ce5e5] transition-all duration-300">
              <div className="h-full p-8 rounded-[14px] bg-white">
                <div className="text-xs uppercase tracking-[0.2em] text-gray-700 font-semibold mb-2">
                  Attention AI
                </div>
                <h3 className="text-2xl font-bold mb-3">AI for the brain.</h3>
                <p className="text-gray-600 mb-6">
                  We build the models that find what others can&apos;t. Molecules
                  that cross the blood-brain barrier, and the biology that decides
                  whether they work.
                </p>
                <button
                  onClick={() => onChangeView("ai")}
                  className="text-sm font-semibold text-[#3E317D] hover:text-[#2e245e]"
                >
                  Explore →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Try BBB-Nuke */}
      <section className="py-24 border-b border-gray-100 bg-gradient-to-br from-[#faf7ff] to-[#f0fbfb]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-700 font-semibold mb-3">
            Our Platform
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            BBB-Nuke.
          </h2>
          <p className="text-xl md:text-2xl font-semibold text-gray-900 max-w-3xl mb-6 leading-snug">
            The state-of-the-art AI platform for facilitating the design of
            drugs that reach the brain. Built in-house. 30% more accurate than
            CNS-MPO, the standard the field has relied on for a decade.
            Available to you now.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mb-12">
            Score any molecule for blood-brain barrier penetration from a
            single SMILES string. Call it from your own code, or hand it to
            Claude.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-[#9d5cff] to-[#5ce5e5] bg-clip-text text-transparent">
                0.933
              </div>
              <div className="text-sm text-gray-500 mt-1">
                AUROC, 5-fold cross validation
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#16a34a]">
                +30%
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Accuracy over CNS-MPO
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-[#9d5cff] to-[#5ce5e5] bg-clip-text text-transparent">
                &lt;1s
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Per compound inference
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:temi@attentionlab.ai?subject=BBB-Nuke%20API%20Access"
              className="px-6 py-3 rounded-full bg-[#3E317D] text-white font-semibold hover:bg-[#2e245e] transition-colors"
            >
              REST API
            </a>
            <a
              href="/mcp"
              className="px-6 py-3 rounded-full border-2 border-[#3E317D] text-[#3E317D] font-semibold hover:bg-[#3E317D] hover:text-white transition-colors"
            >
              Use with Claude
            </a>
          </div>
        </div>
      </section>

      {/* From the Lab — blog */}
      <section className="py-20 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-gray-700 font-semibold mb-3">
                From the Lab
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                What we&apos;re thinking about.
              </h2>
            </div>
            <a
              href="https://attentionlabs.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-[#3E317D] hover:text-[#2e245e]"
            >
              All posts on Substack →
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                tag: "Platform",
                title: "Why the blood-brain barrier is still the hardest filter in drug discovery.",
                date: "Coming soon",
                href: "https://attentionlabs.substack.com",
              },
              {
                tag: "Science",
                title: "ADHD has not seen a new mechanism in a generation. Here is why.",
                date: "Coming soon",
                href: "https://attentionlabs.substack.com",
              },
              {
                tag: "AI",
                title: "Designing bespoke models for data-poor problems in neuroscience.",
                date: "Coming soon",
                href: "https://attentionlabs.substack.com",
              },
            ].map((p) => (
              <a
                key={p.title}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-2xl p-[2px] bg-gradient-to-r from-[#9d5cff]/40 to-[#5ce5e5]/40 hover:from-[#9d5cff] hover:to-[#5ce5e5] active:from-[#9d5cff] active:to-[#5ce5e5] transition-all duration-300 block"
              >
                <div className="h-full p-6 rounded-[14px] bg-white flex flex-col">
                  <div className="text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold mb-3">
                    {p.tag}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 leading-snug mb-6 group-hover:text-[#3E317D] transition-colors">
                    {p.title}
                  </h3>
                  <div className="mt-auto text-xs text-gray-400">{p.date}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="py-20 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-700 font-semibold mb-10">
            The Team
          </div>
          <TeamCarousel />
        </div>
      </section>

    </>
  );
}

const TEAM_MEMBERS = [
  {
    name: "Temitope Sobodu, PhD",
    role: "Founder & CEO",
    src: "/team/temi.png",
    bio: "Temi is a pharmacologist focused on optimizing AI models for early drug discovery, and sets the strategic direction and roadmap for Attention Labs. He holds a PhD in pharmacology and was a research fellow at Harvard Medical School. He brings prior business development experience from Pfizer and Sanofi, combining scientific depth with strategic leadership.",
  },
  {
    name: "Noah Abasciano",
    role: "Founding Team · Data",
    src: "/team/noah.png",
    bio: "Noah is a data scientist, software developer, and geneticist with a track record of success in bioinformatics and clinical research, driven by a passion for solving complex problems in biotech.",
  },
  {
    name: "Hamid Hadipour",
    role: "Founding Team · AI",
    src: "/team/hamid.png",
    bio: "Hamid is an AI scientist with a master's in computer science and experience in AI research and building practical ML applications in the drug discovery industry.",
  },
  {
    name: "Abhishek Poddar, PhD",
    role: "Founding Team · Neuroscience",
    src: "/team/abhishek.png",
    bio: "Abhishek is a neuroscientist and molecular biologist with extensive expertise in in vitro modeling and preclinical validation. He is a postdoctoral researcher at Harvard-MGH, specializing in cellular transcriptomic pathways.",
  },
  {
    name: "Jack Rudrum",
    role: "Founding Team · Bioengineering",
    src: "/team/jack.png",
    bio: "Jack is a bioengineer specializing in developing in vitro blood-brain barrier models. He is a PhD candidate in the Bioengineering Department at MIT.",
  },
];

function TeamCarousel() {
  const [index, setIndex] = useState(0);
  const member = TEAM_MEMBERS[index];

  const prev = () =>
    setIndex((i) => (i - 1 + TEAM_MEMBERS.length) % TEAM_MEMBERS.length);
  const next = () =>
    setIndex((i) => (i + 1) % TEAM_MEMBERS.length);

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Photo */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-[3/4] max-w-lg mx-auto w-full">
          <img
            src={member.src}
            alt={member.name}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            key={member.src}
          />
        </div>

        {/* Bio */}
        <div className="flex flex-col justify-center" key={member.name}>
          <div className="text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold mb-2">
            {member.role}
          </div>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            {member.name}
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            {member.bio}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-6 mt-10">
        <button
          onClick={prev}
          className="w-10 h-10 rounded-full border border-gray-300 hover:border-[#3E317D] hover:text-[#3E317D] flex items-center justify-center transition-colors"
          aria-label="Previous team member"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="text-sm text-gray-400">
          {index + 1} / {TEAM_MEMBERS.length}
        </span>
        <button
          onClick={next}
          className="w-10 h-10 rounded-full border border-gray-300 hover:border-[#3E317D] hover:text-[#3E317D] flex items-center justify-center transition-colors"
          aria-label="Next team member"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function BioView() {
  return (
    <>
      <section className="py-20 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-700 font-semibold mb-3">
            The Division
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
            Attention Bio.
          </h2>
          <div className="text-gray-600 text-lg leading-relaxed max-w-3xl space-y-6">
            <p>
              Attention Bio is the therapeutics engine of Attention Labs. We
              develop first-in-class drugs for the brain, spanning
              neuropsychiatric disease and age-related cognitive decline.
            </p>
            <p>
              Every program begins with a question the field has failed to
              answer, and every molecule is designed with our own AI. We are
              modality-agnostic and built to move where legacy pharma has
              stalled.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-700 font-semibold mb-3">
            Lead Asset
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
            ATTN001.
          </h2>
          <p className="text-xl md:text-2xl font-semibold text-gray-900 mb-8 max-w-3xl">
            A potential first-in-class D2 dopamine receptor agonist for ADHD.
          </p>

          <div className="text-gray-600 text-lg leading-relaxed max-w-3xl space-y-6">
            <p>
              ATTN001 is our lead program: a potential first-in-class D2
              dopamine receptor agonist discovered by BBB-Nuke. It is a
              non-stimulant candidate for Attention Deficit Hyperactivity
              Disorder, a condition the field has not delivered a new chemical
              entity for in decades.
            </p>
            <p>
              ADHD affects over 366 million adults and 129 million children
              worldwide. The mainstay stimulants, amphetamines and
              methylphenidate, have been the standard of care for more than a
              century, and 25% of patients see no benefit from any approved
              therapy.
            </p>
          </div>

          <div className="mt-12 flex items-center gap-6">
            <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-[#9d5cff] to-[#5ce5e5] bg-clip-text text-transparent">
              25%
            </div>
            <div className="text-sm text-gray-500 max-w-[16rem]">
              of ADHD patients do not respond to any currently approved therapy
            </div>
          </div>
        </div>
      </section>
      {/* Mechanism of Action */}
      <section className="py-20 border-b border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-700 font-semibold mb-3">
            Mechanism
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
            A measured stream, not a flood.
          </h2>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="text-gray-600 text-lg leading-relaxed space-y-6">
              <p>
                ATTN001 is a selective agonist of the presynaptic D2
                autoreceptor. With chronic activation, these receptors
                internalize, releasing their brake on dopamine synthesis and
                producing a sustained, physiologic increase in dopamine tone
                across the prefrontal cortex.
              </p>
              <p>
                This is fundamentally different from amphetamines, which
                trigger a violent, nonselective release of dopamine and drive
                the overstimulation, abuse liability, and cardiovascular side
                effects that have defined ADHD treatment for a century.
                ATTN001 delivers a controlled dopamine stream, restoring focus
                without the flood.
              </p>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-black w-3/4 mx-auto">
              <video
                src="/attn001-activation.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white text-xs">
                ATTN001 activating D2 receptors in live HEK293A cells
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Next Program */}
      <section className="py-20 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-700 font-semibold mb-3">
            Next Program
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
            A dual GLP-1R / TAAR1 agonist for substance use disorder.
          </h2>

          <div className="text-gray-600 text-lg leading-relaxed max-w-3xl space-y-6">
            <p>
              Our next program pairs two of the most promising targets in
              addiction biology into a single molecule. GLP-1 receptor
              agonists, now the standard of care in obesity, are showing
              unexpected and substantial reductions in alcohol use across
              real-world populations. TAAR1 agonism, in parallel, blunts the
              reinforcing effects of stimulants like cocaine and
              methamphetamine, and its structural biology is now resolved.
            </p>
            <p>
              We are designing a single molecule that engages both receptors
              simultaneously, aiming to combine the craving-suppressing effect
              of GLP-1 activation with the stimulant-blocking action of TAAR1.
              No existing therapy offers this combination.
            </p>
          </div>

          <div className="mt-10 max-w-3xl">
            <div className="text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold mb-3">
              The Science
            </div>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <a
                  href="https://www.nature.com/articles/s41467-024-48780-6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3E317D] hover:text-[#2e245e] font-medium"
                >
                  Wang et al., Nature Communications (2024)
                </a>
                {" — "}Semaglutide is associated with a 50–56% lower risk of
                alcohol use disorder incidence and recurrence in a
                83,825-patient cohort.
              </li>
              <li>
                <a
                  href="https://www.nature.com/articles/s41586-023-06775-1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3E317D] hover:text-[#2e245e] font-medium"
                >
                  Xu et al., Nature (2023)
                </a>
                {" — "}Cryo-EM structures of human TAAR1 bound to
                methamphetamine and a clinical-stage agonist, establishing
                TAAR1 as a tractable target for addiction and psychiatric
                disease.
              </li>
              <li>
                <a
                  href="https://www.nature.com/articles/s41380-022-01448-3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3E317D] hover:text-[#2e245e] font-medium"
                >
                  Liu et al., Molecular Psychiatry (2022)
                </a>
                {" — "}TAAR1 activation suppresses cocaine-seeking reinstatement
                by negatively modulating CaMKIIα in the nucleus accumbens.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

function AIView() {
  return (
    <>
      <section className="py-20 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-700 font-semibold mb-3">
            The Division
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
            Attention AI.
          </h2>
          <div className="text-gray-600 text-lg leading-relaxed max-w-3xl space-y-6">
            <p>
              Attention AI is the computational engine of Attention Labs. We
              build bespoke models for the most complex and data-poor problems
              in neuroscience, where off-the-shelf tools break down and the
              questions demand their own machinery.
            </p>
            <p>
              Every model we build exists to push the next molecule forward.
              Better chemistry, better efficacy, better ADMET, and better odds
              of reaching the brain. Our platforms are not abstractions; they
              are the direct reason molecules like ATTN001 exist.
            </p>
            <p>
              Our first public platform is BBB-Nuke, a model built
              specifically for the blood-brain barrier: one of the oldest and
              most stubborn bottlenecks in CNS drug discovery. More on that
              below.
            </p>
          </div>
        </div>
      </section>

      {/* BBB-Nuke: problem + platform */}
      <section className="py-20 border-b border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          {/* Heading card — starfield poster as background, smoothly feathered */}
          <div className="relative rounded-3xl overflow-hidden mb-12 shadow-lg max-w-3xl">
            <img
              src="/bbb-nuke-poster.jpg"
              alt=""
              className="w-full h-56 md:h-72 object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.85) 100%)",
              }}
            />
            <div className="absolute inset-0 flex flex-col justify-center px-10 text-white">
              <div className="text-xs uppercase tracking-[0.2em] text-white/70 font-semibold mb-3">
                Platform
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                BBB-Nuke.
              </h2>
            </div>
          </div>

          <div className="text-gray-600 text-lg leading-relaxed max-w-3xl space-y-6">
            <p>
              Fewer than 2% of small molecules cross the blood-brain barrier
              (
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/15717053/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3E317D] hover:text-[#2e245e] underline"
              >
                Pardridge, NeuroRx 2005
              </a>
              ), and a majority of CNS drug candidates fail in clinical trials
              from poor ADMET and inadequate brain exposure. The blood-brain
              barrier is the most expensive filter in drug discovery, and the
              field has spent decades trying to outsmart it.
            </p>
            <p>
              The standards the field relies on, CNS-MPO and its descendants,
              reduce that barrier to a handful of physicochemical properties:
              molecular weight, lipophilicity, polar surface area. These rules
              are useful, but they are blind to the biology that actually
              decides whether a molecule reaches its target. Efflux
              transporters, metabolic degradation, and active uptake all get
              ignored.
            </p>
            <p>
              BBB-Nuke extends those foundations with a heuristic layer built
              on the biology the old models leave out. It learns the
              fingerprints of efflux pumps, metabolic clearance, and
              protein-mediated transport, and folds them back into a single
              score that tells you not just whether a molecule looks like a
              CNS drug, but whether it will actually behave like one.
            </p>
          </div>
        </div>
      </section>
      {/* Benchmarks */}
      <section className="py-20 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-700 font-semibold mb-3">
            Benchmarks
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-10">
            Head to head.
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            <BenchmarkChart
              title="AUROC"
              yLabel="AUROC"
              rows={[
                { name: "BBB-Nuke", value: 0.933, highlight: true },
                { name: "LightBBB", value: 0.84 },
                { name: "ADMETlab", value: 0.82 },
                { name: "BBB-Score", value: 0.79 },
                { name: "CNS-MPO", value: 0.72 },
              ]}
              yMax={1.0}
              format={(v) => v.toFixed(2)}
            />
            <BenchmarkChart
              title="Accuracy"
              yLabel="Accuracy"
              rows={[
                { name: "BBB-Nuke", value: 0.88, highlight: true },
                { name: "LightBBB", value: 0.78 },
                { name: "ADMETlab", value: 0.75 },
                { name: "BBB-Score", value: 0.73 },
                { name: "CNS-MPO", value: 0.58 },
              ]}
              yMax={1.0}
              format={(v) => `${(v * 100).toFixed(0)}%`}
            />
          </div>
        </div>
      </section>
      {/* Access points overview */}
      <section className="py-20 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-700 font-semibold mb-3">
            Developer Access
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Three ways to run BBB-Nuke.
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mb-12">
            Whether you live in a backend service, an AI agent, or a secure
            in-house environment, BBB-Nuke meets you where you work.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { tag: "01", name: "MCP Server", sub: "Claude + agents" },
              { tag: "02", name: "REST API", sub: "Backend integration" },
              { tag: "03", name: "Enterprise", sub: "On-prem, private" },
            ].map((a) => (
              <div
                key={a.name}
                className="group relative rounded-2xl p-[2px] bg-gradient-to-r from-[#9d5cff]/40 to-[#5ce5e5]/40 hover:from-[#9d5cff] hover:to-[#5ce5e5] active:from-[#9d5cff] active:to-[#5ce5e5] transition-all duration-300"
              >
                <div className="h-full p-6 rounded-[14px] bg-white">
                  <div className="text-xs font-mono text-gray-400 mb-3">
                    {a.tag}
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {a.name}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{a.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Access points details */}
      <section className="py-20 border-b border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 space-y-16">
          <div className="grid md:grid-cols-[160px,1fr] gap-6 md:gap-12">
            <div className="text-xs font-mono text-gray-400 pt-1">01 · MCP</div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                MCP Server.
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                BBB-Nuke is exposed as a Model Context Protocol server, which
                lets Claude call it as a native tool inside a conversation. In
                Claude Desktop or Claude Code, add the BBB-Nuke MCP server once
                in settings, and from then on you can paste a SMILES, describe
                a library, or upload a CSV and ask Claude to screen it.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Claude decides when to invoke BBB-Nuke, reasons over the
                returned scores, flags the efflux liabilities, and drafts the
                next round of analogs — all in the same chat. A single agent
                session can screen up to 1,000 compounds in 24 hours.
              </p>
              <a
                href="/mcp"
                className="inline-block px-5 py-2.5 rounded-full border-2 border-[#3E317D] text-[#3E317D] font-semibold hover:bg-[#3E317D] hover:text-white transition-colors text-sm"
              >
                Use with Claude →
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-[160px,1fr] gap-6 md:gap-12">
            <div className="text-xs font-mono text-gray-400 pt-1">02 · REST</div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                REST API.
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Score any SMILES string with a single HTTPS call. The REST API
                is the simplest way to plug BBB-Nuke into an existing pipeline,
                backend service, or internal tool, with no ML infrastructure to
                maintain on your side. Access is granted on request.
              </p>
              <a
                href="mailto:temi@attentionlab.ai?subject=BBB-Nuke%20API%20Access"
                className="inline-block px-4 py-2 text-sm font-semibold rounded-full bg-[#3E317D] text-white hover:bg-[#2e245e] transition-colors"
              >
                Request access →
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-[160px,1fr] gap-6 md:gap-12">
            <div className="text-xs font-mono text-gray-400 pt-1">
              03 · Enterprise
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                Enterprise.
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                For teams where structures are the crown jewels. Enterprise
                ships as a command-line tool and an installable local web
                application with a full graphical interface, both running
                entirely inside your own infrastructure. No SMILES ever leave
                your network, no queries touch our servers, and IP governance,
                audit trails, and access control stay under your control — not
                ours.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="inline-block px-3 py-1.5 rounded-md bg-gray-900 text-gray-100 text-sm font-mono">
                  bbnuke score &quot;CCN(CC)CC&quot;
                </div>
                <div className="inline-block px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 text-sm">
                  Local web app
                </div>
              </div>
              <a
                href="mailto:temi@attentionlab.ai?subject=BBB-Nuke%20Enterprise"
                className="inline-block px-4 py-2 text-sm font-semibold rounded-full bg-[#3E317D] text-white hover:bg-[#2e245e] transition-colors"
              >
                Request access →
              </a>
            </div>
          </div>
        </div>
      </section>    </>
  );
}

export default function Sections({
  view,
  onChangeView,
}: {
  view: ViewState;
  onChangeView: (v: ViewState) => void;
}) {
  return (
    <div className="transition-opacity duration-200" key={view}>
      {view === "labs" && <LabsView onChangeView={onChangeView} />}
      {view === "bio" && <BioView />}
      {view === "ai" && <AIView />}
    </div>
  );
}
