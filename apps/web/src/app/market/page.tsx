'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'

/* ─── Chart constants ─────────────────────────────────── */
const VW = 1000
const VH = 260
const PAD = { t: 16, r: 58, b: 38, l: 14 }
const V_MIN = 3900
const V_MAX = 4900

const INDEX_DATA = [
  { label: 'Jan', value: 3952 },
  { label: 'Feb', value: 4024 },
  { label: 'Mar', value: 4088 },
  { label: 'Apr', value: 4310 },
  { label: 'May', value: 4195 },
  { label: 'Jun', value: 4265 },
  { label: 'Jul', value: 4358 },
  { label: 'Aug', value: 4483 },
  { label: 'Sep', value: 4591 },
  { label: 'Oct', value: 4714 },
  { label: 'Now', value: 4821 },
]

const Y_TICKS = [3900, 4000, 4100, 4200, 4300, 4400, 4500, 4600, 4700, 4800, 4900]

function xi(i: number) {
  return PAD.l + (i / (INDEX_DATA.length - 1)) * (VW - PAD.l - PAD.r)
}
function yv(v: number) {
  return PAD.t + (1 - (v - V_MIN) / (V_MAX - V_MIN)) * (VH - PAD.t - PAD.b)
}

const PTS: [number, number][] = INDEX_DATA.map((d, i) => [xi(i), yv(d.value)])

function smoothLine(pts: [number, number][]): string {
  if (pts.length < 2) return ''
  const parts = [`M ${pts[0][0]},${pts[0][1]}`]
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const dx = (x1 - x0) * 0.45
    parts.push(`C ${x0 + dx},${y0} ${x1 - dx},${y1} ${x1},${y1}`)
  }
  return parts.join(' ')
}

const LINE = smoothLine(PTS)
const FILL = `${LINE} L ${PTS[PTS.length - 1][0]},${VH - PAD.b} L ${PTS[0][0]},${VH - PAD.b} Z`

/* ─── Data ────────────────────────────────────────────── */
type Period = '7D' | '30D' | '90D' | '6M' | '1Y' | '5Y'

const METRICS = [
  { label: 'Market Index',   value: '4,821',  sub: '▲ 3.2% this week',    up: true  as true | false | null },
  { label: 'Total Volume',   value: '$38.4M', sub: '▲ 11% vs last week',  up: true  as true | false | null },
  { label: 'PSA 10 Premium', value: '3.8×',   sub: 'vs raw avg',          up: null  as true | false | null },
  { label: 'Top Sport',      value: 'NBA',    sub: '▲ 18% volume share',  up: true  as true | false | null },
  { label: 'Avg Sale Price', value: '$247',   sub: '▼ 2.1% vs last week', up: false as true | false | null },
  { label: 'New Listings',   value: '12,441', sub: '▲ 4.7%',              up: true  as true | false | null },
]

const TOP_MOVERS = [
  { player: 'Victor Wembanyama', card: '2023 Topps Chrome Auto',    grade: 'PSA 10', price: '$3,400', change: '+28.2%', up: true  },
  { player: 'Caitlin Clark',     card: '2024 Rittenhouse WNBA',     grade: 'PSA 10', price: '$1,200', change: '+41.2%', up: true  },
  { player: 'Patrick Mahomes',   card: '2017 Panini Prizm Rookie',  grade: 'PSA 10', price: '$2,950', change: '+12.2%', up: true  },
  { player: 'Paul Skenes',       card: '2024 Topps Chrome RC',      grade: 'PSA 10', price: '$445',   change: '+15.3%', up: true  },
  { player: 'Matvei Michkov',    card: 'Upper Deck Series 1 RC',    grade: 'PSA 10', price: '$380',   change: '+22.8%', up: true  },
  { player: 'Drake Maye',        card: '2024 Panini Mosaic RC',     grade: 'PSA 10', price: '$175',   change: '-3.2%',  up: false },
]

