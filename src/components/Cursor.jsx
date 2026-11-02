import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

// Detect touch-only device (phone / tablet) — no custom cursor needed
const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  (navigator.maxTouchPoints > 0 || window.matchMedia('(hover: none)').matches)

export default function CustomCursor() {
  const cursorRef = useRef(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && 
    (window.innerWidth <= 768 || navigator.maxTouchPoints > 0 || window.matchMedia('(hover: none)').matches)
  )

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(
        window.innerWidth <= 768 || 
        navigator.maxTouchPoints > 0 || 
        window.matchMedia('(hover: none)').matches
      )
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Never render on touch/mobile — the OS pointer is fine there, and custom cursors cause lag
  if (isMobile) return null

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    // Setup GSAP QuickTo for buttery smooth cursor tracking
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.4, ease: "power3" })
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.4, ease: "power3" })

    const moveCursor = (e) => {
      xTo(e.clientX)
      yTo(e.clientY)
    }

    const handleMouseOver = (e) => {
      // If hovering over buttons, links, or interactive elements
      if (
        e.target.tagName.toLowerCase() === 'a' ||
        e.target.tagName.toLowerCase() === 'button' ||
        e.target.closest('a') ||
        e.target.closest('button') ||
        e.target.closest('.interactive-zone')
      ) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  return (
    <div 
      ref={cursorRef} 
      className={`custom-cursor-container ${isHovering ? 'is-hovering' : ''}`}
      style={{
        position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 99999,
        transform: 'translate(-50%, -50%)', mixBlendMode: 'difference'
      }}
    >
      {/* The main dot */}
      <div style={{
        width: isHovering ? '48px' : '12px',
        height: isHovering ? '48px' : '12px',
        backgroundColor: 'var(--color-primary-light)',
        borderRadius: '50%',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isHovering 
          ? '0 0 20px rgba(167, 139, 250, 0.5), inset 0 0 10px rgba(255,255,255,0.5)'
          : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {isHovering && (
           <div style={{
             width: '6px', height: '6px', backgroundColor: 'var(--color-void)',
             borderRadius: '50%'
           }} />
        )}
      </div>
      
      {/* Outer sleek border */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isHovering ? '64px' : '32px',
        height: isHovering ? '64px' : '32px',
        border: '1px solid var(--color-primary-light)',
        borderRadius: '50%', opacity: isHovering ? 0 : 0.4,
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }} />
    </div>
  )
}
