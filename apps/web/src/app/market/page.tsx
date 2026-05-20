'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type Period = '7D' | '30D' | '90D' | '6M' | '1Y' | '5Y'

const METRICS = [
  { label: 'Market Index',    value: '4,821',  sub: '▲ 3.2% this week',    up: true  },
  { label: 'Total Volume',    value: '$38.4M', sub: '▲ 11% vs last week',  up: true  },
  { label: 'PSA 10 Premium',  value: '3.8×',   sub: 'vs raw avg',          up: null  },
  { label: 'Top Sport',       value: 'NBA',    sub: '▲ 18% volume share',  up: true  },
  { label: 'Avg Sale Price',  value: '$247',   sub: '▼ 2.1% vs last week', up: false },
  { label: 'New Listings',    value: '12,441', sub: '▲ 4.7%',              up: true  },
]

const TOP_MOVERS = [
  { player: 'Matvei Michkov',    card: 'RC Base',        grade: 'PSA 10', price: '$380', change: '+22.8%', up: true  },
  { player: 'Jayden Daniels',    card: 'Panini Mosaic',  grade: 'PSA 10', price: '$195', change: '+22.1%', up: true  },
  { player: 'Caitlin Clark',     card: 'Parkside RC',    grade: 'PSA 10', price: '$890', change: '+31.2%', up: true  },
  { player: 'Connor Bedard',     card: 'UD Series 1 RC', grade: 'PSA 10', price: '$620', change: '+11.5%', up: true  },
  { player: 'Drake Maye',        card: 'Panini Mosaic',  grade: 'PSA 10', price: '$175', change: '-3.2%',  up: false },
  { player: 'Chet Holmgren',     card: 'Panini Prizm',   grade: 'PSA 10', price: '$380', change: '-2.1%',  up: false },
]

const VOLUME_BY_SPORT = [
  { sport: 'NBA',     pct: 34, color: '#f0c96a' },
  { sport: 'NFL',     pct: 28, color: '#34c97a' },
  { sport: 'MLB',     pct: 18, color: '#60a5fa' },
  { sport: 'NHL',     pct: 9,  color: '#a78bfa' },
  { sport: 'WNBA',    pct: 6,  color: '#f0c96a' },
  { sport: 'Soccer',  pct: 5,  color: '#34d399' },
]

const INVESTOR_PICKS = [
  {
    player: 'Caitlin Clark',
    card: '2024 Rittenhouse WNBA RC Auto',
    change: '+41.2%',
    icon: '🏀',
    accent: '#34c97a',
    thesis: 'Historic rookie demand with crossover mainstream appeal. Certified autos in PSA 10 remain under-distributed relative to collector interest — strong floor with league growth as a tailwind.',
    stats: [
      { label: 'Avg PSA 10', value: '$1,200' },
      { label: 'Pop Report', value: '214' },
      { label: 'Conviction', value: 'HIGH', color: '#34c97a' },
    ],
  },
  {
    player: 'Victor Wembanyama',
    card: '2023 Topps Chrome Auto PSA 10',
    change: '+28.2%',
    icon: '🏀',
    accent: '#d4a843',
    thesis: 'Generational prospect comps to LeBron rookie trajectories at the same career stage. Certified autos are still early in price discovery — institutional collector funds have begun staking positions.',
    stats: [
      { label: 'Avg PSA 10', value: '$3,400' },
      { label: 'Pop Report', value: '389' },
      { label: 'Conviction', value: 'HIGH', color: '#34c97a' },
    ],
  },
  {
    player: 'Shohei Ohtani',
    card: '2018 Topps Chrome RC Refractor',
    change: '+30.9%',
    icon: '⚾',
    accent: '#d4a843',
    thesis: 'Unique two-way player status commands a collector premium with no historical comparable. Dodgers signing amplified global demand — Japanese collector market adds a non-correlated buyer pool.',
    stats: [
      { label: 'Avg PSA 9', value: '$890' },
      { label: 'Pop Report', value: '1,042' },
      { label: 'Conviction', value: 'MED', color: '#d4a843' },
    ],
  },
]

