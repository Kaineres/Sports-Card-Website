'use client'

import { Suspense, useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { BROWSE_CATALOG, SPORT_META, type Sport } from '@/lib/catalog'
import { useWatchlist } from '@/lib/watchlist-context'

type SortKey = 'value-desc' | 'value-asc' | 'change-desc' | 'player-asc'

const SPORT_CATEGORY: Record<string, string> = {
  NBA: 'Basketball', NFL: 'Football', MLB: 'Baseball', NHL: 'Hockey',
  Soccer: 'Soccer', WNBA: 'Basketball', 'UFC/MMA': 'MMA', Golf: 'Golf',
}

const SPORTS: (Sport | 'All')[] = ['All', 'NBA', 'NFL', 'MLB', 'NHL', 'Soccer', 'WNBA', 'UFC/MMA', 'Golf']

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'value-desc',  label: 'Value: High → Low' },
  { value: 'value-asc',   label: 'Value: Low → High' },
  { value: 'change-desc', label: 'Gain: High → Low' },
  { value: 'player-asc',  label: 'Player A → Z' },
]

const GRADES = ['All Grades', 'PSA 10', 'PSA 9', 'PSA 8', 'PSA 7', 'Raw']

function gradeStyle(grade: string): { color: string; bg: string; border: string } {
  const n = parseInt(grade.replace('PSA ', ''))
  if (n === 10)          return { color: '#34c97a', bg: 'rgba(52,201,122,0.12)',  border: 'rgba(52,201,122,0.25)'  }
  if (n === 9)           return { color: '#5dd68c', bg: 'rgba(93,214,140,0.10)',  border: 'rgba(93,214,140,0.22)'  }
  if (n === 8)           return { color: '#d4a843', bg: 'rgba(212,168,67,0.12)',  border: 'rgba(212,168,67,0.25)'  }
  if (n === 7)           return { color: '#e8a030', bg: 'rgba(232,160,48,0.12)',  border: 'rgba(232,160,48,0.25)'  }
  if (n === 6)           return { color: '#e07840', bg: 'rgba(224,120,64,0.12)',  border: 'rgba(224,120,64,0.25)'  }
  if (n >= 1 && n <= 5)  return { color: '#e05c5c', bg: 'rgba(224,92,92,0.12)',   border: 'rgba(224,92,92,0.25)'   }
  return                        { color: 'var(--text3)', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' }
}

function parseSport(s: string | null): Sport | 'All' {
  if (!s) return 'All'
  const match = SPORTS.find(sp => sp.toLowerCase() === s.toLowerCase())
  return (match && match !== 'All') ? match as Sport : 'All'
}

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

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [sport, setSport] = useState<Sport | 'All'>(() => parseSport(searchParams.get('sport')))
  const [grade, setGrade] = useState('All Grades')
  const [sort, setSort]   = useState<SortKey>('value-desc')
  const { toggle: toggleWatch, isWatched } = useWatchlist()

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
    setSport(parseSport(searchParams.get('sport')))
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
    if (sport !== 'All') cards = cards.filter(c => c.sport === sport)
    if (grade !== 'All Grades') cards = cards.filter(c => c.grade === grade)
    cards.sort((a, b) => {
      switch (sort) {
        case 'value-desc':  return b.currentValue - a.currentValue
        case 'value-asc':   return a.currentValue - b.currentValue
        case 'change-desc': return b.percentChange - a.percentChange
        case 'player-asc':  return a.player.localeCompare(b.player)
        default:            return 0
      }
    })
    return cards
  }, [query, sport, grade, sort])



  const activeSport = sport !== 'All' ? (sport as Sport) : null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <div style={{
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border-md)',
        padding: '1rem 1.5rem 0',
      }}>
        <div style={{ maxWidth: '1500px', margin: '0 auto' }}>

          {/* Back + sport label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Link href="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '5px 12px',
              background: 'var(--bg2)', border: '1px solid var(--border-md)',
              borderRadius: '7px',
              color: 'var(--text2)', textDecoration: 'none',
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
              transition: 'color 0.15s',
            }}>
              ← Back
            </Link>

            {activeSport && (
              <>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700,
                  color: 'var(--text)',
                }}>
                  <span>{SPORT_META[activeSport].icon}</span>
                  {activeSport}
                </span>
                <span style={{
                  padding: '3px 10px',
                  background: 'var(--gold-bg)', border: '1px solid var(--gold-border)',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 600,
                  color: 'var(--gold2)',
                }}>
                  {SPORT_CATEGORY[activeSport]}
                </span>
              </>
            )}
          </div>

          {/* Search + sport pills + dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>

            {/* Search bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'var(--bg2)', border: '1px solid var(--border-md)',
              borderRadius: '8px', padding: '8px 14px',
              minWidth: '260px', flex: '0 1 340px',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search player, set, card name..."
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: '0.84rem',
                }}
              />
              {query && (
                <button onClick={() => setQuery('')} style={{
                  background: 'none', border: 'none', color: 'var(--text3)',
                  cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1, padding: 0,
                }}>×</button>
              )}
              <button style={{
                background: 'none', border: 'none', color: 'var(--text3)',
                cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text3)'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0-2-2h-3l-2.5-3z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
              </button>
            </div>

            {/* Sport pills */}
            {SPORTS.map(s => {
              const isActive = sport === s
              return (
                <button key={s} onClick={() => setSport(s)} style={{
                  padding: '7px 13px',
                  borderRadius: '7px',
                  border: isActive ? '1px solid var(--gold-border)' : '1px solid var(--border-md)',
                  background: isActive ? 'var(--gold-bg)' : 'var(--bg2)',
                  color: isActive ? 'var(--gold2)' : 'var(--text3)',
                  fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: '0.15s',
                }}>
                  {s === 'All' ? 'All' : s}
                </button>
              )
            })}

            {/* Grade */}
            <select value={grade} onChange={e => setGrade(e.target.value)} style={{
              background: 'var(--bg2)', border: '1px solid var(--border-md)',
              borderRadius: '7px', color: 'var(--text2)',
              fontFamily: 'var(--font-display)', fontSize: '0.8rem',
              padding: '8px 12px', cursor: 'pointer', outline: 'none', flexShrink: 0,
            }}>
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value as SortKey)} style={{
              background: 'var(--bg2)', border: '1px solid var(--border-md)',
              borderRadius: '7px', color: 'var(--text2)',
              fontFamily: 'var(--font-display)', fontSize: '0.8rem',
              padding: '8px 12px', cursor: 'pointer', outline: 'none', flexShrink: 0,
            }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Result count */}
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text3)',
            padding: '10px 0 8px',
          }}>
            {filtered.length} cards found
          </div>
        </div>
      </div>

      {/* ── Card grid ── */}
      <div style={{ padding: '1.25rem 2rem' }}>
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
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '10px',
          }}>
            {filtered.map(card => {
              const isUp    = card.percentChange >= 0
              const watched = isWatched(card.id)
              const meta    = SPORT_META[card.sport]
              return (
                <div
                  key={card.id}
                  onClick={() => router.push(`/player/${encodeURIComponent(card.player)}`)}
                  style={{
                    background: 'var(--bg2)',
                    border: '1px solid var(--border-md)',
                    borderRadius: '10px',
                    padding: '1rem',
                    display: 'flex', flexDirection: 'column', gap: '10px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-lg)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-md)'}
                >
                  {/* Sport badge + % change */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '3px 8px',
                      background: `${meta.color}18`,
                      border: `1px solid ${meta.color}40`,
                      borderRadius: '5px',
                    }}>
                      <span style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: meta.color, flexShrink: 0,
                        display: 'inline-block',
                      }} />
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.64rem', fontWeight: 700,
                        color: meta.color, letterSpacing: '0.04em',
                      }}>
                        {card.sport}
                      </span>
                    </span>
                    <span style={{
                      padding: '3px 7px',
                      background: isUp ? 'var(--green-bg)' : 'var(--red-bg)',
                      border: `1px solid ${isUp ? 'rgba(52,201,122,0.2)' : 'rgba(224,92,92,0.2)'}`,
                      borderRadius: '5px',
                      fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700,
                      color: isUp ? 'var(--green)' : 'var(--red)',
                    }}>
                      {isUp ? '+' : ''}{card.percentChange.toFixed(1)}%
                    </span>
                  </div>

                  {/* Player name */}
                  <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem',
                    color: 'var(--text)', lineHeight: 1.2,
                  }}>
                    {card.player}
                  </div>

                  {/* Card name */}
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '0.77rem', color: 'var(--text3)',
                    lineHeight: 1.4,
                  }}>
                    {card.cardName}
                  </div>

                  {/* Grade pill + year · set */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{
                      padding: '2px 7px',
                      background: gradeStyle(card.grade).bg,
                      border: `1px solid ${gradeStyle(card.grade).border}`,
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)', fontSize: '0.63rem', fontWeight: 700,
                      color: gradeStyle(card.grade).color,
                    }}>
                      {card.grade}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--text3)',
                    }}>
                      {card.year} · {card.setName}
                    </span>
                  </div>

                  {/* Price + % */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 700,
                      color: 'var(--text)', letterSpacing: '-0.01em',
                    }}>
                      ${card.currentValue.toLocaleString()}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600,
                      color: isUp ? 'var(--green)' : 'var(--red)',
                    }}>
                      {isUp ? '▲' : '▼'} {Math.abs(card.percentChange).toFixed(1)}%
                    </span>
                  </div>

                  {/* Watch + Add buttons */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={e => { e.stopPropagation(); toggleWatch(card.id) }}
                      style={{
                        flex: 1, padding: '8px 0',
                        background: watched ? 'var(--gold-bg)' : 'transparent',
                        border: watched ? '1px solid var(--gold-border)' : '1px solid var(--border-md)',
                        borderRadius: '6px',
                        color: watched ? 'var(--gold2)' : 'var(--text2)',
                        fontFamily: 'var(--font-display)', fontSize: '0.74rem', fontWeight: 600,
                        cursor: 'pointer', transition: '0.15s',
                      }}
                    >
                      ★ {watched ? 'Watching' : 'Watch'}
                    </button>
                    <button
                      onClick={e => e.stopPropagation()}
                      style={{
                        flex: 1, padding: '8px 0',
                        background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
                        border: 'none', borderRadius: '6px',
                        color: '#0d1117',
                        fontFamily: 'var(--font-display)', fontSize: '0.74rem', fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      + Add
                    </button>
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
