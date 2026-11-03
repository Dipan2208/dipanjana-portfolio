/**
 * QuoteReveal.jsx
 * ─────────────────────────────────────────────────────────────────
 * Charles Leclerc-style scroll-driven quote reveal section.
 * Drop into your portfolio as a standalone section between
 * Hero and About, or between Projects and Contact.
 *
 * HOW IT WORKS:
 *   - Section is 420vh tall with a sticky 100vh panel
 *   - Scroll distance = animation timeline (0 → 1)
 *   - Each phrase reveals at a specific scroll threshold
 *   - "CONVERSATIONS." gets lavender highlight + glow + scale
 *
 * USAGE:
 *   import QuoteReveal from './QuoteReveal';
 *   <QuoteReveal />
 *
 * CUSTOMISE:
 *   - Change THRESHOLDS array to adjust word timing
 *   - Change SECTION_HEIGHT to control how long the sticky lasts
 *   - Edit quote phrases in the PHRASES array
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useCallback } from "react";

const SECTION_HEIGHT = "420vh"; // total scroll distance for the section

// Each phrase: text, and optionally highlight + italic + glow
const PHRASES = [
  { id: "w1", text: "Performance",          highlight: false, size: "hero" },
  { id: "w2", text: "Settles",              highlight: false, size: "hero" },
  { id: "w3", text: "Conversations.",       highlight: true,  size: "hero" },
  { id: "w4", text: "Everything else tends to follow.", highlight: false, size: "sub" },
];

// Scroll progress (0→1) at which each phrase starts revealing
const THRESHOLDS = [0.08, 0.22, 0.40, 0.58];
// How long each reveal window lasts in scroll-progress units
const WINDOWS    = [0.12, 0.12, 0.14, 0.16];

// ── Easing ────────────────────────────────────────────────────────
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
function clamp01(v) { return Math.max(0, Math.min(1, v)); }

// ── Styles (all inline, no Tailwind dependency) ───────────────────
const S = {
  outer: {
    position: "relative",
    background: "#050505",
    height: SECTION_HEIGHT,
  },
  sticky: {
    position: "sticky",
    top: 0,
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  glowBg: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background:
      "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(139,92,246,0.09) 0%, transparent 70%)",
    transition: "opacity 0.6s ease",
    opacity: 0,
  },
  stage: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    padding: "2rem",
    width: "min(820px, 88vw)",
  },
  phrase: {
    display: "block",
    overflow: "hidden",
    marginBottom: "clamp(0.4rem, 1.8vh, 1rem)",
    lineHeight: 1,
  },
  phraseInnerBase: {
    display: "block",
    transform: "translateY(110%) skewY(3deg)",
    opacity: 0,
    willChange: "transform, opacity",
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 900,
    letterSpacing: "-0.03em",
    color: "#F0EEF6",
    lineHeight: 1.0,
    textTransform: "uppercase",
    fontSize: "clamp(2rem, 6.5vw, 5.5rem)",
  },
  phraseInnerSub: {
    fontSize: "clamp(1rem, 2.8vw, 2.2rem)",
    fontWeight: 700,
    letterSpacing: "-0.01em",
    color: "rgba(240,238,246,0.65)",
    textTransform: "none",
  },
  phraseHighlight: {
    color: "#C4B5FD",
    fontStyle: "italic",
  },
  hint: {
    position: "absolute",
    bottom: "2.5rem",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 5,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    transition: "opacity 0.5s ease",
  },
  hintLabel: {
    fontFamily: "'Courier New', monospace",
    fontSize: "10px",
    color: "rgba(139,92,246,0.7)",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
  },
  hintArrow: {
    width: "1px",
    height: "32px",
    background: "linear-gradient(to bottom, rgba(139,92,246,0.7), transparent)",
  },
  completionTag: {
    position: "absolute",
    bottom: "clamp(4rem, 8vh, 6rem)",
    left: "50%",
    transform: "translateX(-50%)",
    fontFamily: "'Courier New', monospace",
    fontSize: "clamp(9px, 1.2vw, 12px)",
    color: "rgba(196,181,253,0.5)",
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    transition: "opacity 0.8s ease",
    opacity: 0,
  },
  // Progress rail removed — portfolio uses its own .section-dots fixed rail
};

export default function QuoteReveal() {
  const outerRef       = useRef(null);
  const glowRef        = useRef(null);
  const hintRef        = useRef(null);
  const completionRef  = useRef(null);
  const wordRefs       = useRef([]);
  const ticking        = useRef(false);

  const update = useCallback(() => {
    ticking.current = false;
    const outer = outerRef.current;
    if (!outer) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const outerRect = outer.getBoundingClientRect();
    const outerTop  = scrollTop + outerRect.top;
    const outerH    = outer.offsetHeight;
    const viewH     = window.innerHeight;
    const maxScroll = outerH - viewH;
    const localScroll = Math.max(0, scrollTop - outerTop);
    const p = clamp01(localScroll / maxScroll);

    // Scroll hint
    if (hintRef.current)
      hintRef.current.style.opacity = p < 0.05 ? "1" : "0";

    // Glow intensity
    if (glowRef.current)
      glowRef.current.style.opacity = String(clamp01(p * 2.2) * 0.85);

    // Each word
    wordRefs.current.forEach((el, i) => {
      if (!el) return;
      const start = THRESHOLDS[i];
      const end   = start + WINDOWS[i];
      const local = clamp01((p - start) / (end - start));
      const eased = easeInOut(local);
      const isHighlight = PHRASES[i].highlight;

      const translateY = (1 - eased) * 110;
      const skewY      = (1 - eased) * 3;
      const scale      = isHighlight ? 0.96 + eased * 0.07 : 1;
      el.style.transform = `translateY(${translateY}%) skewY(${skewY}deg) scale(${scale})`;
      el.style.opacity   = String(eased);

      // "CONVERSATIONS." glow
      if (isHighlight) {
        const glowVal = eased > 0.7
          ? `0 0 ${Math.round(40 * eased)}px rgba(196,181,253,0.35)`
          : "none";
        el.style.textShadow = glowVal;
      }
    });

    // Completion tag
    const lastEnd = THRESHOLDS[3] + WINDOWS[3] + 0.06;
    if (completionRef.current)
      completionRef.current.style.opacity = p > lastEnd ? "0.7" : "0";
  }, []);

  const onScroll = useCallback(() => {
    if (!ticking.current) {
      ticking.current = true;
      requestAnimationFrame(update);
    }
  }, [update]);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll, update]);

  return (
    <section
      id="quote"
      ref={outerRef}
      className="quote-section"
      style={S.outer}
    >
      <div className="quote-sticky" style={S.sticky}>

        {/* Ambient glow */}
        <div ref={glowRef} style={S.glowBg} />

        {/* Quote stage */}
        <div className="quote-stage" style={S.stage}>
          {PHRASES.map((phrase, i) => (
            <span
              key={phrase.id}
              style={{
                ...S.phrase,
                ...(i === 3 ? { marginTop: "clamp(0.8rem, 3vh, 2rem)" } : {}),
              }}
            >
              <span
                className="quote-phrase"
                ref={el => (wordRefs.current[i] = el)}
                style={{
                  ...S.phraseInnerBase,
                  ...(phrase.size === "sub" ? S.phraseInnerSub : {}),
                  ...(phrase.highlight ? S.phraseHighlight : {}),
                }}
              >
                {phrase.text}
              </span>
            </span>
          ))}
        </div>

        {/* Scroll hint — fades out after user starts scrolling */}
        <div ref={hintRef} style={S.hint}>
          <span style={S.hintLabel}>scroll to reveal</span>
          <div style={S.hintArrow} />
        </div>

        {/* Completion signature */}
        <div ref={completionRef} style={S.completionTag}>
          — Dipanjana Ghosh · Portfolio 2026
        </div>
      </div>
    </section>
  );
}