const VOLUME_DATA = [
  { sport: 'NBA',    pct: 38, dollars: '$14.6M', color: '#c9a84c' },
  { sport: 'NFL',    pct: 28, dollars: '$10.8M', color: '#c9a84c' },
  { sport: 'MLB',    pct: 19, dollars: '$7.3M',  color: '#34c97a' },
  { sport: 'Soccer', pct: 9,  dollars: '$3.5M',  color: '#a78bfa' },
  { sport: 'Other',  pct: 6,  dollars: '$2.3M',  color: '#4a4a4a' },
]

const INVESTOR_PICKS = [
  {
    player: 'Caitlin Clark', card: '2024 Rittenhouse WNBA RC Auto',
    change: '+41.2%', icon: '🏀', accent: '#34c97a',
    thesis: 'Historic rookie demand with crossover mainstream appeal. Certified autos in PSA 10 remain under-distributed relative to collector interest — strong floor with league growth as a tailwind.',
    stats: [{ label: 'Avg PSA 10', value: '$1,200' }, { label: 'Pop Report', value: '214' }, { label: 'Conviction', value: 'HIGH', color: '#34c97a' }],
  },
  {
    player: 'Victor Wembanyama', card: '2023 Topps Chrome Auto PSA 10',
    change: '+28.2%', icon: '🏀', accent: '#d4a843',
    thesis: 'Generational prospect comps to LeBron rookie trajectories at the same career stage. Certified autos still early in price discovery — institutional collector funds have begun staking positions.',
    stats: [{ label: 'Avg PSA 10', value: '$3,400' }, { label: 'Pop Report', value: '389' }, { label: 'Conviction', value: 'HIGH', color: '#34c97a' }],
  },
  {
    player: 'Shohei Ohtani', card: '2018 Topps Chrome RC Refractor',
    change: '+30.9%', icon: '⚾', accent: '#d4a843',
    thesis: 'Unique two-way player status commands a collector premium with no historical comparable. Dodgers signing amplified global demand — Japanese collector market adds a non-correlated buyer pool.',
    stats: [{ label: 'Avg PSA 9', value: '$890' }, { label: 'Pop Report', value: '1,042' }, { label: 'Conviction', value: 'MED', color: '#d4a843' }],
  },
]

const TRENDING_NOW = [
  { player: 'Caitlin Clark',     sport: 'WNBA', change: '+31.2%' },
  { player: 'Matvei Michkov',    sport: 'NHL',  change: '+22.8%' },
  { player: 'Jayden Daniels',    sport: 'NFL',  change: '+22.1%' },
  { player: 'Jackson Holliday',  sport: 'MLB',  change: '+9.8%'  },
  { player: 'Victor Wembanyama', sport: 'NBA',  change: '+8.7%'  },
]

