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
  NBA:       { icon: '🏀', color: '#d4a843' },
  NFL:       { icon: '🏈', color: '#c9a84c' },
  MLB:       { icon: '⚾', color: '#34c97a' },
  NHL:       { icon: '🏒', color: '#7eb8e8' },
  Soccer:    { icon: '⚽', color: '#a88be0' },
  WNBA:      { icon: '🏀', color: '#e07a5b' },
  'UFC/MMA': { icon: '🥊', color: '#e05c5c' },
  Golf:      { icon: '⛳', color: '#6db87a' },
}

export const BROWSE_CATALOG: CatalogCard[] = [
  // ── NBA ──
  { id:1,   player:'LeBron James',            cardName:'2003-04 Topps Chrome Rookie',               setName:'Topps Chrome',          year:2003, grade:'PSA 9',  currentValue:4800,   percentChange:+50.0, sport:'NBA' },
  { id:2,   player:'LeBron James',            cardName:'2003-04 Topps Chrome Rookie',               setName:'Topps Chrome',          year:2003, grade:'PSA 10', currentValue:14500,  percentChange:+62.0, sport:'NBA' },
  { id:3,   player:'LeBron James',            cardName:'2003-04 Topps Chrome Rookie',               setName:'Topps Chrome',          year:2003, grade:'PSA 8',  currentValue:2200,   percentChange:+31.0, sport:'NBA' },
  { id:4,   player:'LeBron James',            cardName:'2003-04 Upper Deck Rookie Exclusives',      setName:'Upper Deck',            year:2003, grade:'PSA 9',  currentValue:890,    percentChange:+18.5, sport:'NBA' },
  { id:5,   player:'LeBron James',            cardName:'2003-04 SP Authentic RC Patch Auto /100',   setName:'SP Authentic',          year:2003, grade:'PSA 8',  currentValue:32000,  percentChange:+44.2, sport:'NBA' },
  { id:6,   player:'LeBron James',            cardName:'2004-05 Bowman Chrome Refractor',           setName:'Bowman Chrome',         year:2004, grade:'PSA 10', currentValue:3200,   percentChange:+27.3, sport:'NBA' },
  { id:7,   player:'LeBron James',            cardName:'2012-13 Panini Prizm',                      setName:'Panini Prizm',          year:2012, grade:'PSA 10', currentValue:1100,   percentChange:+14.8, sport:'NBA' },
  { id:8,   player:'Luka Dončić',            cardName:'2018-19 Panini Prizm Silver Rookie',         setName:'Panini Prizm',          year:2018, grade:'PSA 10', currentValue:780,    percentChange:-13.3, sport:'NBA' },
  { id:9,   player:'Luka Dončić',            cardName:'2018-19 Panini Prizm Silver Rookie',         setName:'Panini Prizm',          year:2018, grade:'PSA 9',  currentValue:320,    percentChange:-8.1,  sport:'NBA' },
  { id:10,  player:'Luka Dončić',            cardName:'2018-19 Donruss Optic Rated Rookie',         setName:'Donruss Optic',         year:2018, grade:'PSA 10', currentValue:490,    percentChange:-10.5, sport:'NBA' },
  { id:11,  player:'Luka Dončić',            cardName:'2018-19 Select RC Concourse',                setName:'Panini Select',         year:2018, grade:'PSA 10', currentValue:380,    percentChange:-5.2,  sport:'NBA' },
  { id:12,  player:'Luka Dončić',            cardName:'2018-19 Prizm Gold Rookie /10',              setName:'Panini Prizm',          year:2018, grade:'PSA 9',  currentValue:4200,   percentChange:-18.4, sport:'NBA' },
  { id:13,  player:'Ja Morant',              cardName:'2019-20 Donruss Optic Rated Rookie',         setName:'Donruss Optic',         year:2019, grade:'PSA 10', currentValue:590,    percentChange:+22.9, sport:'NBA' },
  { id:14,  player:'Ja Morant',              cardName:'2019-20 Panini Prizm Rookie',                setName:'Panini Prizm',          year:2019, grade:'PSA 10', currentValue:420,    percentChange:+15.4, sport:'NBA' },
  { id:15,  player:'Ja Morant',              cardName:'2019-20 Select RC Concourse',                setName:'Panini Select',         year:2019, grade:'PSA 9',  currentValue:195,    percentChange:+9.8,  sport:'NBA' },
  { id:16,  player:'Ja Morant',              cardName:'2019-20 Hoops Premium Stock Rookie',         setName:'Panini Hoops',          year:2019, grade:'PSA 10', currentValue:145,    percentChange:+6.1,  sport:'NBA' },
  { id:17,  player:'Giannis Antetokounmpo',  cardName:'2013-14 Panini Prizm Rookie',                setName:'Panini Prizm',          year:2013, grade:'PSA 9',  currentValue:1650,   percentChange:+17.9, sport:'NBA' },
  { id:18,  player:'Giannis Antetokounmpo',  cardName:'2013-14 Panini Prizm Rookie',                setName:'Panini Prizm',          year:2013, grade:'PSA 10', currentValue:4800,   percentChange:+29.4, sport:'NBA' },
  { id:19,  player:'Giannis Antetokounmpo',  cardName:'2013-14 Panini Rookie Auto',                 setName:'Panini',                year:2013, grade:'PSA 9',  currentValue:2200,   percentChange:+21.2, sport:'NBA' },
  { id:20,  player:'Giannis Antetokounmpo',  cardName:'2016-17 Panini Prizm',                       setName:'Panini Prizm',          year:2016, grade:'PSA 10', currentValue:640,    percentChange:+11.5, sport:'NBA' },
  { id:21,  player:'Victor Wembanyama',      cardName:'2023-24 Topps Chrome RC Auto',               setName:'Topps Chrome',          year:2023, grade:'PSA 10', currentValue:3400,   percentChange:+28.4, sport:'NBA' },
  { id:22,  player:'Victor Wembanyama',      cardName:'2023-24 Panini Prizm Rookie',                setName:'Panini Prizm',          year:2023, grade:'PSA 10', currentValue:1800,   percentChange:+22.0, sport:'NBA' },
  { id:23,  player:'Victor Wembanyama',      cardName:'2023-24 Donruss Optic Rated Rookie',         setName:'Donruss Optic',         year:2023, grade:'PSA 10', currentValue:950,    percentChange:+18.6, sport:'NBA' },
  { id:24,  player:'Victor Wembanyama',      cardName:'2023-24 Select RC Concourse Silver',         setName:'Panini Select',         year:2023, grade:'PSA 10', currentValue:1240,   percentChange:+24.3, sport:'NBA' },
  { id:25,  player:'Victor Wembanyama',      cardName:'2023-24 Prizm Gold Rookie /10',              setName:'Panini Prizm',          year:2023, grade:'PSA 9',  currentValue:12000,  percentChange:+35.1, sport:'NBA' },
  { id:26,  player:'Stephen Curry',          cardName:'2009-10 Panini Prizm Rookie',                setName:'Panini Prizm',          year:2009, grade:'PSA 9',  currentValue:2100,   percentChange:+9.2,  sport:'NBA' },
  { id:27,  player:'Stephen Curry',          cardName:'2009-10 Panini Prizm Rookie',                setName:'Panini Prizm',          year:2009, grade:'PSA 10', currentValue:6800,   percentChange:+14.5, sport:'NBA' },
  { id:28,  player:'Stephen Curry',          cardName:'2009-10 Topps Chrome Rookie',                setName:'Topps Chrome',          year:2009, grade:'PSA 9',  currentValue:1450,   percentChange:+7.4,  sport:'NBA' },
  { id:29,  player:'Stephen Curry',          cardName:'2009-10 SP Authentic Rookie Auto',           setName:'SP Authentic',          year:2009, grade:'PSA 8',  currentValue:4200,   percentChange:+11.8, sport:'NBA' },
  { id:30,  player:'Stephen Curry',          cardName:'2013-14 Panini Prizm Gold /10',              setName:'Panini Prizm',          year:2013, grade:'PSA 9',  currentValue:8900,   percentChange:+16.2, sport:'NBA' },
  { id:31,  player:'Kevin Durant',           cardName:'2007-08 Topps Chrome Rookie Refractor',      setName:'Topps Chrome',          year:2007, grade:'PSA 8',  currentValue:880,    percentChange:+6.4,  sport:'NBA' },
  { id:32,  player:'Kevin Durant',           cardName:'2007-08 Topps Chrome Rookie Refractor',      setName:'Topps Chrome',          year:2007, grade:'PSA 9',  currentValue:1650,   percentChange:+9.8,  sport:'NBA' },
  { id:33,  player:'Kevin Durant',           cardName:'2007-08 SP Authentic Rookie Auto',           setName:'SP Authentic',          year:2007, grade:'PSA 9',  currentValue:3100,   percentChange:+12.3, sport:'NBA' },
  { id:34,  player:'Kevin Durant',           cardName:'2007-08 Bowman Chrome Rookie',               setName:'Bowman Chrome',         year:2007, grade:'PSA 10', currentValue:940,    percentChange:+8.1,  sport:'NBA' },
  { id:35,  player:'Nikola Jokić',          cardName:'2015-16 Panini Prizm Rookie Silver',          setName:'Panini Prizm',          year:2015, grade:'PSA 10', currentValue:1420,   percentChange:+31.5, sport:'NBA' },
  { id:36,  player:'Nikola Jokić',          cardName:'2015-16 Panini Prizm Rookie Silver',          setName:'Panini Prizm',          year:2015, grade:'PSA 9',  currentValue:620,    percentChange:+18.2, sport:'NBA' },
  { id:37,  player:'Nikola Jokić',          cardName:'2015-16 Donruss Rookie',                      setName:'Panini Donruss',        year:2015, grade:'PSA 10', currentValue:340,    percentChange:+14.7, sport:'NBA' },
  { id:38,  player:'Nikola Jokić',          cardName:'2015-16 Prizm Gold Rookie /10',               setName:'Panini Prizm',          year:2015, grade:'PSA 8',  currentValue:4800,   percentChange:+38.4, sport:'NBA' },

  // ── NFL ──
  { id:39,  player:'Patrick Mahomes',        cardName:'2017 Panini Prizm Rookie',                   setName:'Panini Prizm',          year:2017, grade:'PSA 10', currentValue:2950,   percentChange:+63.9, sport:'NFL' },
  { id:40,  player:'Patrick Mahomes',        cardName:'2017 Panini Prizm Rookie',                   setName:'Panini Prizm',          year:2017, grade:'PSA 9',  currentValue:1100,   percentChange:+38.2, sport:'NFL' },
  { id:41,  player:'Patrick Mahomes',        cardName:'2017 Panini Prizm Rookie Auto',              setName:'Panini Prizm',          year:2017, grade:'PSA 10', currentValue:8800,   percentChange:+72.4, sport:'NFL' },
  { id:42,  player:'Patrick Mahomes',        cardName:'2017 Donruss Optic Rated Rookie',            setName:'Donruss Optic',         year:2017, grade:'PSA 10', currentValue:1650,   percentChange:+51.3, sport:'NFL' },
  { id:43,  player:'Patrick Mahomes',        cardName:'2017 Select RC Concourse',                   setName:'Panini Select',         year:2017, grade:'PSA 10', currentValue:1240,   percentChange:+44.8, sport:'NFL' },
  { id:44,  player:'Patrick Mahomes',        cardName:'2017 Prizm Gold /10',                        setName:'Panini Prizm',          year:2017, grade:'PSA 9',  currentValue:18500,  percentChange:+88.2, sport:'NFL' },
  { id:45,  player:'Justin Jefferson',       cardName:'2020 Panini Prizm Rookie Silver',            setName:'Panini Prizm',          year:2020, grade:'PSA 9',  currentValue:420,    percentChange:+35.5, sport:'NFL' },
  { id:46,  player:'Justin Jefferson',       cardName:'2020 Panini Prizm Rookie Silver',            setName:'Panini Prizm',          year:2020, grade:'PSA 10', currentValue:980,    percentChange:+42.6, sport:'NFL' },
  { id:47,  player:'Justin Jefferson',       cardName:'2020 Donruss Optic Rated Rookie',            setName:'Donruss Optic',         year:2020, grade:'PSA 10', currentValue:310,    percentChange:+28.4, sport:'NFL' },
  { id:48,  player:'Justin Jefferson',       cardName:'2020 Select RC Concourse Gold',              setName:'Panini Select',         year:2020, grade:'PSA 9',  currentValue:240,    percentChange:+22.1, sport:'NFL' },
  { id:49,  player:'Joe Burrow',             cardName:'2020 Panini Prizm Rookie Auto',              setName:'Panini Prizm',          year:2020, grade:'PSA 10', currentValue:890,    percentChange:+18.2, sport:'NFL' },
  { id:50,  player:'Joe Burrow',             cardName:'2020 Panini Prizm Rookie',                   setName:'Panini Prizm',          year:2020, grade:'PSA 10', currentValue:440,    percentChange:+12.8, sport:'NFL' },
  { id:51,  player:'Joe Burrow',             cardName:'2020 Select RC National Treasures Auto /99', setName:'National Treasures',    year:2020, grade:'PSA 9',  currentValue:3400,   percentChange:+24.6, sport:'NFL' },
  { id:52,  player:'Joe Burrow',             cardName:'2020 Donruss Optic Rated Rookie',            setName:'Donruss Optic',         year:2020, grade:'PSA 10', currentValue:320,    percentChange:+9.4,  sport:'NFL' },
  { id:53,  player:"Ja'Marr Chase",          cardName:'2021 Panini Select Rookie',                  setName:'Panini Select',         year:2021, grade:'PSA 10', currentValue:560,    percentChange:+24.1, sport:'NFL' },
  { id:54,  player:"Ja'Marr Chase",          cardName:'2021 Panini Prizm Rookie',                   setName:'Panini Prizm',          year:2021, grade:'PSA 10', currentValue:480,    percentChange:+20.8, sport:'NFL' },
  { id:55,  player:"Ja'Marr Chase",          cardName:'2021 Donruss Optic Rated Rookie',            setName:'Donruss Optic',         year:2021, grade:'PSA 10', currentValue:280,    percentChange:+14.2, sport:'NFL' },
  { id:56,  player:'Tom Brady',              cardName:'2000 Playoff Contenders Rookie Auto',        setName:'Playoff Contenders',    year:2000, grade:'PSA 8',  currentValue:18500,  percentChange:+5.3,  sport:'NFL' },
  { id:57,  player:'Tom Brady',              cardName:'2000 Playoff Contenders Rookie Auto',        setName:'Playoff Contenders',    year:2000, grade:'PSA 9',  currentValue:48000,  percentChange:+8.1,  sport:'NFL' },
  { id:58,  player:'Tom Brady',              cardName:'2000 Bowman Chrome Rookie',                  setName:'Bowman Chrome',         year:2000, grade:'PSA 9',  currentValue:6200,   percentChange:+6.4,  sport:'NFL' },
  { id:59,  player:'Tom Brady',              cardName:'2000 Topps Chrome Rookie',                   setName:'Topps Chrome',          year:2000, grade:'PSA 8',  currentValue:3800,   percentChange:+4.9,  sport:'NFL' },
  { id:60,  player:'Tom Brady',              cardName:'2001 SP Authentic Chirography Auto',         setName:'SP Authentic',          year:2001, grade:'PSA 8',  currentValue:9200,   percentChange:+7.2,  sport:'NFL' },
  { id:61,  player:'Caleb Williams',         cardName:'2024 Panini Prizm Draft Picks RC',           setName:'Panini Prizm',          year:2024, grade:'Raw',    currentValue:180,    percentChange:-8.1,  sport:'NFL' },
  { id:62,  player:'Caleb Williams',         cardName:'2024 Panini Prizm Draft Picks RC',           setName:'Panini Prizm',          year:2024, grade:'PSA 9',  currentValue:420,    percentChange:-4.2,  sport:'NFL' },
  { id:63,  player:'Caleb Williams',         cardName:'2024 Donruss Optic Rated Rookie',            setName:'Donruss Optic',         year:2024, grade:'PSA 10', currentValue:310,    percentChange:-6.5,  sport:'NFL' },

  // ── MLB ──
  { id:64,  player:'Mike Trout',             cardName:'2011 Topps Update Rookie',                   setName:'Topps Update',          year:2011, grade:'PSA 8',  currentValue:740,    percentChange:+19.4, sport:'MLB' },
  { id:65,  player:'Mike Trout',             cardName:'2011 Topps Update Rookie',                   setName:'Topps Update',          year:2011, grade:'PSA 9',  currentValue:1650,   percentChange:+24.8, sport:'MLB' },
  { id:66,  player:'Mike Trout',             cardName:'2011 Topps Update Rookie',                   setName:'Topps Update',          year:2011, grade:'PSA 10', currentValue:5800,   percentChange:+38.2, sport:'MLB' },
  { id:67,  player:'Mike Trout',             cardName:'2009 Bowman Chrome Prospect Auto',           setName:'Bowman Chrome',         year:2009, grade:'PSA 9',  currentValue:4200,   percentChange:+32.1, sport:'MLB' },
  { id:68,  player:'Mike Trout',             cardName:'2011 Topps Chrome Rookie',                   setName:'Topps Chrome',          year:2011, grade:'PSA 10', currentValue:2100,   percentChange:+28.4, sport:'MLB' },
  { id:69,  player:'Mike Trout',             cardName:'2012 Topps Triple Threads Auto /18',         setName:'Topps Triple Threads',  year:2012, grade:'PSA 9',  currentValue:6800,   percentChange:+21.5, sport:'MLB' },
  { id:70,  player:'Shohei Ohtani',          cardName:'2018 Topps Chrome Rookie Refractor',         setName:'Topps Chrome',          year:2018, grade:'PSA 10', currentValue:1100,   percentChange:+29.4, sport:'MLB' },
  { id:71,  player:'Shohei Ohtani',          cardName:'2018 Topps Chrome Rookie Refractor',         setName:'Topps Chrome',          year:2018, grade:'PSA 9',  currentValue:480,    percentChange:+18.6, sport:'MLB' },
  { id:72,  player:'Shohei Ohtani',          cardName:'2018 Topps Update Rookie',                   setName:'Topps Update',          year:2018, grade:'PSA 10', currentValue:640,    percentChange:+22.3, sport:'MLB' },
  { id:73,  player:'Shohei Ohtani',          cardName:'2018 Bowman Chrome Rookie Auto',             setName:'Bowman Chrome',         year:2018, grade:'PSA 9',  currentValue:3400,   percentChange:+34.8, sport:'MLB' },
  { id:74,  player:'Shohei Ohtani',          cardName:'2018 Topps Finest Rookie Auto',              setName:'Topps Finest',          year:2018, grade:'PSA 10', currentValue:2800,   percentChange:+31.2, sport:'MLB' },
  { id:75,  player:'Fernando Tatis Jr.',     cardName:'2019 Bowman Chrome Auto',                    setName:'Bowman Chrome',         year:2019, grade:'PSA 10', currentValue:640,    percentChange:+12.0, sport:'MLB' },
  { id:76,  player:'Fernando Tatis Jr.',     cardName:'2019 Bowman Chrome Auto',                    setName:'Bowman Chrome',         year:2019, grade:'PSA 9',  currentValue:280,    percentChange:+7.4,  sport:'MLB' },
  { id:77,  player:'Fernando Tatis Jr.',     cardName:'2019 Topps Chrome Rookie',                   setName:'Topps Chrome',          year:2019, grade:'PSA 10', currentValue:420,    percentChange:+10.2, sport:'MLB' },
  { id:78,  player:'Ronald Acuña Jr.',       cardName:'2018 Topps Chrome Rookie Auto',              setName:'Topps Chrome',          year:2018, grade:'PSA 9',  currentValue:480,    percentChange:+8.8,  sport:'MLB' },
  { id:79,  player:'Ronald Acuña Jr.',       cardName:'2018 Topps Chrome Rookie Auto',              setName:'Topps Chrome',          year:2018, grade:'PSA 10', currentValue:1100,   percentChange:+14.5, sport:'MLB' },
  { id:80,  player:'Ronald Acuña Jr.',       cardName:'2018 Topps Update Rookie',                   setName:'Topps Update',          year:2018, grade:'PSA 10', currentValue:320,    percentChange:+9.1,  sport:'MLB' },
  { id:81,  player:'Mickey Mantle',          cardName:'1952 Topps',                                 setName:'Topps',                 year:1952, grade:'PSA 7',  currentValue:85000,  percentChange:+3.1,  sport:'MLB' },
  { id:82,  player:'Mickey Mantle',          cardName:'1952 Topps',                                 setName:'Topps',                 year:1952, grade:'PSA 5',  currentValue:28000,  percentChange:+2.4,  sport:'MLB' },
  { id:83,  player:'Mickey Mantle',          cardName:'1954 Topps',                                 setName:'Topps',                 year:1954, grade:'PSA 7',  currentValue:12000,  percentChange:+2.8,  sport:'MLB' },
  { id:84,  player:'Mickey Mantle',          cardName:'1956 Topps',                                 setName:'Topps',                 year:1956, grade:'PSA 8',  currentValue:9800,   percentChange:+3.4,  sport:'MLB' },
  { id:85,  player:'Mickey Mantle',          cardName:'1958 Topps',                                 setName:'Topps',                 year:1958, grade:'PSA 8',  currentValue:4200,   percentChange:+2.1,  sport:'MLB' },

  // ── NHL ──
  { id:86,  player:'Connor McDavid',         cardName:'2015-16 Upper Deck Young Guns Rookie',       setName:'Upper Deck',            year:2015, grade:'PSA 10', currentValue:2400,   percentChange:+22.7, sport:'NHL' },
  { id:87,  player:'Connor McDavid',         cardName:'2015-16 Upper Deck Young Guns Rookie',       setName:'Upper Deck',            year:2015, grade:'PSA 9',  currentValue:980,    percentChange:+14.8, sport:'NHL' },
  { id:88,  player:'Connor McDavid',         cardName:'2015-16 The Cup Rookie Auto /249',           setName:'Upper Deck The Cup',    year:2015, grade:'PSA 9',  currentValue:8200,   percentChange:+31.4, sport:'NHL' },
  { id:89,  player:'Connor McDavid',         cardName:'2015-16 SP Authentic Rookie Auto',           setName:'SP Authentic',          year:2015, grade:'PSA 10', currentValue:4100,   percentChange:+26.8, sport:'NHL' },
  { id:90,  player:'Sidney Crosby',          cardName:'2005-06 Upper Deck Young Guns Rookie',       setName:'Upper Deck',            year:2005, grade:'PSA 9',  currentValue:1800,   percentChange:+11.2, sport:'NHL' },
  { id:91,  player:'Sidney Crosby',          cardName:'2005-06 Upper Deck Young Guns Rookie',       setName:'Upper Deck',            year:2005, grade:'PSA 10', currentValue:6200,   percentChange:+16.8, sport:'NHL' },
  { id:92,  player:'Sidney Crosby',          cardName:'2005-06 The Cup Rookie Auto /99',            setName:'Upper Deck The Cup',    year:2005, grade:'PSA 8',  currentValue:12000,  percentChange:+9.4,  sport:'NHL' },
  { id:93,  player:'Sidney Crosby',          cardName:'2005-06 SP Authentic Rookie Auto',           setName:'SP Authentic',          year:2005, grade:'PSA 9',  currentValue:3800,   percentChange:+13.2, sport:'NHL' },
  { id:94,  player:'Nathan MacKinnon',       cardName:'2013-14 Upper Deck Young Guns Rookie',       setName:'Upper Deck',            year:2013, grade:'PSA 9',  currentValue:980,    percentChange:+16.4, sport:'NHL' },
  { id:95,  player:'Nathan MacKinnon',       cardName:'2013-14 Upper Deck Young Guns Rookie',       setName:'Upper Deck',            year:2013, grade:'PSA 10', currentValue:3200,   percentChange:+24.1, sport:'NHL' },
  { id:96,  player:'Nathan MacKinnon',       cardName:'2013-14 SP Authentic Rookie Auto',           setName:'SP Authentic',          year:2013, grade:'PSA 9',  currentValue:2100,   percentChange:+19.8, sport:'NHL' },
  { id:97,  player:'Auston Matthews',        cardName:'2016-17 Upper Deck Young Guns Rookie',       setName:'Upper Deck',            year:2016, grade:'PSA 10', currentValue:1150,   percentChange:+19.0, sport:'NHL' },
  { id:98,  player:'Auston Matthews',        cardName:'2016-17 Upper Deck Young Guns Rookie',       setName:'Upper Deck',            year:2016, grade:'PSA 9',  currentValue:480,    percentChange:+12.6, sport:'NHL' },
  { id:99,  player:'Auston Matthews',        cardName:'2016-17 The Cup Rookie Auto /249',           setName:'Upper Deck The Cup',    year:2016, grade:'PSA 9',  currentValue:4800,   percentChange:+28.4, sport:'NHL' },

  // ── Soccer ──
  { id:100, player:'Lionel Messi',           cardName:'2004-05 Panini Rookie Card',                 setName:'Panini',                year:2004, grade:'PSA 8',  currentValue:7200,   percentChange:+14.5, sport:'Soccer' },
  { id:101, player:'Lionel Messi',           cardName:'2004-05 Panini Rookie Card',                 setName:'Panini',                year:2004, grade:'PSA 9',  currentValue:18500,  percentChange:+21.8, sport:'Soccer' },
  { id:102, player:'Lionel Messi',           cardName:'2018 Topps Chrome UCC',                      setName:'Topps Chrome',          year:2018, grade:'PSA 10', currentValue:2400,   percentChange:+18.2, sport:'Soccer' },
  { id:103, player:'Lionel Messi',           cardName:'2022 Topps Chrome World Cup Prizm',          setName:'Topps Chrome',          year:2022, grade:'PSA 10', currentValue:1800,   percentChange:+24.6, sport:'Soccer' },
  { id:104, player:'Lionel Messi',           cardName:'2014 Panini Prizm World Cup',                setName:'Panini Prizm',          year:2014, grade:'PSA 9',  currentValue:3200,   percentChange:+16.8, sport:'Soccer' },
  { id:105, player:'Cristiano Ronaldo',      cardName:'2003-04 Futera Unique Rookie',               setName:'Futera Unique',         year:2003, grade:'PSA 7',  currentValue:4100,   percentChange:+9.8,  sport:'Soccer' },
  { id:106, player:'Cristiano Ronaldo',      cardName:'2003-04 Futera Unique Rookie',               setName:'Futera Unique',         year:2003, grade:'PSA 8',  currentValue:9800,   percentChange:+12.4, sport:'Soccer' },
  { id:107, player:'Cristiano Ronaldo',      cardName:'2018 Topps Chrome UCC',                      setName:'Topps Chrome',          year:2018, grade:'PSA 10', currentValue:1850,   percentChange:+14.2, sport:'Soccer' },
  { id:108, player:'Cristiano Ronaldo',      cardName:'2022 Topps Chrome World Cup Prizm',          setName:'Topps Chrome',          year:2022, grade:'PSA 10', currentValue:1400,   percentChange:+18.9, sport:'Soccer' },
  { id:109, player:'Erling Haaland',         cardName:'2019 Topps Chrome UCC Rookie Auto',          setName:'Topps Chrome',          year:2019, grade:'PSA 10', currentValue:1850,   percentChange:+38.2, sport:'Soccer' },
  { id:110, player:'Erling Haaland',         cardName:'2019 Topps Chrome UCC Rookie',               setName:'Topps Chrome',          year:2019, grade:'PSA 9',  currentValue:680,    percentChange:+24.4, sport:'Soccer' },
  { id:111, player:'Erling Haaland',         cardName:'2022 Topps Chrome Bundesliga Rookie',        setName:'Topps Chrome',          year:2022, grade:'PSA 10', currentValue:440,    percentChange:+18.6, sport:'Soccer' },

  // ── WNBA ──
  { id:112, player:'Caitlin Clark',          cardName:'2024 Rittenhouse WNBA Rookie',               setName:'Rittenhouse',           year:2024, grade:'PSA 10', currentValue:1200,   percentChange:+41.2, sport:'WNBA' },
  { id:113, player:'Caitlin Clark',          cardName:'2024 Rittenhouse WNBA Rookie',               setName:'Rittenhouse',           year:2024, grade:'PSA 9',  currentValue:540,    percentChange:+28.4, sport:'WNBA' },
  { id:114, player:'Caitlin Clark',          cardName:'2024 Panini Prizm WNBA Rookie',              setName:'Panini Prizm',          year:2024, grade:'PSA 10', currentValue:890,    percentChange:+36.8, sport:'WNBA' },
  { id:115, player:'Caitlin Clark',          cardName:'2024 Panini Prizm WNBA Rookie Auto /99',     setName:'Panini Prizm',          year:2024, grade:'PSA 9',  currentValue:4200,   percentChange:+52.4, sport:'WNBA' },
  { id:116, player:'Caitlin Clark',          cardName:'2024 Donruss WNBA Rated Rookie',             setName:'Panini Donruss',        year:2024, grade:'PSA 10', currentValue:420,    percentChange:+24.1, sport:'WNBA' },
  { id:117, player:'Angel Reese',            cardName:'2024 Panini Prizm WNBA Rookie',              setName:'Panini Prizm',          year:2024, grade:'PSA 10', currentValue:480,    percentChange:+28.7, sport:'WNBA' },
  { id:118, player:'Angel Reese',            cardName:'2024 Panini Prizm WNBA Rookie',              setName:'Panini Prizm',          year:2024, grade:'PSA 9',  currentValue:210,    percentChange:+18.4, sport:'WNBA' },
  { id:119, player:'Angel Reese',            cardName:'2024 Donruss WNBA Rated Rookie',             setName:'Panini Donruss',        year:2024, grade:'PSA 10', currentValue:280,    percentChange:+22.1, sport:'WNBA' },

  // ── UFC/MMA ──
  { id:120, player:'Conor McGregor',         cardName:'2016 Topps UFC Knockout Auto',               setName:'Topps UFC',             year:2016, grade:'PSA 9',  currentValue:520,    percentChange:+7.3,  sport:'UFC/MMA' },
  { id:121, player:'Conor McGregor',         cardName:'2016 Topps UFC Knockout Auto',               setName:'Topps UFC',             year:2016, grade:'PSA 10', currentValue:1400,   percentChange:+12.8, sport:'UFC/MMA' },
  { id:122, player:'Conor McGregor',         cardName:'2015 Topps UFC Champions Rookie',            setName:'Topps UFC',             year:2015, grade:'PSA 10', currentValue:320,    percentChange:+9.4,  sport:'UFC/MMA' },
  { id:123, player:'Conor McGregor',         cardName:'2017 Topps UFC Knockout Prizm',              setName:'Topps UFC',             year:2017, grade:'PSA 9',  currentValue:280,    percentChange:+6.1,  sport:'UFC/MMA' },
  { id:124, player:'Jon Jones',              cardName:'2011 Topps UFC Finest Rookie Auto',          setName:'Topps UFC',             year:2011, grade:'PSA 8',  currentValue:310,    percentChange:-4.1,  sport:'UFC/MMA' },
  { id:125, player:'Jon Jones',              cardName:'2011 Topps UFC Finest Rookie Auto',          setName:'Topps UFC',             year:2011, grade:'PSA 9',  currentValue:680,    percentChange:-2.8,  sport:'UFC/MMA' },
  { id:126, player:'Jon Jones',              cardName:'2010 Topps UFC Knockout Rookie',             setName:'Topps UFC',             year:2010, grade:'PSA 9',  currentValue:240,    percentChange:-5.2,  sport:'UFC/MMA' },

  // ── Golf ──
  { id:127, player:'Tiger Woods',            cardName:'2001 SP Authentic Sign of the Times Auto',   setName:'SP Authentic',          year:2001, grade:'PSA 9',  currentValue:3800,   percentChange:+6.2,  sport:'Golf' },
  { id:128, player:'Tiger Woods',            cardName:'2001 SP Authentic Sign of the Times Auto',   setName:'SP Authentic',          year:2001, grade:'PSA 8',  currentValue:2100,   percentChange:+4.8,  sport:'Golf' },
  { id:129, player:'Tiger Woods',            cardName:'2001 Upper Deck Pros & Prospects RC',        setName:'Upper Deck',            year:2001, grade:'PSA 10', currentValue:1650,   percentChange:+8.4,  sport:'Golf' },
  { id:130, player:'Tiger Woods',            cardName:'2002 SP Game Used Auto',                     setName:'SP Game Used',          year:2002, grade:'PSA 9',  currentValue:4200,   percentChange:+7.1,  sport:'Golf' },
  { id:131, player:'Tiger Woods',            cardName:'1997 Grand Slam Ventures Masters',           setName:'Grand Slam Ventures',   year:1997, grade:'PSA 9',  currentValue:2800,   percentChange:+5.6,  sport:'Golf' },
  { id:132, player:'Rory McIlroy',           cardName:'2012 SP Authentic Rookie Auto',              setName:'SP Authentic',          year:2012, grade:'PSA 10', currentValue:420,    percentChange:+11.0, sport:'Golf' },
  { id:133, player:'Rory McIlroy',           cardName:'2012 SP Authentic Rookie Auto',              setName:'SP Authentic',          year:2012, grade:'PSA 9',  currentValue:210,    percentChange:+7.4,  sport:'Golf' },
  { id:134, player:'Rory McIlroy',           cardName:'2014 SP Game Used',                          setName:'SP Game Used',          year:2014, grade:'PSA 9',  currentValue:280,    percentChange:+9.2,  sport:'Golf' },
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
