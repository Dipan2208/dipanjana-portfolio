import { useState, useEffect, useRef, useMemo } from "react";
import Hyperspeed from './Hyperspeed';

// ── Text Scramble Hook ──────────────────────────────────────────
function useScramble(text, active, delay = 0) {
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-[]{}—+*^?#∎·";
  const [display, setDisplay] = useState(text.replace(/[^\n ]/g, "█"));
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const timer = setTimeout(() => {
      let frame = 0;
      const lines = text.split("\n");
      const flat = text.replace("\n", "");
      const total = flat.length * 3 + 20;

      const tick = () => {
        let fi = 0;
        const result = lines.map(line => {
          let out = "";
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === " ") {
              out += " ";
              fi++;
              continue;
            }
            if (frame > fi * 3 + 20) {
              out += ch;
            } else if (frame > fi * 2) {
              out += CHARS[Math.floor(Math.random() * CHARS.length)];
            } else {
              out += "█";
            }
            fi++;
          }
          return out;
        });
        setDisplay(result.join("\n"));
        frame++;
        if (frame < total) rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, text, delay]);

  return display;
}

// ── Intersection Observer Hook ──────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView];
}

const GRID_COLS = 20;
const GRID_ROWS = 14;

// Detect touch device for hint text adaptation
const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  (navigator.maxTouchPoints > 0 || window.matchMedia('(hover: none)').matches)

// ── Main Hero Component ────────────────────────────────────────
export default function Hero() {
  const [sectionRef, inView] = useInView(0.1);
  const nameDisplay = useScramble("DIPANJANA\nGHOSH", inView, 200);

  const hyperspeedOptions = useMemo(() => ({
    distortion: "turbulentDistortion",
    length: 400,
    roadWidth: 10,
    islandWidth: 2,
    lanesPerRoad: 3,
    fov: 90,
    fovSpeedUp: 150,
    speedUp: 3,
    carLightsFade: 0.4,
    totalSideLightSticks: 20,
    lightPairsPerRoadWay: 40,
    shoulderLinesWidthPercentage: 0.05,
    brokenLinesWidthPercentage: 0.1,
    brokenLinesLengthPercentage: 0.5,
    lightStickWidth: [0.12, 0.5],
    lightStickHeight: [1.3, 1.7],
    movingAwaySpeed: [60, 80],
    movingCloserSpeed: [-120, -160],
    carLightsLength: [12, 80],
    carLightsRadius: [0.05, 0.14],
    carWidthPercentage: [0.3, 0.5],
    carShiftX: [-0.8, 0.8],
    carFloorSeparation: [0, 5],
    colors: {
      roadColor: 0x050505,
      islandColor: 0x050505,
      background: 0x050505,
      shoulderLines: 0x131318,
      brokenLines: 0x131318,
      leftCars: [0x8B5CF6, 0x00D2BE, 0xC4B5FD],
      rightCars: [0x00D2BE, 0x8B5CF6, 0x6D45DB],
      sticks: 0x8B5CF6
    }
  }), []);



  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#050505",
        overflow: "hidden",
        padding: "2rem",
      }}
    >
      {/* Hyperspeed component mount */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "auto" }}>
        <Hyperspeed effectOptions={hyperspeedOptions} />
      </div>



      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(139,92,246,0.08) 0%, transparent 70%)",
          zIndex: 2,
          pointerEvents: "none",
          opacity: inView ? 1 : 0,
          transition: "opacity 1s ease",
        }}
      />

      {/* Main content container */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          textAlign: "center",
          maxWidth: "900px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
          marginTop: "-6vh", // Moves content up to prevent clashing
          pointerEvents: "none", // so interactions hit the 3d canvas
        }}
      >
        {/* Scrambled Name */}
        <h1
          style={{
            fontSize: "clamp(2.2rem, 8.5vw, 10rem)",
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            color: "#F0EEF6",
            whiteSpace: "pre-wrap",
            marginBottom: "0.5rem",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
            fontFamily: "var(--font-display)",
          }}
        >
          {nameDisplay}
        </h1>

        {/* Tagline — Your voice */}
        <p
          style={{
            fontSize: "clamp(1rem, 2.2vw, 1.4rem)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "#F0EEF6",
            lineHeight: 1.4,
            marginBottom: "0.5rem",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s ease 0.5s, transform 0.8s ease 0.5s",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span style={{ color: "#8B5CF6" }}>STILL DEBUGGING LIFE.</span>
          <br />
          <span style={{ color: "#F0EEF6" }}>SHIPPING CODE.</span>
        </p>

        {/* Divider line */}
        <div
          style={{
            width: "60px",
            height: "2px",
            background: "linear-gradient(90deg, #8B5CF6, #00D2BE)",
            borderRadius: "2px",
            margin: "1rem 0",
            opacity: inView ? 1 : 0,
            transform: inView ? "scaleX(1)" : "scaleX(0)",
            transformOrigin: "center",
            transition: "opacity 0.8s ease 0.6s, transform 0.8s ease 0.6s",
          }}
        />


      </div>

      {/* Bottom Indicators */}
      <div
        style={{
          position: "absolute",
          bottom: "clamp(1.5rem, 4vh, 2.5rem)",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
          pointerEvents: "none",
        }}
      >
        {true && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              animation: "hintPulse 2s ease-in-out infinite",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "#c77dff",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              {isTouchDevice() ? 'tap & hold for hyperspeed' : 'click & hold for hyperspeed'}
            </span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8l6 6 6-6" stroke="#c77dff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            animation: "bounce 2s ease-in-out infinite",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            EXPLORE MY WORK
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "rgba(139,92,246,0.6)",
              animation: "chevronBounce 1.8s ease-in-out infinite",
            }}
          >
            ↓
          </div>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-12px); }
        }

        @keyframes chevronBounce {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(8px); opacity: 0.3; }
        }

        @keyframes hintPulse {
          0%, 100% { opacity: 1; text-shadow: 0 0 10px rgba(199, 125, 255, 0.4); }
          50% { opacity: 0.3; text-shadow: none; }
        }
      `}</style>
    </section>
  );
}
