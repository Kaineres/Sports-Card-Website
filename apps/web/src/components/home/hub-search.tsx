'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HubSearch() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/browse?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '560px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'var(--bg2)',
        border: '1px solid var(--border-md)',
        borderRadius: '10px',
        padding: '6px 6px 6px 16px',
        marginBottom: '12px',
        transition: 'border-color 0.15s',
      }}
      onFocus={e => e.currentTarget.style.borderColor = 'var(--gold-border)'}
      onBlur={e => e.currentTarget.style.borderColor = 'var(--border-md)'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search any player, set, or card name..."
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'var(--text)',
            fontFamily: 'var(--font-display)',
            fontSize: '0.88rem',
            lineHeight: 1,
          }}
        />
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

      {/* Photo search */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
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
    </form>
  )
}
