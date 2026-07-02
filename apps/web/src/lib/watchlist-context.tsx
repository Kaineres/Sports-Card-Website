'use client'

import {
  createContext, useContext, useState, useEffect, useCallback, useMemo, useRef,
} from 'react'
import { useAuth, useClerk } from '@clerk/nextjs'
import { BROWSE_CATALOG } from './catalog'
import { parseGradeLabel } from './cards/grade'

interface WatchRow { id: string; legacy_catalog_id: number | null }

interface WatchlistCtx {
  watchedIds: Set<number>
  toggle: (id: number) => void
  isWatched: (id: number) => boolean
  loading: boolean
}

const WatchlistContext = createContext<WatchlistCtx>({
  watchedIds: new Set(),
  toggle: () => {},
  isWatched: () => false,
  loading: false,
})

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { redirectToSignIn } = useClerk()
  const [rows, setRows] = useState<WatchRow[]>([])
  const [loading, setLoading] = useState(false)

  // legacy_catalog_id -> row id, for optimistic removal without a refetch.
  const rowByLegacy = useRef<Map<number, string>>(new Map())
  useEffect(() => {
    const m = new Map<number, string>()
    for (const r of rows) if (r.legacy_catalog_id != null) m.set(r.legacy_catalog_id, r.id)
    rowByLegacy.current = m
  }, [rows])

  const watchedIds = useMemo(
    () => new Set(rows.map((r) => r.legacy_catalog_id).filter((x): x is number => x != null)),
    [rows]
  )

  // Load from the server once Clerk is ready and the user is signed in.
  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) { setRows([]); return }
    let active = true
    setLoading(true)
    fetch('/api/watchlist')
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => {
        if (!active) return
        setRows((d.items ?? []).map((i: { id: string; legacy_catalog_id: number | null }) => ({
          id: i.id, legacy_catalog_id: i.legacy_catalog_id,
        })))
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [isLoaded, isSignedIn])

  const isWatched = useCallback((id: number) => watchedIds.has(id), [watchedIds])

  const toggle = useCallback((id: number) => {
    // Clerk's isSignedIn is falsy until isLoaded — don't redirect an
    // already-authenticated user to sign-in during that hydration window.
    if (!isLoaded) return
    if (!isSignedIn) { redirectToSignIn(); return }

    const existingRowId = rowByLegacy.current.get(id)
    if (existingRowId) {
      // Optimistic remove, revert on failure.
      setRows((prev) => prev.filter((r) => r.id !== existingRowId))
      fetch(`/api/watchlist/${existingRowId}`, { method: 'DELETE' })
        .then((r) => { if (!r.ok) throw new Error('delete failed') })
        .catch(() => {
          setRows((prev) =>
            prev.some((r) => r.id === existingRowId)
              ? prev
              : [...prev, { id: existingRowId, legacy_catalog_id: id }]
          )
        })
      return
    }

    const card = BROWSE_CATALOG.find((c) => c.id === id)
    if (!card) return
    const tempId = `temp-${id}`
    // Optimistic add.
    setRows((prev) => [...prev, { id: tempId, legacy_catalog_id: id }])

    const { grading_service, grade } = parseGradeLabel(card.grade)
    const payload = {
      legacy_catalog_id: id,
      player: card.player,
      card_name: card.cardName,
      set_name: card.setName,
      year: card.year,
      sport: card.sport,
      grading_service,
      grade,
    }
    fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('add failed'))))
      .then((d) => {
        setRows((prev) => prev.map((r) => (r.id === tempId ? { id: d.item.id, legacy_catalog_id: id } : r)))
      })
      .catch(() => {
        setRows((prev) => prev.filter((r) => r.id !== tempId))
      })
  }, [isLoaded, isSignedIn, redirectToSignIn])

  return (
    <WatchlistContext.Provider value={{ watchedIds, toggle, isWatched, loading }}>
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist() {
  return useContext(WatchlistContext)
}
