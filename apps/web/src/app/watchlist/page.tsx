'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type WLSortKey = '' | 'player-asc' | 'player-desc' | 'value-desc' | 'value-asc' | 'change-desc' | 'change-asc'

interface WatchCard {
  id: number
  player: string
  cardName: string
  setName: string
  year: number
  grade: string
  currentValue: number
  trend: string
  trendUp: boolean
  sport: string
  alertEnabled: boolean
  priceHistory: number[]
}

const MOCK_WATCHLIST: WatchCard[] = [
  {
    id: 101, player: 'Victor Wembanyama', cardName: '2023-24 Topps Chrome RC Auto',
    setName: 'Topps Chrome', year: 2023, grade: 'PSA 10', currentValue: 3400,
    trend: '+28%', trendUp: true, sport: 'NBA', alertEnabled: true,
    priceHistory: [2100, 2300, 2500, 2600, 2800, 3000, 3200, 3400],
  },
  {
    id: 102, player: 'Caitlin Clark', cardName: '2024 Rittenhouse WNBA Rookie',
    setName: 'Rittenhouse', year: 2024, grade: 'PSA 10', currentValue: 1200,
    trend: '+41%', trendUp: true, sport: 'WNBA', alertEnabled: false,
    priceHistory: [650, 720, 810, 900, 980, 1050, 1120, 1200],
  },
  {
    id: 103, player: 'Caleb Williams', cardName: '2024 Panini Prizm Draft Picks RC',
    setName: 'Panini Prizm', year: 2024, grade: 'Raw', currentValue: 180,
    trend: '-8%', trendUp: false, sport: 'NFL', alertEnabled: true,
    priceHistory: [220, 210, 205, 195, 190, 185, 182, 180],
  },
  {
    id: 104, player: 'Connor Bedard', cardName: 'Upper Deck Series 1 RC',
    setName: 'Upper Deck', year: 2023, grade: 'PSA 10', currentValue: 620,
    trend: '+11.5%', trendUp: true, sport: 'NHL', alertEnabled: false,
    priceHistory: [400, 440, 470, 510, 530, 555, 590, 620],
  },
  {
    id: 105, player: 'Paul Skenes', cardName: 'Topps Chrome RC',
    setName: 'Topps Chrome', year: 2024, grade: 'PSA 10', currentValue: 445,
    trend: '+15.3%', trendUp: true, sport: 'MLB', alertEnabled: true,
    priceHistory: [280, 300, 320, 355, 380, 400, 425, 445],
  },
]

const SPORT_COLORS: Record<string, string> = {
  NBA: '#f0c96a', NFL: '#34c97a', MLB: '#60a5fa',
  NHL: '#a78bfa', Soccer: '#34d399', WNBA: '#f0c96a',
}

