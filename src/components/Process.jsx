import { useState } from 'react'

const PROJECTS = [
  {
    id: 'specter',
    num: '01',
    name: 'SPECTER',
    accent: '#00D2BE',
    award: 'Hardware + ML Research',
    problem: 'Through-wall human presence detection traditionally requires expensive specialized radar hardware (like mmWave or UWB radars costing thousands of dollars) or intrusive cameras that severely violate human privacy.',
    approach: 'Harnessed commodity ESP32 microcontrollers to extract raw Wi-Fi Channel State Information (CSI) across multiple OFDM subcarriers. Extracted amplitude variances and engineered a machine learning pipeline (Random Forest / SVM) with SciPy and NumPy to discern respiratory and gait micro-distortions through solid architectural barriers.',
    results: 'Accurate occupied vs. empty room classification through walls without cameras. Integrated a real-time serial streaming inference script with an interactive live telemetry dashboard for zero-latency monitoring.',
    tags: ['ESP32', 'Wi-Fi CSI', 'ESP-IDF', 'Scikit-learn', 'Hardware-Software Interfacing'],
  },
  {
    id: 'emotistream',
    num: '02',
    name: 'EmotiStream AI',
    accent: '#8B5CF6',
    award: 'Flagship · Vision AI',
    problem: 'Traditional movie recommendation engines rely solely on historical viewing algorithms or rigid genre filters. They completely overlook the user\'s real-time emotional state — whether someone is stressed, exhausted, or craving excitement.',
    approach: 'Constructed an AI-powered discovery engine combining GPT-4 Vision facial analysis via webcam with manual mood selection. Integrated TMDB API for dynamic trailers, movie metadata, and streaming platform links wrapped in a high-performance Netflix-inspired UI.',
    results: 'Deployed on Vercel with instant emotion-to-genre mapping, dual-engine OpenAI fallback for 100% uptime, and an interactive trailer discovery loop.',
    tags: ['GPT-4 Vision', 'React 19', 'OpenAI API', 'TMDB API', 'Vite'],
  },
  {
    id: 'virasat',
    num: '03',
    name: 'Virasat Setu',
    accent: '#F59E0B',
    award: 'SIH Internal Hackathon',
    problem: 'Regional artisans and heritage craftsmen in India are alienated from modern e-commerce systems due to complex vendor interfaces, lack of regional localization, and exploitative intermediaries.',
    approach: 'Engineered a specialized cultural marketplace during Smart India Hackathon (SIH) internal round. Integrated Leaflet for interactive geospatial heritage discovery, Framer Motion for responsive storefront UI, and Supabase / PostgreSQL for relational artisan catalog verification.',
    results: 'Delivered an interactive map-based artisan discovery platform with verified provenance trails, digital storefronts, and automated craft cataloging under hackathon deadlines.',
    tags: ['React.js', 'Supabase', 'PostgreSQL', 'Leaflet Maps', 'Framer Motion'],
  },
  {
    id: 'mailcheck',
    num: '04',
    name: 'Mailcheck',
    accent: '#38BDF8',
    award: 'Production Tool',
    problem: 'Email marketing campaigns and transaction systems suffer from bad addresses, high bounce rates, and tarnished domain reputation. Sending test emails triggers spam filters, and paid verification APIs charge prohibitive per-lookup fees.',
    approach: 'Engineered an asynchronous multi-stage verification pipeline: RFC 5321 syntax validation -> DNS MX lookup -> disposable provider filtering -> non-intrusive SMTP port 25 probe that halts before the DATA command to prevent sending any messages.',
    results: 'Sub-second verification per address, automated catch-all mailbox detection, batch processing up to 100 emails with CSV export, deployed live on Render with full Flask API.',
    tags: ['Python 3.10+', 'Flask', 'SMTP Sockets', 'DNS / MX', 'Render'],
  },
]

const HOVER_STATES = ['problem', 'approach', 'results']
const HOVER_LABELS = {
  problem: 'The Problem',
  approach: 'The Approach',
  results: 'The Results',
}

