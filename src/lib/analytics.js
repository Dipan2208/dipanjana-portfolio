/**
 * analytics.js — GA4 event tracking utility
 * ─────────────────────────────────────────
 * Stack: Vite + React (SPA, no router)
 * Pattern: gtag.js loaded in index.html, events dispatched via window.gtag()
 *
 * WHY THIS FILE EXISTS:
 *  - Centralises every gtag() call so nothing is hardcoded in components
 *  - Guards every call with `if (typeof window.gtag !== 'function')` so
 *    dev environments or ad-blockers never throw runtime errors
 *  - Makes it trivial to swap GA4 for another provider later
 */

const GA_ID = import.meta.env.VITE_GA_ID

// ─── Guards ──────────────────────────────────────────────────────────────────

/** True only in production AND when gtag has loaded */
const canTrack = () =>
  import.meta.env.PROD &&
  typeof window !== 'undefined' &&
  typeof window.gtag === 'function'

// ─── Core ─────────────────────────────────────────────────────────────────────

/**
 * Fire a GA4 `page_view` event.
 * Call this whenever the user reaches a new section (our "route").
 *
 * @param {string} sectionId  - The section id, e.g. 'hero', 'about', 'projects'
 * @param {string} [title]    - Human-readable title shown in GA dashboard
 */
export function trackPageView(sectionId, title) {
  if (!canTrack()) return

  window.gtag('event', 'page_view', {
    page_title:    title || sectionId,
    page_location: `${window.location.origin}/#${sectionId}`,
    page_path:     `/#${sectionId}`,
    send_to:       GA_ID,
  })
}

/**
 * Fire a generic GA4 custom event.
 *
 * @param {string} eventName          - GA4 event name (snake_case recommended)
 * @param {Record<string, any>} params - Additional parameters
 */
export function trackEvent(eventName, params = {}) {
  if (!canTrack()) return

  window.gtag('event', eventName, {
    ...params,
    send_to: GA_ID,
  })
}

// ─── Pre-built event helpers ──────────────────────────────────────────────────

/**
 * Track a resume download click.
 * Attach to any <a> or <button> that downloads/links to the resume.
 */
export const trackResumeDownload = () =>
  trackEvent('resume_download', {
    event_category: 'engagement',
    event_label:    'Resume DOCX',
  })

/**
 * Track a GitHub profile / repo click.
 * @param {string} [repo] - Optional repo name for per-project tracking
 */
export const trackGitHubClick = (repo = 'profile') =>
  trackEvent('github_click', {
    event_category: 'outbound',
    event_label:    repo,
    link_url:       repo === 'profile' ? 'https://github.com/Dipan2208' : `https://github.com/Dipan2208/${repo}`,
  })

/**
 * Track a LinkedIn profile click.
 */
export const trackLinkedInClick = () =>
  trackEvent('linkedin_click', {
    event_category: 'outbound',
    event_label:    'LinkedIn Profile',
    link_url:       'https://www.linkedin.com/in/dipanjana-ghosh-a99a522b6',
  })

/**
 * Track a live project demo click.
 * @param {string} projectName - Name of the project
 * @param {string} [url]       - Demo URL
 */
export const trackProjectDemoClick = (projectName, url = '') =>
  trackEvent('project_demo_click', {
    event_category: 'engagement',
    event_label:    projectName,
    link_url:       url,
  })

/**
 * Track contact form submission.
 */
export const trackContactSubmit = () =>
  trackEvent('contact_form_submit', {
    event_category: 'engagement',
    event_label:    'Contact Form',
  })

/**
 * Track section visibility (called by App.jsx when scroll section changes).
 * Maps section IDs to human-readable titles for the GA dashboard.
 *
 * @param {string} sectionId
 */
const SECTION_TITLES = {
  hero:          'Hero — Landing',
  quote:         'Quote — Signal',
  about:         'About — Bio & Skills',
  projects:      'Projects — Constructs',
  process:       'Process — Under the Hood',
  blog:          'Research — Dispatches',
  contributions: 'Contributions — In the Wild',
  achievements:  'Clubs & Leadership — Campus Involvement',
  contact:       'Contact — Final Lap',
}

export const trackSectionView = (sectionId) =>
  trackPageView(sectionId, SECTION_TITLES[sectionId] || sectionId)