/* ─── Interactive chart ────────────────────────────────── */
function IndexChart({ period }: { period: Period }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const onMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const vx = ((e.clientX - rect.left) / rect.width) * VW
    let best = 0
    let bestDist = Infinity
    PTS.forEach(([px], i) => {
      const d = Math.abs(px - vx)
      if (d < bestDist) { bestDist = d; best = i }
    })
    setHoverIdx(best)
  }, [])

  const hx = hoverIdx !== null ? PTS[hoverIdx][0] : null
  const hy = hoverIdx !== null ? PTS[hoverIdx][1] : null
  const hd = hoverIdx !== null ? INDEX_DATA[hoverIdx] : null

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        style={{ width: '100%', display: 'block', cursor: 'crosshair' }}
        onMouseMove={onMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#d4a843" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#d4a843" stopOpacity="0"    />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {Y_TICKS.map(v => (
          <line key={v}
            x1={PAD.l} y1={yv(v)} x2={VW - PAD.r} y2={yv(v)}
            stroke="rgba(255,255,255,0.05)" strokeWidth="1"
          />
        ))}

        {/* Y-axis labels — right side */}
        {Y_TICKS.filter((_, i) => i % 2 === 0).map(v => (
          <text key={v}
            x={VW - PAD.r + 8} y={yv(v) + 4}
            fill="rgba(138,112,96,0.75)"
            fontSize="12" fontFamily="monospace"
          >{v.toLocaleString()}</text>
        ))}

        {/* Gradient fill */}
        <path d={FILL} fill="url(#goldGrad)" />

        {/* Line */}
        <path d={LINE} fill="none" stroke="#d4a843" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* X-axis labels */}
        {INDEX_DATA.map((d, i) => (
          <text key={d.label}
            x={xi(i)} y={VH - 8}
            textAnchor="middle"
            fill="rgba(138,112,96,0.7)"
            fontSize="12" fontFamily="monospace"
          >{d.label}</text>
        ))}

        {/* Hover elements */}
        {hx !== null && hy !== null && (
          <>
            <line x1={hx} y1={PAD.t} x2={hx} y2={VH - PAD.b}
              stroke="rgba(212,168,67,0.35)" strokeWidth="1" strokeDasharray="4 3" />
            <circle cx={hx} cy={hy} r="4.5"
              fill="#d4a843" stroke="#101010" strokeWidth="2" />
          </>
        )}
      </svg>

      {/* Floating tooltip */}
      {hd && hx !== null && hy !== null && (
        <div style={{
          position: 'absolute',
          left: `${(hx / VW) * 100}%`,
          top:  `${(hy / VH) * 100}%`,
          transform: 'translate(-50%, calc(-100% - 12px))',
          background: 'var(--bg3)',
          border: '1px solid var(--border-lg)',
          borderRadius: '8px',
          padding: '8px 14px',
          pointerEvents: 'none',
          zIndex: 20,
          whiteSpace: 'nowrap',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text3)', marginBottom: '2px', letterSpacing: '0.06em' }}>{hd.label} · {period}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--gold2)' }}>{hd.value.toLocaleString()}</div>
        </div>
      )}
    </div>
  )
}

/* ─── Grade Premium bar chart ─────────────────────────── */
const GRADE_BARS = [
  { grade: 'PSA 7',  mult: 1.0, color: '#34d399' },
  { grade: 'PSA 8',  mult: 1.5, color: '#f87171' },
  { grade: 'PSA 9',  mult: 2.3, color: '#a78bfa' },
  { grade: 'PSA 10', mult: 3.8, color: '#d4a843' },
]
const GB_VW = 480, GB_VH = 240
const GB_PAD = { t: 16, r: 52, b: 34, l: 16 }
const GB_MAX = 4
const GB_YTICKS = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4]
const GB_INNER_W = GB_VW - GB_PAD.l - GB_PAD.r
const GB_INNER_H = GB_VH - GB_PAD.t - GB_PAD.b
const GB_BAR_W = 54
const GB_SECTION = GB_INNER_W / GRADE_BARS.length

function gbY(v: number) { return GB_PAD.t + (1 - v / GB_MAX) * GB_INNER_H }
function gbX(i: number) { return GB_PAD.l + i * GB_SECTION + (GB_SECTION - GB_BAR_W) / 2 }

function GradePremiumChart() {
  const [hov, setHov] = useState<number | null>(null)
  return (
    <svg viewBox={`0 0 ${GB_VW} ${GB_VH}`} style={{ width: '100%', display: 'block' }}>
      {/* Grid lines */}
      {GB_YTICKS.map(v => (
        <line key={v}
          x1={GB_PAD.l} y1={gbY(v)}
          x2={GB_VW - GB_PAD.r} y2={gbY(v)}
          stroke="rgba(255,255,255,0.05)" strokeWidth="1"
        />
      ))}
      {/* Y-axis labels */}
      {GB_YTICKS.map(v => (
        <text key={v}
          x={GB_VW - GB_PAD.r + 8} y={gbY(v) + 4}
          fill="rgba(138,112,96,0.7)" fontSize="11" fontFamily="monospace"
        >{v}x</text>
      ))}
      {/* Bars */}
      {GRADE_BARS.map((b, i) => {
        const x = gbX(i)
        const barH = (b.mult / GB_MAX) * GB_INNER_H
        const y = GB_PAD.t + GB_INNER_H - barH
        return (
          <g key={b.grade}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
            style={{ cursor: 'default' }}
          >
            <rect
              x={x} y={y} width={GB_BAR_W} height={barH}
              fill={b.color}
              opacity={hov === null || hov === i ? 0.82 : 0.4}
              rx="4"
            />
            {/* Multiplier label above bar */}
            {hov === i && (
              <text
                x={x + GB_BAR_W / 2} y={y - 6}
                textAnchor="middle"
                fill={b.color} fontSize="13" fontFamily="monospace" fontWeight="bold"
              >{b.mult}×</text>
            )}
            {/* Grade label below */}
            <text
              x={x + GB_BAR_W / 2} y={GB_VH - 8}
              textAnchor="middle"
              fill="rgba(138,112,96,0.8)" fontSize="11" fontFamily="monospace"
            >{b.grade}</text>
          </g>
        )
      })}
    </svg>
  )
}

