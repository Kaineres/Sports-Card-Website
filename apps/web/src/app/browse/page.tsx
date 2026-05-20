'use client'

import { Suspense, useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

/* ── Types ── */
type Sport = 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'Soccer' | 'WNBA' | 'UFC/MMA' | 'Golf'
type SortKey = 'value-desc' | 'value-asc' | 'change-desc' | 'change-asc' | 'player-asc'

interface CatalogCard {
  id: number
  player: string
  cardName: string
  setName: string
  year: number
  grade: string
  currentValue: number
  percentChange: number
  sport: Sport
}

/* ── Mock catalog (swap for Supabase query once catalog is seeded) ── */
const BROWSE_CATALOG: CatalogCard[] = [
  { id:1,  player:'Caleb Williams',       cardName:'Base RC',        setName:'Panini Mosaic',    year:2024, grade:'PSA 10', currentValue:285.00,  percentChange:+12.4, sport:'NFL'  },
  { id:2,  player:'Jayden Daniels',       cardName:'Base RC',        setName:'Panini Mosaic',    year:2024, grade:'PSA 10', currentValue:195.00,  percentChange:+22.1, sport:'NFL'  },
  { id:3,  player:'Drake Maye',           cardName:'Base RC',        setName:'Panini Mosaic',    year:2024, grade:'PSA 10', currentValue:175.00,  percentChange:-3.2,  sport:'NFL'  },
  { id:4,  player:'Marvin Harrison Jr',   cardName:'Base RC',        setName:'Panini Mosaic',    year:2024, grade:'PSA 10', currentValue:260.00,  percentChange:+18.4, sport:'NFL'  },
  { id:5,  player:'Brock Bowers',         cardName:'Base RC',        setName:'Panini Mosaic',    year:2024, grade:'PSA 10', currentValue:220.00,  percentChange:+6.5,  sport:'NFL'  },
  { id:6,  player:'Victor Wembanyama',    cardName:'Base RC',        setName:'Panini Prizm',     year:2023, grade:'PSA 10', currentValue:1240.00, percentChange:+8.7,  sport:'NBA'  },
  { id:7,  player:'Chet Holmgren',        cardName:'Base RC',        setName:'Panini Prizm',     year:2022, grade:'PSA 10', currentValue:380.00,  percentChange:-2.1,  sport:'NBA'  },
  { id:8,  player:'Paolo Banchero',       cardName:'Base RC',        setName:'Panini Prizm',     year:2022, grade:'PSA 10', currentValue:310.00,  percentChange:+4.3,  sport:'NBA'  },
  { id:9,  player:'Scoot Henderson',      cardName:'Base RC',        setName:'Panini Prizm',     year:2023, grade:'PSA 10', currentValue:145.00,  percentChange:-6.8,  sport:'NBA'  },
  { id:10, player:'Brandon Miller',       cardName:'Base RC',        setName:'Panini Prizm',     year:2023, grade:'PSA 10', currentValue:120.00,  percentChange:+1.2,  sport:'NBA'  },
  { id:11, player:'Jackson Holliday',     cardName:'Base RC',        setName:'Topps Chrome',     year:2024, grade:'PSA 10', currentValue:320.00,  percentChange:+9.8,  sport:'MLB'  },
  { id:12, player:'Jackson Chourio',      cardName:'Base RC',        setName:'Topps Chrome',     year:2024, grade:'PSA 10', currentValue:280.00,  percentChange:+14.2, sport:'MLB'  },
  { id:13, player:'Yoshinobu Yamamoto',   cardName:'Base RC',        setName:'Topps Chrome',     year:2024, grade:'PSA 10', currentValue:510.00,  percentChange:+4.2,  sport:'MLB'  },
  { id:14, player:'Paul Skenes',          cardName:'Base RC',        setName:'Topps Chrome',     year:2024, grade:'PSA 10', currentValue:445.00,  percentChange:+15.3, sport:'MLB'  },
  { id:15, player:'Wyatt Langford',       cardName:'Base RC',        setName:'Topps Chrome',     year:2024, grade:'PSA 10', currentValue:190.00,  percentChange:+7.6,  sport:'MLB'  },
  { id:16, player:'Connor Bedard',        cardName:'Base RC',        setName:'Upper Deck Series', year:2023, grade:'PSA 10', currentValue:620.00, percentChange:+11.5, sport:'NHL'  },
  { id:17, player:'Matvei Michkov',       cardName:'Base RC',        setName:'Upper Deck Series', year:2024, grade:'PSA 10', currentValue:380.00, percentChange:+22.8, sport:'NHL'  },
  { id:18, player:'Caitlin Clark',        cardName:'Base RC',        setName:'Parkside WNBA',    year:2024, grade:'PSA 10', currentValue:890.00,  percentChange:+31.2, sport:'WNBA' },
  { id:19, player:'Angel Reese',          cardName:'Base RC',        setName:'Parkside WNBA',    year:2024, grade:'PSA 10', currentValue:420.00,  percentChange:+18.6, sport:'WNBA' },
  { id:20, player:'Erling Haaland',       cardName:'Base',           setName:'Topps Chrome UCL', year:2023, grade:'PSA 10', currentValue:340.00,  percentChange:+5.9,  sport:'Soccer'},
]

const SPORT_COLORS: Record<Sport, string> = {
  'NBA':     '#f0c96a',
  'NFL':     '#34c97a',
  'MLB':     '#60a5fa',
  'NHL':     '#a78bfa',
  'Soccer':  '#34d399',
  'WNBA':    '#f0c96a',
  'UFC/MMA': '#e05c5c',
  'Golf':    '#34c97a',
}

const SPORTS: (Sport | 'All')[] = ['All', 'NBA', 'NFL', 'MLB', 'NHL', 'Soccer', 'WNBA', 'UFC/MMA', 'Golf']

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'value-desc',   label: 'Value: High → Low' },
  { value: 'value-asc',    label: 'Value: Low → High' },
  { value: 'change-desc',  label: 'Gainers First' },
  { value: 'change-asc',   label: 'Losers First' },
  { value: 'player-asc',   label: 'Player A → Z' },
]

