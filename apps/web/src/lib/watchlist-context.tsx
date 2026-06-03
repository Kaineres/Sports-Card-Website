'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const LS_KEY = 'slabmetrics_watchlist'
const SEED_IDS = [101, 102, 103, 104, 105]

interface WatchlistCtx {
  watchedIds: Set<number>
  toggle: (id: number) => void
  isWatched: (id: number) => boolean
}

const WatchlistContext = createContext<WatchlistCtx>({
  watchedIds: new Set(),
  toggle: () => {},
  isWatched: () => false,
})

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchedIds, setWatchedIds] = useState<Set<number>>(() => new Set(SEED_IDS))
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) setWatchedIds(new Set(JSON.parse(saved) as number[]))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(LS_KEY, JSON.stringify([...watchedIds]))
    } catch {}
  }, [watchedIds, hydrated])

  const toggle = useCallback((id: number) => {
    setWatchedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const isWatched = useCallback((id: number) => watchedIds.has(id), [watchedIds])

  return (
    <WatchlistContext.Provider value={{ watchedIds, toggle, isWatched }}>
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist() {
  return useContext(WatchlistContext)
}
