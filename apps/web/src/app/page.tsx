import HubSearch from '@/components/home/hub-search'
import Link from 'next/link'

/* ── Mock data (replace with real DB queries once catalog is seeded) ── */

const STATS = [
  { label: 'Cards Tracked',   value: '142,847',  mono: true },
  { label: 'Market Cap',      value: '$2.4B',     mono: true },
  { label: 'Active Users',    value: '28,341',   mono: true },
  { label: 'Price Accuracy',  value: '99.2%',    mono: true },
]

const FEATURES = [
  { icon: '📈', title: 'Real-Time Pricing',    desc: 'Live eBay sold data ingested hourly. Every price has a source and a timestamp.' },
  { icon: '🤖', title: 'AI Card Grading',       desc: 'Upload a photo of any card and get a predicted PSA grade with sub-grade breakdown.' },
  { icon: '💼', title: 'Portfolio Tracking',    desc: 'Track cost basis, unrealized P&L, and realized gains across your entire collection.' },
  { icon: '🔥', title: 'Market Analytics',      desc: 'Spot trends before they happen. Grade premiums, volume by set, momentum signals.' },
  { icon: '🔔', title: 'Watchlist & Alerts',    desc: 'Watch any card, set a price alert, and get notified the moment it moves.' },
  { icon: '📷', title: 'Photo Card Search',     desc: 'Point your camera at any card. We identify it and pull pricing instantly.' },
]

const TRENDING = [
  { player: 'Caleb Williams',     set: 'Panini Mosaic',  year: 2024, grade: 'PSA 10', price: 285.00,  change: +12.4 },
  { player: 'Victor Wembanyama', set: 'Panini Prizm',   year: 2023, grade: 'PSA 10', price: 1240.00, change: +8.7  },
  { player: 'Jayden Daniels',    set: 'Panini Mosaic',  year: 2024, grade: 'PSA 10', price: 195.00,  change: +22.1 },
  { player: 'Paul Skenes',       set: 'Topps Chrome',   year: 2024, grade: 'PSA 10', price: 445.00,  change: +15.3 },
  { player: 'Drake Maye',        set: 'Panini Mosaic',  year: 2024, grade: 'PSA 10', price: 175.00,  change: -3.2  },
  { player: 'Jackson Holliday',  set: 'Topps Chrome',   year: 2024, grade: 'PSA 10', price: 320.00,  change: +9.8  },
]

const SPORTS = [
  { name: 'NBA',     icon: '🏀', count: 38, color: '#f0c96a' },
  { name: 'NFL',     icon: '🏈', count: 25, color: '#34c97a' },
  { name: 'MLB',     icon: '⚾', count: 22, color: '#60a5fa' },
  { name: 'NHL',     icon: '🏒', count: 14, color: '#a78bfa' },
  { name: 'Soccer',  icon: '⚽', count: 12, color: '#34d399' },
  { name: 'WNBA',    icon: '🏀', count: 8,  color: '#f0c96a' },
  { name: 'UFC/MMA', icon: '🥊', count: 6,  color: '#e05c5c' },
  { name: 'Golf',    icon: '⛳', count: 5,  color: '#34c97a' },
]

