'use client'

import { useState, useMemo } from 'react'

type CollSortKey = '' | 'player-asc' | 'player-desc' | 'year-asc' | 'year-desc' | 'grade-asc' | 'grade-desc' | 'value-desc' | 'value-asc' | 'change-desc' | 'change-asc'

interface CollCard {
  id: number
  player: string
  cardName: string
  setName: string
  year: number
  grade: string
  sport: string
  qty: number
  purchasePrice: number
  currentValue: number
  change: number
  percentChange: number
}

const MOCK_COLLECTION: CollCard[] = [
  { id:1, player:'LeBron James',          cardName:'2003-04 Topps Chrome Rookie',       setName:'Topps Chrome',   year:2003, grade:'PSA 9',  sport:'NBA', qty:1, purchasePrice:3200, currentValue:4800,  change:1600,  percentChange:50.0  },
  { id:2, player:'Patrick Mahomes',        cardName:'2017 Panini Prizm Rookie',          setName:'Panini Prizm',   year:2017, grade:'PSA 10', sport:'NFL', qty:1, purchasePrice:1800, currentValue:2950,  change:1150,  percentChange:63.9  },
  { id:3, player:'Luka Dončić',           cardName:'2018-19 Panini Prizm Silver Rookie', setName:'Panini Prizm',   year:2018, grade:'PSA 10', sport:'NBA', qty:2, purchasePrice:900,  currentValue:780,   change:-120,  percentChange:-13.3 },
  { id:4, player:'Mike Trout',             cardName:'2011 Topps Update Rookie',          setName:'Topps Update',   year:2011, grade:'PSA 8',  sport:'MLB', qty:1, purchasePrice:620,  currentValue:740,   change:120,   percentChange:19.4  },
  { id:5, player:'Ja Morant',              cardName:'2019-20 Donruss Optic Rated Rookie',setName:'Donruss Optic',  year:2019, grade:'PSA 10', sport:'NBA', qty:1, purchasePrice:480,  currentValue:590,   change:110,   percentChange:22.9  },
  { id:6, player:'Justin Jefferson',       cardName:'2020 Panini Prizm Rookie Silver',   setName:'Panini Prizm',   year:2020, grade:'PSA 9',  sport:'NFL', qty:1, purchasePrice:310,  currentValue:420,   change:110,   percentChange:35.5  },
  { id:7, player:'Shohei Ohtani',          cardName:'2018 Topps Chrome Rookie Refractor',setName:'Topps Chrome',   year:2018, grade:'PSA 10', sport:'MLB', qty:1, purchasePrice:850,  currentValue:1100,  change:250,   percentChange:29.4  },
  { id:8, player:'Giannis Antetokounmpo',  cardName:'2013-14 Panini Prizm Rookie',       setName:'Panini Prizm',   year:2013, grade:'PSA 9',  sport:'NBA', qty:1, purchasePrice:1400, currentValue:1650,  change:250,   percentChange:17.9  },
]

const SPORT_COLORS: Record<string, string> = {
  NBA: '#f0c96a', NFL: '#34c97a', MLB: '#60a5fa', NHL: '#a78bfa', WNBA: '#f0a0a0',
}

