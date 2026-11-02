import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSound } from '../context/SoundContext'

const SEARCH_DESTINATIONS = [
  { label: 'About', href: '#about', detail: 'Profile and tech arsenal', keywords: 'intro skills technologies' },
  { label: 'Projects', href: '#projects', detail: 'Featured builds', keywords: 'work portfolio' },
  { label: 'Blog', href: '#blog', detail: 'Articles and research', keywords: 'writing research articles' },
  { label: 'Process', href: '#process', detail: 'How the projects were built', keywords: 'approach case studies' },
  { label: 'Contributions', href: '#contributions', detail: 'Experience and certificates', keywords: 'timeline certifications' },
  { label: 'Clubs & Leadership', href: '#achievements', detail: 'Campus communities', keywords: 'clubs leadership' },
  { label: 'Contact', href: '#contact', detail: 'Get in touch', keywords: 'email connect' },
]

export default function ObsidianNav({ currentSection, onMenuToggle, isMenuOpen }) {
  const { playSoftClick } = useSound()
  const [theme, setTheme] = useState('nav-dark')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchRef = useRef(null)
  const searchInputRef = useRef(null)

  const matchingDestinations = SEARCH_DESTINATIONS.filter(({ label, detail, keywords }) => {
    const query = searchQuery.trim().toLowerCase()
    return !query || `${label} ${detail} ${keywords}`.toLowerCase().includes(query)
  })

  useEffect(() => {
    // If menu is open, force dark theme for visibility
    if (isMenuOpen) {
      setTheme('nav-dark')
      return
    }

    const el = document.getElementById(currentSection)
    if (el && el.classList.contains('bg-light')) {
      setTheme('nav-light')
    } else {
      setTheme('nav-dark')
    }
  }, [currentSection, isMenuOpen])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!searchRef.current?.contains(event.target)) setIsSearchOpen(false)
    }
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsSearchOpen(true)
        searchInputRef.current?.focus()
      } else if (event.key === 'Escape') {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const closeSearch = () => {
    setIsSearchOpen(false)
    setSearchQuery('')
  }

  return (
    <nav className={`obs-nav ${theme}`}>
      {/* Top Left: Logo */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <a href="#" className="obs-nav-logo" style={{ display: 'block', transition: 'transform 0.3s ease' }}>
          <svg width="40" height="40" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <style>{`
              .obs-nav-logo:hover .orbit-circle {
                transform-origin: center;
                animation: rotate 8s linear infinite;
              }
              @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
            <defs>
              <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#5B2EFF"/>
                <stop offset="60%" stopColor="#9B5CFF"/>
                <stop offset="85%" stopColor="#3DA9FC"/>
                <stop offset="100%" stopColor="#FFD166"/>
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <circle className="orbit-circle" cx="110" cy="110" r="72"
                    stroke="url(#purpleGrad)"
                    strokeWidth="1.8"
                    opacity="0.6"
                    fill="none"
                    filter="url(#glow)"/>
            <path d="M50 110 A60 60 0 0 1 170 110"
                  stroke="#9B5CFF"
                  strokeWidth="1.2"
                  strokeDasharray="8 10"
                  opacity="0.5"
                  fill="none"/>
            <circle cx="182" cy="110" r="4" fill="#9B5CFF" filter="url(#glow)"/>
            {/* Futuristic DG Monogram */}
            <path d="M 68 68 H 96 L 106 78 V 142 L 96 152 H 68 Z
                     M 78 80 H 93 L 98 85 V 135 L 93 140 H 78 Z"
                  fillRule="evenodd"
                  fill="url(#purpleGrad)"
                  filter="url(#glow)"/>
            <path d="M 152 82 L 138 68 H 124 L 114 78 V 142 L 124 152 H 144 L 152 144 V 110 H 132 V 120 H 142 V 141 L 139 144 H 127 L 124 141 V 79 L 127 76 H 135 L 143 84 L 152 82 Z"
                  fill="url(#purpleGrad)"
                  filter="url(#glow)"/>
          </svg>
        </a>
      </div>

      {/* Center Links */}
      <div className="obs-nav-links" aria-label="Primary navigation">
        <a href="#about" className={currentSection === 'about' ? 'active' : ''} onMouseEnter={playSoftClick}>ABOUT</a>
        <a href="#projects" className={currentSection === 'projects' ? 'active' : ''} onMouseEnter={playSoftClick}>PROJECTS</a>
        <a href="#blog" className={currentSection === 'blog' ? 'active' : ''} onMouseEnter={playSoftClick}>BLOG</a>
        <a href="#process" className={`nav-overflow-link ${currentSection === 'process' ? 'active' : ''}`} onMouseEnter={playSoftClick}>PROCESS</a>
        <a href="#achievements" className={`nav-overflow-link ${currentSection === 'achievements' ? 'active' : ''}`} onMouseEnter={playSoftClick}>CLUBS</a>
      </div>

      <div ref={searchRef} className={`obs-nav-search ${isSearchOpen ? 'is-open' : ''}`}>
        <button
          type="button"
          className="obs-nav-search-toggle"
          aria-label={isSearchOpen ? 'Close section search' : 'Open section search'}
          aria-expanded={isSearchOpen}
          onClick={() => {
            setIsSearchOpen((open) => !open)
            if (!isSearchOpen) requestAnimationFrame(() => searchInputRef.current?.focus())
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 4.5 4.5" />
          </svg>
        </button>
        <div className="obs-nav-search-panel">
          <form
            className="obs-nav-search-form"
            role="search"
            onSubmit={(event) => {
              event.preventDefault()
              if (matchingDestinations[0]) {
                window.location.hash = matchingDestinations[0].href
                closeSearch()
              }
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 4.5 4.5" />
            </svg>
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              placeholder="Jump to a section..."
              aria-label="Search portfolio sections"
              aria-controls="obs-nav-search-results"
              onFocus={() => setIsSearchOpen(true)}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setIsSearchOpen(true)
              }}
            />
            <kbd>CTRL K</kbd>
          </form>
          {isSearchOpen && (
            <div className="obs-nav-search-results" id="obs-nav-search-results">
              <div className="obs-nav-search-heading">{searchQuery.trim() ? 'MATCHING SECTIONS' : 'QUICK JUMP'}</div>
              {matchingDestinations.length ? matchingDestinations.map((destination) => (
                <a
                  key={destination.href}
                  href={destination.href}
                  className="obs-nav-search-result"
                  onClick={closeSearch}
                >
                  <span className="obs-nav-search-result-icon" aria-hidden="true">↗</span>
                  <span className="obs-nav-search-result-copy">
                    <strong>{destination.label}</strong>
                    <small>{destination.detail}</small>
                  </span>
                  <span className="obs-nav-search-enter" aria-hidden="true">↵</span>
                </a>
              )) : (
                <div className="obs-nav-search-empty">No sections found. Try “projects” or “blog”.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top Right: CTA / Menu */}
      <div className="obs-nav-actions" style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'flex-end' }}>


        <motion.a 
          href="#contact" 
          className="pill-btn h-btn hide-mobile"
          onMouseEnter={playSoftClick}
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 0 35px rgba(139,92,246,0.6), inset 0 0 10px rgba(255,255,255,0.2)',
            backgroundColor: 'rgba(139,92,246,0.2)'
          }}
          transition={{
            boxShadow: {
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse"
            }
          }}
          style={{ 
            padding: '10px 24px', 
            opacity: 1, 
            border: '1px solid rgba(139,92,246,0.3)', 
            background: 'rgba(139,92,246,0.1)',
            minWidth: '220px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            color: 'white',
            letterSpacing: '0.05em',
            transition: 'border-color 0.3s, background-color 0.3s'
          }}
        >
          LET'S BUILD SOMETHING
        </motion.a>
        <button 
          className="obs-nav-menu" 
          onClick={onMenuToggle}
          style={{ 
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: 'inherit',
            minWidth: '80px',
            justifyContent: 'flex-end'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'inherit';
          }}
        >
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
             {isMenuOpen ? (
               <>
                 <line x1="18" y1="6" x2="6" y2="18" />
                 <line x1="6" y1="6" x2="18" y2="18" />
               </>
             ) : (
               <>
                 <line x1="3" y1="12" x2="21" y2="12" />
                 <line x1="3" y1="6" x2="21" y2="6" />
                 <line x1="3" y1="18" x2="21" y2="18" />
               </>
             )}
           </svg>
           <span style={{ fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.1em' }}>
             {isMenuOpen ? 'CLOSE' : 'SYSTEM'}
           </span>
        </button>
      </div>
    </nav>
  )
}
