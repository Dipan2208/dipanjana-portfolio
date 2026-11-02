import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'

/* ── Club & Leadership Data ──────────────────────────────────── */
const clubRoles = [
  {
    index: '01',
    title: 'ACM Student Chapter · VIT-AP',
    subtitle: 'Technical Team Co-Lead · 2026–Present',
    bullets: [
      {
        highlight: 'Spidey-Tech',
        text: 'Architected a three-round online technical competition',
        detail: 'Created algorithmic challenges, debugging sprints, and automated evaluation criteria.',
      },
      {
        highlight: 'Golden Egg',
        text: 'Designed a technical treasure hunt',
        detail: 'Created algorithmic checkpoints and automated QR validation mechanics, supporting 150+ teams.',
      },
      {
        highlight: 'Technical sessions',
        text: 'Mentored peers in frontend development and core algorithmic problem-solving.',
      },
    ],
    metric: '2026',
    metricLabel: 'STARTED',
    tags: ['Technical Events', 'Mentoring', 'Frontend'],
  },
  {
    index: '02',
    title: 'Microsoft Student Chapter · VIT-AP',
    subtitle: 'Technical Team Co-Lead · 2025–Present',
    bullets: [
      {
        highlight: 'Workshops & bootcamps',
        text: 'Coordinated technical workshop logistics and hands-on coding bootcamps.',
        detail: 'Prepared session materials for student developers.',
      },
    ],
    metric: '2025',
    metricLabel: 'STARTED',
    tags: ['Technical Workshops', 'Coding Bootcamps'],
  },
  {
    index: '03',
    title: 'BONGOJO · The Bengali Association of VIT-AP',
    subtitle: 'Design & Decoration Team Co-Lead · May 2026–Present',
    bullets: [
      {
        highlight: 'V-Cipher',
        text: 'Contributed to V-Cipher and other cultural events.',
        detail: 'Directed creative assets and campus media campaigns for Bongojo events.',
      },
      {
        highlight: 'Design & Decoration Team Member',
        text: 'Oct 2025–May 2026',
      },
    ],
    metric: '2026',
    metricLabel: 'CO-LEAD',
    tags: ['Creative Direction', 'Campus Media', 'Design'],
  },
  {
    index: '04',
    title: 'The Machine Learning CLUB VITAP',
    subtitle: 'VIT-AP University',
    bullets: [
      {
        highlight: 'Design Team Co Lead',
        text: 'Aug 2026–Present',
      },
      {
        highlight: 'Design Team Member',
        text: 'Nov 2025–Present',
      },
    ],
    metric: '02',
    metricLabel: 'ROLES',
    tags: ['Design', 'Student Leadership', 'Machine Learning'],
  },
]

