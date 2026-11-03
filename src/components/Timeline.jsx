import { useState } from 'react'

const CONTRIBUTIONS = [
  {
    id: 'acm',
    year: 'Jul 2026 - Present',
    org: 'ACM',
    fullName: 'ACM Student Chapter · VIT-AP University',
    role: 'Technical Team Co-Lead',
    location: 'Amaravati, AP',
    accent: '#00D2BE',
    accentGrad: 'linear-gradient(135deg,#00D2BE,#38BDF8)',
    logoBg: '#FFFFFF',
    svgLogo: (
      <svg width="44" height="44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#0E1726" />
        <circle cx="50" cy="50" r="36" stroke="#00D2BE" strokeWidth="2.5" strokeDasharray="6 3" />
        <polygon points="50,22 75,68 25,68" stroke="#38BDF8" strokeWidth="3" fill="none" />
        <circle cx="50" cy="48" r="8" fill="#00D2BE" />
        <text x="50" y="86" textAnchor="middle" fill="#00D2BE" fontSize="13" fontWeight="900" fontFamily="sans-serif">ACM</text>
      </svg>
    ),
    copy: 'Technical Team Co-Lead at ACM Student Chapter, VIT-AP. Architected Spidey-Tech, a three-round online technical competition with algorithmic challenges and debugging sprints. Designed automated QR validation mechanics for the Golden Egg technical treasure hunt, supporting 150+ teams. Conducted technical sessions and mentored peers in frontend engineering and algorithmic problem-solving.',
    tags: ['ACM', 'Competitive Programming', 'Spidey-Tech', 'Golden Egg', 'Mentorship'],
    status: 'Active',
    statusColor: '#22C55E',
  },
  {
    id: 'microsoft',
    year: 'Jul 2026 - Present',
    org: 'Microsoft',
    fullName: 'Microsoft Student Chapter · VIT-AP University',
    role: 'Technical Team Co-Lead',
    location: 'Amaravati, AP',
    accent: '#38BDF8',
    accentGrad: 'linear-gradient(135deg,#38BDF8,#8B5CF6)',
    logoBg: '#FFFFFF',
    svgLogo: (
      <svg width="44" height="44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#0F172A" />
        {/* Microsoft 4-square grid */}
        <rect x="27" y="27" width="20" height="20" rx="3" fill="#F25022" />
        <rect x="53" y="27" width="20" height="20" rx="3" fill="#7FBA00" />
        <rect x="27" y="53" width="20" height="20" rx="3" fill="#00A4EF" />
        <rect x="53" y="53" width="20" height="20" rx="3" fill="#FFB900" />
      </svg>
    ),
    copy: 'Technical Team Co-Lead at Microsoft Student Chapter, VIT-AP, after serving as a Technical Team Member from Oct 2025 to Jul 2026. Coordinated technical workshop logistics, prepared session materials, and supported hands-on coding bootcamps for student developers.',
    tags: ['Microsoft', 'Workshops', 'Coding Bootcamps', 'Developer Ecosystem'],
    status: 'Active',
    statusColor: '#22C55E',
  },
  {
    id: 'bongojo',
    year: 'May 2026 - Present',
    org: 'Bongojo',
    fullName: 'BONGOJO - The Bengali Association Of VIT-AP',
    role: 'Design & Decoration Team Co-Lead',
    location: 'Amaravati, AP',
    accent: '#EC4899',
    accentGrad: 'linear-gradient(135deg,#EC4899,#F59E0B)',
    logoBg: '#FFFFFF',
    icon: <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#EC4899' }}>B</span>,
    copy: 'Design and Decoration Team Co-Lead at Bongojo from May 2026, after serving as a team member from Oct 2025 to May 2026. Contributed to V-Cipher and other cultural events through creative assets and campus media campaigns.',
    tags: ['V-Cipher', 'Cultural Events', 'Design', 'Campus Media'],
    status: 'Active',
    statusColor: '#22C55E',
  },
  {
    id: 'mlc',
    year: 'Aug 2026 - Present',
    org: 'MLC',
    fullName: 'The Machine Learning CLUB VITAP',
    role: 'Design Team Co Lead',
    location: 'Amaravati, AP',
    accent: '#F5B942',
    accentGrad: 'linear-gradient(135deg,#F5B942,#EC4899)',
    logoBg: '#17130A',
    icon: <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#F5B942' }}>ML</span>,
    copy: 'Design Team Co Lead at The Machine Learning CLUB VITAP since Aug 2026, after joining the Design Team in Nov 2025.',
    tags: ['Machine Learning Club', 'Design Team', 'Student Community'],
    status: 'Active',
    statusColor: '#22C55E',
  },
]

