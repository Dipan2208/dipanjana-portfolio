import { useState, useEffect } from 'react'
import { SoundProvider } from './context/SoundContext'
import Loader from './components/Loader'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Menu from './components/Menu'
import Hero from './components/Hero'
import Quote from './sections/Quote'
import About from './sections/About'
import Projects from './sections/Projects'
import Process from './components/Process'
import Blog from './sections/Blog'
import Timeline from './components/Timeline'
import Achievements from './sections/Achievements'
import Contact from './sections/Contact'
import Counter from './components/Counter'
import { trackSectionView } from './lib/analytics'

const BASE_TITLE = 'Dipanjana Ghosh'
const SECTION_PAGE_TITLES = {
  hero:          'Dipanjana Ghosh | Full Stack Developer & AI Builder',
  quote:         'Signal | Dipanjana Ghosh',
  about:         'About | Dipanjana Ghosh',
  projects:      'Projects | Dipanjana Ghosh',
  process:       'Process | Dipanjana Ghosh',
  blog:          'Research & Dispatches | Dipanjana Ghosh',
  contributions: 'Contributions | Dipanjana Ghosh',
  achievements:  'Clubs & Leadership | Dipanjana Ghosh',
  contact:       "Let's Connect | Dipanjana Ghosh",
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentSection, setCurrentSection] = useState('hero')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Track scroll position for Nav updates + GA4 section view events
  useEffect(() => {
    if (isLoading) return
    
    const handleScroll = () => {
      const sections = document.querySelectorAll('.obs-section')
      let current = ''
      
      sections.forEach((section) => {
        const sectionTop = section.offsetTop
        if (window.scrollY >= sectionTop - window.innerHeight / 3) {
          current = section.getAttribute('id')
        }
      })
      
      if (current !== currentSection) {
        setCurrentSection(current)
        // Fire a GA4 section-view event on every section change
        if (current) trackSectionView(current)
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isLoading, currentSection])

  // Update document.title as the user scrolls through sections (#11)
  useEffect(() => {
    if (isLoading) return
    const title = SECTION_PAGE_TITLES[currentSection]
    if (title) document.title = title
  }, [currentSection, isLoading])

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('no-scroll')
    } else {
      document.body.classList.remove('no-scroll')
    }
  }, [isMenuOpen])

  useEffect(() => {
    if (isLoading) return
    // Skip smooth scroll on touch devices — native momentum scroll is superior
    const isTouch = window.innerWidth <= 768 || navigator.maxTouchPoints > 0 || window.matchMedia('(hover: none)').matches
    if (isTouch) return

    import('@studio-freight/lenis').then(({ default: Lenis }) => {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
      })

      function raf(time) {
        lenis.raf(time)
        requestAnimationFrame(raf)
      }
      requestAnimationFrame(raf)

      lenis.on('scroll', () => {
        import('gsap/ScrollTrigger').then(({ default: ScrollTrigger }) => {
          ScrollTrigger.update()
        })
      })

      return () => lenis.destroy()
    })
  }, [isLoading])



  useEffect(() => {
    if (isLoading) return
    
    const obsvr = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
        }
      })
    }, { threshold: 0.1 })
    
    document.querySelectorAll('.reveal-up').forEach(el => obsvr.observe(el))
    return () => obsvr.disconnect()
  }, [isLoading])

  return (
    <SoundProvider>
      <Cursor />
      
      {isLoading && (
        <Loader onComplete={() => setIsLoading(false)} />
      )}

      {!isLoading && (
        <>
          <Menu 
            isOpen={isMenuOpen} 
            onClose={() => setIsMenuOpen(false)} 
          />
          <Nav 
            currentSection={currentSection} 
            isMenuOpen={isMenuOpen}
            onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} 
          />
          
          <main>
            <Hero />
            <Quote />
            <About />
            <Projects />
            <Process />
            <Blog />
            <Timeline />
            <Achievements />
            <Contact />
          </main>

          <Counter />
        </>
      )}
    </SoundProvider>
  );
}
