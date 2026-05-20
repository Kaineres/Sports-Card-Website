'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { searchCatalog, SPORT_META, type CatalogCard } from '@/lib/catalog'

function highlight(text: string, q: string) {
  const i = text.toLowerCase().indexOf(q.toLowerCase())
  if (i < 0) return <span>{text}</span>
  return (
    <span>
      {text.slice(0, i)}
      <strong style={{ color: 'var(--gold2)', fontWeight: 700 }}>{text.slice(i, i + q.length)}</strong>
      {text.slice(i + q.length)}
    </span>
  )
}

export default function HubSearch() {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState<CatalogCard[]>([])
  const [open, setOpen]         = useState(false)
  const [focusIdx, setFocusIdx] = useState(-1)
  const router   = useRouter()
  const wrapRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(val: string) {
    setQuery(val)
    setFocusIdx(-1)
    if (!val.trim()) { setResults([]); setOpen(false); return }
    const hits = searchCatalog(val, 20)
    setResults(hits)
    setOpen(hits.length > 0)
  }

  function navigate(q: string) {
    if (!q.trim()) return
    setOpen(false)
    router.push(`/browse?q=${encodeURIComponent(q.trim())}`)
  }

  function pickCard(card: CatalogCard) {
    setQuery(card.player)
    navigate(card.player)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === 'Enter') navigate(query)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusIdx(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (focusIdx >= 0 && results[focusIdx]) pickCard(results[focusIdx])
      else navigate(query)
    } else if (e.key === 'Escape') {
      setOpen(false)
      setFocusIdx(-1)
    }
  }

  /* Close on outside click */
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
        setFocusIdx(-1)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    navigate(query)
  }

  return (
    <div ref={wrapRef} style={{ width: '100%', maxWidth: '560px', position: 'relative' }}>
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'var(--bg2)',
          border: `1px solid ${open ? 'var(--gold-border)' : 'var(--border-md)'}`,
          borderRadius: open && results.length > 0 ? '10px 10px 0 0' : '10px',
          padding: '6px 6px 6px 16px',
          marginBottom: '0',
          transition: 'border-color 0.15s, border-radius 0.1s',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (results.length > 0) setOpen(true) }}
            placeholder="Search any player, set, or card name..."
            autoComplete="off"
            style={{
              flex: 1,
              background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)',
              fontFamily: 'var(--font-display)',
              fontSize: '0.88rem',
              lineHeight: 1,
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResults([]); setOpen(false); inputRef.current?.focus() }}
              style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0 4px', flexShrink: 0 }}
            >×</button>
          )}
          <button type="submit" style={{
            padding: '9px 18px',
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
            border: 'none',
            borderRadius: '7px',
            color: '#0d1117',
            fontFamily: 'var(--font-display)',
            fontSize: '0.83rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            Browse All →
          </button>
        </div>
      </form>

      {/* ── Autocomplete dropdown ── */}
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
          background: 'var(--bg2)',
          border: '1px solid var(--gold-border)',
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          maxHeight: '340px',
          overflowY: 'auto',
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
        }}>
          {results.map((card, i) => {
            const meta  = SPORT_META[card.sport]
            const isUp  = card.percentChange >= 0
            const focus = i === focusIdx
            return (
              <div
                key={card.id}
                onPointerDown={e => { e.preventDefault(); pickCard(card) }}
                onPointerEnter={() => setFocusIdx(i)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: focus ? 'var(--bg3)' : 'transparent',
                  borderBottom: i < results.length - 1 ? '1px solid var(--border-sm)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
              >
                {/* Left: text + inline sport badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  {/* Sport square badge — solid background */}
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0,
                    background: meta.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 800,
                      color: '#0d1117', letterSpacing: '0.03em', lineHeight: 1,
                    }}>{card.sport}</span>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    {/* Player name + inline league pill — solid */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '7px',
                      whiteSpace: 'nowrap', overflow: 'hidden',
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-display)', fontSize: '0.88rem', fontWeight: 700,
                        color: 'var(--text)', lineHeight: 1.3, flexShrink: 1,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {highlight(card.player, query)}
                      </span>
                      <span style={{
                        padding: '2px 7px', borderRadius: '4px', flexShrink: 0,
                        background: meta.color,
                        fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 800,
                        color: '#0d1117', letterSpacing: '0.04em', lineHeight: 1.6,
                      }}>{card.sport}</span>
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--text3)',
                      marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {card.setName} · {card.grade} · {card.year}
                    </div>
                  </div>
                </div>

                {/* Right: price + % avg */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0, marginLeft: '16px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700,
                    color: 'var(--gold2)', letterSpacing: '-0.01em',
                  }}>
                    ${card.currentValue.toLocaleString()}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 600,
                    color: isUp ? 'var(--green)' : 'var(--red)',
                  }}>
                    {isUp ? '+' : ''}{card.percentChange.toFixed(1)}% avg
                  </span>
                </div>
              </div>
            )
          })}

          {/* Footer: view all results */}
          <div
            onPointerDown={e => { e.preventDefault(); navigate(query) }}
            style={{
              padding: '10px 14px',
              borderTop: '1px solid var(--border-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer',
              background: focusIdx === results.length ? 'var(--bg3)' : 'transparent',
              borderRadius: '0 0 12px 12px',
              transition: 'background 0.1s',
            }}
            onPointerEnter={() => setFocusIdx(results.length)}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--text2)', fontWeight: 500 }}>
              View all results for "{query}"
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gold2)' }}>→</span>
          </div>
        </div>
      )}

      {/* No results */}
      {open && query.trim() && results.length === 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
          background: 'var(--bg2)',
          border: '1px solid var(--gold-border)',
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          padding: '14px',
          textAlign: 'center',
          fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text3)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
        }}>
          No matches — try a player or set name
        </div>
      )}

      {/* Photo search */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
        <button type="button" style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          padding: '7px 16px',
          background: 'var(--bg3)',
          border: '1px solid var(--border-md)',
          borderRadius: '8px',
          color: 'var(--text2)',
          fontFamily: 'var(--font-display)',
          fontSize: '0.8rem',
          fontWeight: 500,
          cursor: 'pointer',
          transition: '0.15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-lg)'
          ;(e.currentTarget as HTMLElement).style.color = 'var(--text)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-md)'
          ;(e.currentTarget as HTMLElement).style.color = 'var(--text2)'
        }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
            <circle cx="12" cy="13" r="3"/>
          </svg>
          Search by Photo
        </button>
      </div>
    </div>
  )
}
