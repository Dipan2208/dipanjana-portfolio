import { Fragment, useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, LayoutGroup, useInView } from 'framer-motion'
import gsap from 'gsap'
import { BLOG_POSTS, CATEGORIES } from '../data/blogPosts'
import { useSound } from '../context/SoundContext'

const EASE_OUT = [0.16, 1, 0.3, 1]

function renderInlineMarkdown(text) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index}>{part.slice(1, -1)}</code>
    }
    return <Fragment key={index}>{part}</Fragment>
  })
}

/* ── Interactive Full-Screen Reader Modal ────────────────────── */
function ArticleModal({ post, isOpen, onClose }) {
  const { playSoftClick } = useSound()
  const contentRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [copied, setCopied] = useState(false)

  // Track scroll progress within article modal
  useEffect(() => {
    if (!isOpen) return
    const el = contentRef.current
    if (!el) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const total = scrollHeight - clientHeight
      if (total <= 0) {
        setScrollProgress(100)
        return
      }
      setScrollProgress(Math.min(100, Math.max(0, (scrollTop / total) * 100)))
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [isOpen])

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleCopyLink = () => {
    if (playSoftClick) playSoftClick()
    navigator.clipboard?.writeText?.(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2400)
  }

  if (!post) return null

  // Render markdown-like sections cleanly
  const renderFormattedContent = (rawText) => {
    const sections = rawText.split('\n\n')
    return sections.map((sec, idx) => {
      const trimmed = sec.trim()
      if (!trimmed) return null

      // Process diagrams
      if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
        const lines = trimmed.split('\n')
        const lang = lines[0].replace('```', '').trim()
        const code = lines.slice(1, -1).join('\n')

        if (lang.toLowerCase() === 'flow') {
          const routes = code.split('\n').map((line) =>
            line.split(/\s*(?:→|->)\s*/).map((step) => step.trim()).filter(Boolean),
          ).filter((steps) => steps.length > 0)

          return (
            <div key={idx} className="blog-flowchart" role="list" aria-label="Article process flowchart">
              <span className="blog-flowchart-label">HOW THE FLOW WORKS</span>
              {routes.map((steps, routeIndex) => (
                <div key={routeIndex} className="blog-flowchart-route">
                  {steps.map((step, stepIndex) => (
                    <Fragment key={`${routeIndex}-${stepIndex}`}>
                      <div className="blog-flowchart-node" role="listitem">
                        <span className="blog-flowchart-step">
                          PATH {String(routeIndex + 1).padStart(2, '0')} · STEP {String(stepIndex + 1).padStart(2, '0')}
                        </span>
                        <span>{renderInlineMarkdown(step)}</span>
                      </div>
                      {stepIndex < steps.length - 1 && (
                        <span className="blog-flowchart-arrow" aria-hidden="true">→</span>
                      )}
                    </Fragment>
                  ))}
                </div>
              ))}
            </div>
          )
        }

        return (
          <div key={idx} className="blog-code-block">
            {lang && <span className="blog-code-lang">{lang.toUpperCase()}</span>}
            <pre><code>{code}</code></pre>
          </div>
        )
      }

      // H3 headers
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="blog-content-h3">
            {trimmed.replace('### ', '')}
          </h3>
        )
      }

      // Ordered or unordered lists
      if (/^(?:- |\d+\. )/.test(trimmed)) {
        const items = trimmed.split('\n')
        const isOrdered = /^\d+\. /.test(items[0])
        const List = isOrdered ? 'ol' : 'ul'
        return (
          <List key={idx} className="blog-content-list">
            {items.map((it, i) => (
              <li key={i}>{renderInlineMarkdown(it.replace(/^(-\s*|\d+\.\s*)/, ''))}</li>
            ))}
          </List>
        )
      }

      // Standard paragraphs
      return (
        <p key={idx} className="blog-content-p">
          {renderInlineMarkdown(trimmed)}
        </p>
      )
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="blog-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="blog-modal-window"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.98 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top reading progress line */}
            <div className="blog-reading-progress-track">
              <div
                className="blog-reading-progress-bar"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>

            {/* Modal Header */}
            <div className="blog-modal-header">
              <div className="blog-header-telemetry">
                <span className="blog-telemetry-dot" />
                <span className="blog-telemetry-title">RESEARCH ARCHIVE // {post.category.toUpperCase()}</span>
              </div>
              <div className="blog-header-actions">
                <button
                  className="blog-action-btn"
                  onClick={handleCopyLink}
                  title="Copy link to dispatch"
                >
                  {copied ? '✓ COPIED' : 'SHARE DISPATCH'}
                </button>
                <button
                  className="blog-close-btn"
                  onClick={onClose}
                  aria-label="Close reading view"
                >
                  ✕ [ESC]
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="blog-modal-body" ref={contentRef}>
              <div className="blog-article-meta-row">
                <span className="blog-date-badge">{post.date}</span>
                <span className="blog-time-badge">{post.readTime}</span>
                <span className="blog-author-badge">BY DIPANJANA GHOSH</span>
              </div>

              <h1 className="blog-article-title">{post.title}</h1>
              <p className="blog-article-subtitle">{post.subtitle}</p>

              {/* Telemetry Grid */}
              {post.telemetry && (
                <div className="blog-article-telemetry-grid">
                  {Object.entries(post.telemetry).map(([key, value]) => (
                    <div key={key} className="blog-telemetry-card">
                      <span className="blog-telemetry-key">{key.toUpperCase()}</span>
                      <span className="blog-telemetry-val">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags */}
              <div className="blog-article-tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="blog-tag-pill">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="blog-article-divider" />

              {/* Formatted Content */}
              <div className="blog-article-content">
                {renderFormattedContent(post.content)}
              </div>

              {/* Article Footer */}
              <div className="blog-article-footer">
                <div className="blog-footer-author">
                  <div className="blog-author-avatar">DG</div>
                  <div>
                    <div className="blog-author-name">Dipanjana Ghosh</div>
                    <div className="blog-author-role">Full-Stack Developer & AI Builder</div>
                  </div>
                </div>
                <button className="blog-footer-back-btn" onClick={onClose}>
                  ← BACK TO ALL DISPATCHES
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN BLOG / RESEARCH ARCHIVE SECTION
   ═══════════════════════════════════════════════════════════════ */
export default function Blog() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const { playSoftClick } = useSound()

  const [activeCategory, setActiveCategory] = useState("All Dispatches")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPost, setSelectedPost] = useState(null)

  useEffect(() => {
    let context
    let cancelled = false

    import('gsap/ScrollTrigger').then(({ default: ScrollTrigger }) => {
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)

      context = gsap.context(() => {
        const media = gsap.matchMedia()

        media.add('(prefers-reduced-motion: no-preference)', () => {
          gsap.fromTo(
            '.blog-watermark',
            { x: 70 },
            {
              x: -70,
              ease: 'none',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            },
          )

          gsap.to('.blog-ambient-glow', {
            y: 120,
            scale: 1.15,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          })
        })

        return () => media.revert()
      })
    })

    return () => {
      cancelled = true
      context?.revert()
    }
  }, [])

  // Filter posts
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        activeCategory === "All Dispatches" || post.category === activeCategory

      const matchesSearch =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchQuery])

  // Featured flagship post
  const flagshipPost = useMemo(() => {
    return BLOG_POSTS.find((p) => p.flagship) || BLOG_POSTS[0]
  }, [])
  const showFlagship =
    !searchQuery &&
    (activeCategory === "All Dispatches" || activeCategory === flagshipPost.category)

  const handleOpenPost = (post) => {
    if (playSoftClick) playSoftClick()
    setSelectedPost(post)
  }

  return (
    <section
      id="blog"
      ref={sectionRef}
      className="obs-section bg-deep blog-section"
      aria-labelledby="blog-heading"
      style={{
        position: 'relative',
        padding: '120px 0 100px',
        overflow: 'hidden',
      }}
    >
      {/* Background Watermark & Ambient Grid */}
      <div className="blog-watermark ghost-text-bg">RESEARCH</div>
      <div className="blog-ambient-glow" />

      <div
        className="obs-inner"
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 48px',
        }}
      >
        {/* Section Header */}
        <div className="blog-section-header">
          <motion.div
            className="about-label"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          >
            <span className="about-label-line" />
            [ 004 — THE RESEARCH JOURNAL ]
          </motion.div>

          <motion.h2
            id="blog-heading"
            className="blog-headline"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT }}
          >
            Ideas in <span className="blog-headline-accent">motion.</span>
          </motion.h2>

          <motion.p
            className="blog-intro-text"
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 0.7, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.35, ease: EASE_OUT }}
          >
            Notes from the build: practical experiments, systems thinking, and the ideas behind the things I make.
          </motion.p>
        </div>

        {/* Search & Filter Control Deck */}
        <motion.div
          className="blog-control-deck"
          initial={{ opacity: 0, y: 18 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.28, ease: EASE_OUT }}
        >
          {/* Category Tabs */}
          <div className="blog-categories-wrap">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat
              return (
                <button
                  key={cat}
                  className={`blog-category-pill ${active ? 'active' : ''}`}
                  aria-pressed={active}
                  onClick={() => {
                    if (playSoftClick) playSoftClick()
                    setActiveCategory(cat)
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Terminal Search Bar */}
          <div className="blog-search-wrap">
            <span className="blog-search-prompt">$ grep</span>
            <input
              type="text"
              className="blog-search-input"
              placeholder="Search notes, topics, tags..."
              aria-label="Search articles"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="blog-search-clear"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
        </motion.div>

        {/* Counter readout */}
        <div className="blog-readout-row">
          <span className="blog-readout-stat">
            <span className="blog-readout-label">FIELD NOTES</span>
            <span>{filteredPosts.length} ARTICLES</span>
          </span>
          {searchQuery && (
            <span className="blog-search-filter-tag">FILTER: "{searchQuery}"</span>
          )}
        </div>

        {/* ── Featured Flagship Post (When no query or match) ── */}
        {showFlagship && (
          <motion.div
            className="blog-flagship-card"
            role="button"
            tabIndex={0}
            aria-label={`Read featured article: ${flagshipPost.title}`}
            initial={{ opacity: 0, y: 25 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.45, ease: EASE_OUT }}
            onClick={() => handleOpenPost(flagshipPost)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleOpenPost(flagshipPost)
              }
            }}
            whileHover={{ y: -5, scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
          >
            <div className="blog-flagship-glow-border" />
            <div className="blog-flagship-copy">
              <div className="blog-flagship-badge-row">
                <span className="blog-flagship-pill">EDITOR’S PICK</span>
                <span className="blog-flagship-cat">{flagshipPost.category}</span>
              </div>

              <h3 className="blog-flagship-title">{flagshipPost.title}</h3>
              <p className="blog-flagship-subtitle">{flagshipPost.subtitle}</p>
              <p className="blog-flagship-summary">{flagshipPost.summary}</p>

              <div className="blog-flagship-footer">
                <div className="blog-flagship-tags">
                  {flagshipPost.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="blog-tag-pill">#{tag}</span>
                  ))}
                </div>
                <span className="blog-read-btn">
                  <span>READ THE STORY</span>
                  <span className="blog-btn-arrow">↗</span>
                </span>
              </div>
            </div>

            <div className="blog-feature-art" aria-hidden="true">
              <div className="blog-art-orbit blog-art-orbit-outer" />
              <div className="blog-art-orbit blog-art-orbit-inner" />
              <div className="blog-art-core">AI<span> / </span>01</div>
              <span className="blog-art-node blog-art-node-one" />
              <span className="blog-art-node blog-art-node-two" />
              <div className="blog-art-caption">
                <span>01 — MULTIMODAL SYSTEMS</span>
                <span>{flagshipPost.readTime}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Post Grid ── */}
        <LayoutGroup>
          <div className="blog-grid">
            <AnimatePresence mode="popLayout">
              {filteredPosts
                .filter((post) => !showFlagship || post.id !== flagshipPost.id)
                .map((post, idx) => (
                  <motion.article
                    key={post.id}
                    layout
                    className="blog-card"
                    role="button"
                    tabIndex={0}
                    aria-label={`Read article: ${post.title}`}
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.97 }}
                    transition={{
                      duration: 0.45,
                      delay: isInView ? Math.min(idx * 0.07, 0.28) : 0,
                      ease: EASE_OUT,
                      layout: { type: 'spring', stiffness: 280, damping: 28 },
                    }}
                    whileHover={{ y: -7, scale: 1.015 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleOpenPost(post)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        handleOpenPost(post)
                      }
                    }}
                  >
                    <div className="blog-card-index">
                      <span>0{idx + 1}</span>
                      <span> / FIELD NOTE</span>
                    </div>
                    <div className="blog-card-meta">
                      <span className="blog-card-cat">{post.category}</span>
                      <span className="blog-card-read">{post.readTime}</span>
                    </div>

                    <h4 className="blog-card-title">{post.title}</h4>
                    <p className="blog-card-summary">{post.summary}</p>

                    <div className="blog-card-footer">
                      <div className="blog-card-date">{post.date}</div>
                      <div className="blog-card-explore">
                        READ ARTICLE <span className="blog-explore-arrow">↗</span>
                      </div>
                    </div>
                  </motion.article>
                ))}
            </AnimatePresence>
          </div>
        </LayoutGroup>

        {filteredPosts.length === 0 && (
          <div className="blog-no-results">
            <div className="blog-no-results-code">404_NO_DISPATCHES_MATCHED</div>
            <p>No research studies match query "{searchQuery}". Try searching for "vision", "reasoning", "smtp", or "agents".</p>
            <button className="blog-reset-btn" onClick={() => { setSearchQuery(''); setActiveCategory('All Dispatches'); }}>
              RESET SEARCH
            </button>
          </div>
        )}
      </div>

      {/* Reader Modal */}
      <ArticleModal
        post={selectedPost}
        isOpen={Boolean(selectedPost)}
        onClose={() => setSelectedPost(null)}
      />

      {/* Inline styles for the blog section */}
      <style>{`
        .blog-section {
          background:
            radial-gradient(ellipse at 82% 8%, rgba(139, 92, 246, 0.1), transparent 34%),
            radial-gradient(ellipse at 4% 72%, rgba(0, 210, 190, 0.045), transparent 30%),
            #050505;
        }
        .blog-watermark {
          position: absolute;
          top: 30%;
          left: -4%;
          font-family: var(--font-display);
          font-size: clamp(6rem, 16vw, 18rem);
          font-weight: 900;
          color: rgba(255, 255, 255, 0.015);
          letter-spacing: 0.1em;
          pointer-events: none;
          z-index: 1;
        }
        .blog-ambient-glow {
          position: absolute;
          top: 25%;
          right: 5%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%);
          pointer-events: none;
          z-index: 1;
        }
        .blog-section-header {
          max-width: 900px;
          margin-bottom: 48px;
        }
        .blog-headline {
          font-family: var(--font-display);
          font-size: clamp(3rem, 7vw, 6.4rem);
          font-weight: 800;
          color: #F0EEF6;
          line-height: 0.98;
          letter-spacing: -0.065em;
          margin-top: 24px;
          text-wrap: balance;
        }
        .blog-headline-accent {
          background: linear-gradient(105deg, #C4B5FD 5%, #8B5CF6 52%, #75F0DA 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .blog-intro-text {
          font-family: var(--font-body);
          font-size: clamp(1rem, 1.3vw, 1.15rem);
          color: #8A8896;
          max-width: 590px;
          margin-top: 20px;
          line-height: 1.75;
        }
        .blog-control-deck {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }
        .blog-categories-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .blog-category-pill {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          font-family: var(--font-mono);
          font-size: 0.75rem;
          padding: 8px 16px;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .blog-category-pill:hover {
          color: #FFF;
          border-color: rgba(139, 92, 246, 0.4);
          background: rgba(139, 92, 246, 0.1);
        }
        .blog-category-pill.active {
          background: rgba(139, 92, 246, 0.2);
          border-color: #8B5CF6;
          color: #F0EEF6;
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.25);
        }
        .blog-search-wrap {
          display: flex;
          align-items: center;
          background: rgba(15, 15, 20, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          padding: 8px 14px;
          min-width: 280px;
          position: relative;
        }
        .blog-search-prompt {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: #00D2BE;
          margin-right: 8px;
        }
        .blog-search-input {
          background: transparent;
          border: none;
          outline: none;
          color: #F0EEF6;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          width: 100%;
        }
        .blog-search-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
        .blog-search-clear {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          font-size: 0.8rem;
        }
        .blog-readout-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.35);
          letter-spacing: 0.1em;
        }
        .blog-readout-stat {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .blog-readout-label {
          color: #C4B5FD;
        }
        .blog-search-filter-tag {
          color: #C4B5FD;
        }
        .blog-flagship-card {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(270px, 0.85fr);
          align-items: center;
          gap: clamp(28px, 6vw, 80px);
          min-height: 390px;
          background:
            radial-gradient(ellipse at 82% 50%, rgba(109, 69, 219, 0.18), transparent 43%),
            linear-gradient(135deg, rgba(19, 18, 28, 0.98), rgba(8, 10, 14, 0.98));
          border: 1px solid rgba(196, 181, 253, 0.16);
          border-radius: 22px;
          padding: clamp(28px, 5vw, 58px);
          margin-bottom: 36px;
          cursor: pointer;
          transition: border-color 0.35s ease, box-shadow 0.35s ease;
          overflow: hidden;
          isolation: isolate;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.24);
        }
        .blog-flagship-card:hover {
          border-color: rgba(196, 181, 253, 0.42);
          box-shadow: 0 32px 90px rgba(57, 34, 108, 0.25);
        }
        .blog-flagship-copy {
          position: relative;
          z-index: 2;
        }
        .blog-flagship-glow-border {
          position: absolute;
          inset: 0;
          z-index: -1;
          background: linear-gradient(120deg, transparent 20%, rgba(139, 92, 246, 0.11), transparent 75%);
          pointer-events: none;
        }
        .blog-feature-art {
          position: relative;
          display: grid;
          place-items: center;
          min-height: 290px;
          overflow: hidden;
          border: 1px solid rgba(196, 181, 253, 0.13);
          border-radius: 18px;
          background:
            linear-gradient(rgba(196, 181, 253, 0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(196, 181, 253, 0.045) 1px, transparent 1px),
            radial-gradient(circle at center, rgba(139, 92, 246, 0.19), transparent 58%),
            rgba(5, 5, 10, 0.68);
          background-size: 30px 30px, 30px 30px, auto, auto;
        }
        .blog-feature-art::after {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 64%, rgba(5, 5, 5, 0.55));
          content: "";
          pointer-events: none;
        }
        .blog-art-orbit {
          position: absolute;
          width: min(72%, 250px);
          aspect-ratio: 1;
          border: 1px solid rgba(196, 181, 253, 0.27);
          border-radius: 50%;
          box-shadow: 0 0 50px rgba(139, 92, 246, 0.1), inset 0 0 40px rgba(139, 92, 246, 0.07);
        }
        .blog-art-orbit-outer {
          transform: rotateX(66deg) rotate(-25deg);
          animation: blog-orbit-float 8s ease-in-out infinite;
        }
        .blog-art-orbit-inner {
          width: min(54%, 190px);
          border-color: rgba(117, 240, 218, 0.26);
          transform: rotateX(66deg) rotate(34deg);
          animation: blog-orbit-float 10s ease-in-out infinite reverse;
        }
        .blog-art-core {
          position: relative;
          z-index: 1;
          color: #F0EEF6;
          font-family: var(--font-display);
          font-size: clamp(2.8rem, 6vw, 4.8rem);
          font-weight: 700;
          letter-spacing: -0.09em;
          text-shadow: 0 0 50px rgba(196, 181, 253, 0.42);
        }
        .blog-art-core span {
          color: #75F0DA;
          font-size: 0.45em;
          vertical-align: 0.35em;
        }
        .blog-art-node {
          position: absolute;
          z-index: 2;
          width: 9px;
          height: 9px;
          border: 2px solid #D9D0FF;
          border-radius: 50%;
          background: #8B5CF6;
          box-shadow: 0 0 18px rgba(196, 181, 253, 0.8);
        }
        .blog-art-node-one {
          top: 24%;
          left: 26%;
        }
        .blog-art-node-two {
          right: 23%;
          bottom: 30%;
          border-color: #75F0DA;
          background: #00D2BE;
          box-shadow: 0 0 18px rgba(117, 240, 218, 0.7);
        }
        .blog-art-caption {
          position: absolute;
          right: 18px;
          bottom: 16px;
          left: 18px;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: rgba(240, 238, 246, 0.48);
          font-family: var(--font-mono);
          font-size: 0.58rem;
          letter-spacing: 0.12em;
        }
        @keyframes blog-orbit-float {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -12px; }
        }
        .blog-flagship-badge-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .blog-flagship-pill {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid #8B5CF6;
          color: #DDD6FE;
          padding: 3px 10px;
          border-radius: 9999px;
          font-weight: 600;
        }
        .blog-flagship-cat {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: #00D2BE;
        }
        .blog-flagship-read {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
        }
        .blog-flagship-title {
          font-family: var(--font-display);
          font-size: clamp(1.7rem, 3vw, 2.6rem);
          font-weight: 800;
          color: #FFF;
          line-height: 1.1;
          letter-spacing: -0.045em;
          margin-bottom: 14px;
        }
        .blog-flagship-subtitle {
          font-family: var(--font-body);
          font-size: 0.92rem;
          color: #C4B5FD;
          margin-bottom: 14px;
        }
        .blog-flagship-summary {
          font-family: var(--font-body);
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          max-width: 650px;
          margin-bottom: 28px;
        }
        .blog-flagship-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .blog-flagship-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .blog-read-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.5);
          color: #FFF;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          padding: 10px 20px;
          border-radius: 9999px;
          font-weight: 600;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .blog-flagship-card:hover .blog-read-btn {
          background: #8B5CF6;
          border-color: #8B5CF6;
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
        }
        .blog-btn-arrow {
          transition: transform 0.3s ease;
        }
        .blog-flagship-card:hover .blog-btn-arrow {
          transform: translateX(4px);
        }
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 290px), 1fr));
          gap: 18px;
        }
        .blog-card {
          position: relative;
          min-height: 300px;
          overflow: hidden;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.1), transparent 48%),
            linear-gradient(145deg, rgba(18, 18, 25, 0.9), rgba(10, 10, 14, 0.94));
          border: 1px solid rgba(255, 255, 255, 0.085);
          border-radius: 16px;
          padding: 26px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: pointer;
          transition: border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
          transform-origin: center;
          will-change: transform;
        }
        .blog-card:hover {
          border-color: rgba(196, 181, 253, 0.34);
          box-shadow: 0 20px 55px rgba(0, 0, 0, 0.38), 0 0 28px rgba(139, 92, 246, 0.09);
        }
        .blog-card-index {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-bottom: 20px;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.075);
          color: rgba(255, 255, 255, 0.28);
          font-family: var(--font-mono);
          font-size: 0.62rem;
          letter-spacing: 0.12em;
        }
        .blog-card-index span:first-child {
          color: #C4B5FD;
          font-size: 0.78rem;
        }
        .blog-card-meta {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.45);
          margin-bottom: 12px;
        }
        .blog-card-cat {
          color: #00D2BE;
        }
        .blog-card-title {
          font-family: var(--font-display);
          font-size: 1.28rem;
          font-weight: 700;
          color: #FFF;
          line-height: 1.28;
          letter-spacing: -0.025em;
          margin-bottom: 12px;
        }
        .blog-card-summary {
          font-family: var(--font-body);
          font-size: 0.82rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.7;
          margin-bottom: 24px;
          flex-grow: 1;
        }
        .blog-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--font-mono);
          font-size: 0.65rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 16px;
        }
        .blog-card-date {
          color: rgba(255, 255, 255, 0.35);
        }
        .blog-card-explore {
          color: #C4B5FD;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: gap 0.2s ease;
        }
        .blog-card:hover .blog-card-explore {
          color: #FFF;
          gap: 8px;
        }
        .blog-card:focus-visible,
        .blog-flagship-card:focus-visible {
          outline: 2px solid #C4B5FD;
          outline-offset: 4px;
        }
        .blog-tag-pill {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.55);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 3px 8px;
          border-radius: 4px;
        }
        .blog-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(5, 5, 5, 0.88);
          backdrop-filter: blur(12px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .blog-modal-window {
          background: #0B0B10;
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 16px;
          width: 100%;
          max-width: 880px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
        }
        .blog-reading-progress-track {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(255, 255, 255, 0.05);
          z-index: 20;
        }
        .blog-reading-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #8B5CF6, #00D2BE);
          box-shadow: 0 0 10px rgba(0, 210, 190, 0.6);
          transition: width 0.1s linear;
        }
        .blog-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 28px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(10, 10, 15, 0.95);
        }
        .blog-header-telemetry {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .blog-telemetry-dot {
          width: 8px;
          height: 8px;
          background: #2ECC71;
          border-radius: 50%;
          box-shadow: 0 0 8px #2ECC71;
        }
        .blog-telemetry-title {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: #DDD6FE;
          letter-spacing: 0.1em;
        }
        .blog-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .blog-action-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.8);
          font-family: var(--font-mono);
          font-size: 0.7rem;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .blog-action-btn:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: #8B5CF6;
          color: #FFF;
        }
        .blog-close-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-family: var(--font-mono);
          font-size: 0.8rem;
          cursor: pointer;
        }
        .blog-close-btn:hover {
          color: #FFF;
        }
        .blog-modal-body {
          padding: 36px;
          overflow-y: auto;
        }
        .blog-article-meta-row {
          display: flex;
          gap: 12px;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 18px;
        }
        .blog-date-badge {
          color: #00D2BE;
        }
        .blog-author-badge {
          color: #C4B5FD;
        }
        .blog-article-title {
          font-family: var(--font-display);
          font-size: clamp(1.8rem, 3.2vw, 2.6rem);
          font-weight: 800;
          color: #FFF;
          line-height: 1.2;
          margin-bottom: 12px;
        }
        .blog-article-subtitle {
          font-family: var(--font-body);
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
          margin-bottom: 24px;
        }
        .blog-article-telemetry-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          background: rgba(15, 15, 22, 0.7);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }
        .blog-telemetry-card {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .blog-telemetry-key {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 0.1em;
        }
        .blog-telemetry-val {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: #DDD6FE;
          font-weight: 600;
        }
        .blog-article-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 28px;
        }
        .blog-article-divider {
          width: 100%;
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          margin-bottom: 32px;
        }
        .blog-article-content {
          font-family: var(--font-body);
          font-size: 1rem;
          line-height: 1.8;
          color: #E2E1EC;
        }
        .blog-content-h3 {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 700;
          color: #FFF;
          margin: 32px 0 14px;
          padding-left: 12px;
          border-left: 3px solid #8B5CF6;
        }
        .blog-content-p {
          margin-bottom: 20px;
          color: rgba(240, 238, 246, 0.85);
        }
        .blog-content-list {
          margin: 16px 0 24px;
          padding-left: 1.5rem;
          list-style-type: disc;
          color: #DDD6FE;
        }
        ol.blog-content-list {
          list-style-type: decimal;
        }
        .blog-content-list li {
          margin-bottom: 10px;
          padding-left: 6px;
          color: rgba(240, 238, 246, 0.85);
        }
        .blog-article-content strong {
          color: #F4F0FF;
          font-weight: 700;
        }
        .blog-article-content em {
          color: #D7C8FF;
        }
        .blog-article-content p code,
        .blog-article-content li code {
          padding: 2px 6px;
          border: 1px solid rgba(196, 181, 253, 0.16);
          border-radius: 5px;
          background: rgba(139, 92, 246, 0.09);
          color: #D7C8FF;
          font-family: var(--font-mono);
          font-size: 0.88em;
        }
        .blog-flowchart {
          display: grid;
          gap: 12px;
          margin: 28px 0;
          padding: clamp(16px, 3vw, 26px);
          overflow: hidden;
          border: 1px solid rgba(139, 92, 246, 0.22);
          border-radius: 14px;
          background:
            radial-gradient(ellipse at 10% 0%, rgba(139, 92, 246, 0.12), transparent 55%),
            linear-gradient(145deg, rgba(17, 15, 25, 0.96), rgba(7, 8, 12, 0.96));
        }
        .blog-flowchart-label {
          color: #A99ADD;
          font-family: var(--font-mono);
          font-size: 0.62rem;
          letter-spacing: 0.16em;
        }
        .blog-flowchart-route {
          display: flex;
          align-items: stretch;
          gap: 10px;
          min-width: 0;
          overflow-x: auto;
          padding: 4px 2px 10px;
          scrollbar-color: rgba(139, 92, 246, 0.45) transparent;
        }
        .blog-flowchart-node {
          display: flex;
          flex: 1 0 132px;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
          min-height: 76px;
          padding: 12px;
          border: 1px solid rgba(196, 181, 253, 0.18);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.035);
          color: rgba(240, 238, 246, 0.9);
          font-size: 0.8rem;
          line-height: 1.45;
        }
        .blog-flowchart-step {
          color: #75F0DA;
          font-family: var(--font-mono);
          font-size: 0.56rem;
          letter-spacing: 0.12em;
        }
        .blog-flowchart-arrow {
          display: flex;
          flex: 0 0 auto;
          align-items: center;
          color: #A78BFA;
          font-size: 1.05rem;
        }
        .blog-code-block {
          background: #040407;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          padding: 20px;
          margin: 24px 0;
          position: relative;
          overflow-x: auto;
        }
        .blog-code-lang {
          position: absolute;
          top: 8px;
          right: 12px;
          font-family: var(--font-mono);
          font-size: 0.65rem;
          color: #00D2BE;
          letter-spacing: 0.1em;
        }
        .blog-code-block pre {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          line-height: 1.6;
          color: #C4B5FD;
          margin: 0;
        }
        .blog-article-footer {
          margin-top: 48px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .blog-footer-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .blog-author-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8B5CF6, #00D2BE);
          color: #FFF;
          font-family: var(--font-mono);
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .blog-author-name {
          font-family: var(--font-display);
          font-weight: 700;
          color: #FFF;
          font-size: 0.95rem;
        }
        .blog-author-role {
          font-family: var(--font-body);
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.45);
        }
        .blog-footer-back-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #FFF;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          padding: 10px 18px;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .blog-footer-back-btn:hover {
          background: #8B5CF6;
          border-color: #8B5CF6;
        }
        .blog-no-results {
          text-align: center;
          padding: 60px 20px;
          background: rgba(20, 20, 28, 0.4);
          border: 1px dashed rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }
        .blog-no-results-code {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: #EF4444;
          margin-bottom: 8px;
        }
        .blog-no-results p {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
          margin-bottom: 16px;
        }
        .blog-reset-btn {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          padding: 8px 16px;
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid #8B5CF6;
          color: #FFF;
          border-radius: 6px;
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .blog-section {
            padding: 80px 0 60px;
          }
          .blog-control-deck {
            flex-direction: column;
            align-items: stretch;
          }
          .blog-search-wrap {
            min-width: 100%;
          }
          .blog-flagship-card {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 24px;
          }
          .blog-feature-art {
            min-height: 240px;
            grid-row: 1;
          }
          .blog-grid {
            grid-template-columns: 1fr;
          }
          .blog-readout-row {
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 8px 16px;
          }
          .blog-headline {
            font-size: clamp(2.8rem, 12vw, 4.8rem);
          }
          .blog-modal-body {
            padding: 24px;
          }
        }
        @media (max-width: 560px) {
          .blog-flowchart-route {
            flex-direction: column;
            overflow: visible;
            padding: 0;
          }
          .blog-flowchart-node {
            flex: 0 0 auto;
            min-height: 64px;
          }
          .blog-flowchart-arrow {
            justify-content: center;
            transform: rotate(90deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .blog-art-orbit-outer,
          .blog-art-orbit-inner {
            animation: none;
          }
        }
      `}</style>
    </section>
  )
}
