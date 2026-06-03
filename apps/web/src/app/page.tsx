import HubSearch from '@/components/home/hub-search'
import Link from 'next/link'

/* ── Mock data (replace with real DB queries once catalog is seeded) ── */



const SPORTS = [
  { name: 'NBA',     icon: '🏀', count: 38, color: '#d4a843' },
  { name: 'NFL',     icon: '🏈', count: 25, color: '#c9a84c' },
  { name: 'MLB',     icon: '⚾', count: 22, color: '#34c97a' },
  { name: 'NHL',     icon: '🏒', count: 14, color: '#7eb8e8' },
  { name: 'Soccer',  icon: '⚽', count: 12, color: '#a88be0' },
  { name: 'WNBA',    icon: '🏀', count: 8,  color: '#e07a5b' },
  { name: 'UFC/MMA', icon: '🥊', count: 6,  color: '#e05c5c' },
  { name: 'Golf',    icon: '⛳', count: 5,  color: '#6db87a' },
]


export default function HomePage() {
  return (
    <>
      {/* ── HERO ── */}
      <section style={{
        position: 'relative',
        minHeight: '520px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        padding: '5rem 2rem 4rem',
      }}>
        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(201,168,76,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
        {/* Gold radial glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(184,146,46,0.10) 0%, transparent 70%)',
        }} />
        {/* Diagonal rule lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(135deg, rgba(201,168,76,0.03) 0px, rgba(201,168,76,0.03) 1px, transparent 1px, transparent 60px)',
        }} />

        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', maxWidth: '720px', width: '100%',
        }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '5px 14px',
            background: 'var(--gold-bg)',
            border: '1px solid var(--gold-border)',
            borderRadius: '6px',
            marginBottom: '1.5rem',
          }}>
            <span style={{ color: 'var(--gold3)', fontSize: '0.65rem' }}>◆</span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              fontWeight: 500,
              color: 'var(--gold2)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}>
              Sports Card Intelligence Platform
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700,
            lineHeight: 1.18,
            color: 'var(--text)',
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
          }}>
            Smarter{' '}
            <em style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold3) 50%, var(--gold2) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Sports Card
            </em>{' '}
            Investing Starts Here.
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '1rem',
            color: 'var(--text2)',
            lineHeight: 1.7,
            marginBottom: '2rem',
            maxWidth: '540px',
          }}>
            Select a league to browse cards, prices, and trends — or search across all sports below.
          </p>

          {/* Search */}
          <HubSearch />
        </div>
      </section>

      {/* ── BROWSE BY LEAGUE ── */}
      <section style={{ padding: '4rem 2rem 5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gold2)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              Browse by League
            </span>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700,
              color: 'var(--text)', marginTop: '4px',
            }}>
              Browse by League
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '12px',
          }}>
            {SPORTS.map((sport, i) => (
              <Link key={i} href={`/browse?sport=${sport.name.toLowerCase()}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="sport-tile-card">
                  <span style={{ fontSize: '1.5rem' }}>{sport.icon}</span>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem',
                      color: 'var(--text)',
                    }}>
                      {sport.name}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                      color: 'var(--text3)', marginTop: '2px',
                    }}>
                      {sport.count} cards tracked
                    </div>
                  </div>
                  <span style={{
                    position: 'absolute', top: '12px', right: '12px',
                    color: 'var(--text3)', fontSize: '0.75rem',
                  }}>
                    ›
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
