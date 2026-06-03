'use client'

import { useEffect, useState } from 'react'
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
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <>
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

        {/* Nav links — desktop only */}
        <ul className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '2px', listStyle: 'none', flex: 1 }}>
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

        {/* Auth — desktop only */}
        <div className="nav-desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
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

        {/* Spacer — mobile only, pushes hamburger to the right */}
        <div className="nav-mobile-spacer" style={{ display: 'none', flex: 1 }} />

        {/* Hamburger button — mobile only */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          style={{
            display: 'none',
            flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            width: '40px', height: '40px',
            background: menuOpen ? 'var(--gold-bg)' : 'none',
            border: '1px solid var(--border-md)',
            borderRadius: '8px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {menuOpen ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="2" y1="2" x2="14" y2="14" stroke="var(--gold2)" strokeWidth="2" strokeLinecap="round"/>
              <line x1="14" y1="2" x2="2" y2="14" stroke="var(--gold2)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
              <line x1="0" y1="1"  x2="18" y2="1"  stroke="var(--gold2)" strokeWidth="2" strokeLinecap="round"/>
              <line x1="0" y1="6.5" x2="18" y2="6.5" stroke="var(--gold2)" strokeWidth="2" strokeLinecap="round"/>
              <line x1="0" y1="12" x2="18" y2="12" stroke="var(--gold2)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="nav-mobile-menu"
          style={{
            position: 'fixed',
            top: 'var(--nav-h)',
            left: 0, right: 0,
            zIndex: 99,
            background: 'rgba(8,8,8,0.98)',
            backdropFilter: 'blur(20px) saturate(1.4)',
            borderBottom: '1px solid var(--border-md)',
            padding: '0.75rem 1.25rem 1.25rem',
            display: 'flex', flexDirection: 'column', gap: '3px',
          }}
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--gold2)' : 'var(--text2)',
                  background: isActive ? 'var(--gold-bg)' : 'none',
                  border: isActive ? '1px solid var(--gold-border)' : '1px solid transparent',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {link.isAI && (
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700, color: 'var(--gold3)',
                    fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
                    border: '1px solid var(--gold-border)', borderRadius: '4px',
                    padding: '1px 4px',
                  }}>AI</span>
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
            )
          })}

          {/* Auth section */}
          <div style={{
            marginTop: '0.5rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-md)',
            display: 'flex', flexDirection: 'column', gap: '8px',
          }}>
            {isSignedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 14px' }}>
                <UserButton />
                <span style={{ fontSize: '0.85rem', color: 'var(--text2)', fontFamily: 'var(--font-display)' }}>
                  My Account
                </span>
              </div>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button style={{
                    padding: '11px 16px',
                    background: 'none',
                    border: '1px solid var(--border-md)',
                    borderRadius: '8px',
                    color: 'var(--text2)',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                    width: '100%',
                  }}>
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button style={{
                    padding: '11px 16px',
                    background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#0d1117',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                    width: '100%',
                  }}>
                    Get Started
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
