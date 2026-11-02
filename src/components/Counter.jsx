import { useState, useEffect, useRef } from 'react'

const SECTIONS = [
  { id: 'hero',          label: 'HERO',           lap: '01', color: '#8B5CF6' },
  { id: 'quote',         label: 'SIGNAL',         lap: '02', color: '#00D2BE' },
  { id: 'about',         label: 'ABOUT',          lap: '03', color: '#F59E0B' },
  { id: 'projects',      label: 'CONSTRUCTS',     lap: '04', color: '#EC4899' },
  { id: 'process',       label: 'UNDER THE HOOD', lap: '05', color: '#38BDF8' },
  { id: 'blog',          label: 'DISPATCHES',     lap: '06', color: '#A78BFA' },
  { id: 'contributions', label: 'IN THE WILD',    lap: '07', color: '#2ECC71' },
  { id: 'achievements',  label: 'LEADERSHIP',     lap: '08', color: '#FB923C' },
  { id: 'contact',       label: 'FINAL LAP',      lap: '09', color: '#E10600' },
]

export default function LapCounter() {
  const [currentLap, setCurrentLap] = useState(0)
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const rafRef = useRef(null)

  useEffect(() => {
    // Show after a brief delay
    const t = setTimeout(() => setVisible(true), 2500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const update = () => {
      const scrollY = window.scrollY
      const winH = window.innerHeight

      let active = 0
      let sectionProgress = 0

      SECTIONS.forEach((s, i) => {
        const el = document.getElementById(s.id)
        if (!el) return
        const top = el.offsetTop
        const height = el.offsetHeight
        if (scrollY + winH / 2 >= top) {
          active = i
          // Progress within this section
          const entered = scrollY + winH / 2 - top
          sectionProgress = Math.min(100, Math.max(0, (entered / height) * 100))
        }
      })

      setCurrentLap(active)
      setProgress(sectionProgress)
      rafRef.current = requestAnimationFrame(update)
    }

    rafRef.current = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const sec = SECTIONS[currentLap]
  const isFinalLap = currentLap === SECTIONS.length - 1
  const activeColor = sec.color

  if (!visible) return null

  return (
    <div
      className="lap-counter-wrapper"
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 9999,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1)',
        pointerEvents: 'none',
      }}
    >
      <style>{`
        @keyframes lapPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(225,6,0,0.4); }
          50%       { box-shadow: 0 0 0 8px rgba(225,6,0,0); }
        }
        @keyframes lapIn {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .lap-dot-pulse {
          animation: lapPulse 1.4s ease-in-out infinite;
        }
      `}</style>

      <div
        style={{
          background: 'rgba(8,8,8,0.92)',
          backdropFilter: 'blur(16px)',
          border: `0.5px solid ${activeColor}99`,
          borderRadius: 12,
          padding: '12px 16px',
          minWidth: 160,
          animation: 'lapIn 0.5s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: `0 0 24px ${activeColor}22, 0 8px 32px rgba(0,0,0,0.5)`,
          transition: 'border-color 0.4s, box-shadow 0.4s',
        }}
      >
        {/* Top row: dot + lap num */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div
            className={isFinalLap ? 'lap-dot-pulse' : ''}
            style={{
              width: 6, height: 6, borderRadius: '50%',
              background: activeColor,
              flexShrink: 0,
              transition: 'background 0.4s',
            }}
          />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            letterSpacing: '0.2em',
            color: activeColor,
            textTransform: 'uppercase',
            transition: 'color 0.4s',
          }}>
            {isFinalLap ? '⚑ FINAL LAP' : `LAP ${sec.lap}`}
          </span>
        </div>

        {/* Section label */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(0.9rem,2vw,1.1rem)',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          color: activeColor,
          lineHeight: 1,
          marginBottom: 10,
          transition: 'color 0.4s',
        }}>
          {sec.label}
        </div>

        {/* Progress bar */}
        <div style={{
          height: 2,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 1,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: `linear-gradient(90deg,${activeColor},${activeColor}99)`,
            borderRadius: 1,
            transition: 'width 0.1s linear, background 0.4s',
          }} />
        </div>

        {/* Lap dots */}
        <div style={{ display: 'flex', gap: 3, marginTop: 8, alignItems: 'center' }}>
          {SECTIONS.map((_, i) => (
            <div
              key={i}
              style={{
                height: 2, borderRadius: 1,
                width: i === currentLap ? 14 : 4,
                background: i <= currentLap
                  ? SECTIONS[i].color
                  : 'rgba(255,255,255,0.1)',
                transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