const CERTIFICATIONS = [
  {
    title: 'MATLAB Certified',
    issuer: 'MathWorks',
    issued: 'Oct 2025',
    credentialId: 'f31191d3-e021-46ce-b0d2-bf0d4fc46e37',
    href: 'https://matlabacademy.mathworks.com/progress/share/certificate.html?id=f31191d3-e021-46ce-b0d2-bf0d4fc46e37',
    accent: '#F28C28',
    mark: 'M',
    type: 'Certification',
  },
  {
    title: 'Hedera Certified Developer Associate (HCDA)',
    issuer: 'The Hashgraph Association',
    issued: 'Jun 2026',
    credentialId: '28212791-2338-40b7-b08d-00698981770a',
    href: 'https://certs.hashgraphdev.com/28212791-2338-40b7-b08d-00698981770a.pdf',
    accent: '#6C5CE7',
    mark: 'H',
    type: 'Certification',
  },
  {
    title: 'Hedera Certified Foundation (HCF)',
    issuer: 'The Hashgraph Association',
    issued: 'Jun 2026',
    credentialId: 'fcd0bcf0-1366-40c1-9e25-7eb5faea47e4',
    href: 'https://certs.hashgraphdev.com/fcd0bcf0-1366-40c1-9e25-7eb5faea47e4.pdf',
    accent: '#6C5CE7',
    mark: 'H',
    type: 'Certification',
  },
  {
    title: "Launchpad '26 · Participation Certificate",
    issuer: 'E-Cell, BITS Pilani · Hyderabad Campus',
    issued: 'Three-day entrepreneurship summit',
    href: 'https://www.linkedin.com/feed/update/urn:li:activity:7491538296435695616/',
    accent: '#F5B942',
    mark: '26',
    type: 'Event participation',
  },
]