/* ─── Player market search data ───────────────────────── */
const MKT_CATALOG = [
  { player: 'LeBron James',       sport: 'NBA',  grade: 'PSA 9',  value: 4800,  change: '+50.0%' },
  { player: 'Patrick Mahomes',    sport: 'NFL',  grade: 'PSA 10', value: 2950,  change: '+63.9%' },
  { player: 'Victor Wembanyama',  sport: 'NBA',  grade: 'PSA 10', value: 3400,  change: '+28.2%' },
  { player: 'Shohei Ohtani',      sport: 'MLB',  grade: 'PSA 10', value: 1100,  change: '+29.4%' },
  { player: 'Caitlin Clark',      sport: 'WNBA', grade: 'PSA 10', value: 890,   change: '+31.2%' },
  { player: 'Connor Bedard',      sport: 'NHL',  grade: 'PSA 10', value: 620,   change: '+11.5%' },
  { player: 'Jayden Daniels',     sport: 'NFL',  grade: 'PSA 10', value: 195,   change: '+22.1%' },
  { player: 'Paul Skenes',        sport: 'MLB',  grade: 'PSA 10', value: 445,   change: '+15.3%' },
  { player: 'Matvei Michkov',     sport: 'NHL',  grade: 'PSA 10', value: 380,   change: '+22.8%' },
  { player: 'Angel Reese',        sport: 'WNBA', grade: 'PSA 10', value: 420,   change: '+18.6%' },
]

const MKT_SPORT_PILLS = [
  { label: 'All',  value: '',     dot: null },
  { label: 'NBA',  value: 'NBA',  dot: '#f0a030' },
  { label: 'NFL',  value: 'NFL',  dot: '#f0a030' },
  { label: 'MLB',  value: 'MLB',  dot: '#34c97a' },
  { label: 'NHL',  value: 'NHL',  dot: '#60a5fa' },
  { label: 'WNBA', value: 'WNBA', dot: '#a78bfa' },
]