const GRADE_PREMIUMS = [
  { grade: 'PSA 10', mult: 3.8, color: '#34c97a' },
  { grade: 'PSA 9',  mult: 2.1, color: '#d4a843' },
  { grade: 'PSA 8',  mult: 1.5, color: '#60a5fa' },
  { grade: 'PSA 7',  mult: 1.0, color: '#8a7060' },
]

const MKT_CATALOG = [
  { player: 'LeBron James',      sport: 'NBA',   grade: 'PSA 9',  value: 4800,  change: '+50.0%' },
  { player: 'Patrick Mahomes',   sport: 'NFL',   grade: 'PSA 10', value: 2950,  change: '+63.9%' },
  { player: 'Victor Wembanyama', sport: 'NBA',   grade: 'PSA 10', value: 3400,  change: '+28.2%' },
  { player: 'Shohei Ohtani',     sport: 'MLB',   grade: 'PSA 10', value: 1100,  change: '+29.4%' },
  { player: 'Caitlin Clark',     sport: 'WNBA',  grade: 'PSA 10', value: 890,   change: '+31.2%' },
  { player: 'Connor Bedard',     sport: 'NHL',   grade: 'PSA 10', value: 620,   change: '+11.5%' },
  { player: 'Jayden Daniels',    sport: 'NFL',   grade: 'PSA 10', value: 195,   change: '+22.1%' },
  { player: 'Paul Skenes',       sport: 'MLB',   grade: 'PSA 10', value: 445,   change: '+15.3%' },
]

const TRENDING_NOW = [
  { player: 'Caitlin Clark', sport: 'WNBA', change: '+31.2%', up: true  },
  { player: 'Matvei Michkov', sport: 'NHL',  change: '+22.8%', up: true  },
  { player: 'Jayden Daniels', sport: 'NFL',  change: '+22.1%', up: true  },
  { player: 'Jackson Holliday', sport: 'MLB', change: '+9.8%', up: true  },
  { player: 'Victor Wembanyama', sport: 'NBA', change: '+8.7%', up: true  },
]

const PERIODS: Period[] = ['7D', '30D', '90D', '6M', '1Y', '5Y']

