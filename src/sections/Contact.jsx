import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { trackContactSubmit, trackGitHubClick, trackLinkedInClick, trackResumeDownload } from '../lib/analytics'

const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT || 'https://formspree.io/f/YOUR_FORMSPREE_ID'
const RESUME_URL = '/Dipanjana_Ghosh_resume.docx'

/* ═══════════════════════════════════════════════════════════════
   TYPING ANIMATION HOOK
   ═══════════════════════════════════════════════════════════════ */
function useTyping(text, active, speed = 28) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!active) { setDisplayed(''); setDone(false); return }
    setDisplayed('')
    setDone(false)
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(id); setDone(true) }
    }, speed)
    return () => clearInterval(id)
  }, [text, active, speed])

  return { displayed, done }
}

/* ═══════════════════════════════════════════════════════════════
   TERMINAL LINE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
function TermLine({ children, type = 'system', delay = 0, onDone, animate = false, text = '' }) {
  const { displayed, done } = useTyping(text, animate, 22)

  useEffect(() => {
    if (done && onDone) onDone()
  }, [done, onDone])

  if (animate) {
    return (
      <div className={`term-line term-${type}`}>
        <span className="term-prefix">{type === 'system' ? '>' : type === 'user' ? '$' : '~'}</span>
        <span>{displayed}<span className="term-cursor-inline" /></span>
      </div>
    )
  }

  return (
    <motion.div
      className={`term-line term-${type}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      {type !== 'blank' && <span className="term-prefix">{type === 'system' ? '>' : type === 'user' ? '$' : '~'}</span>}
      <span>{children}</span>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   TERMINAL MODAL
   ═══════════════════════════════════════════════════════════════ */
const STEPS = {
  BOOT: 'BOOT',
  OPTIONS: 'OPTIONS',
  CONTEXT: 'CONTEXT',
  NAME: 'NAME',
  EMAIL: 'EMAIL',
  COMPANY: 'COMPANY',
  PROFILE: 'PROFILE',
  SENDING: 'SENDING',
  DONE: 'DONE',
}

const OPTION_LIST = [
  { key: 'recruiter', label: 'recruiter', desc: 'hiring or scouting talent' },
  { key: 'internship', label: 'internship', desc: 'offering an opportunity' },
  { key: 'collaboration', label: 'collaboration', desc: 'building together' },
  { key: 'hello', label: 'hello', desc: 'just saying hi' },
]

const CONTEXT_PROMPTS = {
  recruiter: 'tell me about the role or opportunity:',
  internship: 'tell me about the internship opportunity:',
  collaboration: 'what are you building?',
  hello: 'feel free to drop a message:',
}

