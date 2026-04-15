"use client";

import { useEffect, useState } from "react";
import HeroVideo from "@/components/HeroVideo";
import Nav from "@/components/Nav";
import Sections from "@/components/Sections";
import Partners from "@/components/Partners";
import type { ViewState } from "@/components/types";

export default function Home() {
  const [view, setView] = useState<ViewState>("labs");
  const [navVisible, setNavVisible] = useState(false);

  const handleChangeView = (v: ViewState) => {
    setView(v);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const onScroll = () => setNavVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <HeroVideo />

      {/* Persistent logo — always visible top-left, above the video */}
      <div
        className="fixed top-8 left-8 z-40 transition-opacity duration-300"
        style={{ opacity: navVisible ? 0 : 1, pointerEvents: navVisible ? "none" : "auto" }}
      >
        <img
          src="/logo-live.png"
          alt="Attention Labs"
          className="h-6 w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
        />
      </div>

      <Nav view={view} onChange={handleChangeView} visible={navVisible} />

      {/* Spacer — page content slides up under the shrinking video */}
      <div style={{ height: "100dvh" }} />

      <main className="relative z-20 bg-white">
        <Sections view={view} onChangeView={handleChangeView} />
        <Partners />
        <footer
          id="contact"
          className="py-12 border-t border-gray-200 text-center text-sm text-gray-500"
        >
          <a
            href="mailto:temi@attentionlab.ai"
            className="hover:text-black"
          >
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
    </>
  );
}
