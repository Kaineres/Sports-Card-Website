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
  const [query, setQuery]         = useState('')
  const [results, setResults]     = useState<CatalogCard[]>([])
  const [open, setOpen]           = useState(false)
  const [focusIdx, setFocusIdx]   = useState(-1)
  const [photoModal, setPhotoModal] = useState(false)
  const [dragOver, setDragOver]   = useState(false)
  const router    = useRouter()
  const wrapRef   = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)
  const photoRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setPhotoModal(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

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
    setOpen(false)
    router.push(`/player/${encodeURIComponent(card.player)}`)
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
    <div ref={wrapRef} style={{ width: '100%', maxWidth: '560px' }}>
      <div style={{ position: 'relative' }}>
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
                {/* Left: circular sport badge + player info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                    background: meta.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 800,
                      color: '#fff', letterSpacing: '0.03em', lineHeight: 1,
                    }}>{card.sport}</span>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{
                        fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700,
                        color: 'var(--text)', lineHeight: 1.3,
                      }}>
                        {highlight(card.player, query)}
                      </span>
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text3)',
                      marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {card.grade} · {card.setName} · {card.year}
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

      </div>{/* end position:relative inner wrapper */}

      {/* Photo search trigger */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
        <button
          type="button"
          onClick={() => setPhotoModal(true)}
          style={{
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
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-border)'
            ;(e.currentTarget as HTMLElement).style.color = 'var(--text)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-md)'
            ;(e.currentTarget as HTMLElement).style.color = 'var(--text2)'
          }}
        >
          <CameraIcon size={14} />
          Search by Photo
        </button>
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
            {/* Header */}
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

            {/* Drop zone */}
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
              <DropCameraIcon />
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '1rem', color: 'var(--text)',
              }}>
                Drop a card photo here
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.69rem', color: 'var(--text3)',
              }}>
                JPG, PNG, WEBP — or click to browse
              </div>
              <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} />
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-md)' }} />
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text3)',
                letterSpacing: '0.14em', textTransform: 'uppercase', whiteSpace: 'nowrap',
              }}>OR USE CAMERA</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-md)' }} />
            </div>

            {/* Use Camera button */}
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
              <CameraIcon size={16} />
              Use Camera
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CameraIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
  )
}

function DropCameraIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hat brim */}
      <rect x="14" y="14" width="24" height="3" rx="1.5" fill="rgba(184,146,46,0.6)"/>
      {/* Hat top */}
      <rect x="19" y="7" width="14" height="8" rx="2" fill="rgba(184,146,46,0.5)"/>
      {/* Camera body */}
      <rect x="8" y="22" width="36" height="24" rx="4" fill="none" stroke="rgba(184,146,46,0.7)" strokeWidth="2"/>
      {/* Lens ring */}
      <circle cx="26" cy="34" r="8" fill="none" stroke="rgba(184,146,46,0.7)" strokeWidth="2"/>
      {/* Lens inner */}
      <circle cx="26" cy="34" r="4" fill="rgba(184,146,46,0.25)"/>
      {/* Viewfinder bump */}
      <rect x="20" y="19" width="6" height="4" rx="1.5" fill="rgba(184,146,46,0.5)"/>
      {/* Flash dot */}
      <circle cx="38" cy="27" r="2" fill="rgba(184,146,46,0.5)"/>
    </svg>
  )
}