function TerminalModal({ isOpen, onClose }) {
  const [step, setStep] = useState(STEPS.BOOT)
  const [bootLine, setBootLine] = useState(0)
  const [choice, setChoice] = useState(null)
  const [inputs, setInputs] = useState({ context: '', name: '', email: '', company: '' })
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef(null)
  const scrollRef = useRef(null)
  const [lines, setLines] = useState([])

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => { scrollToBottom() }, [lines, step, bootLine, scrollToBottom])

  // Focus input
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [step])

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep(STEPS.BOOT)
      setBootLine(0)
      setChoice(null)
      setInputs({ context: '', name: '', email: '', company: '' })
      setInputValue('')
      setLines([])
    }
  }, [isOpen])

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Boot sequence
  useEffect(() => {
    if (!isOpen || step !== STEPS.BOOT) return
    const timers = [
      setTimeout(() => setBootLine(1), 400),
      setTimeout(() => setBootLine(2), 1000),
      setTimeout(() => setBootLine(3), 1600),
      setTimeout(() => setStep(STEPS.OPTIONS), 2200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [isOpen, step])

  // Quick commands
  const handleQuickCommand = (cmd) => {
    const lower = cmd.trim().toLowerCase()
    if (lower === 'exit' || lower === 'close') {
      onClose()
      return true
    }
    if (lower === 'resume') {
      window.open(RESUME_URL, '_blank')
      return true
    }
    if (lower === 'github') {
      window.open('https://github.com/Dipan2208', '_blank')
      return true
    }
    if (lower === 'linkedin') {
      window.open('https://www.linkedin.com/in/dipanjana-ghosh-a99a522b6', '_blank')
      return true
    }
    return false
  }

  const handleOptionClick = (key) => {
    setChoice(key)
    setStep(STEPS.CONTEXT)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const val = inputValue.trim()
    if (!val) return

    // Check quick commands at any input step
    if (handleQuickCommand(val)) {
      setInputValue('')
      return
    }

    if (step === STEPS.CONTEXT) {
      setInputs(p => ({ ...p, context: val }))
      setInputValue('')
      setStep(STEPS.NAME)
    } else if (step === STEPS.NAME) {
      setInputs(p => ({ ...p, name: val }))
      setInputValue('')
      setStep(STEPS.EMAIL)
    } else if (step === STEPS.EMAIL) {
      setInputs(p => ({ ...p, email: val }))
      setInputValue('')
      setStep(STEPS.COMPANY)
    } else if (step === STEPS.COMPANY) {
      const finalCompany = val || '—'
      setInputs(p => ({ ...p, company: finalCompany }))
      setInputValue('')
      setStep(STEPS.PROFILE)
      
      // Sequence: Profile View -> Sending Status -> Done
      setTimeout(() => setStep(STEPS.SENDING), 2800)
      setTimeout(async () => {
        try {
          await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: choice,
              name: inputs.name,
              email: inputs.email,
              company: finalCompany,
              message: inputs.context
            })
          })
        } catch (err) {
          console.error('Formspree error:', err)
        }
        trackContactSubmit()
        setStep(STEPS.DONE)
      }, 4200)
    }
  }

  const handleSkip = () => {
    if (step === STEPS.COMPANY) {
      setInputs(p => ({ ...p, company: '—' }))
      setInputValue('')
      setStep(STEPS.PROFILE)
      
      setTimeout(() => setStep(STEPS.SENDING), 2800)
      setTimeout(async () => {
        try {
          await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: choice,
              name: inputs.name,
              email: inputs.email,
              company: '—',
              message: inputs.context
            })
          })
        } catch (err) {
          console.error('Formspree error:', err)
        }
        trackContactSubmit()
        setStep(STEPS.DONE)
      }, 4200)
    }
  }

  const getPromptLabel = () => {
    if (step === STEPS.CONTEXT) return CONTEXT_PROMPTS[choice] || '>'
    if (step === STEPS.NAME) return 'your name:'
    if (step === STEPS.EMAIL) return 'your email:'
    if (step === STEPS.COMPANY) return 'company / organization (optional):'
    return '>'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="term-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="term-window"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="term-header">
              <div className="term-dots">
                <span className="term-dot term-dot-red" onClick={onClose} />
                <span className="term-dot term-dot-yellow" />
                <span className="term-dot term-dot-green" />
              </div>
              <span className="term-title">dipanjana@portfolio:~</span>
              <div style={{ width: 52 }} />
              {/* Explicit close button */}
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 12,
                  cursor: 'pointer',
                  marginLeft: 12,
                  fontFamily: 'var(--font-mono)',
                }}
              >✕</button>
            </div>

            {/* Body */}
            <div className="term-body" ref={scrollRef}>
              {/* Boot Sequence */}
              {step === STEPS.BOOT && (
                <>
                  {bootLine >= 1 && <TermLine type="system" delay={0}>initializing connection...</TermLine>}
                  {bootLine >= 2 && <TermLine type="system" delay={0}>loading interface...</TermLine>}
                  {bootLine >= 3 && <TermLine type="system" delay={0}><span className="term-success">ready.</span></TermLine>}
                </>
              )}

              {/* Options */}
              {(step === STEPS.OPTIONS || step !== STEPS.BOOT) && step !== STEPS.BOOT && (
                <>
                  <TermLine type="system" delay={0}>initializing connection...</TermLine>
                  <TermLine type="system" delay={0}>loading interface...</TermLine>
                  <TermLine type="system" delay={0}><span className="term-success">ready.</span></TermLine>
                  <div className="term-spacer" />
                </>
              )}

              {step === STEPS.OPTIONS && (
                <>
                  <TermLine type="system" delay={0.1}>Looking to connect?</TermLine>
                  <TermLine type="system" delay={0.2}>Select an option or type a command:</TermLine>
                  <div className="term-spacer" />
                  <motion.div
                    className="term-options"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {OPTION_LIST.map((opt, i) => (
                      <motion.button
                        key={opt.key}
                        className={`term-option ${opt.key === 'recruiter' || opt.key === 'internship' ? 'term-option-highlight' : ''}`}
                        onClick={() => handleOptionClick(opt.key)}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.08 }}
                      >
                        <span className="term-option-key">{opt.label}</span>
                        <span className="term-option-desc">— {opt.desc}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                  <div className="term-spacer" />
                  <TermLine type="info" delay={0.9}>
                    <span className="term-dim">quick commands: </span>
                    <span className="term-cmd">resume</span>
                    <span className="term-dim"> · </span>
                    <span className="term-cmd">github</span>
                    <span className="term-dim"> · </span>
                    <span className="term-cmd">linkedin</span>
                  </TermLine>
                </>
              )}

              {/* After option selected — show history */}
              {step !== STEPS.BOOT && step !== STEPS.OPTIONS && (
                <>
                  <TermLine type="system" delay={0}>Looking to connect?</TermLine>
                  <TermLine type="user" delay={0}>{choice}</TermLine>
                  <div className="term-spacer" />
                </>
              )}

              {/* Context Input */}
              {step === STEPS.CONTEXT && (
                <TermLine type="system" delay={0.1}>{CONTEXT_PROMPTS[choice]}</TermLine>
              )}

              {/* Name Input - show context answer */}
              {(step === STEPS.NAME || step === STEPS.EMAIL || step === STEPS.COMPANY || step === STEPS.PROFILE || step === STEPS.SENDING || step === STEPS.DONE) && (
                <>
                  <TermLine type="system" delay={0}>{CONTEXT_PROMPTS[choice]}</TermLine>
                  <TermLine type="user" delay={0}>{inputs.context}</TermLine>
                  <div className="term-spacer" />
                </>
              )}

              {step === STEPS.NAME && (
                <TermLine type="system" delay={0.1}>your name:</TermLine>
              )}

              {/* Email - show name */}
              {(step === STEPS.EMAIL || step === STEPS.COMPANY || step === STEPS.PROFILE || step === STEPS.SENDING || step === STEPS.DONE) && (
                <>
                  <TermLine type="system" delay={0}>your name:</TermLine>
                  <TermLine type="user" delay={0}>{inputs.name}</TermLine>
                </>
              )}

              {step === STEPS.EMAIL && (
                <TermLine type="system" delay={0.1}>your email:</TermLine>
              )}

              {/* Company - show email */}
              {(step === STEPS.COMPANY || step === STEPS.PROFILE || step === STEPS.SENDING || step === STEPS.DONE) && (
                <>
                  <TermLine type="system" delay={0}>your email:</TermLine>
                  <TermLine type="user" delay={0}>{inputs.email}</TermLine>
                </>
              )}

              {step === STEPS.COMPANY && (
                <>
                  <TermLine type="system" delay={0.1}>company / organization (optional):</TermLine>
                  <motion.button
                    className="term-skip"
                    onClick={handleSkip}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    skip →
                  </motion.button>
                </>
              )}

              {/* Company answer shown */}
              {(step === STEPS.PROFILE || step === STEPS.SENDING || step === STEPS.DONE) && inputs.company && inputs.company !== '—' && (
                <>
                  <TermLine type="system" delay={0}>company / organization:</TermLine>
                  <TermLine type="user" delay={0}>{inputs.company}</TermLine>
                </>
              )}

              {/* Profile Reinforcement */}
              {(step === STEPS.PROFILE || step === STEPS.SENDING || step === STEPS.DONE) && (
                <>
                  <div className="term-spacer" />
                  <div className="term-profile-block">
                    <TermLine type="info" delay={0.2}>
                      <span className="term-label">profile:</span> full-stack developer | cs student
                    </TermLine>
                    <TermLine type="info" delay={0.4}>
                      <span className="term-label">focus:</span> scalable systems, ai workflows, product thinking
                    </TermLine>
                    <TermLine type="info" delay={0.6}>
                      <span className="term-label">status:</span> <span className="term-success">open to internship opportunities</span>
                    </TermLine>
                  </div>
                </>
              )}

              {/* Sending */}
              {(step === STEPS.SENDING || step === STEPS.DONE) && (
                <>
                  <div className="term-spacer" />
                  <TermLine type="system" delay={0}>sending message...</TermLine>
                </>
              )}

              {step === STEPS.DONE && (
                <>
                  <TermLine type="system" delay={0.2}><span className="term-success">connection established ✔</span></TermLine>
                  <div className="term-spacer" />
                  <TermLine type="system" delay={0.5}>thanks for reaching out.</TermLine>
                  <TermLine type="system" delay={0.7}>looking forward to building something meaningful.</TermLine>
                  <div className="term-spacer" />
                  <TermLine type="info" delay={1.0}>
                    <span className="term-dim">or reach me directly at: </span>
                    <a href="mailto:dipanjanaghosh489@gmail.com" className="term-email">dipanjanaghosh489@gmail.com</a>
                  </TermLine>
                  <div className="term-spacer" />
                  <motion.button
                    className="term-skip"
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    style={{ marginTop: 12 }}
                  >
                    [exit terminal]
                  </motion.button>
                </>
              )}

              {/* Active Input */}
              {(step === STEPS.CONTEXT || step === STEPS.NAME || step === STEPS.EMAIL || step === STEPS.COMPANY) && (
                <form className="term-input-row" onSubmit={handleSubmit}>
                  <span className="term-prefix">$</span>
                  <input
                    ref={inputRef}
                    className="term-input"
                    type={step === STEPS.EMAIL ? 'email' : 'text'}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder=""
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <span className="term-cursor-blink" />
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN CONTACT SECTION
   ═══════════════════════════════════════════════════════════════ */
export default function Contact() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const [terminalOpen, setTerminalOpen] = useState(false)

  const stagger = (i) => ({
    initial: { opacity: 0, y: 30 },
    animate: isInView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.8, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] },
  })

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="obs-section bg-dark"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '120px 40px 60px',
      }}
    >
      <div className="cta-watermark ghost-text-bg">CONNECT</div>
      <div className="cta-ambient-glow" />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '900px', textAlign: 'center' }}>
        <motion.div {...stagger(0)} className="cta-status">
          <span className="cta-status-dot" />
          STATUS: AVAILABLE FOR COLLABORATION
        </motion.div>

        <motion.div
          className="cta-divider-v"
          initial={{ scaleY: 0 }}
          animate={isInView ? { scaleY: 1 } : {}}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />

        <div className="cta-headline-wrap">
          <motion.h2 {...stagger(1)} className="cta-headline-line1">
            LET'S BUILD SOMETHING
          </motion.h2>
          <motion.h2 {...stagger(2)} className="cta-headline-line2">
            THAT <span className="cta-keyword">MATTERS</span>
          </motion.h2>
        </div>

        <motion.p {...stagger(3)} className="cta-subtext">
          Open to collaborations, internships, and ambitious ideas.
          <br />
          Let's turn concepts into working systems.
        </motion.p>

        <motion.div {...stagger(4)}>
          <button className="cta-primary" onClick={() => setTerminalOpen(true)}>
            <span className="cta-primary-glow" />
            <span className="cta-primary-text">START A CONVERSATION</span>
          </button>
        </motion.div>

        <motion.div {...stagger(5)} className="cta-secondary">
          <a
            href="https://github.com/Dipan2208"
            target="_blank" rel="noreferrer"
            className="cta-link"
            onClick={trackGitHubClick}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GITHUB
          </a>
          <a
            href="https://www.linkedin.com/in/dipanjana-ghosh-a99a522b6"
            target="_blank" rel="noreferrer"
            className="cta-link"
            onClick={trackLinkedInClick}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            LINKEDIN
          </a>
          <a
            href={RESUME_URL}
            download="Dipanjana_Ghosh_resume.docx"
            className="cta-link"
            onClick={trackResumeDownload}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            RESUME
          </a>
        </motion.div>

        <motion.div
          className="cta-hr"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />

        <motion.div {...stagger(6)} className="cta-footer-stack">
          <span className="cta-tech-signature">
            Built with React, caffeine,<br className="mobile-break" /> and optimistic deployment decisions.
          </span>
          <div className="cta-footer">
            <span>© 2026 DIPANJANA GHOSH</span>
            <span>ALL RIGHTS RESERVED</span>
          </div>
        </motion.div>
      </div>

      <TerminalModal isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />

      <style>{`
        /* ══════════════ CTA SECTION ══════════════ */
        .cta-watermark {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-family: var(--font-display);
          font-size: clamp(8rem, 22vw, 28rem);
          font-weight: 800; text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(139, 92, 246, 0.03);
          pointer-events: none; z-index: 0; user-select: none;
          white-space: nowrap; line-height: 1;
        }
        .cta-ambient-glow {
          position: absolute; top: 30%; left: 50%;
          transform: translateX(-50%);
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .cta-status {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: var(--font-mono); font-size: 0.55rem;
          letter-spacing: 0.25em; color: rgba(167, 139, 250, 0.6);
          text-transform: uppercase; margin-bottom: 24px;
          padding: 6px 16px;
          border: 1px solid rgba(139, 92, 246, 0.12);
          border-radius: 999px; background: rgba(139, 92, 246, 0.04);
        }
        .cta-status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
          animation: statusPulse 2s ease-in-out infinite;
        }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(34, 197, 94, 0.5); }
          50% { opacity: 0.5; box-shadow: 0 0 4px rgba(34, 197, 94, 0.2); }
        }
        .cta-divider-v {
          width: 1px; height: 48px;
          background: linear-gradient(180deg, transparent, rgba(139, 92, 246, 0.3), transparent);
          margin: 0 auto 36px; transform-origin: top;
        }
        .cta-headline-wrap { margin-bottom: 28px; }
        .cta-headline-line1, .cta-headline-line2 {
          font-family: var(--font-display);
          font-size: clamp(1.6rem, 6vw, 4rem);
          font-weight: 700; letter-spacing: -0.02em;
          line-height: 1.1; color: var(--color-text-primary); margin: 0;
        }
        .cta-keyword {
          background: linear-gradient(135deg, var(--color-primary-light), var(--color-lavender), var(--color-primary));
          background-size: 200% 200%;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: keywordShift 6s ease-in-out infinite;
          font-style: italic;
        }
        @keyframes keywordShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .cta-subtext {
          font-family: var(--font-body); font-size: 0.92rem;
          color: rgba(255, 255, 255, 0.4); line-height: 1.7;
          max-width: 520px; margin: 0 auto 44px;
        }
        .cta-primary {
          position: relative; display: inline-flex;
          align-items: center; justify-content: center;
          padding: 16px 44px;
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 999px; background: rgba(139, 92, 246, 0.08);
          cursor: none; overflow: hidden;
          transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cta-primary-glow {
          position: absolute; inset: -1px; border-radius: 999px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dim));
          opacity: 0; transition: opacity 0.45s ease; z-index: 0;
        }
        .cta-primary-text {
          position: relative; z-index: 1;
          font-family: var(--font-mono); font-size: 0.7rem;
          letter-spacing: 0.2em; color: var(--color-primary-light);
          font-weight: 600; transition: color 0.35s ease;
        }
        .cta-primary:hover {
          transform: scale(1.06);
          border-color: rgba(139, 92, 246, 0.5);
          box-shadow: 0 0 40px rgba(139, 92, 246, 0.2), 0 0 80px rgba(139, 92, 246, 0.08);
        }
        .cta-primary:hover .cta-primary-glow { opacity: 1; }
        .cta-primary:hover .cta-primary-text { color: #fff; }
        .cta-primary:active { transform: scale(0.98); }
        .cta-secondary {
          display: flex; justify-content: center;
          gap: 12px; margin-top: 28px; flex-wrap: wrap;
        }
        .cta-link {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: var(--font-mono); font-size: 0.6rem;
          letter-spacing: 0.15em; text-transform: uppercase;
          text-decoration: none; color: rgba(255, 255, 255, 0.3);
          padding: 10px 20px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 999px; background: rgba(255, 255, 255, 0.02);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cta-link svg { opacity: 0.5; transition: opacity 0.35s ease; }
        .cta-link:hover {
          color: var(--color-primary-light);
          border-color: rgba(139, 92, 246, 0.25);
          background: rgba(139, 92, 246, 0.06);
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.1);
        }
        .cta-link:hover svg { opacity: 1; }
        .cta-hr {
          width: 100%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          margin: 60px 0 24px; transform-origin: center;
        }
        .cta-footer-stack {
          display: flex; flex-direction: column; gap: 16px;
        }
        .cta-tech-signature {
          text-align: center;
          font-family: var(--font-mono); font-size: 0.5rem;
          color: rgba(255, 255, 255, 0.15);
          letter-spacing: 0.1em; line-height: 1.6;
        }
        .cta-footer {
          display: flex; justify-content: space-between;
          align-items: center;
          font-family: var(--font-mono); font-size: 0.5rem;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(255, 255, 255, 0.18); padding: 0 4px;
        }
        .mobile-break { display: none; }

        /* ══════════════ TERMINAL MODAL ══════════════ */
        .term-overlay {
          position: fixed; inset: 0;
          background: rgba(2, 2, 6, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          z-index: 99999;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .term-window {
          width: 100%; max-width: 640px; max-height: 80vh;
          display: flex; flex-direction: column;
          background: linear-gradient(180deg, rgba(14, 14, 18, 0.98), rgba(8, 8, 12, 0.99));
          border: 1px solid rgba(139, 92, 246, 0.1);
          border-radius: 14px; overflow: hidden;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.7),
                      0 0 80px rgba(139, 92, 246, 0.05);
        }
        .term-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .term-dots { display: flex; gap: 7px; }
        .term-dot {
          width: 11px; height: 11px; border-radius: 50%;
          transition: opacity 0.2s;
        }
        .term-dot-red { background: #ff5f57; cursor: pointer; }
        .term-dot-red:hover { opacity: 0.7; }
        .term-dot-yellow { background: #febc2e; }
        .term-dot-green { background: #28c840; }
        .term-title {
          font-family: 'JetBrains Mono', var(--font-mono);
          font-size: 0.68rem; color: rgba(255, 255, 255, 0.35);
          letter-spacing: 0.04em;
        }

        /* ── Terminal Body ── */
        .term-body {
          flex: 1; overflow-y: auto;
          padding: 20px 22px 24px;
          font-family: 'JetBrains Mono', var(--font-mono);
          font-size: 0.78rem; line-height: 1.7;
          scroll-behavior: smooth;
        }
        .term-body::-webkit-scrollbar { width: 3px; }
        .term-body::-webkit-scrollbar-track { background: transparent; }
        .term-body::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.2); border-radius: 3px; }

        .term-spacer { height: 12px; }

        /* ── Lines ── */
        .term-line {
          display: flex; gap: 10px; align-items: flex-start;
          padding: 2px 0; min-height: 22px;
        }
        .term-prefix {
          color: rgba(139, 92, 246, 0.5); flex-shrink: 0;
          font-weight: 500; user-select: none;
          min-width: 12px;
        }
        .term-system { color: rgba(255, 255, 255, 0.55); }
        .term-user .term-prefix { color: var(--color-primary-light); }
        .term-user { color: rgba(255, 255, 255, 0.8); }
        .term-info { color: rgba(255, 255, 255, 0.35); }
        .term-success { color: #22c55e; }
        .term-dim { color: rgba(255, 255, 255, 0.2); }
        .term-label {
          color: var(--color-primary-light);
          font-weight: 500;
        }
        .term-cmd {
          color: rgba(167, 139, 250, 0.6);
          border-bottom: 1px dashed rgba(139, 92, 246, 0.2);
        }
        .term-email {
          color: var(--color-primary-light);
          text-decoration: none;
          border-bottom: 1px solid rgba(139, 92, 246, 0.3);
          transition: color 0.2s;
        }
        .term-email:hover { color: #fff; }

        /* ── Options ── */
        .term-options {
          display: flex; flex-direction: column; gap: 4px;
          padding-left: 22px;
        }
        .term-option {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 14px; border-radius: 8px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.04);
          font-family: 'JetBrains Mono', var(--font-mono);
          font-size: 0.75rem; color: rgba(255, 255, 255, 0.5);
          cursor: pointer; text-align: left;
          transition: all 0.3s ease;
        }
        .term-option:hover {
          background: rgba(139, 92, 246, 0.06);
          border-color: rgba(139, 92, 246, 0.15);
          color: rgba(255, 255, 255, 0.8);
        }
        .term-option-highlight {
          border-color: rgba(139, 92, 246, 0.12);
          background: rgba(139, 92, 246, 0.03);
        }
        .term-option-highlight .term-option-key {
          color: var(--color-primary-light);
        }
        .term-option-key {
          font-weight: 500; color: rgba(255, 255, 255, 0.7);
          min-width: 110px;
        }
        .term-option-desc {
          color: rgba(255, 255, 255, 0.25); font-size: 0.7rem;
        }

        /* ── Input ── */
        .term-input-row {
          display: flex; align-items: center; gap: 10px;
          padding: 6px 0; margin-top: 4px;
        }
        .term-input {
          flex: 1; background: transparent; border: none;
          font-family: 'JetBrains Mono', var(--font-mono);
          font-size: 0.78rem; color: rgba(255, 255, 255, 0.85);
          outline: none; caret-color: var(--color-primary-light);
          padding: 0;
        }
        .term-input::placeholder { color: rgba(255, 255, 255, 0.15); }

        .term-cursor-blink {
          display: inline-block; width: 8px; height: 16px;
          background: var(--color-primary-light);
          animation: cursorBlink 1s step-end infinite;
          margin-left: -2px; opacity: 0.7;
          flex-shrink: 0;
        }
        .term-cursor-inline {
          display: inline-block; width: 7px; height: 14px;
          background: var(--color-primary-light);
          animation: cursorBlink 1s step-end infinite;
          vertical-align: text-bottom; margin-left: 1px;
          opacity: 0.6;
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0; }
        }

        .term-skip {
          background: none; border: none;
          font-family: 'JetBrains Mono', var(--font-mono);
          font-size: 0.65rem; color: rgba(139, 92, 246, 0.4);
          cursor: pointer; margin-left: 22px; margin-top: 4px;
          padding: 4px 8px; border-radius: 4px;
          transition: all 0.25s ease;
        }
        .term-skip:hover {
          color: var(--color-primary-light);
          background: rgba(139, 92, 246, 0.06);
        }

        /* ── Profile Block ── */
        .term-profile-block {
          padding: 10px 0 6px 10px;
          border-left: 2px solid rgba(139, 92, 246, 0.15);
          margin-left: 10px;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .cta-headline-line1, .cta-headline-line2 {
            font-size: clamp(1.6rem, 8vw, 2.8rem);
          }
          .cta-footer {
            flex-direction: column; gap: 8px; text-align: center;
          }
          .cta-secondary {
            flex-direction: column; align-items: center;
          }
          .cta-link { width: 200px; justify-content: center; }
          .cta-watermark {
            font-size: clamp(4rem, 20vw, 8rem);
            -webkit-text-stroke-width: 1px;
          }
          .mobile-break { display: block; }
          .term-window { max-height: 85vh; }
          .term-option { flex-direction: column; gap: 2px; align-items: flex-start; }
          .term-option-key { min-width: auto; }
        }
      `}</style>
    </section>
  )
}