export default function ContributionsTimeline() {
  const [hovered, setHovered] = useState(null)

  return (
    <section
      id="contributions"
      className="obs-section bg-dark"
      style={{ padding: '80px 0', position: 'relative', overflow: 'hidden' }}
    >
      <style>{`
        @keyframes ctCardIn {
          from { opacity: 0; transform: translateY(20px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        .ct-card { transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s; }
        .ct-card:hover { transform: translateY(-6px) !important; }
      `}</style>

      {/* Ghost background text */}
      <div className="ghost-text-bg" style={{
        position: 'absolute', top: '50%', left: '-1rem',
        transform: 'translateY(-50%)',
        fontSize: 'clamp(5rem,18vw,13rem)', fontWeight: 900,
        color: 'rgba(255,255,255,0.02)',
        letterSpacing: '-0.06em', lineHeight: 1,
        pointerEvents: 'none', userSelect: 'none', zIndex: 0,
        fontFamily: 'var(--font-display)',
      }}>
        EXPERIENCE
      </div>

      <div className="mobile-content-gutter" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px', position: 'relative', zIndex: 2 }}>

        {/* Section header */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 20, height: 1, background: '#F97316' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(249,115,22,0.7)' }}>
              005 — Experience & Journey
            </span>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem,5vw,3.5rem)',
            fontWeight: 900, letterSpacing: '-0.04em', color: '#F0EEF6', lineHeight: 1, marginBottom: 12
          }}>
            Experience & Contributions
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(240,238,246,0.4)', maxWidth: 480, lineHeight: 1.8 }}>
            Proof, not padding. These are the organizations and communities where the work is public, the reviews are honest, and the commits actually ship.
          </p>
        </div>

        {/* Cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {CONTRIBUTIONS.map((c, i) => (
            <div
              key={c.id}
              className="ct-card"
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: '#0D0D0D',
                border: `0.5px solid ${hovered === c.id ? c.accent + '55' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 16, overflow: 'hidden',
                boxShadow: hovered === c.id ? `0 12px 60px ${c.accent}15` : '0 4px 20px rgba(0,0,0,0.3)',
                animation: `ctCardIn 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s both`,
                cursor: 'default',
              }}
            >
              {/* Top gradient bar */}
              <div style={{ height: 3, background: c.accentGrad }} />

              <div style={{ padding: '1.75rem' }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  {/* Logo Container */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: c.logoBg || `${c.accent}15`,
                    border: `0.5px solid ${c.accent}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                    flexShrink: 0,
                  }}>
                    {c.logoUrl ? (
                      <img 
                        src={c.logoUrl} 
                        alt={`${c.org} logo`} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: c.logoBg === '#FFFFFF' ? 4 : 0 }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextSibling) {
                            e.currentTarget.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div style={{ display: c.logoUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {c.svgLogo || c.icon}
                    </div>
                  </div>

                  {/* Status pill */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.15em',
                    textTransform: 'uppercase', padding: '4px 10px', borderRadius: 100,
                    border: `0.5px solid ${c.statusColor}44`,
                    color: c.statusColor,
                    background: `${c.statusColor}10`,
                  }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.statusColor, flexShrink: 0 }} />
                    {c.status}
                  </div>
                </div>

                {/* Org name */}
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.4rem,3vw,1.9rem)',
                  fontWeight: 900, letterSpacing: '-0.03em',
                  color: '#F0EEF6', lineHeight: 1, marginBottom: 4,
                }}>
                  {c.org}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9,
                  color: 'rgba(240,238,246,0.35)', letterSpacing: '0.08em',
                  marginBottom: '1rem',
                }}>
                  {c.fullName} · {c.year}
                </div>

                {/* Role badge */}
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: c.accent,
                  marginBottom: '1rem',
                }}>
                  {c.role}
                </div>

                {/* Copy */}
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  color: 'rgba(240,238,246,0.55)', lineHeight: 1.85,
                  borderLeft: `2px solid ${c.accent}44`,
                  paddingLeft: 12, marginBottom: '1.25rem',
                }}>
                  {c.copy}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {c.tags.map(tag => (
                    <span key={tag} style={{
                      fontFamily: 'var(--font-mono)', fontSize: 8,
                      padding: '3px 9px', borderRadius: 100,
                      border: `0.5px solid ${c.accent}33`,
                      color: `${c.accent}88`,
                      letterSpacing: '0.08em',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Certifications ── */}
        <div style={{ marginTop: '3.5rem' }}>

          {/* Sub-header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
            <div style={{ width: 20, height: 1, background: '#FFD700' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,215,0,0.7)' }}>
              Certifications & Event Participation
            </span>
          </div>

          <div className="cert-grid">
            {CERTIFICATIONS.map((cert) => (
              <a
                key={cert.title}
                href={cert.href}
                target="_blank"
                rel="noopener noreferrer"
                className="cert-card"
              >
                <div className="cert-card-accent" style={{ background: cert.accent }} />
                <div className="cert-card-content">
                  <div className="cert-card-topline">
                    <span className="cert-card-type" style={{ color: cert.accent }}>
                      {cert.type}
                    </span>
                    <span className="cert-card-arrow" aria-hidden="true">↗</span>
                  </div>
                  <div className="cert-card-main">
                    <span className="cert-card-mark" style={{ color: cert.accent, borderColor: `${cert.accent}55` }}>
                      {cert.mark}
                    </span>
                    <div>
                      <h3 className="cert-card-title">{cert.title}</h3>
                      <p className="cert-card-issuer">{cert.issuer}</p>
                    </div>
                  </div>
                  <p className="cert-card-issued">{cert.issued}</p>
                  {cert.credentialId && (
                    <p className="cert-card-id">CREDENTIAL · {cert.credentialId}</p>
                  )}
                </div>
              </a>
            ))}
          </div>

        </div>

        <style>{`
          .cert-card {
            position: relative;
            display: block;
            min-width: 0;
            overflow: hidden;
            text-decoration: none;
            background: linear-gradient(145deg, rgba(20,20,27,0.94), rgba(10,10,14,0.97));
            border: 1px solid rgba(255,255,255,0.09);
            border-radius: 16px;
            color: inherit;
            isolation: isolate;
            transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s cubic-bezier(0.16,1,0.3,1);
          }
          .cert-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(min(100%, 290px), 1fr));
            gap: 14px;
          }
          .cert-card-accent {
            height: 3px;
            opacity: 0.85;
          }
          .cert-card-content {
            padding: 1.25rem;
          }
          .cert-card-topline {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }
          .cert-card-type,
          .cert-card-issued,
          .cert-card-id {
            font-family: var(--font-mono);
            font-size: 0.6rem;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }
          .cert-card-arrow {
            color: rgba(240,238,246,0.45);
            font-size: 1rem;
            transition: color 0.3s, transform 0.3s;
          }
          .cert-card-main {
            display: flex;
            align-items: center;
            gap: 0.85rem;
            min-height: 60px;
          }
          .cert-card-mark {
            display: grid;
            place-items: center;
            width: 42px;
            height: 42px;
            flex: 0 0 42px;
            border: 1px solid;
            border-radius: 12px;
            background: rgba(255,255,255,0.035);
            font-family: var(--font-display);
            font-size: 1.05rem;
            font-weight: 800;
          }
          .cert-card-title {
            color: #F0EEF6;
            font-family: var(--font-display);
            font-size: 0.95rem;
            font-weight: 700;
            line-height: 1.35;
          }
          .cert-card-issuer {
            margin-top: 4px;
            color: rgba(240,238,246,0.48);
            font-family: var(--font-body);
            font-size: 0.75rem;
            line-height: 1.45;
          }
          .cert-card-issued {
            margin-top: 1rem;
            color: rgba(240,238,246,0.56);
          }
          .cert-card-id {
            margin-top: 0.6rem;
            overflow-wrap: anywhere;
            color: rgba(240,238,246,0.28);
            font-size: 0.52rem;
          }
          .cert-card:hover {
            border-color: rgba(196,181,253,0.35);
            box-shadow: 0 12px 40px rgba(0,0,0,0.3);
            transform: translateY(-4px);
          }
          .cert-card:hover .cert-card-arrow {
            color: #F0EEF6;
            transform: translate(2px,-2px);
          }
          .cert-card:focus-visible {
            outline: 2px solid #C4B5FD;
            outline-offset: 3px;
          }
        `}</style>

      </div>
    </section>
  )
}
