/**
 * BBBNukeHero — React wrapper for the BBB-Nuke animated graphical abstract.
 *
 * The figure itself is a self-contained HTML document (bbb-nuke-hero.html)
 * that renders thousands of canvas particles. We embed it via <iframe>:
 *   - No CSS/JS pollution into the host page
 *   - Iframe is paused automatically when offscreen (IntersectionObserver
 *     inside the doc) and when prefers-reduced-motion is set
 *   - Works under any framework (Next.js, Remix, plain React)
 *
 * For Next.js: copy bbb-nuke-hero.html into your /public folder, then use
 *   <BBBNukeHero src="/bbb-nuke-hero.html" />
 *
 * Aspect ratio is locked to 16:9. To use as full-bleed hero, wrap in a
 * container with overflow:hidden and use height-driven sizing.
 */

import React, { useEffect, useRef, useState } from "react";

interface BBBNukeHeroProps {
  /** Path to bbb-nuke-hero.html (typically "/bbb-nuke-hero.html" in /public) */
  src: string;
  /** Optional className applied to the wrapper */
  className?: string;
  /** Optional inline style for the wrapper */
  style?: React.CSSProperties;
  /** Aspect ratio (width / height). Defaults to 16/9. */
  aspectRatio?: number;
  /** If true, pauses the animation regardless of viewport state */
  paused?: boolean;
  /** Called once when the iframe finishes loading */
  onReady?: () => void;
}

export const BBBNukeHero: React.FC<BBBNukeHeroProps> = ({
  src,
  className,
  style,
  aspectRatio = 16 / 9,
  paused,
  onReady,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  // External pause/play via prop
  useEffect(() => {
    if (!ready) return;
    const win = iframeRef.current?.contentWindow as any;
    const api = win?.bbbNuke;
    if (!api) return;
    if (paused) api.pause();
    else api.play();
  }, [paused, ready]);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: String(aspectRatio),
        background: "#0A0A0F",
        overflow: "hidden",
        ...style,
      }}
    >
      <iframe
        ref={iframeRef}
        src={src}
        title="BBB-Nuke pipeline — graphical abstract"
        loading="lazy"
        onLoad={() => {
          setReady(true);
          onReady?.();
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
        // Allow same-origin so our parent can talk to window.bbbNuke
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default BBBNukeHero;
