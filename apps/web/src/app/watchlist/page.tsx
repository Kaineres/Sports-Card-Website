'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useAuth, useClerk } from '@clerk/nextjs'
import type { WatchlistItem } from '@/lib/supabase/types'
import { formatGradeLabel } from '@/lib/cards/grade'
import { useWatchlist } from '@/lib/watchlist-context'

type WLSortKey = '' | 'player-asc' | 'player-desc' | 'setName-asc' | 'setName-desc' | 'year-asc' | 'year-desc' | 'grade-asc' | 'grade-desc'

interface WatchRow {
  id: string
  legacyCatalogId: number | null
  player: string
  cardName: string
  setName: string
  year: number
  grade: string
  sport: string
  alertEnabled: boolean
  // No fabricated market data until eBay data links in:
  currentValue: number | null
  percentChange: number | null
  priceHistory: number[]
}

const RANGE_OPTS = ['7D', '30D', '90D', '6M', '1Y', '5Y+']

function fmtK(v: number): string {
  if (v >= 10000) return `$${(v / 1000).toFixed(0)}k`
  if (v >= 1000)  return `$${(v / 1000).toFixed(1)}k`
  return `$${Math.round(v)}`
}

function WatchSparkline({ data, up, uid }: { data: number[], up: boolean, uid: string }) {
  const W = 290, H = 86, PAD_R = 42, PAD_T = 10, PAD_B = 8
  const chartW = W - PAD_R
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const toX = (i: number) => (i / (data.length - 1)) * chartW
  const toY = (v: number) => PAD_T + (1 - (v - min) / range) * (H - PAD_T - PAD_B)

  const pts = data.map((v, i) => ({ x: toX(i), y: toY(v) }))

  // Smooth cubic bezier path — control points are horizontal midpoints
  let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], c = pts[i]
    const mx = ((p.x + c.x) / 2).toFixed(1)
    d += ` C ${mx},${p.y.toFixed(1)} ${mx},${c.y.toFixed(1)} ${c.x.toFixed(1)},${c.y.toFixed(1)}`
  }

  const last = pts[pts.length - 1], first = pts[0]
  const fillD = `${d} L ${last.x.toFixed(1)},${H} L ${first.x.toFixed(1)},${H} Z`

  const color = up ? '#34c97a' : '#e05c5c'
  const gradId = `wsg-${uid}`

  const midVal = (max + min) / 2
  const yTop = toY(max), yMid = toY(midVal), yBot = toY(min)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {/* Subtle grid lines */}
      <line x1="0" y1={yTop} x2={chartW - 2} y2={yTop} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3,5" />
      <line x1="0" y1={yMid} x2={chartW - 2} y2={yMid} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3,5" />
      <line x1="0" y1={yBot} x2={chartW - 2} y2={yBot} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3,5" />
      {/* Fill + line */}
      <path d={fillD} fill={`url(#${gradId})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      {/* Y-axis labels */}
      <text x={chartW + 3} y={yTop + 1} fontSize="7.5" fill="rgba(255,255,255,0.3)" fontFamily="monospace" dominantBaseline="middle">{fmtK(max)}</text>
      <text x={chartW + 3} y={yMid} fontSize="7.5" fill="rgba(255,255,255,0.3)" fontFamily="monospace" dominantBaseline="middle">{fmtK(midVal)}</text>
      <text x={chartW + 3} y={yBot - 1} fontSize="7.5" fill="rgba(255,255,255,0.3)" fontFamily="monospace" dominantBaseline="middle">{fmtK(min)}</text>
    </svg>
  )
}

// Shown in place of the sparkline until real eBay price history is available.
// Never fabricates a chart from thin air.
function PricePendingSparkline() {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1px dashed var(--border-md)', borderRadius: '8px', boxSizing: 'border-box',
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text3)' }}>
        Awaiting price data
      </span>
    </div>
  )
}

export default function WatchlistPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const { redirectToSignIn } = useClerk()
  const { toggle: toggleWatch } = useWatchlist()

  const [items, setItems] = useState<WatchlistItem[]>([])
  const [loadError, setLoadError] = useState(false)

  const [playerFilter, setPlayerFilter] = useState('')
  const [cardFilter,   setCardFilter]   = useState('')
  const [setFilter,    setSetFilter]    = useState('')
  const [yearFilter,   setYearFilter]   = useState('')
  const [gradeFilter,  setGradeFilter]  = useState('')
  const [sort, setSort]                 = useState<WLSortKey>('')
  const [photoModal,   setPhotoModal]   = useState(false)
  const [dragOver,     setDragOver]     = useState(false)
  const [ranges, setRanges] = useState<Record<string, string>>({})
  const photoRef = useRef<HTMLInputElement>(null)

  const reload = useCallback(() => {
    fetch('/api/watchlist')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('load failed'))))
      .then((d) => { setItems(d.items ?? []); setLoadError(false) })
      .catch(() => setLoadError(true))
  }, [])

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    reload()
  }, [isLoaded, isSignedIn, reload])

  useEffect(() => {
    if (!photoModal) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPhotoModal(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [photoModal])

  const displayed = useMemo(() => {
    let list: WatchRow[] = items.map((it) => ({
      id: it.id,
      legacyCatalogId: it.legacy_catalog_id,
      player: it.player,
      cardName: it.card_name,
      setName: it.set_name ?? '',
      year: it.year ?? 0,
      grade: formatGradeLabel(it.grading_service, it.grade),
      sport: it.sport,
      alertEnabled: it.alert_enabled,
      // No fabricated market data until eBay data links in:
      currentValue: null,
      percentChange: null,
      priceHistory: [],
    }))
    if (playerFilter.trim()) {
      const q = playerFilter.toLowerCase()
      list = list.filter(c => c.player.toLowerCase().includes(q))
    }
    if (cardFilter.trim()) {
      const q = cardFilter.toLowerCase()
      list = list.filter(c => c.cardName.toLowerCase().includes(q))
    }
    if (setFilter.trim()) {
      const q = setFilter.toLowerCase()
      list = list.filter(c => c.setName.toLowerCase().includes(q))
    }
    if (yearFilter.trim()) {
      list = list.filter(c => String(c.year).includes(yearFilter.trim()))
    }
    if (gradeFilter) list = list.filter(c => c.grade === gradeFilter)
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'player-asc':   return a.player.localeCompare(b.player)
        case 'player-desc':  return b.player.localeCompare(a.player)
        case 'setName-asc':  return a.setName.localeCompare(b.setName)
        case 'setName-desc': return b.setName.localeCompare(a.setName)
        case 'year-asc':     return a.year - b.year
        case 'year-desc':    return b.year - a.year
        case 'grade-asc':    return a.grade.localeCompare(b.grade)
        case 'grade-desc':   return b.grade.localeCompare(a.grade)
        default:             return 0
      }
    })
    return list
  }, [items, playerFilter, cardFilter, setFilter, yearFilter, gradeFilter, sort])

  const totalCount = displayed.length

  async function toggleAlert(id: string, next: boolean) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, alert_enabled: next } : it)))
    const res = await fetch(`/api/watchlist/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alert_enabled: next }),
    })
    if (!res.ok) {
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, alert_enabled: !next } : it)))
    }
  }

  function WatchCard({
    id, legacyCatalogId, player, setName, year, grade,
    currentValue, priceHistory, alertEnabled,
  }: {
    id: string; legacyCatalogId: number | null; player: string; setName: string
    year: number; grade: string; currentValue: number | null; percentChange: number | null
    sport: string; priceHistory: number[]; alertEnabled: boolean
  }) {
    const hasHistory   = priceHistory.length > 0
    const openVal      = hasHistory ? priceHistory[0] : null
    const highVal      = hasHistory ? Math.max(...priceHistory) : null
    const lowVal       = hasHistory ? Math.min(...priceHistory) : null
    const dollarChange = currentValue != null && openVal != null ? currentValue - openVal : null
    const pctChange    = dollarChange != null && openVal ? (dollarChange / openVal) * 100 : null
    const isUp         = dollarChange != null ? dollarChange >= 0 : null
    const rangeActive  = ranges[id] ?? '30D'
    const changeColor  = isUp ? 'var(--green)' : 'var(--red)'
    const changeBg     = isUp ? 'var(--green-bg)' : 'var(--red-bg)'
    const changeBorder = isUp ? 'rgba(52,201,122,0.2)' : 'rgba(224,92,92,0.2)'
    const sign         = isUp ? '+' : ''
    const accentGradient = isUp == null
      ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)'
      : isUp
        ? 'linear-gradient(90deg, transparent, rgba(52,201,122,0.55), transparent)'
        : 'linear-gradient(90deg, transparent, rgba(224,92,92,0.5), transparent)'

    return (
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)',
        padding: '1.15rem 1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '10px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: accentGradient,
        }} />

        {/* Header: player name · set/year/grade · bell + ✕ */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.02rem',
              color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{player}</div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.67rem', color: 'var(--text3)',
              marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{setName} · {year} · {grade}</div>
          </div>
          <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
            <button
              onClick={() => toggleAlert(id, !alertEnabled)}
              style={{
                width: '28px', height: '28px', borderRadius: '6px',
                border: '1px solid var(--border-md)',
                background: alertEnabled ? 'var(--gold-bg)' : 'none',
                color: alertEnabled ? 'var(--gold2)' : 'var(--text3)',
                fontSize: '0.75rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >🔔</button>
            <button
              onClick={() => { if (legacyCatalogId != null) toggleWatch(legacyCatalogId) }}
              disabled={legacyCatalogId == null}
              title={legacyCatalogId == null ? 'This item cannot be unwatched yet' : 'Remove from watchlist'}
              style={{
                width: '28px', height: '28px', borderRadius: '6px',
                border: '1px solid rgba(224,92,92,0.25)',
                background: 'var(--red-bg)', color: 'var(--red)',
                fontSize: '0.85rem', fontWeight: 700,
                cursor: legacyCatalogId == null ? 'not-allowed' : 'pointer',
                opacity: legacyCatalogId == null ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </div>
        </div>

        {/* Price + dollar/pct badge */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
          {currentValue == null ? (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '1.02rem', fontWeight: 500,
              color: 'var(--text3)', letterSpacing: '-0.01em',
            }}>
              Price pending
            </span>
          ) : (
            <>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '1.55rem', fontWeight: 500,
                color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1,
              }}>
                ${currentValue.toLocaleString()}
              </span>
              {dollarChange != null && pctChange != null && (
                <span style={{
                  padding: '3px 9px', borderRadius: '5px',
                  background: changeBg, border: `1px solid ${changeBorder}`,
                  fontFamily: 'var(--font-mono)', fontSize: '0.67rem', fontWeight: 600,
                  color: changeColor, whiteSpace: 'nowrap',
                }}>
                  {isUp ? '▲' : '▼'} {sign}${Math.abs(dollarChange).toLocaleString()} ({sign}{pctChange.toFixed(2)}%)
                </span>
              )}
            </>
          )}
        </div>

        {/* OPEN / HIGH / LOW / RANGE stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
          {([
            ['OPEN',  openVal != null ? `$${openVal.toLocaleString()}` : '—'],
            ['HIGH',  highVal != null ? `$${highVal.toLocaleString()}` : '—'],
            ['LOW',   lowVal  != null ? `$${lowVal.toLocaleString()}`  : '—'],
            ['RANGE', rangeActive],
          ] as [string, string][]).map(([label, val]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.57rem', color: 'var(--text3)',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px',
              }}>{label}</div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 500,
                color: label === 'RANGE' ? 'var(--gold2)' : 'var(--text2)',
              }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Range pills */}
        <div style={{ display: 'flex', gap: '3px' }}>
          {RANGE_OPTS.map(r => {
            const active = rangeActive === r
            return (
              <button
                key={r}
                onClick={() => setRanges(prev => ({ ...prev, [id]: r }))}
                style={{
                  flex: 1, padding: '4px 0', borderRadius: '5px',
                  fontSize: '0.59rem', fontFamily: 'var(--font-mono)', fontWeight: 600,
                  cursor: 'pointer',
                  border: active ? '1px solid var(--gold-border)' : '1px solid transparent',
                  background: active ? 'var(--gold-bg)' : 'var(--bg3)',
                  color: active ? 'var(--gold2)' : 'var(--text3)',
                  transition: 'all 0.12s',
                }}
              >{r}</button>
            )
          })}
        </div>

        {/* Sparkline (placeholder until real price history exists) */}
        <div style={{ height: '86px', margin: '0 -4px' }}>
          {hasHistory
            ? <WatchSparkline data={priceHistory} up={isUp ?? true} uid={id} />
            : <PricePendingSparkline />}
        </div>

        {/* Alert toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '7px', borderTop: '1px solid var(--border-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: alertEnabled ? 'var(--green)' : 'var(--text3)',
              boxShadow: alertEnabled ? '0 0 6px var(--green)' : 'none',
              transition: 'background 0.15s',
            }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text3)' }}>
              Price alert
            </span>
          </div>
          <button
            onClick={() => toggleAlert(id, !alertEnabled)}
            style={{
              width: '36px', height: '20px', borderRadius: '10px',
              border: `1px solid ${alertEnabled ? 'rgba(52,201,122,0.4)' : 'var(--border-md)'}`,
              background: alertEnabled ? 'rgba(52,201,122,0.15)' : 'var(--bg5)',
              cursor: 'pointer', position: 'relative', transition: 'all 0.15s', padding: 0,
            }}
          >
            <div style={{
              position: 'absolute', top: '3px', width: '12px', height: '12px', borderRadius: '50%',
              background: alertEnabled ? 'var(--green)' : 'var(--text3)',
              left: alertEnabled ? '20px' : '3px',
              transition: 'left 0.15s, background 0.15s',
            }} />
          </button>
        </div>
      </div>
    )
  }

  if (isLoaded && !isSignedIn) {
    return (
      <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--text)' }}>
          Sign in to view your watchlist
        </p>
        <button
          onClick={() => redirectToSignIn()}
          style={{
            marginTop: '1rem', padding: '10px 24px',
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
            border: 'none', borderRadius: '8px', color: '#0d1117',
            fontFamily: 'var(--font-display)', fontWeight: 700, cursor: 'pointer',
          }}
        >
          Sign In
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Page header ── */}
      <div style={{ borderBottom: '1px solid var(--border-md)', background: 'var(--bg2)', padding: '1.5rem 2rem' }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem',
        }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>Watchlist</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginTop: '3px' }}>Cards you&apos;re tracking and targeting</p>
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
            color: 'var(--gold2)', padding: '4px 12px',
            background: 'var(--gold-bg)', border: '1px solid var(--gold-border)', borderRadius: '5px',
          }}>
            {totalCount} card{totalCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div style={{ borderBottom: '1px solid var(--border-sm)', background: 'var(--bg)', padding: '0.65rem 2rem' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

          {/* Player name + camera icon */}
          <div style={{ position: 'relative', flex: '2 1 220px', minWidth: 0 }}>
            <input
              type="text"
              value={playerFilter}
              onChange={e => setPlayerFilter(e.target.value)}
              placeholder="Player name..."
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--bg2)', border: '1px solid var(--border-md)',
                borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-display)',
                fontSize: '0.83rem', padding: '8px 38px 8px 12px', outline: 'none',
              }}
            />
            <button
              onClick={() => setPhotoModal(true)}
              style={{
                position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', padding: '2px', cursor: 'pointer',
                color: 'var(--gold2)', display: 'flex', alignItems: 'center',
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </button>
          </div>

          {/* Card name */}
          <input
            type="text"
            value={cardFilter}
            onChange={e => setCardFilter(e.target.value)}
            placeholder="Card name..."
            style={{
              flex: '2 1 220px', minWidth: 0,
              background: 'var(--bg2)', border: '1px solid var(--border-md)',
              borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-display)',
              fontSize: '0.83rem', padding: '8px 12px', outline: 'none',
            }}
          />

          {/* Set name */}
          <input
            type="text"
            value={setFilter}
            onChange={e => setSetFilter(e.target.value)}
            placeholder="Set name..."
            style={{
              flex: '1 1 130px', minWidth: 0,
              background: 'var(--bg2)', border: '1px solid var(--border-md)',
              borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-display)',
              fontSize: '0.83rem', padding: '8px 12px', outline: 'none',
            }}
          />

          {/* Year */}
          <input
            type="text"
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            placeholder="Year..."
            style={{
              flex: '0 1 90px', minWidth: 0,
              background: 'var(--bg2)', border: '1px solid var(--border-md)',
              borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-display)',
              fontSize: '0.83rem', padding: '8px 12px', outline: 'none',
            }}
          />

          {/* All Grades */}
          <select
            value={gradeFilter}
            onChange={e => setGradeFilter(e.target.value)}
            style={{
              flex: '0 0 auto',
              background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: '8px',
              color: gradeFilter ? 'var(--gold2)' : 'var(--text2)',
              fontFamily: 'var(--font-display)', fontSize: '0.82rem',
              padding: '8px 12px', outline: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            <option value="">All Grades</option>
            <option>PSA 10</option>
            <option>PSA 9</option>
            <option>PSA 8</option>
            <option>PSA 7</option>
            <option>Raw</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value as WLSortKey)}
            style={{
              flex: '0 0 auto',
              background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: '8px',
              color: 'var(--text2)', fontFamily: 'var(--font-display)', fontSize: '0.82rem',
              padding: '8px 12px', outline: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            <option value="">Sort: Default</option>
            <option value="player-asc">Player A→Z</option>
            <option value="player-desc">Player Z→A</option>
            <option value="setName-asc">Set A→Z</option>
            <option value="setName-desc">Set Z→A</option>
            <option value="year-asc">Year: Oldest</option>
            <option value="year-desc">Year: Newest</option>
            <option value="grade-asc">Grade: Best First</option>
            <option value="grade-desc">Grade: Lowest First</option>
          </select>

        </div>
      </div>

      {/* ── Card grid ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {loadError ? (
          <div style={{ textAlign: 'center', padding: '6rem 0' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--text)', marginBottom: '8px' }}>
              Couldn&apos;t load your watchlist
            </div>
            <button
              onClick={reload}
              style={{
                marginTop: '0.5rem', padding: '9px 22px',
                background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
                border: 'none', borderRadius: '8px', color: '#0d1117',
                fontFamily: 'var(--font-display)', fontSize: '0.83rem', fontWeight: 700,
                cursor: 'pointer',
              }}
            >Retry</button>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>☆</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--text)', marginBottom: '8px' }}>
              Nothing on your watchlist yet — add cards from Browse
            </div>
            <Link href="/browse" style={{
              padding: '9px 22px',
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
              border: 'none', borderRadius: '8px', color: '#0d1117',
              fontFamily: 'var(--font-display)', fontSize: '0.83rem', fontWeight: 700,
              textDecoration: 'none',
            }}>Browse Cards</Link>
          </div>
        ) : totalCount === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 0', fontFamily: 'var(--font-mono)', color: 'var(--text3)', fontSize: '0.85rem' }}>
            No cards match your filters.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {displayed.map(card => (
              <WatchCard
                key={card.id}
                id={card.id}
                legacyCatalogId={card.legacyCatalogId}
                player={card.player}
                setName={card.setName}
                year={card.year}
                grade={card.grade}
                currentValue={card.currentValue}
                percentChange={card.percentChange}
                sport={card.sport}
                priceHistory={card.priceHistory}
                alertEnabled={card.alertEnabled}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Photo Search Modal ── */}
      {photoModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setPhotoModal(false)}
        >
          <div
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border-md)',
              borderRadius: '16px',
              padding: '1.75rem',
              width: '100%', maxWidth: '460px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700,
                color: 'var(--text)', margin: 0,
              }}>Photo Card Search</h2>
              <button
                onClick={() => setPhotoModal(false)}
                style={{
                  width: '30px', height: '30px', borderRadius: '7px',
                  border: '1px solid var(--border-md)', background: 'var(--bg3)',
                  color: 'var(--text2)', fontSize: '1rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >✕</button>
            </div>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.71rem', color: 'var(--text3)',
              marginBottom: '1.5rem', lineHeight: 1.55, marginTop: '4px',
            }}>
              Upload or snap a photo — AI identifies the card instantly
            </p>

            <div
              onClick={() => photoRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false) }}
              style={{
                border: `1.5px dashed ${dragOver ? 'var(--gold2)' : 'rgba(184,146,46,0.32)'}`,
                borderRadius: '10px',
                background: dragOver ? 'rgba(184,146,46,0.06)' : 'rgba(255,255,255,0.02)',
                padding: '2.5rem 1.5rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                cursor: 'pointer', textAlign: 'center',
                transition: 'border-color 0.15s, background 0.15s',
                marginBottom: '1.25rem',
              }}
            >
              <WLDropCameraIcon />
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
                Drop a card photo here
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.69rem', color: 'var(--text3)' }}>
                JPG, PNG, WEBP — or click to browse
              </div>
              <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-md)' }} />
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text3)',
                letterSpacing: '0.14em', textTransform: 'uppercase', whiteSpace: 'nowrap',
              }}>OR USE CAMERA</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-md)' }} />
            </div>

            <button style={{
              width: '100%', padding: '12px',
              background: 'none',
              border: '1px solid var(--border-md)',
              borderRadius: '8px',
              color: 'var(--text2)',
              fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
              transition: '0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-border)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--text)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-md)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--text2)'
            }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
              Use Camera
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function WLDropCameraIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="14" width="24" height="3" rx="1.5" fill="rgba(184,146,46,0.6)"/>
      <rect x="19" y="7" width="14" height="8" rx="2" fill="rgba(184,146,46,0.5)"/>
      <rect x="8" y="22" width="36" height="24" rx="4" fill="none" stroke="rgba(184,146,46,0.7)" strokeWidth="2"/>
      <circle cx="26" cy="34" r="8" fill="none" stroke="rgba(184,146,46,0.7)" strokeWidth="2"/>
      <circle cx="26" cy="34" r="4" fill="rgba(184,146,46,0.25)"/>
      <rect x="20" y="19" width="6" height="4" rx="1.5" fill="rgba(184,146,46,0.5)"/>
      <circle cx="38" cy="27" r="2" fill="rgba(184,146,46,0.5)"/>
    </svg>
  )
}