export default function ProcessBreakdown() {
  const [activeProject, setActiveProject] = useState(0)
  const [hoveredPanel, setHoveredPanel] = useState(null)

  const p = PROJECTS[activeProject]

  return (
    <section
      id="process"
      className="obs-section bg-dark"
      style={{ padding: '80px 0', position: 'relative', overflow: 'hidden' }}
    >
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(24px) }
          to   { opacity: 1; transform: translateX(0) }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(16px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        .pb-project-item:hover .pb-project-num { opacity: 1 !important; }
        .pb-panel-row:hover .pb-panel-content { max-height: 300px !important; opacity: 1 !important; padding-top: 12px !important; }
        .pb-panel-row:hover .pb-panel-arrow { transform: rotate(90deg) !important; }
        .pb-tag { transition: all 0.2s; }
        .pb-tag:hover { opacity: 1 !important; border-color: var(--accent) !important; }
      `}</style>

      {/* Ghost background word */}
      <div className="ghost-text-bg" style={{
        position: 'absolute', top: '50%', right: '-2rem',
        transform: 'translateY(-50%)',
        fontSize: 'clamp(5rem,18vw,14rem)', fontWeight: 900,
        color: `rgba(255,255,255,0.025)`,
        letterSpacing: '-0.06em', lineHeight: 1,
        pointerEvents: 'none', userSelect: 'none', zIndex: 0,
        fontFamily: 'var(--font-display)',
      }}>
        PROCESS
      </div>

      <div className="mobile-content-gutter" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px', position: 'relative', zIndex: 2 }}>

        {/* Section header */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 20, height: 1, background: '#8B5CF6' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(139,92,246,0.7)' }}>
              003 — Under The Hood
            </span>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem,5vw,3.5rem)',
            fontWeight: 900, letterSpacing: '-0.04em', color: '#F0EEF6', lineHeight: 1, marginBottom: 12
          }}>
            How It Actually Got Built
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(240,238,246,0.4)', maxWidth: 480, lineHeight: 1.8 }}>
            Not the "passionate developer" kind of breakdown. The real one — problem, approach, result. Hover to see what actually happened.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="pb-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 40, alignItems: 'start' }}>

          {/* LEFT: Project list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {PROJECTS.map((proj, i) => (
              <div
                key={proj.id}
                className="pb-project-item"
                onClick={() => { setActiveProject(i); setHoveredPanel(null) }}
                style={{
                  padding: '20px 0',
                  borderBottom: '0.5px solid rgba(255,255,255,0.07)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s',
                }}
              >
                {/* Active accent bar */}
                <div style={{
                  position: 'absolute', left: -24, top: 0, bottom: 0, width: 2,
                  background: activeProject === i ? proj.accent : 'transparent',
                  transition: 'background 0.3s',
                  borderRadius: 1,
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span
                    className="pb-project-num"
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                      color: activeProject === i ? proj.accent : 'rgba(255,255,255,0.2)',
                      letterSpacing: '0.1em', minWidth: 24,
                      opacity: activeProject === i ? 1 : 0.5,
                      transition: 'all 0.3s',
                    }}
                  >
                    {proj.num}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(1.2rem,2.5vw,1.6rem)',
                      fontWeight: 900, letterSpacing: '-0.03em',
                      color: activeProject === i ? '#F0EEF6' : 'rgba(240,238,246,0.4)',
                      transition: 'color 0.3s',
                      lineHeight: 1.1,
                    }}>
                      {proj.name}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 9,
                      color: activeProject === i ? `${proj.accent}99` : 'rgba(255,255,255,0.2)',
                      letterSpacing: '0.12em', marginTop: 4,
                      textTransform: 'uppercase', transition: 'color 0.3s',
                    }}>
                      {proj.award}
                    </div>
                  </div>
                  <div style={{
                    color: activeProject === i ? proj.accent : 'rgba(255,255,255,0.15)',
                    fontSize: 16, transition: 'all 0.3s',
                    transform: activeProject === i ? 'translateX(0)' : 'translateX(-4px)',
                  }}>
                    →
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Detail panel */}
          <div
            key={p.id}
            style={{
              background: '#0D0D0D',
              border: `0.5px solid ${p.accent}33`,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: `0 0 60px ${p.accent}08`,
              animation: 'slideInRight 0.4s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {/* Top accent bar */}
            <div style={{ height: 3, background: `linear-gradient(90deg,${p.accent},${p.accent}44)` }} />

            <div style={{ padding: '2rem' }}>
              {/* Project title */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.4rem,4vw,2.6rem)',
                  fontWeight: 900, letterSpacing: '-0.04em',
                  color: '#F0EEF6', lineHeight: 1.1, marginBottom: 6,
                  wordBreak: 'break-word'
                }}>
                  {p.name}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9,
                  color: `${p.accent}99`, letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}>
                  {p.award}
                </div>
              </div>

              {/* Hover reveal panels */}
              {HOVER_STATES.map((state) => (
                <div
                  key={state}
                  className="pb-panel-row"
                  onMouseEnter={() => setHoveredPanel(state)}
                  onMouseLeave={() => setHoveredPanel(null)}
                  style={{
                    borderTop: '0.5px solid rgba(255,255,255,0.06)',
                    paddingTop: '1rem', paddingBottom: '1rem',
                    cursor: 'default',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                      letterSpacing: '0.18em', textTransform: 'uppercase',
                      color: hoveredPanel === state ? p.accent : 'rgba(255,255,255,0.5)',
                      transition: 'color 0.2s',
                    }}>
                      {HOVER_LABELS[state]}
                    </span>
                    <span
                      className="pb-panel-arrow"
                      style={{
                        color: hoveredPanel === state ? p.accent : 'rgba(255,255,255,0.2)',
                        fontSize: 12, transition: 'all 0.3s',
                        transform: hoveredPanel === state ? 'rotate(90deg)' : 'rotate(0deg)',
                      }}
                    >
                      →
                    </span>
                  </div>
                  <div
                    className="pb-panel-content"
                    style={{
                      maxHeight: hoveredPanel === state ? 300 : 0,
                      opacity: hoveredPanel === state ? 1 : 0,
                      overflow: 'hidden',
                      paddingTop: hoveredPanel === state ? 12 : 0,
                      transition: 'max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s, padding 0.3s',
                    }}
                  >
                    <p style={{
                      fontFamily: 'var(--font-mono)', fontSize: 11,
                      color: 'rgba(240,238,246,0.65)', lineHeight: 1.8,
                      borderLeft: `2px solid ${p.accent}55`,
                      paddingLeft: 12,
                    }}>
                      {p[state]}
                    </p>
                  </div>
                </div>
              ))}

              {/* Tech tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: '1.2rem', paddingTop: '1rem', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="pb-tag"
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 8,
                      padding: '3px 9px', borderRadius: 100,
                      border: `0.5px solid ${p.accent}33`,
                      color: `${p.accent}99`,
                      letterSpacing: '0.08em',
                      opacity: 0.85,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
