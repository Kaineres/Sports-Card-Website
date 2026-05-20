export type Sport = 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'Soccer' | 'WNBA' | 'UFC/MMA' | 'Golf'

export interface CatalogCard {
  id: number
  player: string
  cardName: string
  setName: string
  year: number
  grade: string
  currentValue: number
  percentChange: number
  sport: Sport
}

export const SPORT_META: Record<Sport, { icon: string; color: string }> = {
  NBA:     { icon: '🏀', color: '#f0c96a' },
  NFL:     { icon: '🏈', color: '#34c97a' },
  MLB:     { icon: '⚾', color: '#60a5fa' },
  NHL:     { icon: '🏒', color: '#a78bfa' },
  Soccer:  { icon: '⚽', color: '#34d399' },
  WNBA:    { icon: '🏀', color: '#f0a0a0' },
  'UFC/MMA': { icon: '🥊', color: '#e05c5c' },
  Golf:    { icon: '⛳', color: '#6db87a' },
}

export const BROWSE_CATALOG: CatalogCard[] = [
  { id:1,  player:'Caleb Williams',       cardName:'Base RC',        setName:'Panini Mosaic',     year:2024, grade:'PSA 10', currentValue:285.00,  percentChange:+12.4, sport:'NFL'   },
  { id:2,  player:'Jayden Daniels',       cardName:'Base RC',        setName:'Panini Mosaic',     year:2024, grade:'PSA 10', currentValue:195.00,  percentChange:+22.1, sport:'NFL'   },
  { id:3,  player:'Drake Maye',           cardName:'Base RC',        setName:'Panini Mosaic',     year:2024, grade:'PSA 10', currentValue:175.00,  percentChange:-3.2,  sport:'NFL'   },
  { id:4,  player:'Marvin Harrison Jr',   cardName:'Base RC',        setName:'Panini Mosaic',     year:2024, grade:'PSA 10', currentValue:260.00,  percentChange:+18.4, sport:'NFL'   },
  { id:5,  player:'Brock Bowers',         cardName:'Base RC',        setName:'Panini Mosaic',     year:2024, grade:'PSA 10', currentValue:220.00,  percentChange:+6.5,  sport:'NFL'   },
  { id:6,  player:'Victor Wembanyama',    cardName:'Base RC',        setName:'Panini Prizm',      year:2023, grade:'PSA 10', currentValue:1240.00, percentChange:+8.7,  sport:'NBA'   },
  { id:7,  player:'Chet Holmgren',        cardName:'Base RC',        setName:'Panini Prizm',      year:2022, grade:'PSA 10', currentValue:380.00,  percentChange:-2.1,  sport:'NBA'   },
  { id:8,  player:'Paolo Banchero',       cardName:'Base RC',        setName:'Panini Prizm',      year:2022, grade:'PSA 10', currentValue:310.00,  percentChange:+4.3,  sport:'NBA'   },
  { id:9,  player:'Scoot Henderson',      cardName:'Base RC',        setName:'Panini Prizm',      year:2023, grade:'PSA 10', currentValue:145.00,  percentChange:-6.8,  sport:'NBA'   },
  { id:10, player:'Brandon Miller',       cardName:'Base RC',        setName:'Panini Prizm',      year:2023, grade:'PSA 10', currentValue:120.00,  percentChange:+1.2,  sport:'NBA'   },
  { id:11, player:'Jackson Holliday',     cardName:'Base RC',        setName:'Topps Chrome',      year:2024, grade:'PSA 10', currentValue:320.00,  percentChange:+9.8,  sport:'MLB'   },
  { id:12, player:'Jackson Chourio',      cardName:'Base RC',        setName:'Topps Chrome',      year:2024, grade:'PSA 10', currentValue:280.00,  percentChange:+14.2, sport:'MLB'   },
  { id:13, player:'Yoshinobu Yamamoto',   cardName:'Base RC',        setName:'Topps Chrome',      year:2024, grade:'PSA 10', currentValue:510.00,  percentChange:+4.2,  sport:'MLB'   },
  { id:14, player:'Paul Skenes',          cardName:'Base RC',        setName:'Topps Chrome',      year:2024, grade:'PSA 10', currentValue:445.00,  percentChange:+15.3, sport:'MLB'   },
  { id:15, player:'Wyatt Langford',       cardName:'Base RC',        setName:'Topps Chrome',      year:2024, grade:'PSA 10', currentValue:190.00,  percentChange:+7.6,  sport:'MLB'   },
  { id:16, player:'Connor Bedard',        cardName:'Base RC',        setName:'Upper Deck Series', year:2023, grade:'PSA 10', currentValue:620.00,  percentChange:+11.5, sport:'NHL'   },
  { id:17, player:'Matvei Michkov',       cardName:'Base RC',        setName:'Upper Deck Series', year:2024, grade:'PSA 10', currentValue:380.00,  percentChange:+22.8, sport:'NHL'   },
  { id:18, player:'Caitlin Clark',        cardName:'Base RC',        setName:'Parkside WNBA',     year:2024, grade:'PSA 10', currentValue:890.00,  percentChange:+31.2, sport:'WNBA'  },
  { id:19, player:'Angel Reese',          cardName:'Base RC',        setName:'Parkside WNBA',     year:2024, grade:'PSA 10', currentValue:420.00,  percentChange:+18.6, sport:'WNBA'  },
  { id:20, player:'Erling Haaland',       cardName:'Base',           setName:'Topps Chrome UCL',  year:2023, grade:'PSA 10', currentValue:340.00,  percentChange:+5.9,  sport:'Soccer'},
  { id:21, player:'LeBron James',         cardName:'2003-04 Topps Chrome Rookie', setName:'Topps Chrome', year:2003, grade:'PSA 9',  currentValue:4800.00, percentChange:+50.0, sport:'NBA' },
  { id:22, player:'Patrick Mahomes',      cardName:'2017 Panini Prizm Rookie',   setName:'Panini Prizm', year:2017, grade:'PSA 10', currentValue:2950.00, percentChange:+63.9, sport:'NFL' },
  { id:23, player:'Luka Dončić',         cardName:'2018-19 Prizm Silver RC',    setName:'Panini Prizm', year:2018, grade:'PSA 10', currentValue:780.00,  percentChange:-13.3, sport:'NBA' },
  { id:24, player:'Shohei Ohtani',        cardName:'2018 Topps Chrome RC Refractor', setName:'Topps Chrome', year:2018, grade:'PSA 10', currentValue:1100.00, percentChange:+29.4, sport:'MLB' },
  { id:25, player:'Giannis Antetokounmpo',cardName:'2013-14 Panini Prizm Rookie',setName:'Panini Prizm', year:2013, grade:'PSA 9',  currentValue:1650.00, percentChange:+17.9, sport:'NBA' },
  { id:26, player:'Justin Jefferson',     cardName:'2020 Prizm Rookie Silver',   setName:'Panini Prizm', year:2020, grade:'PSA 9',  currentValue:420.00,  percentChange:+35.5, sport:'NFL' },
  { id:27, player:'Ja Morant',            cardName:'2019-20 Donruss Optic RC',   setName:'Donruss Optic',year:2019, grade:'PSA 10', currentValue:590.00,  percentChange:+22.9, sport:'NBA' },
  { id:28, player:'Mike Trout',           cardName:'2011 Topps Update Rookie',   setName:'Topps Update', year:2011, grade:'PSA 8',  currentValue:740.00,  percentChange:+19.4, sport:'MLB' },
]

export function searchCatalog(q: string, max = 20): CatalogCard[] {
  if (!q.trim()) return []
  const ql = q.toLowerCase()

  const startsWith:  CatalogCard[] = []
  const wordStarts:  CatalogCard[] = []
  const contains:    CatalogCard[] = []
  const cardMatches: CatalogCard[] = []

  for (const c of BROWSE_CATALOG) {
    const pl = c.player.toLowerCase()
    const cl = c.cardName.toLowerCase()
    const sl = c.setName.toLowerCase()
    if (pl.startsWith(ql))                                startsWith.push(c)
    else if (pl.split(' ').some(w => w.startsWith(ql)))   wordStarts.push(c)
    else if (pl.includes(ql))                             contains.push(c)
    else if (cl.includes(ql) || sl.includes(ql) || c.sport.toLowerCase().includes(ql)) cardMatches.push(c)
  }

  return [...startsWith, ...wordStarts, ...contains, ...cardMatches].slice(0, max)
}