function MiniSparkline({ data, up }: { data: number[], up: boolean }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 80, h = 32
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={up ? 'var(--green)' : 'var(--red)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function WatchlistPage() {
  const [playerFilter, setPlayerFilter] = useState('')
  const [gradeFilter, setGradeFilter]   = useState('')
  const [sort, setSort]                 = useState<WLSortKey>('')
  const [alerts, setAlerts]             = useState<Record<number, boolean>>(
    Object.fromEntries(MOCK_WATCHLIST.map(c => [c.id, c.alertEnabled]))
  )
  const [removed, setRemoved]           = useState<Set<number>>(new Set())

  const displayed = useMemo(() => {
    let list = MOCK_WATCHLIST.filter(c => !removed.has(c.id))
    if (playerFilter.trim()) {
      const q = playerFilter.toLowerCase()
      list = list.filter(c => c.player.toLowerCase().includes(q) || c.cardName.toLowerCase().includes(q))
    }
    if (gradeFilter) list = list.filter(c => c.grade === gradeFilter)
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'player-asc':  return a.player.localeCompare(b.player)
        case 'player-desc': return b.player.localeCompare(a.player)
        case 'value-desc':  return b.currentValue - a.currentValue
        case 'value-asc':   return a.currentValue - b.currentValue
        case 'change-desc': return (b.trendUp ? 1 : -1) - (a.trendUp ? 1 : -1)
        case 'change-asc':  return (a.trendUp ? 1 : -1) - (b.trendUp ? 1 : -1)
        default:            return 0
      }
    })
    return list
  }, [playerFilter, gradeFilter, sort, removed])

  function toggleAlert(id: number) {
    setAlerts(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function removeCard(id: number) {
    setRemoved(prev => new Set([...prev, id]))
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <div style={{ borderBottom: '1px solid var(--border-md)', background: 'var(--bg2)', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>Watchlist</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginTop: '3px' }}>Cards you're tracking and targeting</p>
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
            color: 'var(--gold2)', padding: '4px 12px',
            background: 'var(--gold-bg)', border: '1px solid var(--gold-border)', borderRadius: '5px',
          }}>
            {displayed.length} card{displayed.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div style={{ borderBottom: '1px solid var(--border-sm)', background: 'var(--bg2)', padding: '0.75rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={playerFilter}
            onChange={e => setPlayerFilter(e.target.value)}
            placeholder="Player or card name…"
            style={{
              flex: 1, minWidth: '160px', background: 'var(--bg3)', border: '1px solid var(--border-md)',
              borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-display)',
              fontSize: '0.83rem', padding: '7px 12px', outline: 'none',
            }}
          />
          <select
            value={gradeFilter}
            onChange={e => setGradeFilter(e.target.value)}
            style={{ background: 'var(--bg3)', border: '1px solid var(--border-md)', borderRadius: '8px', color: 'var(--text2)', fontFamily: 'var(--font-display)', fontSize: '0.82rem', padding: '8px 12px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="">All Grades</option>
            <option>PSA 10</option><option>PSA 9</option><option>PSA 8</option><option>PSA 7</option><option>Raw</option>
          </select>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as WLSortKey)}
            style={{ background: 'var(--bg3)', border: '1px solid var(--border-md)', borderRadius: '8px', color: 'var(--text2)', fontFamily: 'var(--font-display)', fontSize: '0.82rem', padding: '8px 12px', outline: 'none', cursor: 'pointer', minWidth: '148px' }}
          >
            <option value="">Sort: Default</option>
            <option value="player-asc">Player A→Z</option>
            <option value="player-desc">Player Z→A</option>
            <option value="value-desc">Value: High→Low</option>
            <option value="value-asc">Value: Low→High</option>
            <option value="change-desc">Gainers First</option>
            <option value="change-asc">Losers First</option>
          </select>
          {(playerFilter || gradeFilter || sort) && (
            <button
              onClick={() => { setPlayerFilter(''); setGradeFilter(''); setSort('') }}
              style={{ background: 'none', border: '1px solid var(--border-md)', borderRadius: '7px', color: 'var(--text3)', fontFamily: 'var(--font-display)', fontSize: '0.78rem', padding: '7px 12px', cursor: 'pointer' }}
            >✕ Clear</button>
          )}
          <Link href="/browse" style={{
            marginLeft: 'auto', padding: '7px 16px',
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
            border: 'none', borderRadius: '7px', color: '#0d1117',
            fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700,
            textDecoration: 'none', whiteSpace: 'nowrap',
          }}>+ Add Cards</Link>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>☆</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--text)', marginBottom: '8px' }}>Your watchlist is empty</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text3)', marginBottom: '1.5rem' }}>Browse cards and click Watch to track them here</div>
            <Link href="/browse" style={{
              padding: '9px 22px',
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
              border: 'none', borderRadius: '8px', color: '#0d1117',
              fontFamily: 'var(--font-display)', fontSize: '0.83rem', fontWeight: 700,
              textDecoration: 'none',
            }}>Browse Cards</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
            {displayed.map(card => {
              const sportColor = SPORT_COLORS[card.sport] ?? 'var(--text3)'
              return (
                <div key={card.id} className="browse-card" style={{
                  padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative',
                }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{
                      padding: '3px 9px', borderRadius: '5px',
                      background: `${sportColor}18`, border: `1px solid ${sportColor}40`,
                      fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, color: sportColor, letterSpacing: '0.04em',
                    }}>{card.sport}</span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        onClick={() => toggleAlert(card.id)}
                        title={alerts[card.id] ? 'Alert on' : 'Alert off'}
                        style={{
                          background: alerts[card.id] ? 'var(--gold-bg)' : 'none',
                          border: alerts[card.id] ? '1px solid var(--gold-border)' : '1px solid var(--border-md)',
                          borderRadius: '5px', color: alerts[card.id] ? 'var(--gold2)' : 'var(--text3)',
                          fontFamily: 'var(--font-mono)', fontSize: '0.62rem', padding: '3px 7px', cursor: 'pointer', transition: '0.15s',
                        }}>
                        {alerts[card.id] ? '🔔' : '🔕'} Alert
                      </button>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 8px', borderRadius: '5px',
                        background: card.trendUp ? 'var(--green-bg)' : 'var(--red-bg)',
                        border: `1px solid ${card.trendUp ? 'rgba(52,201,122,0.2)' : 'rgba(224,92,92,0.2)'}`,
                        fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                        color: card.trendUp ? 'var(--green)' : 'var(--red)',
                      }}>{card.trendUp ? '▲' : '▼'} {card.trend.replace(/[+-]/g, '')}</span>
                    </div>
                  </div>

                  {/* Player info */}
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '3px' }}>{card.player}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text3)' }}>{card.cardName}</div>
                  </div>

                  {/* Meta + sparkline */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px',
                        background: 'var(--green-bg)', border: '1px solid rgba(52,201,122,0.2)',
                        fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 600, color: 'var(--green)',
                      }}>{card.grade}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text3)' }}>{card.year}</span>
                    </div>
                    <MiniSparkline data={card.priceHistory} up={card.trendUp} />
                  </div>

                  {/* Price + actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--text)' }}>
                      ${card.currentValue.toLocaleString()}
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => removeCard(card.id)}
                        style={{
                          padding: '6px 12px', background: 'none', border: '1px solid var(--border-md)',
                          borderRadius: '6px', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', cursor: 'pointer', transition: '0.15s',
                        }}>× Remove</button>
                      <button style={{
                        padding: '6px 12px',
                        background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
                        border: 'none', borderRadius: '6px', color: '#0d1117',
                        fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                      }}>+ Add</button>
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