/* ── Animated Counter Hook ──────────────────────────────────── */
function useCountUp(target, isInView, duration = 1600) {
  const [value, setValue] = useState(0)
  const numericTarget = parseInt(target, 10)
  const isNumeric = !isNaN(numericTarget)

  useEffect(() => {
    if (!isInView || !isNumeric) return
    const startTime = performance.now()

    function tick(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(eased * numericTarget)
      setValue(current)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [isInView, numericTarget, isNumeric, duration])

  if (!isNumeric) return target
  return value.toString().padStart(2, '0')
}

/* ── Single Bullet Item ─────────────────────────────────────── */
function BulletItem({ bullet, index }) {
  return (
    <li className="ach-bullet-item">
      <span className="ach-bullet-marker">
        <span className="ach-bullet-dot" />
        <span className="ach-bullet-line" />
      </span>
      <div className="ach-bullet-body">
        <div className="ach-bullet-headline">
          <span className="ach-bullet-highlight">{bullet.highlight}</span>
          <span className="ach-bullet-sep">→</span>
          <span className="ach-bullet-text">{bullet.text}</span>
        </div>
        {bullet.detail && (
          <p className="ach-bullet-detail">{bullet.detail}</p>
        )}
      </div>
    </li>
  )
}

/* ── Single Achievement Row ─────────────────────────────────── */
function AchievementRow({ item, delay }) {
  const rowRef = useRef(null)
  const isInView = useInView(rowRef, { once: true, margin: '-60px' })
  const displayMetric = useCountUp(item.metric, isInView)

  return (
    <motion.div
      ref={rowRef}
      className="ach-row"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {/* Hover glow layer */}
      <div className="ach-row-glow" />

      {/* ── Left: Index ── */}
      <div className="ach-index">
        <span>{item.index}</span>
      </div>

      {/* ── Middle: Content ── */}
      <div className="ach-content">
        <h3 className="ach-title">{item.title}</h3>
        <p className="ach-subtitle">{item.subtitle}</p>
        <ul className="ach-bullets">
          {item.bullets.map((b, i) => (
            <BulletItem key={i} bullet={b} index={i} />
          ))}
        </ul>
        {item.note && <p className="ach-note">{item.note}</p>}
        <div className="ach-tags">
          {item.tags.map((tag, i) => (
            <span key={i} className="ach-tag">{tag}</span>
          ))}
        </div>
      </div>

      {/* ── Right: Metric ── */}
      <div className="ach-metric-block">
        <span className="ach-metric-value">{displayMetric}</span>
        <span className="ach-metric-label">{item.metricLabel}</span>
      </div>
    </motion.div>
  )
}

/* ── Main Section ───────────────────────────────────────────── */
export default function Achievements() {
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const bgTextX = useTransform(scrollYProgress, [0, 1], ['8%', '-25%'])

  return (
    <section
      id="achievements"
      ref={containerRef}
      className="obs-section bg-dark"
      style={{
        padding: '140px 0 120px',
        position: 'relative',
        overflow: 'hidden',
        display: 'block',
      }}
    >
      {/* ── Giant Background Watermark ── */}
      <motion.div className="ach-watermark ghost-text-bg" style={{ x: bgTextX }}>
        CLUBS & LEADERSHIP
      </motion.div>

      {/* ── Inner Container ── */}
      <div
        className="obs-inner"
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 48px',
        }}
      >
        {/* ── Section Header ── */}
        <motion.div
          className="ach-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="ach-header-left">
            <div className="ach-section-label">
              <span className="ach-label-line" />
              [ 006 — CLUBS & LEADERSHIP ]
            </div>
            <h2 className="ach-section-title">Clubs & Leadership</h2>
          </div>
          <div className="ach-header-right">
            CAMPUS INVOLVEMENT / OVERVIEW
          </div>
        </motion.div>

        {/* ── Achievement Rows ── */}
        <div className="ach-list">
          {clubRoles.map((item, idx) => (
            <AchievementRow
              key={item.index}
              item={item}
              delay={idx * 0.08}
            />
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
           STYLES (scoped)
         ───────────────────────────────────────────────────── */}
      <style>{`
        /* ── Watermark ── */
        .ach-watermark {
          position: absolute;
          top: 50%;
          left: 0;
          white-space: nowrap;
          transform: translateY(-50%);
          font-family: var(--font-display);
          font-size: clamp(7rem, 18vw, 22rem);
          font-weight: 800;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(139, 92, 246, 0.04);
          pointer-events: none;
          z-index: 0;
          user-select: none;
          line-height: 1;
        }

        /* ── Header ── */
        .ach-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 28px;
          margin-bottom: 0;
        }

        .ach-section-label {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--color-primary-light);
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .ach-label-line {
          display: inline-block;
          width: 28px;
          height: 1px;
          background: var(--color-primary);
          opacity: 0.6;
        }

        .ach-section-title {
          font-family: var(--font-display);
          font-size: clamp(1.8rem, 3.5vw, 2.6rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--color-text-primary);
        }

        .ach-header-right {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.3);
          text-align: right;
          text-transform: uppercase;
        }

        /* ── List ── */
        .ach-list {
          display: flex;
          flex-direction: column;
        }

        /* ── Row ── */
        .ach-row {
          display: grid;
          grid-template-columns: 72px 1fr 160px;
          gap: 32px;
          align-items: start;
          padding: 44px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          position: relative;
          transition: background 0.45s ease;
        }

        .ach-row-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            90deg,
            rgba(139, 92, 246, 0) 0%,
            rgba(139, 92, 246, 0.03) 40%,
            rgba(139, 92, 246, 0.05) 60%,
            rgba(139, 92, 246, 0) 100%
          );
          opacity: 0;
          transition: opacity 0.5s ease;
          z-index: -1;
        }

        .ach-row:hover .ach-row-glow {
          opacity: 1;
        }

        .ach-row:hover .ach-title {
          color: #fff;
          text-shadow: 0 0 30px rgba(139, 92, 246, 0.2);
        }

        .ach-row:hover .ach-index span {
          color: var(--color-primary-light);
        }

        .ach-row:hover .ach-metric-value {
          color: var(--color-primary-light);
          text-shadow: 0 0 40px rgba(139, 92, 246, 0.35);
        }

        .ach-row:hover .ach-subtitle {
          color: rgba(255, 255, 255, 0.65);
        }

        /* ── Index ── */
        .ach-index {
          padding-top: 4px;
        }

        .ach-index span {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.2);
          transition: color 0.4s ease;
        }

        /* ── Content ── */
        .ach-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ach-title {
          font-family: var(--font-display);
          font-size: clamp(1.1rem, 2vw, 1.4rem);
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.88);
          transition: color 0.4s ease, text-shadow 0.4s ease;
          line-height: 1.3;
        }

        .ach-subtitle {
          font-family: var(--font-body);
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.35);
          letter-spacing: 0.02em;
          margin-bottom: 8px;
          transition: color 0.4s ease;
        }

        /* ── Bullet Items (Redesigned) ── */
        .ach-bullets {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .ach-bullet-item {
          display: flex;
          align-items: stretch;
          gap: 14px;
          padding: 10px 0;
          position: relative;
          transition: all 0.35s ease;
        }

        .ach-bullet-item:hover {
          transform: translateX(4px);
        }

        .ach-bullet-item:hover .ach-bullet-dot {
          background: var(--color-primary-light);
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5),
                      0 0 20px rgba(139, 92, 246, 0.2);
          transform: scale(1.4);
        }

        .ach-bullet-item:hover .ach-bullet-line {
          background: linear-gradient(180deg, var(--color-primary) 0%, transparent 100%);
          opacity: 0.5;
        }

        .ach-bullet-item:hover .ach-bullet-highlight {
          color: #fff;
          text-shadow: 0 0 12px rgba(139, 92, 246, 0.3);
        }

        .ach-bullet-item:hover .ach-bullet-text {
          color: rgba(255, 255, 255, 0.7);
        }

        .ach-bullet-item:hover .ach-bullet-detail {
          color: rgba(255, 255, 255, 0.4);
        }

        /* Marker (dot + vertical line) */
        .ach-bullet-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          min-width: 12px;
          padding-top: 6px;
          flex-shrink: 0;
        }

        .ach-bullet-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-primary-dim);
          opacity: 0.6;
          flex-shrink: 0;
          transition: all 0.35s ease;
        }

        .ach-bullet-line {
          width: 1px;
          flex: 1;
          min-height: 12px;
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.2) 0%, transparent 100%);
          opacity: 0.3;
          transition: all 0.35s ease;
        }

        .ach-bullet-item:last-child .ach-bullet-line {
          opacity: 0;
        }

        /* Bullet body */
        .ach-bullet-body {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .ach-bullet-headline {
          display: flex;
          align-items: baseline;
          gap: 8px;
          flex-wrap: wrap;
        }

        .ach-bullet-highlight {
          font-family: var(--font-display);
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--color-primary-light);
          letter-spacing: 0.02em;
          white-space: nowrap;
          transition: all 0.35s ease;
        }

        .ach-bullet-sep {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          color: rgba(139, 92, 246, 0.3);
          flex-shrink: 0;
        }

        .ach-bullet-text {
          font-family: var(--font-body);
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.5;
          transition: color 0.35s ease;
        }

        .ach-bullet-detail {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.22);
          letter-spacing: 0.03em;
          line-height: 1.5;
          margin-top: 2px;
          transition: color 0.35s ease;
        }

        .ach-note {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: rgba(255, 255, 255, 0.2);
          letter-spacing: 0.04em;
          margin-top: 6px;
          padding: 8px 14px;
          border-left: 2px solid rgba(139, 92, 246, 0.2);
          background: rgba(139, 92, 246, 0.02);
          border-radius: 0 6px 6px 0;
          line-height: 1.6;
          font-style: italic;
        }

        /* ── Tags ── */
        .ach-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 12px;
        }

        .ach-tag {
          font-family: var(--font-mono);
          font-size: 0.5rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 3px 9px;
          border-radius: 999px;
          border: 1px solid rgba(139, 92, 246, 0.12);
          color: rgba(167, 139, 250, 0.5);
          background: rgba(139, 92, 246, 0.03);
          transition: all 0.35s ease;
        }

        .ach-row:hover .ach-tag {
          border-color: rgba(139, 92, 246, 0.3);
          color: rgba(167, 139, 250, 0.8);
          background: rgba(139, 92, 246, 0.08);
        }

        /* ── Metric Block ── */
        .ach-metric-block {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: flex-start;
          padding-top: 0;
          text-align: right;
        }

        .ach-metric-value {
          font-family: var(--font-display);
          font-size: clamp(2.4rem, 5vw, 3.6rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1;
          color: rgba(255, 255, 255, 0.12);
          transition: color 0.4s ease, text-shadow 0.5s ease;
        }

        .ach-metric-label {
          font-family: var(--font-mono);
          font-size: 0.5rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.15);
          margin-top: 4px;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .ach-row {
            grid-template-columns: 40px 1fr;
            gap: 16px;
            padding: 32px 12px;
          }

          .ach-metric-block {
            grid-column: 2;
            flex-direction: row;
            align-items: center;
            gap: 10px;
            margin-top: 8px;
          }

          .ach-metric-value {
            font-size: 1.8rem;
          }

          .ach-metric-label {
            margin-top: 0;
          }

          .ach-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .ach-header-right {
            text-align: left;
          }

          .ach-watermark {
            font-size: clamp(3rem, 20vw, 6rem);
            -webkit-text-stroke-width: 1px;
          }

          .ach-bullet-headline {
            flex-direction: column;
            gap: 2px;
          }

          .ach-bullet-sep {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .ach-row {
            grid-template-columns: 1fr;
            gap: 8px;
            padding: 28px 8px;
          }

          .ach-index {
            display: none;
          }

          .ach-title::before {
            content: attr(data-index) ' — ';
            font-family: var(--font-mono);
            font-size: 0.65rem;
            color: rgba(255,255,255,0.2);
            letter-spacing: 0.1em;
          }
        }
      `}</style>
    </section>
  )
}
