"use client";

import { useState } from "react";
import Link from "next/link";
import type { Metadata } from "next";

const TEAM = [
  {
    name: "Temitope Sobodu, PhD",
    role: "Founder & CEO",
    tag: "Strategy & Drug Discovery",
    src: "/team/temi.png",
    bio: "Temi is a pharmacologist focused on optimizing AI models for early drug discovery, and sets the strategic direction and roadmap for Attention Labs. He holds a PhD in pharmacology and brings prior business development experience from Pfizer and Sanofi, combining scientific depth with strategic leadership.",
  },
  {
    name: "Noah Abasciano",
    role: "Founding Team · Data",
    tag: "Data Science & Bioinformatics",
    src: "/team/noah.png",
    bio: "Noah is a data scientist, software developer, and geneticist with a track record of success in bioinformatics and clinical research, driven by a passion for solving complex problems in biotech.",
  },
  {
    name: "Hamid Hadipour",
    role: "Founding Team · AI",
    tag: "Machine Learning & Drug Discovery",
    src: "/team/hamid.png",
    bio: "Hamid is an AI scientist with a master's in computer science and experience in AI research and building practical ML applications in the drug discovery industry.",
  },
  {
    name: "Abhishek Poddar, PhD",
    role: "Founding Team · Neuroscience",
    tag: "Molecular Biology & Preclinical Validation",
    src: "/team/abhishek.png",
    bio: "Abhishek is a neuroscientist and molecular biologist with extensive expertise in in vitro modeling and preclinical validation. He is a postdoctoral researcher at Harvard-MGH, specializing in cellular transcriptomic pathways.",
  },
  {
    name: "Jack Rudrum, PhD",
    role: "Founding Team · Bioengineering",
    tag: "Blood-Brain Barrier Models",
    src: "/team/jack.png",
    bio: "Jack is a bioengineer specializing in developing in vitro blood-brain barrier models. He is a PhD candidate in the Bioengineering Department at MIT.",
  },
];

function TeamCard({
  member,
  index,
  active,
  onClick,
}: {
  member: (typeof TEAM)[number];
  index: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className="relative w-full cursor-pointer"
      style={{ perspective: "1200px" }}
      onClick={onClick}
    >
      <div
        className="relative w-full transition-transform duration-700 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: active ? "rotateY(-180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front — photo */}
        <div
          className="w-full rounded-2xl overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="relative aspect-[3/4] bg-gray-900">
            <img
              src={member.src}
              alt={member.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <div className="text-white font-bold text-lg leading-tight">
                {member.name}
              </div>
              <div className="text-white/70 text-sm mt-1">{member.role}</div>
            </div>
          </div>
        </div>

        {/* Back — bio */}
        <div
          className="absolute inset-0 w-full rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="aspect-[3/4] bg-gray-950 p-6 flex flex-col justify-center text-white">
            <div className="text-xs uppercase tracking-[0.2em] text-[#9d5cff] font-semibold mb-2">
              {member.tag}
            </div>
            <div className="text-xl font-bold mb-1">{member.name}</div>
            <div className="text-white/60 text-sm mb-5">{member.role}</div>
            <p className="text-white/80 text-sm leading-relaxed">
              {member.bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleClick = (i: number) => {
    setActiveIndex(activeIndex === i ? null : i);
  };

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-white inline-flex items-center gap-1 mb-12"
        >
          ← Back to Attention Labs
        </Link>

        <div className="text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold mb-3">
          The Team
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
          Built by scientists.
        </h1>
        <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mb-16">
          Pharmacologists, neuroscientists, bioengineers, and AI researchers
          building at the intersection of the brain and machine intelligence.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {TEAM.map((m, i) => (
            <TeamCard
              key={m.name}
              member={m}
              index={i}
              active={activeIndex === i}
              onClick={() => handleClick(i)}
            />
          ))}
        </div>

        <p className="text-center text-gray-600 text-sm mt-16">
          Click a card to flip it.
        </p>
      </div>
    </main>
  );
}
