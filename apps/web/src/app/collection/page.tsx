'use client'

import { useState, useMemo, useRef } from 'react'

/* ══ Add-to-Collection Modal ══ */
interface AddModalProps { onClose: () => void }

/* ══ Photo Card Search Modal ══ */
function PhotoSearchModal({ onClose }: { onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) setFile(f)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#161b22', width: '100%', maxWidth: '480px',
        borderRadius: '14px', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
      }}>
        {/* gold top accent */}
        <div style={{ height: '2px', background: 'linear-gradient(90deg, var(--gold) 0%, var(--gold2) 60%, transparent 100%)' }} />

        <div style={{ padding: '1.5rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>
                Photo Card Search
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--gold2)', lineHeight: 1.5 }}>
                Upload or snap a photo — AI identifies the card<br />instantly
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', color: 'var(--text3)', cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1, padding: '5px 8px', marginLeft: '12px', flexShrink: 0 }}>×</button>
          </div>

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              marginTop: '1.25rem',
              border: `2px dashed ${dragOver ? 'var(--gold2)' : 'rgba(201,168,76,0.4)'}`,
              borderRadius: '10px',
              padding: '2.5rem 1.5rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
              cursor: 'pointer', transition: 'border-color 0.15s',
              background: dragOver ? 'rgba(201,168,76,0.04)' : 'rgba(255,255,255,0.01)',
            }}
          >
            <span style={{ fontSize: '2.2rem' }}>📷</span>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: file ? 'var(--green)' : 'var(--text)' }}>
              {file ? file.name : 'Drop a card photo here'}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text3)' }}>
              {file ? 'Click to change file' : 'JPG, PNG, WEBP — or click to browse'}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFile} />
          </div>

          {/* OR USE CAMERA divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '1.25rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>or use camera</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Use Camera button */}
          <button style={{
            width: '100%', padding: '11px',
            background: 'none', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px', color: 'var(--text2)',
            fontFamily: 'var(--font-display)', fontSize: '0.88rem', fontWeight: 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLElement).style.color = 'var(--text2)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
            Use Camera
          </button>

          {/* Search button — only shown when a file is selected */}
          {file && (
            <button style={{
              width: '100%', marginTop: '10px', padding: '11px',
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
              border: 'none', borderRadius: '8px', color: '#0d1117',
              fontFamily: 'var(--font-display)', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
            }}>
              Search by Photo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function AddModal({ onClose }: AddModalProps) {
  const [player,    setPlayer]    = useState('')
  const [cardName,  setCardName]  = useState('')
  const [setName,   setSetName]   = useState('')
  const [year,      setYear]      = useState('')
  const [grade,     setGrade]     = useState('PSA 10')
  const [sport,     setSport]     = useState('NBA')
  const [pricePaid, setPricePaid] = useState('')
  const [estValue,  setEstValue]  = useState('')
  const [qty,       setQty]       = useState('1')
  const [alreadySold, setAlreadySold] = useState(false)
  const frontRef = useRef<HTMLInputElement>(null)
  const backRef  = useRef<HTMLInputElement>(null)

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '7px', color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: '0.88rem',
    padding: '10px 13px', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--gold2)',
    textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px',
  }
  const selectStyle: React.CSSProperties = {
    ...inputStyle, cursor: 'pointer',
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#161b22', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px', width: '100%', maxWidth: '500px',
        maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem 1rem' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>
            Add Card to Collection
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1, padding: '2px 4px' }}>×</button>
        </div>

        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          {/* Photo autofill box */}
          <div style={{ border: '1px solid rgba(201,168,76,0.35)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--gold2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Photo Autofill — Snap or Upload Front &amp; Back
              </span>
            </div>

            {/* Drop zones */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              {(['FRONT', 'BACK'] as const).map((side, idx) => (
                <div
                  key={side}
                  onClick={() => (idx === 0 ? frontRef : backRef).current?.click()}
                  style={{
                    border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '8px',
                    padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text3)', letterSpacing: '0.06em' }}>{side}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>tap or drop</span>
                  <input ref={idx === 0 ? frontRef : backRef} type="file" accept="image/*" style={{ display: 'none' }} />
                </div>
              ))}
            </div>

            {/* Camera buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              {['Camera — Front', 'Camera — Back'].map(label => (
                <button key={label} style={{
                  padding: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '7px', color: 'var(--text3)', fontFamily: 'var(--font-display)', fontSize: '0.78rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                    <circle cx="12" cy="13" r="3"/>
                  </svg>
                  {label}
                </button>
              ))}
            </div>

            {/* Scan button */}
            <button style={{
              width: '100%', padding: '10px',
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
              border: 'none', borderRadius: '8px', color: '#0d1117',
              fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              Scan &amp; Autofill Fields
            </button>
          </div>

          {/* CARD DETAILS divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Card Details</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Form fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Player Name</label>
              <input style={inputStyle} value={player} onChange={e => setPlayer(e.target.value)} placeholder="e.g. LeBron James" />
            </div>
            <div>
              <label style={labelStyle}>Card Name</label>
              <input style={inputStyle} value={cardName} onChange={e => setCardName(e.target.value)} placeholder="e.g. 2003-04 Topps Chrome Rookie" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Set Name</label>
                <input style={inputStyle} value={setName} onChange={e => setSetName(e.target.value)} placeholder="Topps Chrome" />
              </div>
              <div>
                <label style={labelStyle}>Year</label>
                <input style={inputStyle} value={year} onChange={e => setYear(e.target.value)} placeholder="2003" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Grade</label>
                <select style={selectStyle} value={grade} onChange={e => setGrade(e.target.value)}>
                  {['PSA 10','PSA 9','PSA 8','PSA 7','PSA 6','BGS 10','BGS 9.5','BGS 9','Raw'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Sport</label>
                <select style={selectStyle} value={sport} onChange={e => setSport(e.target.value)}>
                  {['NBA','NFL','MLB','NHL','Soccer','WNBA','UFC/MMA','Golf'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Price Paid ($)</label>
                <input style={inputStyle} type="number" value={pricePaid} onChange={e => setPricePaid(e.target.value)} placeholder="250.00" />
              </div>
              <div>
                <label style={labelStyle}>Current Est. Value ($)</label>
                <input style={inputStyle} type="number" value={estValue} onChange={e => setEstValue(e.target.value)} placeholder="310.00" />
              </div>
            </div>
            <div style={{ width: '50%' }}>
              <label style={labelStyle}>Quantity</label>
              <input style={inputStyle} type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} placeholder="1" />
            </div>

            {/* Already sold checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={alreadySold}
                onChange={e => setAlreadySold(e.target.checked)}
                style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: 'var(--gold2)' }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                I Already Sold This Card
              </span>
            </label>

            {/* Footer buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
              <button onClick={onClose} style={{
                padding: '10px 22px', background: 'none',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px',
                color: 'var(--text2)', fontFamily: 'var(--font-display)', fontSize: '0.85rem',
                cursor: 'pointer',
              }}>Cancel</button>
              <button style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
                border: 'none', borderRadius: '8px', color: '#0d1117',
                fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700,
                cursor: 'pointer',
              }}>Add to Collection</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type SortKey = '' | 'player-asc' | 'player-desc' | 'setName-asc' | 'setName-desc' | 'year-asc' | 'year-desc' | 'grade-asc' | 'grade-desc' | 'value-desc' | 'value-asc' | 'change-desc' | 'change-asc' | 'cost-desc' | 'cost-asc'

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

const MOCK: CollCard[] = [
  { id:1, player:'LeBron James',          cardName:'2003-04 Topps Chrome Rookie',        setName:'Topps Chrome',  year:2003, grade:'PSA 9',  sport:'NBA', qty:1, purchasePrice:3200, currentValue:4800,  change:1600,  percentChange:50.0  },
  { id:2, player:'Patrick Mahomes',        cardName:'2017 Panini Prizm Rookie PSA 10',    setName:'Panini Prizm',  year:2017, grade:'PSA 10', sport:'NFL', qty:1, purchasePrice:1800, currentValue:2950,  change:1150,  percentChange:63.9  },
  { id:3, player:'Luka Dončić',           cardName:'2018-19 Panini Prizm Silver Rookie',  setName:'Panini Prizm',  year:2018, grade:'PSA 10', sport:'NBA', qty:2, purchasePrice:900,  currentValue:780,   change:-120,  percentChange:-13.3 },
  { id:4, player:'Mike Trout',             cardName:'2011 Topps Update Rookie',           setName:'Topps Update',  year:2011, grade:'PSA 8',  sport:'MLB', qty:1, purchasePrice:620,  currentValue:740,   change:120,   percentChange:19.4  },
  { id:5, player:'Ja Morant',              cardName:'2019-20 Donruss Optic Rated Rookie', setName:'Donruss Optic', year:2019, grade:'PSA 10', sport:'NBA', qty:1, purchasePrice:480,  currentValue:590,   change:110,   percentChange:22.9  },
  { id:6, player:'Justin Jefferson',       cardName:'2020 Panini Prizm Rookie Silver',    setName:'Panini Prizm',  year:2020, grade:'PSA 9',  sport:'NFL', qty:1, purchasePrice:310,  currentValue:420,   change:110,   percentChange:35.5  },
  { id:7, player:'Shohei Ohtani',          cardName:'2018 Topps Chrome Rookie Refractor', setName:'Topps Chrome',  year:2018, grade:'PSA 10', sport:'MLB', qty:1, purchasePrice:850,  currentValue:1100,  change:250,   percentChange:29.4  },
  { id:8, player:'Giannis Antetokounmpo',  cardName:'2013-14 Panini Prizm Rookie',        setName:'Panini Prizm',  year:2013, grade:'PSA 9',  sport:'NBA', qty:1, purchasePrice:1400, currentValue:1650,  change:250,   percentChange:17.9  },
]

function gradeStyle(g: string) {
  if (g === 'PSA 10') return { bg: 'rgba(52,201,122,0.13)',  border: 'rgba(52,201,122,0.35)',  text: '#34c97a' }
  if (g === 'PSA 9')  return { bg: 'rgba(212,168,67,0.13)',  border: 'rgba(212,168,67,0.35)',  text: '#d4a843' }
  if (g === 'PSA 8')  return { bg: 'rgba(196,92,16,0.13)',   border: 'rgba(196,92,16,0.35)',   text: '#c45c10' }
  return                     { bg: 'rgba(160,120,60,0.13)',  border: 'rgba(160,120,60,0.35)',  text: '#a07840' }
}

const SET_COLOR = '#c9a84c'

export default function CollectionPage() {
  const [search,    setSearch]    = useState('')
  const [setFilter, setSetFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [sport,     setSport]     = useState('')
  const [grade,     setGrade]     = useState('')
  const [sort,      setSort]      = useState<SortKey>('')
  const [cards]                   = useState<CollCard[]>(MOCK)
  const [showModal, setShowModal] = useState(false)
  const [showPhotoSearch, setShowPhotoSearch] = useState(false)

  const filtered = useMemo(() => {
    let list = [...cards]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c => c.player.toLowerCase().includes(q) || c.cardName.toLowerCase().includes(q) || c.setName.toLowerCase().includes(q))
    }
    if (setFilter.trim()) {
      const q = setFilter.toLowerCase()
      list = list.filter(c => c.setName.toLowerCase().includes(q))
    }
    if (yearFilter.trim()) {
      list = list.filter(c => String(c.year).includes(yearFilter.trim()))
    }
    if (sport) list = list.filter(c => c.sport === sport)
    if (grade) list = list.filter(c => c.grade.startsWith(grade))
    list.sort((a, b) => {
      switch (sort) {
        case 'player-asc':  return a.player.localeCompare(b.player)
        case 'player-desc': return b.player.localeCompare(a.player)
        case 'value-desc':  return b.currentValue - a.currentValue
        case 'value-asc':   return a.currentValue - b.currentValue
        case 'cost-desc':   return b.purchasePrice - a.purchasePrice
        case 'cost-asc':    return a.purchasePrice - b.purchasePrice
        case 'change-desc': return b.percentChange - a.percentChange
        case 'change-asc':  return a.percentChange - b.percentChange
        case 'setName-asc':  return a.setName.localeCompare(b.setName)
        case 'setName-desc': return b.setName.localeCompare(a.setName)
        case 'year-asc':    return a.year - b.year
        case 'year-desc':   return b.year - a.year
        case 'grade-asc':   return a.grade.localeCompare(b.grade)
        case 'grade-desc':  return b.grade.localeCompare(a.grade)
        default:            return 0
      }
    })
    return list
  }, [cards, search, setFilter, yearFilter, sport, grade, sort])

  const totalCards   = cards.reduce((s, c) => s + c.qty, 0)
  const totalCost    = cards.reduce((s, c) => s + c.purchasePrice * c.qty, 0)
  const totalValue   = cards.reduce((s, c) => s + c.currentValue  * c.qty, 0)
  const unrealizedGL = totalValue - totalCost

  const COLS = [
    { key: 'player',  label: 'Player',        sortA: 'player-asc',  sortD: 'player-desc' },
    { key: 'card',    label: 'Card Name',      sortA: '',            sortD: '' },
    { key: 'set',     label: 'Set / Year',     sortA: '',            sortD: '' },
    { key: 'grade',   label: 'Grade',          sortA: '',            sortD: '' },
    { key: 'qty',     label: 'Qty',            sortA: '',            sortD: '' },
    { key: 'cost',    label: 'Cost',           sortA: 'cost-asc',   sortD: 'cost-desc' },
    { key: 'value',   label: 'Current Value',  sortA: 'value-asc',  sortD: 'value-desc' },
    { key: 'gl',      label: 'Gain/Loss',      sortA: 'change-asc', sortD: 'change-desc' },
    { key: 'pct',     label: '% Change',       sortA: 'change-asc', sortD: 'change-desc' },
    { key: 'actions', label: 'Actions',        sortA: '',            sortD: '' },
  ]

  function cycleSort(sortA: string, sortD: string) {
    if (!sortA) return
    if (sort === sortD) setSort(sortA as SortKey)
    else setSort(sortD as SortKey)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {showModal && <AddModal onClose={() => setShowModal(false)} />}
      {showPhotoSearch && <PhotoSearchModal onClose={() => setShowPhotoSearch(false)} />}

      {/* ── Header ── */}
      <div style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border-md)', padding: '1.5rem 2rem 1.5rem' }}>
        <div style={{ maxWidth: '1500px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: '1.9rem', color: 'var(--text)', lineHeight: 1.1, marginBottom: '4px' }}>
            My Collection
          </h1>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--text3)', marginBottom: '1.5rem' }}>
            Portfolio-style tracking for your sports cards
          </p>

          {/* Stats bar */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            border: '1px solid var(--border-md)', borderRadius: '10px', overflow: 'hidden',
            background: 'var(--bg2)',
          }}>
            {[
              { label: 'Cost Basis',      value: `$${totalCost.toLocaleString()}`,                                              sub: `${totalCards} cards total`,         subColor: 'var(--text3)',  valColor: 'var(--text)' },
              { label: 'Holding Value',   value: `$${totalValue.toLocaleString()}`,                                             sub: `${totalCards} held`,                subColor: 'var(--text3)',  valColor: 'var(--text)' },
              { label: 'Unrealized P&L',  value: `${unrealizedGL >= 0 ? '+' : ''}$${Math.abs(unrealizedGL).toLocaleString()}`, sub: `▲ open positions`,                   subColor: 'var(--green)', valColor: unrealizedGL >= 0 ? 'var(--green)' : 'var(--red)' },
              { label: 'Realized P&L',    value: '+$0',                                                                        sub: '0 sold',                            subColor: 'var(--text3)',  valColor: 'var(--text)' },
            ].map((s, i) => (
              <div key={s.label} style={{ padding: '1.1rem 1.5rem', borderLeft: i > 0 ? '1px solid var(--border-md)' : 'none' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text3)', marginBottom: '8px' }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: s.valColor, marginBottom: '4px', letterSpacing: '-0.02em' }}>
                  {s.value}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: s.subColor }}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '1.25rem 2rem 3rem' }}>

        {/* ── Toolbar ── */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '0', flexWrap: 'wrap', alignItems: 'center' }}>

          {/* Search with camera icon */}
          <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '220px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search cards, players..."
              style={{
                width: '100%', background: 'var(--bg2)', border: '1px solid var(--border-md)',
                borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: '0.83rem',
                padding: '9px 40px 9px 34px', outline: 'none', boxSizing: 'border-box',
              }}
            />
            <button
              onClick={() => setShowPhotoSearch(true)}
              title="Search by photo"
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', alignItems: 'center', padding: '2px' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--gold2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text3)'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </button>
          </div>

          {/* Set name */}
          <input
            type="text"
            value={setFilter}
            onChange={e => setSetFilter(e.target.value)}
            placeholder="Set name..."
            style={{ background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: '8px', color: 'var(--text2)', fontFamily: 'var(--font-display)', fontSize: '0.82rem', padding: '9px 14px', outline: 'none', width: '130px' }}
          />

          {/* Year */}
          <input
            type="text"
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            placeholder="Year..."
            style={{ background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: '8px', color: 'var(--text2)', fontFamily: 'var(--font-display)', fontSize: '0.82rem', padding: '9px 14px', outline: 'none', width: '90px' }}
          />

          {/* Sport */}
          <select value={sport} onChange={e => setSport(e.target.value)} style={{ background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: '8px', color: sport ? 'var(--text)' : 'var(--text2)', fontFamily: 'var(--font-display)', fontSize: '0.82rem', padding: '9px 12px', outline: 'none', cursor: 'pointer' }}>
            <option value="">All Sports</option>
            {['NBA','NFL','MLB','NHL','Soccer','WNBA','UFC/MMA','Golf'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Grade */}
          <select value={grade} onChange={e => setGrade(e.target.value)} style={{ background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: '8px', color: grade ? 'var(--text)' : 'var(--text2)', fontFamily: 'var(--font-display)', fontSize: '0.82rem', padding: '9px 12px', outline: 'none', cursor: 'pointer' }}>
            <option value="">All Grades</option>
            {['PSA 10','PSA 9','PSA 8','PSA 7','Raw'].map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value as SortKey)} style={{ background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: '8px', color: 'var(--text2)', fontFamily: 'var(--font-display)', fontSize: '0.82rem', padding: '9px 12px', outline: 'none', cursor: 'pointer' }}>
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

          {/* Add */}
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '9px 20px', marginLeft: 'auto',
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
              border: 'none', borderRadius: '8px', color: '#0d1117',
              fontFamily: 'var(--font-display)', fontSize: '0.83rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
            + Add to Collection
          </button>
        </div>

        {/* ── Table ── */}
        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', fontFamily: 'var(--font-mono)', color: 'var(--text3)', fontSize: '0.85rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
              {cards.length === 0 ? 'Your collection is empty — add your first card above.' : 'No cards match your filters.'}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-md)' }}>
                  {COLS.map(col => (
                    <th
                      key={col.key}
                      onClick={() => cycleSort(col.sortA, col.sortD)}
                      style={{
                        padding: '10px 16px', textAlign: 'left',
                        fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        color: 'var(--text3)', fontWeight: 600, whiteSpace: 'nowrap',
                        cursor: col.sortA ? 'pointer' : 'default',
                        userSelect: 'none',
                      }}
                    >
                      {col.label}
                      {col.sortA && (
                        <span style={{ marginLeft: '4px', opacity: sort === col.sortA || sort === col.sortD ? 1 : 0.35 }}>↕</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(card => {
                  const isUp = card.change >= 0
                  const gs   = gradeStyle(card.grade)
                  return (
                    <tr
                      key={card.id}
                      className="table-row"
                      style={{ borderBottom: '1px solid var(--border-sm)', transition: 'background 0.1s' }}
                    >
                      {/* Player */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>
                          {card.player}
                        </div>
                      </td>

                      {/* Card name */}
                      <td style={{ padding: '16px 16px', fontFamily: 'var(--font-display)', fontSize: '0.82rem', color: 'var(--text2)', maxWidth: '260px' }}>
                        {card.cardName}
                      </td>

                      {/* Set / Year */}
                      <td style={{ padding: '16px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: SET_COLOR, fontWeight: 500 }}>
                          {card.setName} · {card.year}
                        </span>
                      </td>

                      {/* Grade */}
                      <td style={{ padding: '16px 16px' }}>
                        <span style={{ padding: '3px 9px', borderRadius: '5px', background: gs.bg, border: `1px solid ${gs.border}`, fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: gs.text, whiteSpace: 'nowrap' }}>
                          {card.grade}
                        </span>
                      </td>

                      {/* Qty */}
                      <td style={{ padding: '16px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text2)', textAlign: 'center' }}>
                        {card.qty}
                      </td>

                      {/* Cost */}
                      <td style={{ padding: '16px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--text2)' }}>
                        ${card.purchasePrice.toLocaleString()}
                      </td>

                      {/* Current Value */}
                      <td style={{ padding: '16px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>
                        ${card.currentValue.toLocaleString()}
                      </td>

                      {/* Gain/Loss */}
                      <td style={{ padding: '16px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.84rem', fontWeight: 600, color: isUp ? 'var(--green)' : 'var(--red)', whiteSpace: 'nowrap' }}>
                        {isUp ? '+' : ''}${card.change.toLocaleString()}
                      </td>

                      {/* % Change */}
                      <td style={{ padding: '16px 16px' }}>
                        <span style={{
                          padding: '3px 9px', borderRadius: '5px',
                          background: isUp ? 'rgba(52,201,122,0.12)' : 'rgba(224,92,92,0.12)',
                          border: `1px solid ${isUp ? 'rgba(52,201,122,0.3)' : 'rgba(224,92,92,0.3)'}`,
                          fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
                          color: isUp ? 'var(--green)' : 'var(--red)', whiteSpace: 'nowrap',
                        }}>
                          {isUp ? '+' : ''}{card.percentChange.toFixed(1)}%
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button style={{
                            padding: '5px 12px',
                            background: 'rgba(52,201,122,0.08)',
                            border: '1px solid rgba(52,201,122,0.25)',
                            borderRadius: '6px',
                            color: 'var(--green)',
                            fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 600,
                            cursor: 'pointer', whiteSpace: 'nowrap',
                          }}>
                            $ Sell
                          </button>
                          <button style={{
                            padding: '5px 8px',
                            background: 'none',
                            border: '1px solid var(--border-md)',
                            borderRadius: '6px',
                            color: 'var(--text3)',
                            fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                            cursor: 'pointer', lineHeight: 1,
                          }}>
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
