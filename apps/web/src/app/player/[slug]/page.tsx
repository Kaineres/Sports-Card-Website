'use client'

import { useState, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { BROWSE_CATALOG, SPORT_META, type CatalogCard } from '@/lib/catalog'

type TimeRange = '7D' | '30D' | '90D' | '6M' | '1Y' | '5Y+'
const TIME_RANGES: TimeRange[] = ['7D', '30D', '90D', '6M', '1Y', '5Y+']

/* ── seeded RNG ── */
function seedRng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

/* ── price history ── */
function generatePriceHistory(base: number, pct: number, points: number, id: number) {
  const rng = seedRng(id * 9973)
  const start = base / (1 + pct / 100)
  const hist: number[] = []
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1)
    hist.push(Math.max(start + (base - start) * t + (rng() - 0.5) * base * 0.07, base * 0.25))
  }
  hist[hist.length - 1] = base
  return hist
}

/* ── chart ── */
function InteractiveChart({ card, range }: { card: CatalogCard; range: TimeRange }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hov, setHov] = useState<{ x: number; y: number; val: number } | null>(null)

  const pts = range === '7D' ? 7 : range === '30D' ? 30 : range === '90D' ? 90
            : range === '6M' ? 180 : range === '1Y' ? 365 : 600
  const data = useMemo(
    () => generatePriceHistory(card.currentValue, card.percentChange, Math.min(pts, 120), card.id),
    [card, pts],
  )

  const W = 900, H = 380
  const PAD = { top: 24, right: 6, bottom: 24, left: 12 }
  const CW = W - PAD.left - PAD.right
  const CH = H - PAD.top - PAD.bottom
  const minV = Math.min(...data) * 0.96
  const maxV = Math.max(...data) * 1.04

  const tx = (i: number) => PAD.left + (i / (data.length - 1)) * CW
  const ty = (v: number) => PAD.top + (1 - (v - minV) / (maxV - minV)) * CH

  const line = data.map((v, i) => {
    if (i === 0) return `M ${tx(i)} ${ty(v)}`
    const x0 = tx(i - 1), y0 = ty(data[i - 1]), x1 = tx(i), y1 = ty(v), cx = (x0 + x1) / 2
    return `C ${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`
  }).join(' ')

  const area = line + ` L ${tx(data.length - 1)} ${PAD.top + CH} L ${tx(0)} ${PAD.top + CH} Z`

  const yLabels = [0, 0.33, 0.66, 1].map(t => ({
    v: minV + t * (maxV - minV),
    y: PAD.top + (1 - t) * CH,
  }))

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const px = ((e.clientX - rect.left) / rect.width) * W
    const t  = Math.max(0, Math.min(1, (px - PAD.left) / CW))
    const idx = Math.round(t * (data.length - 1))
    setHov({ x: tx(idx), y: ty(data[idx]), val: data[idx] })
  }

  const isUp    = card.percentChange >= 0
  const lineClr = isUp ? '#34c97a' : '#e05c5c'
  const gid     = `cg${card.id}`

  return (
    <div style={{ width: '100%', height: '360px' }}>
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
      onMouseMove={onMove}
      onMouseLeave={() => setHov(null)}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={lineClr} stopOpacity="0.3" />
          <stop offset="100%" stopColor={lineClr} stopOpacity="0"   />
        </linearGradient>
      </defs>

      {/* grid lines + right-side y-axis labels (overlaid inside chart) */}
      {yLabels.map(({ v, y }) => {
        const label = v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`
        const labelW = label.length * 6.5 + 8
        return (
          <g key={y}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <rect
              x={W - PAD.right - labelW - 2} y={y - 9}
              width={labelW} height={14} rx="2"
              fill="rgba(10,12,15,0.72)"
            />
            <text
              x={W - PAD.right - 6} y={y + 4}
              textAnchor="end"
              fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace"
            >
              {label}
            </text>
          </g>
        )
      })}

      <path d={area} fill={`url(#${gid})`} />
      <path d={line}  fill="none" stroke={lineClr} strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" />

      {hov && (
        <>
          <line x1={hov.x} y1={PAD.top} x2={hov.x} y2={PAD.top + CH}
            stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="3,3" />
          <circle cx={hov.x} cy={hov.y} r="5"  fill={lineClr} />
          <circle cx={hov.x} cy={hov.y} r="10" fill={lineClr} fillOpacity="0.18" />
          <rect
            x={Math.min(hov.x + 10, W - PAD.right - 82)} y={hov.y - 24}
            width="76" height="20" rx="4"
            fill="#0d1117" stroke="rgba(255,255,255,0.15)" strokeWidth="1"
          />
          <text
            x={Math.min(hov.x + 48, W - PAD.right - 44)} y={hov.y - 10}
            textAnchor="middle" fill="#e6c96a" fontSize="11"
            fontFamily="monospace" fontWeight="700"
          >
            {hov.val >= 1000 ? `$${(hov.val / 1000).toFixed(2)}k` : `$${hov.val.toFixed(0)}`}
          </text>
        </>
      )}
    </svg>
    </div>
  )
}

/* ── listings ── */
interface Listing { platform: string; grade: string; notes: string; price: number }
const CONDITION_NOTES = [
  'Well-centered, sharp corners',
  'Minor surface wear',
  'Gloss intact, slight edge wear',
  'Fresh pull, never touched',
  'Minor print line, minor corner wear',
  'Well-centered, sharp corners',
  'Centering 55/45, clean surface',
  'Light handling marks on reverse',
]

function syntheticListings(card: CatalogCard): Listing[] {
  const rng  = seedRng(card.id * 7919)
  const base = card.currentValue
  const platforms = ['eBay', 'PWCC', 'MySlabs', 'Goldin', 'Fanatics', 'eBay']
  return platforms
    .map((p, i) => ({
      platform: p,
      grade:    card.grade,
      notes:    CONDITION_NOTES[i % CONDITION_NOTES.length],
      price:    Math.round((base * (0.90 + rng() * 0.35)) / 5) * 5,
    }))
    .sort((a, b) => a.price - b.price)
}

/* ── auctions ── */
interface Auction { platform: string; bid: number; bids: number; ends: string }

function syntheticAuctions(card: CatalogCard): Auction[] {
  const rng  = seedRng(card.id * 3571)
  const base = card.currentValue
  return (['MySlabs', 'Goldin', 'Fanatics', 'eBay'] as const).map((p, i) => ({
    platform: p,
    bid:  Math.round((base * (0.62 + rng() * 0.38)) / 4) * 4,
    bids: Math.round(rng() * 26 + 3),
    ends: (['1d 6h', '3d 12h', '6d 6h', '8d 12h'] as const)[i],
  })).sort((a, b) => a.bid - b.bid)
}

/* ── virtual card ── */
interface VirtualCard {
  vid: string; player: string; cardName: string; setName: string
  year: number; grade: string; currentValue: number; percentChange: number
  sport: CatalogCard['sport']
}

function generateVariants(card: CatalogCard): VirtualCard[] {
  const rng = seedRng(card.id * 2731)
  const r   = () => rng()
  const g10 = card.grade === 'PSA 10'
  const g9  = card.grade === 'PSA 9'
  return [
    { vid: `s${card.id}-1`, player: card.player, sport: card.sport, cardName: card.cardName, setName: card.setName, year: card.year,
      grade: g10 ? 'PSA 9' : g9 ? 'PSA 8' : 'PSA 7',
      currentValue:  Math.max(5,  Math.round(card.currentValue * (0.50 + r() * 0.18) / 5)  * 5),
      percentChange: parseFloat((card.percentChange * (0.55 + r() * 0.60)).toFixed(1)) },
    { vid: `s${card.id}-2`, player: card.player, sport: card.sport, cardName: card.cardName, setName: card.setName, year: card.year,
      grade: g10 ? 'PSA 8' : 'PSA 7',
      currentValue:  Math.max(5,  Math.round(card.currentValue * (0.22 + r() * 0.14) / 5)  * 5),
      percentChange: parseFloat((card.percentChange * (0.35 + r() * 0.50)).toFixed(1)) },
    { vid: `s${card.id}-3`, player: card.player, sport: card.sport, cardName: `${card.cardName} Gold /10`, setName: card.setName, year: card.year,
      grade: card.grade,
      currentValue:  Math.max(50, Math.round(card.currentValue * (3.0 + r() * 5.5) / 50) * 50),
      percentChange: parseFloat((card.percentChange * (1.05 + r() * 0.85)).toFixed(1)) },
    { vid: `s${card.id}-4`, player: card.player, sport: card.sport, cardName: `${card.cardName} Refractor`, setName: card.setName, year: card.year,
      grade: card.grade,
      currentValue:  Math.max(10, Math.round(card.currentValue * (1.35 + r() * 1.15) / 10) * 10),
      percentChange: parseFloat((card.percentChange * (0.85 + r() * 0.75)).toFixed(1)) },
  ]
}

/* ── helpers ── */
function fmtVal(v: number) {
  return v >= 1000
    ? `$${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : `$${v.toFixed(2)}`
}

function gradeStyle(grade: string) {
  if (grade === 'PSA 10') return { bg: 'rgba(52,201,122,0.14)',  border: 'rgba(52,201,122,0.35)',  text: '#34c97a' }
  if (grade === 'PSA 9')  return { bg: 'rgba(212,168,67,0.14)',  border: 'rgba(212,168,67,0.35)',  text: '#d4a843' }
  return                         { bg: 'rgba(196,92,16,0.14)',   border: 'rgba(196,92,16,0.35)',   text: '#c45c10' }
}

/* ══════════════════════════════════════════════ PAGE ══════════════════════════════════════════════ */
export default function PlayerPage() {
  const params = useParams()
  const slug   = typeof params.slug === 'string' ? decodeURIComponent(params.slug) : ''

  const cards = useMemo(() => BROWSE_CATALOG.filter(c => c.player === slug), [slug])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [range,    setRange]    = useState<TimeRange>('90D')

  const card = useMemo<CatalogCard | undefined>(
    () => (activeId !== null ? cards.find(c => c.id === activeId) : undefined) ?? cards[0],
    [cards, activeId],
  )

  const listings    = useMemo(() => card ? syntheticListings(card)  : [], [card])
  const auctions    = useMemo(() => card ? syntheticAuctions(card)  : [], [card])
  const allVariants = useMemo<VirtualCard[]>(() => {
    if (!card) return []
    const real: VirtualCard[] = BROWSE_CATALOG
      .filter(c => c.player === slug && c.id !== card.id)
      .map(c => ({ vid: `r${c.id}`, player: c.player, cardName: c.cardName, setName: c.setName, year: c.year, grade: c.grade, currentValue: c.currentValue, percentChange: c.percentChange, sport: c.sport }))
    return [...real, ...generateVariants(card).slice(0, Math.max(0, 4 - real.length))]
  }, [slug, card])

  if (!card) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text3)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🃏</div>
          <div>Player not found.</div>
          <Link href="/" style={{ color: 'var(--gold2)', textDecoration: 'none', fontSize: '0.82rem', marginTop: '1rem', display: 'block' }}>← Home</Link>
        </div>
      </div>
    )
  }

  const meta   = SPORT_META[card.sport]
  const isUp   = card.percentChange >= 0
  const totalMV = cards.reduce((s, c) => s + c.currentValue, 0)
  const topCard = cards.reduce((b, c) => c.currentValue > b.currentValue ? c : b, cards[0])
  const gs      = gradeStyle(card.grade)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(180deg, var(--bg3) 0%, var(--bg2) 60%, var(--bg) 100%)',
        borderBottom: '1px solid var(--border-md)',
        padding: '1.75rem 2rem',
      }}>
        <div style={{ maxWidth: '1500px', margin: '0 auto' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text3)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', marginBottom: '1.25rem' }}>
            ← Home
          </Link>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', flexWrap: 'wrap' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0, background: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: `0 0 22px ${meta.color}55` }}>
              {meta.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: meta.color, marginBottom: '5px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {card.sport} · {card.year} Rookie Class
              </div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', color: 'var(--text)', lineHeight: 1.1, marginBottom: '1.25rem' }}>
                {slug}
              </h1>
              {/* Stats bar */}
              <div style={{ display: 'flex', background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: '10px', overflow: 'hidden', flexWrap: 'wrap' }}>
                {[
                  { label: 'Cards Tracked',     value: cards.length.toString() },
                  { label: 'Total Market Value', value: `$${totalMV.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
                  { label: 'Top Card Value',     value: `$${topCard.currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
                  { label: '12-MO Trend',        value: `${isUp ? '+' : ''}${card.percentChange.toFixed(1)}%`, accent: isUp ? 'var(--green)' : 'var(--red)' },
                ].map((s, i, arr) => (
                  <div key={s.label} style={{ flex: '1 1 120px', padding: '12px 20px', borderRight: i < arr.length - 1 ? '1px solid var(--border-sm)' : 'none' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: s.accent ?? 'var(--text)' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* ══ Card detail panel ══ */}
      <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '1.25rem 1.5rem 0' }}>
        <div style={{
          background: '#0a0c0f',
          border: '1px solid var(--border-md)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {/* gold top accent */}
          <div style={{ height: '2px', background: 'linear-gradient(90deg, var(--gold) 0%, var(--gold2) 55%, transparent 100%)' }} />

          {/* chart + stats row */}
          <div style={{ display: 'flex', minHeight: '360px' }}>

            {/* ── Left: chart area ── */}
            <div style={{ flex: 1, padding: '1.75rem 1.5rem 1.5rem 2.5rem', minWidth: 0 }}>
              {/* card name */}
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--gold2)', marginBottom: '4px', lineHeight: 1.2 }}>
                {card.cardName}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text3)', marginBottom: '10px' }}>
                {card.year} · {card.setName}
              </div>
              {/* badges */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ padding: '3px 10px', borderRadius: '5px', background: gs.bg, border: `1px solid ${gs.border}`, fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: gs.text }}>
                  {card.grade}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text3)', fontWeight: 500 }}>
                  {card.sport}
                </span>
              </div>

              {/* VALUE OVER TIME + range buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Value Over Time
                </span>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {TIME_RANGES.map(r => (
                    <button key={r} onClick={() => setRange(r)} style={{
                      padding: '3px 8px', borderRadius: '4px',
                      border: range === r ? '1px solid var(--gold-border)' : '1px solid transparent',
                      background: range === r ? 'var(--gold-bg)' : 'none',
                      color: range === r ? 'var(--gold2)' : 'var(--text3)',
                      fontFamily: 'var(--font-mono)', fontSize: '0.63rem', cursor: 'pointer',
                    }}>{r}</button>
                  ))}
                </div>
              </div>

              <InteractiveChart card={card} range={range} />
            </div>

            {/* ── Right: stats column ── */}
            <div style={{
              width: '210px', flexShrink: 0,
              borderLeft: '1px solid rgba(255,255,255,0.06)',
              padding: '2rem 2rem 2rem 1.75rem',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              {[
                { label: 'Current Value',   value: fmtVal(card.currentValue),                                         color: 'var(--gold2)' },
                { label: '12-MO Change',    value: `${isUp ? '+' : ''}${card.percentChange.toFixed(1)}%`,             color: isUp ? 'var(--green)' : 'var(--red)' },
                { label: 'Avg Sale (90D)',  value: fmtVal(Math.round(card.currentValue * 1.115 / 2) * 2),             color: 'var(--gold2)' },
                { label: 'Last Sale',       value: fmtVal(Math.round(card.currentValue * 0.988 / 2) * 2),             color: 'var(--gold2)' },
                { label: 'Active Listings', value: `${listings.length}`,                                              color: 'var(--text)' },
                { label: 'Live Auctions',   value: `${auctions.length}`,                                              color: 'var(--text)' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: s.color, lineHeight: 1.1 }}>
                    {s.value}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Tables section ── */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

              {/* Active Listings */}
              <div style={{ padding: '0', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 10px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Active Listings
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text3)' }}>
                    {listings.length} results
                  </span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Platform', 'Grade', 'Notes', 'Price'].map(h => (
                        <th key={h} style={{ padding: '6px 20px', fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)', textAlign: h === 'Price' ? 'right' : 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((l, i) => (
                      <tr key={i} style={{ borderBottom: i < listings.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                        <td style={{ padding: '9px 20px', fontFamily: 'var(--font-display)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{l.platform}</td>
                        <td style={{ padding: '9px 20px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{l.grade}</td>
                        <td style={{ padding: '9px 20px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text3)', fontStyle: 'italic' }}>{l.notes}</td>
                        <td style={{ padding: '9px 20px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold2)', textAlign: 'right' }}>${l.price.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Live Auctions */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 10px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Live Auctions
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--red)' }}>
                    {auctions.length} live
                  </span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Platform', 'Bid', 'Bids', 'Ends'].map(h => (
                        <th key={h} style={{ padding: '6px 20px', fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)', textAlign: h === 'Bid' ? 'right' : 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {auctions.map((a, i) => (
                      <tr key={i} style={{ borderBottom: i < auctions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                        <td style={{ padding: '9px 20px', fontFamily: 'var(--font-display)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{a.platform}</td>
                        <td style={{ padding: '9px 20px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold2)', textAlign: 'right' }}>${a.bid.toLocaleString()}</td>
                        <td style={{ padding: '9px 20px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text2)' }}>{a.bids}</td>
                        <td style={{ padding: '9px 20px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text3)' }}>{a.ends}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>{/* end panel wrapper */}

      {/* ── Watch + Add + Other cards ── */}
      <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '1.5rem 1.5rem 3rem' }}>

        {/* Watch + Add */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '2.5rem' }}>
          <button style={{
            padding: '13px', background: 'none',
            border: '1px solid var(--gold-border)', borderRadius: 'var(--radius-lg)',
            color: 'var(--gold2)', fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
          }}>
            ★ Watching
          </button>
          <button style={{
            padding: '13px',
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
            border: 'none', borderRadius: 'var(--radius-lg)',
            color: '#0d1117', fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
          }}>
            + Add to Collection
          </button>
        </div>

        {/* ── Other cards ── */}
        {allVariants.length > 0 && (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
              Other {slug} Cards ({allVariants.length})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
              {allVariants.map(vc => {
                const vcUp  = vc.percentChange >= 0
                const vcMeta = SPORT_META[vc.sport]
                const vcGs   = gradeStyle(vc.grade)
                return (
                  <div key={vc.vid} style={{
                    background: 'var(--bg2)', border: '1px solid var(--border-md)',
                    borderRadius: 'var(--radius-lg)', padding: '1.1rem', cursor: 'default',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '5px', background: `${vcMeta.color}20`, border: `1px solid ${vcMeta.color}45`, fontFamily: 'var(--font-mono)', fontSize: '0.63rem', fontWeight: 700, color: vcMeta.color }}>
                        <span style={{ fontSize: '0.72rem' }}>{vcMeta.icon}</span> {vc.sport}
                      </span>
                      <span style={{ padding: '3px 8px', borderRadius: '5px', background: vcUp ? 'var(--green-bg)' : 'var(--red-bg)', border: `1px solid ${vcUp ? 'rgba(52,201,122,0.22)' : 'rgba(224,92,92,0.22)'}`, fontFamily: 'var(--font-mono)', fontSize: '0.67rem', fontWeight: 700, color: vcUp ? 'var(--green)' : 'var(--red)' }}>
                        {vcUp ? '+' : ''}{vc.percentChange.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', marginBottom: '8px', lineHeight: 1.3 }}>
                      {vc.cardName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', background: vcGs.bg, border: `1px solid ${vcGs.border}`, fontFamily: 'var(--font-mono)', fontSize: '0.63rem', fontWeight: 700, color: vcGs.text }}>{vc.grade}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--text3)' }}>{vc.year} · {vc.setName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>
                        ${vc.currentValue.toLocaleString()}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.73rem', fontWeight: 600, color: vcUp ? 'var(--green)' : 'var(--red)' }}>
                        {vcUp ? '▲' : '▼'} {Math.abs(vc.percentChange).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