export default function MarketPage() {
  const [period, setPeriod] = useState<Period>('7D')
  const [mktQuery, setMktQuery] = useState('')
  const [mktSport, setMktSport] = useState('')

  const mktResults = useMemo(() => {
    if (!mktQuery.trim()) return []
    const q = mktQuery.toLowerCase()
    let results = MKT_CATALOG.filter(c =>
      c.player.toLowerCase().includes(q) ||
      c.sport.toLowerCase().includes(q)
    )
    if (mktSport) results = results.filter(c => c.sport === mktSport)
    return results
  }, [mktQuery, mktSport])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Page header ── */}
      <div style={{
        borderBottom: '1px solid var(--border-md)',
        background: 'var(--bg2)',
        padding: '1.5rem 2rem',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gold2)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>
              — Market Data
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text)' }}>
              Market Analysis
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: '3px', fontFamily: 'var(--font-mono)', letterSpacing: '0.03em' }}>
              Sports card market data, trends, and price movement
            </p>
          </div>

          {/* Period pills */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: period === p ? '1px solid var(--gold-border)' : '1px solid var(--border-md)',
                  background: period === p ? 'var(--gold-bg)' : 'none',
                  color: period === p ? 'var(--gold2)' : 'var(--text3)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                  cursor: 'pointer', transition: '0.15s',
                }}
              >{p}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        {/* ── Metrics bar ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '0', marginBottom: '2rem',
          border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        }}>
          {METRICS.map((m, i) => (
            <div key={m.label} style={{
              padding: '1rem 1.25rem',
              background: 'var(--bg2)',
              borderLeft: i > 0 ? '1px solid var(--border-md)' : 'none',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text3)', marginBottom: '6px' }}>{m.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{m.value}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: m.up === null ? 'var(--text3)' : m.up ? 'var(--green)' : 'var(--red)' }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Main grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

          {/* Index Chart placeholder */}
          <div style={{
            gridColumn: '1 / -1',
            background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)',
            padding: '1.5rem 1.75rem',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '4px' }}>SlabMetrics Market Index</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text3)', marginBottom: '1.25rem' }}>Composite index tracking 500 most-traded sports cards</div>
            {/* Synthetic sparkline */}
            <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '6px', padding: '0 4px' }}>
              {[62,58,65,70,68,74,72,80,76,84,82,88,85,92,90,96,94,100].map((h, i) => (
                <div key={i} style={{
                  flex: 1, borderRadius: '3px 3px 0 0',
                  height: `${h}%`,
                  background: i === 17
                    ? 'linear-gradient(180deg, var(--gold2) 0%, var(--gold) 100%)'
                    : `rgba(212,168,67,${0.15 + (i / 17) * 0.25})`,
                  transition: '0.15s',
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text3)' }}>
              <span>18 periods ago</span>
              <span>Now · {period}</span>
            </div>
          </div>

          {/* Top Movers */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)', padding: '1.5rem 1.75rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '4px' }}>Top Movers</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text3)', marginBottom: '1.25rem' }}>Biggest price changes this period</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-md)' }}>
                  {['Card', 'Grade', 'Price', 'Change'].map(h => (
                    <th key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)', fontWeight: 500, padding: '0 0 8px', textAlign: h === 'Change' || h === 'Price' ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOP_MOVERS.map((m, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-sm)' }}>
                    <td style={{ padding: '10px 0', fontFamily: 'var(--font-display)', fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)' }}>
                      {m.player}
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text3)', fontWeight: 400, marginTop: '1px' }}>{m.card}</div>
                    </td>
                    <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text3)' }}>{m.grade}</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)' }}>{m.price}</td>
                    <td style={{ padding: '10px 0', textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 7px', borderRadius: '4px',
                        background: m.up ? 'var(--green-bg)' : 'var(--red-bg)',
                        color: m.up ? 'var(--green)' : 'var(--red)',
                        fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                      }}>{m.change}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Volume by Sport */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)', padding: '1.5rem 1.75rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '4px' }}>Volume by Sport</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text3)', marginBottom: '1.5rem' }}>Sales distribution this period</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {VOLUME_BY_SPORT.map(v => (
                <div key={v.sport}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)' }}>{v.sport}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text3)' }}>{v.pct}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg4)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${v.pct}%`, height: '100%', background: v.color, borderRadius: '3px', opacity: 0.8 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Investor Picks */}
          <div style={{ gridColumn: '1 / -1', background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.14em', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ opacity: 0.5 }}>—</span> Investor Signals
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text)' }}>Players Top Card Investors Are Buying</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '4px', fontFamily: 'var(--font-mono)', letterSpacing: '0.03em' }}>High-conviction targets with projectable upside — updated weekly</div>
              </div>
              <span style={{
                padding: '4px 10px', borderRadius: '5px',
                background: 'var(--gold-bg)', border: '1px solid var(--gold-border)',
                fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700,
                color: 'var(--gold2)', letterSpacing: '0.1em',
              }}>ANALYST PICKS</span>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0', background: 'var(--border-md)',
              border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            }}>
              {INVESTOR_PICKS.map((pick, i) => (
                <div key={pick.player} className="investor-pick-card" style={{
                  background: 'var(--bg3)', padding: '1.5rem 1.4rem',
                  position: 'relative', overflow: 'hidden',
                  borderLeft: i > 0 ? '1px solid var(--border-md)' : 'none',
                  transition: 'background 0.15s',
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${pick.accent}, transparent)` }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${pick.accent}18`, border: `1px solid ${pick.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '0.75rem' }}>{pick.icon}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)', lineHeight: 1.2 }}>{pick.player}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginTop: '3px', letterSpacing: '0.02em' }}>{pick.card}</div>
                    </div>
                    <span style={{
                      padding: '3px 8px', borderRadius: '5px',
                      background: 'var(--green-bg)', border: '1px solid rgba(52,201,122,0.2)',
                      color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap',
                    }}>{pick.change}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.7, marginBottom: '1.1rem' }}>{pick.thesis}</div>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                    background: 'var(--border-md)', border: '1px solid var(--border-md)', borderRadius: '6px', overflow: 'hidden',
                  }}>
                    {pick.stats.map((s, j) => (
                      <div key={s.label} style={{ padding: '0.5rem 0.7rem', background: 'var(--bg2)', borderLeft: j > 0 ? '1px solid var(--border-md)' : 'none' }}>
                        <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 500, color: s.color ?? 'var(--text)', marginTop: '2px' }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grade Premium */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)', padding: '1.5rem 1.75rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '4px' }}>Grade Premium Multipliers</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text3)', marginBottom: '1.5rem' }}>Price premium relative to PSA 7 baseline</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {GRADE_PREMIUMS.map(g => (
                <div key={g.grade}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)' }}>{g.grade}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: g.color }}>{g.mult}×</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg4)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(g.mult / 3.8) * 100}%`, height: '100%', background: g.color, borderRadius: '4px', opacity: 0.75 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Player Market Search */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)', padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '2px' }}>Player Market Search</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text3)', marginBottom: '0.9rem' }}>Search cards, sets, or players across all sports</div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '13px', flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={mktQuery}
                onChange={e => setMktQuery(e.target.value)}
                placeholder="Player, set, or card name…"
                style={{
                  width: '100%', background: 'var(--bg3)', border: '1px solid var(--border-md)',
                  borderRadius: 'var(--radius-lg)', color: 'var(--text)',
                  fontFamily: 'var(--font-display)', fontSize: '0.88rem', fontWeight: 500,
                  padding: '9px 12px 9px 36px', outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {['', 'NBA', 'NFL', 'MLB', 'NHL', 'WNBA'].map(s => (
                <button
                  key={s}
                  onClick={() => setMktSport(s)}
                  style={{
                    padding: '4px 10px', borderRadius: '4px',
                    border: mktSport === s ? '1px solid var(--gold-border)' : '1px solid var(--border-md)',
                    background: mktSport === s ? 'var(--gold-bg)' : 'none',
                    color: mktSport === s ? 'var(--gold2)' : 'var(--text3)',
                    fontFamily: 'var(--font-mono)', fontSize: '0.7rem', cursor: 'pointer', transition: '0.15s',
                  }}
                >{s || 'All'}</button>
              ))}
            </div>

            {mktResults.length === 0 ? (
              <div style={{ color: 'var(--text3)', fontSize: '0.8rem', textAlign: 'center', padding: '1.5rem 0', fontFamily: 'var(--font-mono)' }}>
                {mktQuery ? 'No results found.' : 'Type to search player markets'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '220px', overflowY: 'auto' }}>
                {mktResults.map((r, i) => (
                  <Link key={i} href={`/browse?q=${encodeURIComponent(r.player)}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 10px', borderRadius: '6px', background: 'var(--bg3)',
                    border: '1px solid var(--border-sm)', textDecoration: 'none', transition: '0.15s',
                  }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)' }}>{r.player}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text3)', marginTop: '1px' }}>{r.sport} · {r.grade}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)' }}>${r.value.toLocaleString()}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--green)', marginTop: '1px' }}>{r.change}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Trending Now */}
          <div style={{ gridColumn: '1 / -1', background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)', padding: '1.5rem 1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>🔥 Trending Now</span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--border-md), transparent)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
              {TRENDING_NOW.map(t => (
                <Link key={t.player} href={`/browse?q=${encodeURIComponent(t.player)}`} style={{
                  display: 'block', padding: '1rem', background: 'var(--bg3)',
                  border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none', transition: '0.15s',
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.83rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.player}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text3)', marginBottom: '8px' }}>{t.sport}</div>
                  <div style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
                    background: 'var(--green-bg)', border: '1px solid rgba(52,201,122,0.2)',
                    color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600,
                  }}>{t.change}</div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