export default function BrowsePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg)' }} />}>
      <BrowseContent />
    </Suspense>
  )
}

function BrowseContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [query, setQuery]       = useState(searchParams.get('q') ?? '')
  const [sport, setSport]       = useState<Sport | 'All'>((searchParams.get('sport')?.toUpperCase() as Sport) ?? 'All')
  const [sort, setSort]         = useState<SortKey>('value-desc')
  const [watchlist, setWatchlist] = useState<Set<number>>(new Set())

  /* Sync query param changes */
  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
    const s = searchParams.get('sport')
    if (s) setSport(s.toUpperCase() as Sport)
  }, [searchParams])

  const filtered = useMemo(() => {
    let cards = [...BROWSE_CATALOG]

    if (query.trim()) {
      const q = query.toLowerCase()
      cards = cards.filter(c =>
        c.player.toLowerCase().includes(q) ||
        c.setName.toLowerCase().includes(q) ||
        c.cardName.toLowerCase().includes(q)
      )
    }

    if (sport !== 'All') {
      cards = cards.filter(c => c.sport === sport)
    }

    cards.sort((a, b) => {
      switch (sort) {
        case 'value-desc':  return b.currentValue - a.currentValue
        case 'value-asc':   return a.currentValue - b.currentValue
        case 'change-desc': return b.percentChange - a.percentChange
        case 'change-asc':  return a.percentChange - b.percentChange
        case 'player-asc':  return a.player.localeCompare(b.player)
        default:            return 0
      }
    })

    return cards
  }, [query, sport, sort])

  function toggleWatch(id: number) {
    setWatchlist(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Page header ── */}
      <div style={{
        borderBottom: '1px solid var(--border-md)',
        background: 'var(--bg2)',
        padding: '1.5rem 2rem',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Back + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
            <Link href="/" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              color: 'var(--text3)', textDecoration: 'none',
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
              transition: 'color 0.15s',
            }}>
              ← Back
            </Link>
            <span style={{ color: 'var(--border-md)' }}>|</span>
            <h1 style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700,
              color: 'var(--text)',
            }}>
              Browse Cards
            </h1>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
              color: 'var(--text3)',
              background: 'var(--bg3)', border: '1px solid var(--border-md)',
              borderRadius: '5px', padding: '2px 8px',
            }}>
              {filtered.length} results
            </span>
          </div>

          {/* Search + sort row */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
              background: 'var(--bg3)', border: '1px solid var(--border-md)',
              borderRadius: '8px', padding: '8px 14px',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search player, set, or card name..."
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: '0.85rem',
                }}
              />
              {query && (
                <button onClick={() => setQuery('')} style={{
                  background: 'none', border: 'none', color: 'var(--text3)',
                  cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1,
                }}>×</button>
              )}
            </div>

            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              style={{
                background: 'var(--bg3)', border: '1px solid var(--border-md)',
                borderRadius: '8px', color: 'var(--text2)',
                fontFamily: 'var(--font-display)', fontSize: '0.82rem',
                padding: '9px 12px', cursor: 'pointer', outline: 'none',
              }}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Sport filter pills */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
            {SPORTS.map(s => {
              const isActive = sport === s
              return (
                <button
                  key={s}
                  onClick={() => setSport(s)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '20px',
                    border: isActive ? '1px solid var(--gold-border)' : '1px solid var(--border-md)',
                    background: isActive ? 'var(--gold-bg)' : 'none',
                    color: isActive ? 'var(--gold2)' : 'var(--text3)',
                    fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 500,
                    cursor: 'pointer', transition: '0.15s',
                  }}
                >
                  {s === 'All' ? 'All Sports' : s}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Card grid ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '5rem 0',
            fontFamily: 'var(--font-mono)', color: 'var(--text3)', fontSize: '0.85rem',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📦</div>
            No cards match your search.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '12px',
          }}>
            {filtered.map(card => {
              const isUp = card.percentChange >= 0
              const watched = watchlist.has(card.id)
              const sportColor = SPORT_COLORS[card.sport]
              return (
                <div key={card.id} className="browse-card" style={{
                  background: 'var(--bg2)',
                  border: '1px solid var(--border-md)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex', flexDirection: 'column', gap: '12px',
                  position: 'relative', overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                }}>
                  {/* Top row: sport badge + change badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{
                      padding: '3px 9px',
                      background: `${sportColor}18`,
                      border: `1px solid ${sportColor}40`,
                      borderRadius: '5px',
                      fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
                      color: sportColor,
                      letterSpacing: '0.04em',
                    }}>
                      {card.sport}
                    </span>
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: '3px',
                      padding: '3px 8px',
                      background: isUp ? 'var(--green-bg)' : 'var(--red-bg)',
                      border: `1px solid ${isUp ? 'rgba(52,201,122,0.2)' : 'rgba(224,92,92,0.2)'}`,
                      borderRadius: '5px',
                      fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                      color: isUp ? 'var(--green)' : 'var(--red)',
                    }}>
                      {isUp ? '▲' : '▼'} {Math.abs(card.percentChange).toFixed(1)}%
                    </span>
                  </div>

                  {/* Player + card info */}
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem',
                      color: 'var(--text)', marginBottom: '4px',
                    }}>
                      {card.player}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text3)',
                    }}>
                      {card.cardName}
                    </div>
                  </div>

                  {/* Meta row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '2px 8px',
                      background: 'var(--green-bg)', border: '1px solid rgba(52,201,122,0.2)',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 600,
                      color: 'var(--green)',
                    }}>
                      {card.grade}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text3)',
                    }}>
                      {card.year} · {card.setName}
                    </span>
                  </div>

                  {/* Price + actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 600,
                      color: 'var(--text)',
                    }}>
                      ${card.currentValue.toFixed(2)}
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={e => { e.stopPropagation(); toggleWatch(card.id) }}
                        style={{
                          padding: '6px 12px',
                          background: watched ? 'var(--gold-bg)' : 'none',
                          border: watched ? '1px solid var(--gold-border)' : '1px solid var(--border-md)',
                          borderRadius: '6px',
                          color: watched ? 'var(--gold2)' : 'var(--text3)',
                          fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                          cursor: 'pointer', transition: '0.15s',
                        }}
                      >
                        {watched ? '★ Watching' : '☆ Watch'}
                      </button>
                      <button
                        onClick={e => e.stopPropagation()}
                        style={{
                          padding: '6px 12px',
                          background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#0d1117',
                          fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