/* ─── Page ────────────────────────────────────────────── */
export default function MarketPage() {
  const [period, setPeriod] = useState<Period>('1Y')
  const [mktQuery, setMktQuery] = useState('')
  const [mktSport, setMktSport] = useState('')

  const mktResults = useMemo(() => {
    if (!mktQuery.trim()) return []
    const q = mktQuery.toLowerCase()
    return MKT_CATALOG.filter(c =>
      (c.player.toLowerCase().includes(q) || c.sport.toLowerCase().includes(q)) &&
      (mktSport === '' || c.sport === mktSport)
    )
  }, [mktQuery, mktSport])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Stats bar ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
        borderBottom: '1px solid var(--border-md)',
      }}>
        {METRICS.map((m, i) => (
          <div key={m.label} style={{
            padding: '1.1rem 1.5rem',
            background: 'var(--bg)',
            borderLeft: i > 0 ? '1px solid var(--border-md)' : 'none',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text3)', marginBottom: '7px' }}>{m.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px', letterSpacing: '-0.01em' }}>{m.value}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: m.up === null ? 'var(--text3)' : m.up ? 'var(--green)' : 'var(--red)' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 0 3rem' }}>

        {/* ── Index chart section ── */}
        <div style={{ padding: '1.5rem 2rem 0', borderBottom: '1px solid var(--border-md)', marginBottom: '0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '3px' }}>SlabMetrics Market Index</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text3)' }}>Composite index tracking 500 most-traded sports cards</div>
            </div>
            <div style={{ display: 'flex', gap: '3px' }}>
              {(['7D','30D','90D','6M','1Y','5Y'] as Period[]).map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  padding: '5px 12px', borderRadius: '5px',
                  border: period === p ? '1px solid var(--gold-border)' : '1px solid var(--border-md)',
                  background: period === p ? 'var(--gold-bg)' : 'none',
                  color: period === p ? 'var(--gold2)' : 'var(--text3)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600,
                  cursor: 'pointer', transition: '0.12s',
                }}>{p}</button>
              ))}
            </div>
          </div>
          <IndexChart period={period} />
        </div>

        {/* ── Top Movers + Volume by Sport ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border-md)' }}>

          {/* Top Movers */}
          <div style={{ padding: '1.5rem 2rem', borderRight: '1px solid var(--border-md)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '3px' }}>Top Movers</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text3)', marginBottom: '1.25rem' }}>Biggest price changes this period</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-md)' }}>
                  {['Card', 'Grade', 'Price', 'Change'].map(h => (
                    <th key={h} style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase',
                      letterSpacing: '0.1em', color: 'var(--text3)', fontWeight: 500,
                      padding: '0 0 8px', textAlign: h === 'Change' || h === 'Price' ? 'right' : 'left',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOP_MOVERS.map((m, i) => (
                  <tr key={i} style={{ borderBottom: i < TOP_MOVERS.length - 1 ? '1px solid var(--border-sm)' : 'none' }}>
                    <td style={{ padding: '11px 0' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)' }}>{m.player}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--text3)', marginTop: '2px' }}>{m.card}</div>
                    </td>
                    <td style={{ padding: '11px 12px 11px 0' }}>
                      <span style={{
                        padding: '2px 7px', borderRadius: '4px',
                        background: 'var(--green-bg)', border: '1px solid rgba(52,201,122,0.2)',
                        fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--green)',
                      }}>{m.grade}</span>
                    </td>
                    <td style={{ padding: '11px 0', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>{m.price}</td>
                    <td style={{ padding: '11px 0 11px 12px', textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
                        background: m.up ? 'var(--green-bg)' : 'var(--red-bg)',
                        border: `1px solid ${m.up ? 'rgba(52,201,122,0.2)' : 'rgba(224,92,92,0.2)'}`,
                        fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
                        color: m.up ? 'var(--green)' : 'var(--red)',
                      }}>{m.change}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Volume by Sport */}
          <div style={{ padding: '1.5rem 2rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '3px' }}>Volume by Sport</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text3)', marginBottom: '1.5rem' }}>Sales distribution this period</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {VOLUME_DATA.map(v => (
                <div key={v.sport} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '52px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text)', flexShrink: 0 }}>{v.sport}</div>
                  <div style={{ flex: 1, height: '22px', background: 'var(--bg3)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: `${v.pct}%`,
                      background: v.color,
                      opacity: 0.8,
                      borderRadius: '3px',
                      display: 'flex', alignItems: 'center',
                      paddingLeft: '8px',
                      transition: 'width 0.4s ease',
                    }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: '#0d1117', whiteSpace: 'nowrap' }}>{v.pct}%</span>
                    </div>
                  </div>
                  <div style={{ width: '48px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text2)', textAlign: 'right', flexShrink: 0 }}>{v.dollars}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Investor Picks ── */}
        <div style={{ padding: '1.75rem 2rem', borderBottom: '1px solid var(--border-md)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '6px' }}>— Investor Signals</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text)' }}>Players Top Card Investors Are Buying</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>High-conviction targets with projectable upside — updated weekly</div>
            </div>
            <span style={{ padding: '4px 10px', borderRadius: '5px', background: 'var(--gold-bg)', border: '1px solid var(--gold-border)', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--gold2)', letterSpacing: '0.1em' }}>ANALYST PICKS</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--border-md)' }}>
            {INVESTOR_PICKS.map((pick, i) => (
              <div key={pick.player} className="investor-pick-card" style={{ background: 'var(--bg2)', padding: '1.5rem 1.4rem', position: 'relative', overflow: 'hidden', borderLeft: i > 0 ? '1px solid var(--border-md)' : 'none', transition: 'background 0.15s' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${pick.accent}, transparent)` }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: `${pick.accent}18`, border: `1px solid ${pick.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', marginBottom: '0.7rem' }}>{pick.icon}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)', lineHeight: 1.2 }}>{pick.player}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginTop: '3px' }}>{pick.card}</div>
                  </div>
                  <span style={{ padding: '3px 8px', borderRadius: '5px', background: 'var(--green-bg)', border: '1px solid rgba(52,201,122,0.2)', color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{pick.change}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.7, marginBottom: '1.1rem' }}>{pick.thesis}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', border: '1px solid var(--border-md)', borderRadius: '6px', overflow: 'hidden' }}>
                  {pick.stats.map((s, j) => (
                    <div key={s.label} style={{ padding: '0.5rem 0.7rem', background: 'var(--bg3)', borderLeft: j > 0 ? '1px solid var(--border-md)' : 'none' }}>
                      <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 500, color: s.color ?? 'var(--text)', marginTop: '2px' }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Grade Premium + Player Market Search ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border-md)' }}>

          {/* Grade Premium Multipliers */}
          <div style={{ padding: '1.5rem 2rem', borderRight: '1px solid var(--border-md)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '3px' }}>Grade Premium Multipliers</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text3)', marginBottom: '1.25rem' }}>Price premium relative to PSA 7 baseline</div>
            <GradePremiumChart />
          </div>

          {/* Player Market Search */}
          <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '3px' }}>Player Market Search</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text3)', marginBottom: '1rem' }}>Search cards, sets, or players across all sports</div>

            {/* Input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '13px', flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={mktQuery}
                onChange={e => setMktQuery(e.target.value)}
                placeholder="Player, set, or card name…"
                style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border-md)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: '0.85rem', padding: '9px 40px 9px 36px', outline: 'none' }}
              />
              {/* Camera icon */}
              <button type="button" style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text3)', display: 'flex', alignItems: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
              </button>
            </div>

            {/* Sport pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
              {MKT_SPORT_PILLS.map(p => {
                const active = mktSport === p.value
                return (
                  <button key={p.value} onClick={() => setMktSport(p.value)} style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '4px 11px', borderRadius: '20px',
                    border: active ? '1px solid var(--gold-border)' : '1px solid var(--border-md)',
                    background: active ? 'var(--gold-bg)' : 'none',
                    color: active ? 'var(--gold2)' : 'var(--text3)',
                    fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600,
                    cursor: 'pointer', transition: '0.12s',
                  }}>
                    {p.dot && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: p.dot, flexShrink: 0 }} />}
                    {p.label}
                  </button>
                )
              })}
            </div>

            {/* Results or empty state */}
            {mktResults.length === 0 ? (
              <div style={{ color: 'var(--text3)', fontSize: '0.8rem', textAlign: 'center', padding: '2rem 0', fontFamily: 'var(--font-mono)', letterSpacing: '0.03em' }}>
                {mktQuery.trim() ? 'No results found.' : 'Type to search player markets'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '220px', overflowY: 'auto' }}>
                {mktResults.map((r, i) => (
                  <Link key={i} href={`/browse?q=${encodeURIComponent(r.player)}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 10px', borderRadius: '6px', background: 'var(--bg3)',
                    border: '1px solid var(--border-sm)', textDecoration: 'none',
                  }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)' }}>{r.player}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--text3)', marginTop: '1px' }}>{r.sport} · {r.grade}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)' }}>${r.value.toLocaleString()}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--green)', marginTop: '1px' }}>{r.change}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Trending Now ── */}
        <div style={{ padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>🔥 Trending Now</span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--border-md), transparent)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
            {TRENDING_NOW.map(t => (
              <Link key={t.player} href={`/browse?q=${encodeURIComponent(t.player)}`} style={{ display: 'block', padding: '1rem', background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)', textDecoration: 'none', transition: '0.15s' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.83rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.player}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text3)', marginBottom: '8px' }}>{t.sport}</div>
                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: 'var(--green-bg)', border: '1px solid rgba(52,201,122,0.2)', color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600 }}>{t.change}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
