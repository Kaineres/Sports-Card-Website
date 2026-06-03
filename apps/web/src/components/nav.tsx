'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { useWatchlist } from '@/lib/watchlist-context'

const NAV_LINKS = [
  { href: '/',           label: 'Home' },
  { href: '/market',     label: 'Market Analysis' },
  { href: '/collection', label: 'Collection' },
  { href: '/watchlist',  label: 'Watchlist', badge: true },
  { href: '/grading',    label: 'AI Grading', isAI: true },
]

export default function Nav() {
  const pathname = usePathname()
  const { isSignedIn } = useUser()
  const { watchedIds } = useWatchlist()

  return (
    <nav
      className="nav-gold-line"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 'var(--nav-h)',
        background: 'rgba(8,8,8,0.97)',
        backdropFilter: 'blur(20px) saturate(1.4)',
        borderBottom: '1px solid var(--border-md)',
        display: 'flex', alignItems: 'center',
        padding: '0 2rem',
        gap: '0',
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: 'flex', alignItems: 'center',
          textDecoration: 'none', marginRight: '2.5rem', flexShrink: 0,
        }}
      >
        <img src="/logo.png" alt="SlabMetrics" style={{ height: '72px', width: 'auto' }} />
      </Link>

      {/* Nav links */}
      <ul style={{ display: 'flex', alignItems: 'center', gap: '2px', listStyle: 'none', flex: 1 }}>
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 13px',
                  borderRadius: '7px',
                  fontSize: '0.83rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--gold2)' : 'var(--text2)',
                  background: isActive ? 'var(--gold-bg)' : 'none',
                  border: isActive ? '1px solid var(--gold-border)' : '1px solid transparent',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.01em',
                  transition: 'color 0.15s, background 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = 'var(--text)'
                    ;(e.currentTarget as HTMLElement).style.background = 'var(--bg3)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = 'var(--text2)'
                    ;(e.currentTarget as HTMLElement).style.background = 'none'
                  }
                }}
              >
                {link.isAI && (
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, color: 'var(--gold3)',
                    fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
                  }}>+</span>
                )}
                {link.label}
                {link.badge && watchedIds.size > 0 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: '18px', height: '18px', borderRadius: '9px',
                    background: 'var(--gold-bg)', border: '1px solid var(--gold-border)',
                    fontSize: '0.6rem', fontWeight: 600, color: 'var(--gold2)',
                    fontFamily: 'var(--font-mono)', padding: '0 5px',
                  }}>
                    {watchedIds.size}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {isSignedIn ? (
          <UserButton />
        ) : (
          <>
            <SignInButton mode="modal">
              <button style={{
                padding: '7px 16px',
                background: 'none',
                border: '1px solid var(--border-md)',
                borderRadius: '7px',
                color: 'var(--text2)',
                fontSize: '0.83rem',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                transition: '0.15s',
              }}>
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button style={{
                padding: '7px 16px',
                background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
                border: 'none',
                borderRadius: '7px',
                color: '#0d1117',
                fontSize: '0.83rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                transition: '0.15s',
              }}>
                Get Started
              </button>
            </SignUpButton>
          </>
        )}
      </div>
    </nav>
  )
}