function pct(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`
}

export default function CollectionPage() {
  const [search, setSearch]   = useState('')
  const [sport, setSport]     = useState('')
  const [grade, setGrade]     = useState('')
  const [sort, setSort]       = useState<CollSortKey>('')
  const [cards]               = useState<CollCard[]>(MOCK_COLLECTION)

  const filtered = useMemo(() => {
    let list = [...cards]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.player.toLowerCase().includes(q) ||
        c.cardName.toLowerCase().includes(q) ||
        c.setName.toLowerCase().includes(q)
      )
    }
    if (sport) list = list.filter(c => c.sport === sport)
    if (grade) list = list.filter(c => c.grade.startsWith(grade))
    list.sort((a, b) => {
      switch (sort) {
        case 'player-asc':  return a.player.localeCompare(b.player)
        case 'player-desc': return b.player.localeCompare(a.player)
        case 'year-asc':    return a.year - b.year
        case 'year-desc':   return b.year - a.year
        case 'value-desc':  return b.currentValue - a.currentValue
        case 'value-asc':   return a.currentValue - b.currentValue
        case 'change-desc': return b.percentChange - a.percentChange
        case 'change-asc':  return a.percentChange - b.percentChange
        default:            return 0
      }
    })
    return list
  }, [cards, search, sport, grade, sort])

  const totalValue    = cards.reduce((s, c) => s + c.currentValue * c.qty, 0)
  const totalCost     = cards.reduce((s, c) => s + c.purchasePrice * c.qty, 0)
  const totalGain     = totalValue - totalCost
  const totalGainPct  = totalCost > 0 ? (totalGain / totalCost) * 100 : 0
  const totalCards    = cards.reduce((s, c) => s + c.qty, 0)

  const PORTFOLIO_STATS = [
    { label: 'Total Value',   value: `$${totalValue.toLocaleString()}`,                  up: null  },
    { label: 'Cost Basis',    value: `$${totalCost.toLocaleString()}`,                   up: null  },
    { label: 'Total Gain',    value: `${totalGain >= 0 ? '+' : ''}$${Math.abs(totalGain).toLocaleString()}`, up: totalGain >= 0 },
    { label: 'Return',        value: pct(totalGainPct),                                  up: totalGainPct >= 0 },
    { label: 'Cards Held',    value: String(totalCards),                                 up: null  },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Portfolio header ── */}
      <div style={{ borderBottom: '1px solid var(--border-md)', background: 'var(--bg2)', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>My Collection</h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginTop: '3px' }}>Portfolio-style tracking for your sports cards</p>
            </div>
            <button style={{
              padding: '9px 20px',
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
              border: 'none', borderRadius: '8px', color: '#0d1117',
              fontFamily: 'var(--font-display)', fontSize: '0.83rem', fontWeight: 700, cursor: 'pointer',
            }}>+ Add to Collection</button>
          </div>

          {/* Portfolio stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
            border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          }}>
            {PORTFOLIO_STATS.map((s, i) => (
              <div key={s.label} style={{ padding: '0.9rem 1.25rem', background: 'var(--bg3)', borderLeft: i > 0 ? '1px solid var(--border-md)' : 'none' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text3)', marginBottom: '5px' }}>{s.label}</div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '1.05rem', fontWeight: 700,
                  color: s.up === null ? 'var(--text)' : s.up ? 'var(--green)' : 'var(--red)',
                }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>

        {/* ── Toolbar ── */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search cards, players…"
              style={{
                width: '100%', background: 'var(--bg3)', border: '1px solid var(--border-md)',
                borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: '0.83rem',
                padding: '8px 12px 8px 32px', outline: 'none',
              }}
            />
          </div>
          {[
            { id: 'sport', value: sport, set: setSport, options: [['', 'All Sports'], ['NBA','NBA'], ['NFL','NFL'], ['MLB','MLB'], ['NHL','NHL'], ['Soccer','Soccer'], ['WNBA','WNBA']] as [string, string][] },
            { id: 'grade', value: grade, set: setGrade, options: [['', 'All Grades'], ['PSA 10','PSA 10'], ['PSA 9','PSA 9'], ['PSA 8','PSA 8'], ['Raw','Raw']] as [string, string][] },
          ].map(f => (
            <select key={f.id} value={f.value} onChange={e => f.set(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border-md)', borderRadius: '8px', color: 'var(--text2)', fontFamily: 'var(--font-display)', fontSize: '0.82rem', padding: '8px 12px', outline: 'none', cursor: 'pointer' }}>
              {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
          <select value={sort} onChange={e => setSort(e.target.value as CollSortKey)} style={{ background: 'var(--bg3)', border: '1px solid var(--border-md)', borderRadius: '8px', color: 'var(--text2)', fontFamily: 'var(--font-display)', fontSize: '0.82rem', padding: '8px 12px', outline: 'none', cursor: 'pointer', minWidth: '152px' }}>
            <option value="">Sort: Default</option>
            <option value="player-asc">Player A→Z</option>
            <option value="player-desc">Player Z→A</option>
            <option value="year-desc">Year: Newest</option>
            <option value="year-asc">Year: Oldest</option>
            <option value="value-desc">Value: High→Low</option>
            <option value="value-asc">Value: Low→High</option>
            <option value="change-desc">Gainers First</option>
            <option value="change-asc">Losers First</option>
          </select>
          {(search || sport || grade || sort) && (
            <button onClick={() => { setSearch(''); setSport(''); setGrade(''); setSort('') }} style={{ background: 'none', border: '1px solid var(--border-md)', borderRadius: '7px', color: 'var(--text3)', fontFamily: 'var(--font-display)', fontSize: '0.78rem', padding: '7px 12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>✕ Clear</button>
          )}
        </div>

        {/* ── Cards table ── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', fontFamily: 'var(--font-mono)', color: 'var(--text3)', fontSize: '0.85rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
            {cards.length === 0 ? "Your collection is empty — add your first card above." : "No cards match your filters."}
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border-md)' }}>
                  {['Player', 'Card Name', 'Set / Year', 'Grade', 'Qty', 'Cost', 'Current Value', 'Gain/Loss', '% Change', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'left',
                      fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      color: 'var(--text3)', fontWeight: 500, whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((card, i) => {
                  const isUp = card.change >= 0
                  const sportColor = SPORT_COLORS[card.sport] ?? 'var(--text3)'
                  return (
                    <tr key={card.id} style={{ background: i % 2 === 0 ? 'var(--bg2)' : 'var(--bg)', borderBottom: '1px solid var(--border-sm)', transition: 'background 0.1s' }}
                      className="table-row"
                    >
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)' }}>{card.player}</div>
                        <span style={{
                          display: 'inline-block', marginTop: '3px', padding: '1px 6px', borderRadius: '3px',
                          background: `${sportColor}18`, border: `1px solid ${sportColor}40`,
                          fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 600, color: sportColor, letterSpacing: '0.04em',
                        }}>{card.sport}</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--text2)', maxWidth: '220px' }}>
                        {card.cardName}
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                        {card.setName}<br />{card.year}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '4px',
                          background: 'var(--green-bg)', border: '1px solid rgba(52,201,122,0.2)',
                          fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--green)',
                        }}>{card.grade}</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text3)', textAlign: 'center' }}>{card.qty}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 500, color: 'var(--text2)' }}>
                        ${card.purchasePrice.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)' }}>
                        ${card.currentValue.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 600, color: isUp ? 'var(--green)' : 'var(--red)', whiteSpace: 'nowrap' }}>
                        {isUp ? '+' : ''}${card.change.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '4px',
                          background: isUp ? 'var(--green-bg)' : 'var(--red-bg)',
                          border: `1px solid ${isUp ? 'rgba(52,201,122,0.2)' : 'rgba(224,92,92,0.2)'}`,
                          fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                          color: isUp ? 'var(--green)' : 'var(--red)',
                        }}>{pct(card.percentChange)}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button style={{ padding: '5px 10px', background: 'none', border: '1px solid var(--border-md)', borderRadius: '5px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', cursor: 'pointer' }}>Edit</button>
                          <button style={{ padding: '5px 10px', background: 'var(--red-bg)', border: '1px solid rgba(224,92,92,0.2)', borderRadius: '5px', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', cursor: 'pointer' }}>Sell</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── P&L Section ── */}
        <div style={{ marginTop: '2rem', background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)', padding: '1.5rem 1.75rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text3)', marginBottom: '4px' }}>Profit &amp; Loss</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: 'var(--text)', marginBottom: '1.25rem' }}>Realized vs. Unrealized</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1.25rem' }}>
            {[
              { label: 'Unrealized P&L', value: `+$${(totalGain).toLocaleString()}`, up: totalGain >= 0 },
              { label: 'Realized P&L',   value: '$0',            up: null },
              { label: 'Total Return',   value: pct(totalGainPct), up: totalGainPct >= 0 },
              { label: 'Cost Basis',     value: `$${totalCost.toLocaleString()}`, up: null },
            ].map((s, i) => (
              <div key={s.label} style={{ padding: '1rem 1.25rem', background: 'var(--bg3)', borderLeft: i > 0 ? '1px solid var(--border-md)' : 'none' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text3)', marginBottom: '5px' }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: s.up === null ? 'var(--text)' : s.up ? 'var(--green)' : 'var(--red)' }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{ color: 'var(--text3)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', textAlign: 'center', padding: '1rem 0' }}>
            No realized trades yet — mark a card as Sold to track realized P&amp;L.
          </div>
        </div>

        {/* ── Portfolio chart placeholder ── */}
        <div style={{ marginTop: '1.25rem', background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)', padding: '1.5rem 1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text3)', marginBottom: '4px' }}>Performance</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>${totalValue.toLocaleString()}</div>
              <span style={{ display: 'inline-block', marginTop: '4px', padding: '2px 8px', borderRadius: '4px', background: 'var(--green-bg)', border: '1px solid rgba(52,201,122,0.2)', color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600 }}>
                +{pct(totalGainPct)} all time
              </span>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['1W', '1M', '3M', '6M', '1Y', 'ALL'].map(r => (
                <button key={r} style={{ padding: '5px 10px', borderRadius: '5px', border: r === '1W' ? '1px solid var(--gold-border)' : '1px solid var(--border-md)', background: r === '1W' ? 'var(--gold-bg)' : 'none', color: r === '1W' ? 'var(--gold2)' : 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', cursor: 'pointer' }}>{r}</button>
              ))}
            </div>
          </div>
          {/* Synthetic chart */}
          <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '4px', padding: '0 4px' }}>
            {[72,75,70,78,76,82,80,85,83,88,86,90,89,94,92,96,94,100].map((h, i) => (
              <div key={i} style={{
                flex: 1, borderRadius: '2px 2px 0 0', height: `${h}%`,
                background: i === 17
                  ? 'linear-gradient(180deg, var(--green) 0%, rgba(52,201,122,0.4) 100%)'
                  : `rgba(52,201,122,${0.12 + (i / 17) * 0.2})`,
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text3)' }}>
            <span>1 week ago</span><span>Today</span>
          </div>
        </div>

        {/* ── Allocation ── */}
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text3)', marginBottom: '4px' }}>Allocation</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: 'var(--text)', marginBottom: '1.25rem' }}>Portfolio Breakdown</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* By Sport */}
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '1.25rem' }}>By Sport</div>
              {(() => {
                const byS: Record<string, number> = {}
                cards.forEach(c => { byS[c.sport] = (byS[c.sport] ?? 0) + c.currentValue * c.qty })
                const total = Object.values(byS).reduce((a, b) => a + b, 0)
                return Object.entries(byS).sort((a, b) => b[1] - a[1]).map(([sp, val]) => (
                  <div key={sp} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)' }}>{sp}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text3)' }}>{((val / total) * 100).toFixed(1)}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--bg4)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${(val / total) * 100}%`, height: '100%', background: SPORT_COLORS[sp] ?? 'var(--text3)', borderRadius: '3px', opacity: 0.75 }} />
                    </div>
                  </div>
                ))
              })()}
            </div>
            {/* By Grade */}
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '1.25rem' }}>By Grade</div>
              {(() => {
                const byG: Record<string, number> = {}
                cards.forEach(c => { byG[c.grade] = (byG[c.grade] ?? 0) + c.currentValue * c.qty })
                const total = Object.values(byG).reduce((a, b) => a + b, 0)
                const gradeColors: Record<string, string> = { 'PSA 10': '#34c97a', 'PSA 9': '#d4a843', 'PSA 8': '#60a5fa', 'PSA 7': '#a78bfa' }
                return Object.entries(byG).sort((a, b) => b[1] - a[1]).map(([g, val]) => (
                  <div key={g} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)' }}>{g}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text3)' }}>{((val / total) * 100).toFixed(1)}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--bg4)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${(val / total) * 100}%`, height: '100%', background: gradeColors[g] ?? '#8a7060', borderRadius: '3px', opacity: 0.75 }} />
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