const TICKER_ITEMS = [
  { player: 'Caleb Williams',       change: +12.4, price: 285.00  },
  { player: 'Victor Wembanyama',    change: +8.7,  price: 1240.00 },
  { player: 'Jayden Daniels',       change: +22.1, price: 195.00  },
  { player: 'Paul Skenes',          change: +15.3, price: 445.00  },
  { player: 'Chet Holmgren',        change: -2.1,  price: 380.00  },
  { player: 'Drake Maye',           change: -3.2,  price: 175.00  },
  { player: 'Brock Bowers',         change: +6.5,  price: 220.00  },
  { player: 'Jackson Holliday',     change: +9.8,  price: 320.00  },
  { player: 'Marvin Harrison Jr',   change: +18.4, price: 260.00  },
  { player: 'Yoshinobu Yamamoto',   change: +4.2,  price: 510.00  },
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

      {/* ── TICKER ── */}
      <div
        className="ticker-wrap"
        style={{
          background: 'var(--bg2)',
          borderTop: '1px solid var(--border-sm)',
          borderBottom: '1px solid var(--border-sm)',
          padding: '10px 0',
          overflow: 'hidden',
        }}
      >
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '0 2rem',
              borderRight: '1px solid var(--border-sm)',
              whiteSpace: 'nowrap',
            }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 600,
                color: 'var(--text)',
              }}>
                {item.player}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                color: 'var(--text3)',
              }}>
                ${item.price.toFixed(2)}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600,
                color: item.change >= 0 ? 'var(--green)' : 'var(--red)',
              }}>
                {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        borderBottom: '1px solid var(--border-sm)',
      }}>
        {STATS.map((s, i) => (
          <div key={i} style={{
            padding: '1.5rem 2rem',
            borderRight: i < 3 ? '1px solid var(--border-sm)' : 'none',
            display: 'flex', flexDirection: 'column', gap: '4px',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
              color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              {s.label}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 500,
              color: 'var(--gold3)', letterSpacing: '-0.01em',
            }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <section style={{ padding: '4rem 2rem', borderBottom: '1px solid var(--border-sm)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gold2)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              Platform Features
            </span>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700,
              color: 'var(--text)', marginTop: '6px', letterSpacing: '-0.01em',
            }}>
              Everything you need to win the market.
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1px',
            background: 'var(--border-sm)',
            border: '1px solid var(--border-sm)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                padding: '1.75rem',
                background: 'var(--bg2)',
                display: 'flex', flexDirection: 'column', gap: '10px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg2)')}
              >
                <span style={{ fontSize: '1.4rem' }}>{f.icon}</span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600,
                  color: 'var(--text)',
                }}>
                  {f.title}
                </span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: '0.8rem',
                  color: 'var(--text3)', lineHeight: 1.6,
                }}>
                  {f.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING ── */}
      <section style={{ padding: '4rem 2rem', borderBottom: '1px solid var(--border-sm)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            marginBottom: '1.75rem',
          }}>
            <div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gold2)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                Top Movers
              </span>
              <h2 style={{
                fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700,
                color: 'var(--text)', marginTop: '4px',
              }}>
                Trending Now
              </h2>
            </div>
            <Link href="/market" style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
              color: 'var(--gold2)', textDecoration: 'none',
              letterSpacing: '0.02em',
            }}>
              View all →
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px',
          }}>
            {TRENDING.map((card, i) => {
              const isUp = card.change >= 0
              return (
                <div key={i} style={{
                  background: 'var(--bg2)',
                  border: '1px solid var(--border-md)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex', flexDirection: 'column', gap: '10px',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border-lg)'
                  e.currentTarget.style.background = 'var(--bg3)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-md)'
                  e.currentTarget.style.background = 'var(--bg2)'
                }}
                >
                  {/* Top accent */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                    background: isUp
                      ? 'linear-gradient(90deg, transparent, var(--green), transparent)'
                      : 'linear-gradient(90deg, transparent, var(--red), transparent)',
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{
                        fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)',
                        fontFamily: 'var(--font-display)',
                      }}>
                        {card.player}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text3)',
                        marginTop: '2px',
                      }}>
                        {card.year} {card.set}
                      </div>
                    </div>
                    <span style={{
                      padding: '3px 9px',
                      background: 'var(--green-bg)',
                      border: '1px solid rgba(52,201,122,0.2)',
                      borderRadius: '5px',
                      fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                      color: 'var(--green)',
                    }}>
                      {card.grade}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 500,
                      color: 'var(--text)',
                    }}>
                      ${card.price.toFixed(2)}
                    </span>
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                      color: isUp ? 'var(--green)' : 'var(--red)',
                      padding: '3px 8px',
                      background: isUp ? 'var(--green-bg)' : 'var(--red-bg)',
                      borderRadius: '5px',
                    }}>
                      {isUp ? '▲' : '▼'} {Math.abs(card.change).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
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
                <div
                  className="sport-tile"
                  style={{
                    background: 'var(--bg2)',
                    border: '1px solid var(--border-md)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem',
                    display: 'flex', flexDirection: 'column', gap: '10px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                    position: 'relative', overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--border-lg)'
                    e.currentTarget.style.background = 'var(--bg3)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-md)'
                    e.currentTarget.style.background = 'var(--bg2)'
                  }}
                >
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
