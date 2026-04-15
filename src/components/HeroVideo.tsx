"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fullscreen-on-load video that shrinks to a 20vh banner as the user scrolls.
 * Scroll-driven interpolation over the first 600px of scroll.
 */
export default function HeroVideo() {
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const rafRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wasAwayRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const SCROLL_RANGE = 600;
    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        const y = window.scrollY;
        setProgress(Math.min(1, Math.max(0, y / SCROLL_RANGE)));

        // Replay video when user returns to the very top after scrolling away
        if (y > 100) {
          wasAwayRef.current = true;
        } else if (y < 20 && wasAwayRef.current && videoRef.current) {
          wasAwayRef.current = false;
          if (!reducedMotion) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => {});
          }
        }

        rafRef.current = null;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const heightPct = 100 - progress * 80;
  const overlayOpacity = progress * 0.35;
  const titleScale = 1 - progress * 0.55;
  const titleOpacity = 1 - progress * 0.85;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-10 overflow-hidden"
      style={{ height: `${heightPct}dvh` }}
    >
      {reducedMotion ? (
        <img
          src="/hero-poster.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src="/hero.mp4"
          poster="/hero-poster.jpg"
          preload="metadata"
          autoPlay
          muted
          playsInline
        />
      )}
      <div
        className="absolute inset-0 bg-white"
        style={{ opacity: overlayOpacity }}
      />
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6"
        style={{
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
          transition: "none",
        }}
      >
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight drop-shadow-lg">
          Attention Labs
        </h1>
        <p className="mt-4 text-base sm:text-lg md:text-2xl font-light drop-shadow">
          Making Humans Intelligent with AI
        </p>
      </div>
    </div>
  );
}
