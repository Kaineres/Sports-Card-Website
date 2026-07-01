'use client'

import { useState, useRef, useCallback } from 'react'
import { CardScannerModal } from '@/components/grading/card-scanner-modal'

type GradingState = 'upload' | 'loading' | 'results'

interface SubGrade { label: string; score: number }

interface LightingTier { label: string; color: string; text: string }
interface TipExample { label: string; color: string; src: string; caption: string }
interface Tip {
  icon: string
  title: string
  body: string
  guide?: LightingTier[]
  examples?: TipExample[]
}

const LOADING_MSGS = [
  'Analyzing edges',
  'Checking centering',
  'Inspecting corners',
  'Scanning surface',
  'Detecting print defects',
  'Computing grade estimate',
]

const MOCK_RESULT = {
  grade: 9.2,
  subgrades: [
    { label: 'Centering', score: 9.0 },
    { label: 'Corners',   score: 9.5 },
    { label: 'Edges',     score: 9.0 },
    { label: 'Surface',   score: 9.3 },
  ] as SubGrade[],
  summary: 'Near mint to mint condition with minor edge wear and slight centering variance. Surface presents well with no visible scratches or print defects under standard inspection.',
}

function CardIcon() {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="5" width="40" height="44" rx="4" fill="rgba(30,22,8,0.7)" stroke="rgba(184,146,46,0.3)" strokeWidth="1.2"/>
      <rect x="11" y="9" width="32" height="22" rx="2" fill="rgba(184,146,46,0.1)"/>
      <circle cx="20" cy="18" r="5" fill="rgba(212,168,67,0.45)"/>
      <path d="M11 31 L19 23 L26 27 L34 19 L43 31Z" fill="rgba(52,201,122,0.18)" stroke="rgba(52,201,122,0.4)" strokeWidth="0.9" strokeLinejoin="round"/>
      <rect x="11" y="36" width="24" height="2.5" rx="1.2" fill="rgba(255,255,255,0.14)"/>
      <rect x="11" y="41" width="17" height="2.5" rx="1.2" fill="rgba(255,255,255,0.09)"/>
    </svg>
  )
}

// One good/avoid example thumbnail. Renders the photo once it exists at `ex.src`;
// until then it shows a labeled placeholder telling you which file to drop into
// public/scan-tips/ — no code change needed when the real photo is added.
function ExampleThumb({ ex }: { ex: TipExample }) {
  const [failed, setFailed] = useState(false)
  const fileName = ex.src.replace(/^\//, '')
  const showImg = !failed

  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <span style={{
        alignSelf: 'flex-start',
        fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.09em',
        color: ex.color, border: `1px solid ${ex.color}`, borderRadius: '4px',
        padding: '1px 6px',
      }}>
        {ex.label}
      </span>
      <div style={{
        aspectRatio: '4 / 3', width: '100%', borderRadius: '7px', overflow: 'hidden',
        border: `1px solid ${ex.color}44`, background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {showImg ? (
          <img
            src={ex.src}
            alt={`${ex.label} — ${ex.caption}`}
            onError={() => setFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '8px' }}>
            <div style={{ fontSize: '1rem', opacity: 0.5, marginBottom: '4px' }}>🖼️</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--text3)', opacity: 0.7, wordBreak: 'break-all', lineHeight: 1.4 }}>
              {fileName}
            </div>
          </div>
        )}
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text3)', textAlign: 'center' }}>
        {ex.caption}
      </span>
    </div>
  )
}

export default function GradingPage() {
  const [state, setState]         = useState<GradingState>('upload')
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile]   = useState<File | null>(null)
  const [frontUrl, setFrontUrl]   = useState<string | null>(null)
  const [backUrl, setBackUrl]     = useState<string | null>(null)
  const [progress, setProgress]   = useState(0)
  const [msgIdx, setMsgIdx]       = useState(0)
  const [dragOver, setDragOver]   = useState<'front' | 'back' | null>(null)
  const [scanner, setScanner]     = useState<'front' | 'back' | null>(null)
  const frontRef = useRef<HTMLInputElement>(null)
  const backRef  = useRef<HTMLInputElement>(null)

  function handleFile(file: File, side: 'front' | 'back') {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    if (side === 'front') { setFrontFile(file); setFrontUrl(url) }
    else                  { setBackFile(file);  setBackUrl(url)  }
  }

  function handleDrop(e: React.DragEvent, side: 'front' | 'back') {
    e.preventDefault()
    setDragOver(null)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file, side)
  }

  const startGrading = useCallback(() => {
    if (!frontFile) return
    setState('loading')
    setProgress(0)
    setMsgIdx(0)
    let p = 0, m = 0
    const tick = setInterval(() => {
      p += Math.random() * 12 + 4
      if (p >= 100) { p = 100; clearInterval(tick); setTimeout(() => setState('results'), 400) }
      setProgress(Math.min(p, 100))
      const nextMsg = Math.floor((p / 100) * LOADING_MSGS.length)
      if (nextMsg !== m) { m = nextMsg; setMsgIdx(Math.min(m, LOADING_MSGS.length - 1)) }
    }, 300)
  }, [frontFile])

  function reset() {
    setState('upload')
    setFrontFile(null); setBackFile(null)
    setFrontUrl(null);  setBackUrl(null)
    setProgress(0); setMsgIdx(0)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Card scanner modal ── */}
      {scanner && (
        <CardScannerModal
          side={scanner}
          onCapture={file => {
            handleFile(file, scanner)
            setScanner(null)
          }}
          onClose={() => setScanner(null)}
        />
      )}

      {/* ── Page header ── */}
      <div style={{ borderBottom: '1px solid var(--border-md)', padding: '1.5rem 2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--gold2)', margin: 0 }}>
          AI Card Grading
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text3)', marginTop: '6px', letterSpacing: '0.04em' }}>
          Upload your card. Instantly estimate condition and grade.
        </p>
      </div>

      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '3rem 2rem' }}>

        {/* ══ Upload state ══ */}
        {state === 'upload' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Upload zones */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {(['front', 'back'] as const).map(side => {
                const file   = side === 'front' ? frontFile : backFile
                const url    = side === 'front' ? frontUrl  : backUrl
                const isDrag = dragOver === side
                return (
                  <div
                    key={side}
                    onClick={() => setScanner(side)}
                    onDragOver={e => { e.preventDefault(); setDragOver(side) }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={e => handleDrop(e, side)}
                    style={{
                      border: file
                        ? '1.5px dashed rgba(52,201,122,0.55)'
                        : `1.5px dashed ${isDrag ? 'var(--gold2)' : 'rgba(184,146,46,0.22)'}`,
                      borderRadius: '14px',
                      background: file
                        ? 'rgba(52,201,122,0.05)'
                        : isDrag ? 'rgba(184,146,46,0.06)' : 'rgba(16,14,8,0.85)',
                      padding: '1.75rem 1.5rem 2.75rem',
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: '10px', cursor: 'pointer', transition: 'border 0.2s, background 0.2s',
                      position: 'relative', minHeight: '265px', justifyContent: 'center',
                      boxShadow: file ? '0 0 0 1px rgba(52,201,122,0.12) inset' : 'none',
                    }}
                  >
                    {/* Zone label */}
                    <div style={{
                      position: 'absolute', top: '13px', left: 0, right: 0,
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px',
                    }}>
                      {file ? (
                        <>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', fontWeight: 700, color: 'rgba(52,201,122,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {side === 'front' ? 'FRONT' : 'BACK'}
                          </span>
                          <span style={{ color: '#34c97a', fontSize: '0.75rem', fontWeight: 700, lineHeight: 1 }}>✓</span>
                        </>
                      ) : (
                        <>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {side === 'front' ? 'FRONT' : 'BACK'}
                          </span>
                          <span style={{ color: '#e05c5c', fontSize: '0.7rem', fontWeight: 700, lineHeight: 1 }}>*</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', fontWeight: 700, color: '#e05c5c', letterSpacing: '0.08em' }}>
                            REQUIRED
                          </span>
                        </>
                      )}
                    </div>

                    {url ? (
                      <>
                        <img
                          src={url}
                          alt={`${side} preview`}
                          style={{ maxHeight: '130px', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.55)' }}
                        />
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--gold2)' }}>
                          {side === 'front' ? 'Front of Card' : 'Back of Card'}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.69rem', color: 'var(--text3)', opacity: 0.7 }}>JPG or PNG</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.67rem', color: '#34c97a', opacity: 0.85, maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file?.name}
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); setScanner(side) }}
                          style={{
                            padding: '8px 24px', marginTop: '2px',
                            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
                            border: 'none', borderRadius: '8px',
                            color: '#0d1117', fontFamily: 'var(--font-display)',
                            fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                          }}
                        >
                          {side === 'front' ? 'Retake Front' : 'Retake Back'}
                        </button>
                        {/* Remove — bottom-left */}
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            if (side === 'front') { setFrontFile(null); setFrontUrl(null) }
                            else { setBackFile(null); setBackUrl(null) }
                          }}
                          style={{
                            position: 'absolute', bottom: '13px', left: '14px',
                            background: 'none', border: 'none',
                            color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                            opacity: 0.75,
                          }}
                        >✕ Remove</button>
                      </>
                    ) : (
                      <>
                        <CardIcon />
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--gold2)', marginTop: '2px' }}>
                          {side === 'front' ? 'Front of Card' : 'Back of Card'}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.69rem', color: 'var(--text3)', opacity: 0.7 }}>
                          JPG or PNG
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); setScanner(side) }}
                          style={{
                            padding: '9px 30px', marginTop: '4px',
                            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
                            border: 'none', borderRadius: '8px',
                            color: '#0d1117', fontFamily: 'var(--font-display)',
                            fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                          }}
                        >
                          {side === 'front' ? 'Capture Front' : 'Capture Back'}
                        </button>
                      </>
                    )}

                    <input
                      ref={side === 'front' ? frontRef : backRef}
                      type="file" accept="image/*" capture="environment"
                      style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f, side) }}
                    />
                  </div>
                )
              })}
            </div>

            {/* Analyze Card button */}
            <button
              onClick={startGrading}
              disabled={!frontFile}
              style={{
                padding: '15px',
                background: frontFile
                  ? 'linear-gradient(135deg, rgba(160,118,28,0.95) 0%, rgba(110,80,14,0.95) 100%)'
                  : 'rgba(184,146,46,0.12)',
                border: `1px solid ${frontFile ? 'rgba(184,146,46,0.45)' : 'rgba(184,146,46,0.18)'}`,
                borderRadius: '10px',
                color: frontFile ? 'rgba(240,201,106,0.95)' : 'rgba(184,146,46,0.38)',
                fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600,
                cursor: frontFile ? 'pointer' : 'not-allowed',
                letterSpacing: '0.04em', transition: '0.2s',
              }}
            >
              Analyze Card
            </button>

            {/* Tips section */}
            <div style={{
              border: '1px solid rgba(184,146,46,0.22)',
              borderRadius: '12px',
              background: 'rgba(16,14,8,0.85)',
              padding: '16px',
            }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold2)', marginBottom: '14px' }}>
                How to get the best scan
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {([
                  {
                    icon: '💡',
                    title: 'Even light — not one hard beam',
                    body: 'A normal well-lit room is enough. These only help if you hit glare or shadows:',
                    guide: [
                      { label: 'Best',  color: '#34c97a',      text: 'Window daylight, or even overhead room light.' },
                      { label: 'Good',  color: 'var(--gold2)', text: 'A lamp bounced off a wall, or off to one side.' },
                      { label: 'Avoid', color: '#e05c5c',      text: 'A flashlight or bright beam aimed at the card; direct sun.' },
                    ],
                    examples: [
                      { label: 'Good',  color: '#34c97a', src: '/scan-tips/lighting-good.jpg',  caption: 'Even, soft light' },
                      { label: 'Avoid', color: '#e05c5c', src: '/scan-tips/lighting-avoid.jpg', caption: 'Glare hotspot' },
                    ],
                  },
                  {
                    icon: '📐',
                    title: 'Fill the box, straight-on',
                    body: 'Line the card up with the corner marks and hold your phone flat above it. Tilting throws off centering and edges.',
                    examples: [
                      { label: 'Good',  color: '#34c97a', src: '/scan-tips/framing-good.jpg',  caption: 'Filled & square' },
                      { label: 'Avoid', color: '#e05c5c', src: '/scan-tips/framing-avoid.jpg', caption: 'Tilted & small' },
                    ],
                  },
                  {
                    icon: '🧘',
                    title: 'Hold still for green',
                    body: 'When focus, light, and steadiness all pass, the corners turn green and it captures automatically — no button.',
                  },
                  {
                    icon: '🎨',
                    title: 'Contrast the background',
                    body: 'Dark surface for white-bordered cards, light or gray for dark-bordered ones. Avoid busy patterns or stacked cards.',
                    examples: [
                      { label: 'Good',  color: '#34c97a', src: '/scan-tips/background-good.jpg',  caption: 'Border stands out' },
                      { label: 'Avoid', color: '#e05c5c', src: '/scan-tips/background-avoid.jpg', caption: 'Border blends in' },
                    ],
                  },
                  {
                    icon: '🛡️',
                    title: 'Remove thick holders',
                    body: 'Take cards out of toploaders, one-touches, and slabs — thick plastic adds blur and glare. Ditch hazy penny sleeves too.',
                    examples: [
                      { label: 'Good',  color: '#34c97a', src: '/scan-tips/holder-good.jpg',  caption: 'Bare card' },
                      { label: 'Avoid', color: '#e05c5c', src: '/scan-tips/holder-avoid.jpg', caption: 'In a slab' },
                    ],
                  },
                  {
                    icon: '↩️',
                    title: 'Scan both sides',
                    body: 'Front is required. Adding the back catches corner and edge wear on the reverse.',
                  },
                ] as Tip[]).map(tip => (
                  <div key={tip.title} style={{
                    border: '1px solid rgba(184,146,46,0.14)',
                    borderRadius: '10px',
                    background: 'rgba(0,0,0,0.22)',
                    padding: '13px 14px',
                  }}>
                    {/* Title row */}
                    <div style={{ display: 'flex', gap: '9px', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{
                        flexShrink: 0, width: '26px', height: '26px', borderRadius: '7px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(184,146,46,0.12)', fontSize: '0.9rem',
                      }}>{tip.icon}</span>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold2)' }}>
                        {tip.title}
                      </div>
                    </div>

                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.71rem', color: 'var(--text3)', lineHeight: 1.6, letterSpacing: '0.01em' }}>
                      {tip.body}
                    </div>

                    {tip.guide && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '10px' }}>
                        {tip.guide.map(g => (
                          <div key={g.label} style={{ display: 'flex', gap: '9px', alignItems: 'flex-start' }}>
                            <span style={{
                              flexShrink: 0, minWidth: '46px', textAlign: 'center',
                              fontFamily: 'var(--font-mono)', fontSize: '0.57rem', fontWeight: 700,
                              textTransform: 'uppercase', letterSpacing: '0.09em',
                              color: g.color, border: `1px solid ${g.color}`, borderRadius: '4px',
                              padding: '2px 6px', marginTop: '1px', opacity: 0.9,
                            }}>
                              {g.label}
                            </span>
                            <span style={{
                              fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                              color: 'var(--text3)', lineHeight: 1.55, letterSpacing: '0.01em',
                            }}>
                              {g.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {tip.examples && (
                      <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                        {tip.examples.map(ex => <ExampleThumb key={ex.label} ex={ex} />)}
                      </div>
                    )}
                  </div>
                ))}

                <div style={{
                  marginTop: '4px', paddingTop: '12px',
                  borderTop: '1px solid rgba(184,146,46,0.12)',
                  display: 'flex', gap: '8px', alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: '0.85rem', flexShrink: 0, color: 'var(--gold2)', marginTop: '1px' }}>⚠</span>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.69rem', color: 'var(--gold2)', letterSpacing: '0.02em', lineHeight: 1.65, margin: 0, opacity: 0.8 }}>
                    Better photos, better grades. Sharp, well-lit, straight-on scans give the most accurate estimates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ Loading state ══ */}
        {state === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '5rem 2rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Processing Card</div>
            <div style={{ width: '100%', maxWidth: '400px', height: '4px', background: 'var(--bg3)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--gold) 0%, var(--gold3) 100%)',
                borderRadius: '2px', transition: 'width 0.3s ease',
              }} />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text2)' }}>
              {LOADING_MSGS[msgIdx]}...
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text3)' }}>{Math.round(progress)}%</div>
          </div>
        )}

        {/* ══ Results state ══ */}
        {state === 'results' && (
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border-md)',
            borderRadius: '16px', overflow: 'hidden',
            maxWidth: '680px', margin: '0 auto',
          }}>

            {/* Top: grade number + card preview */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '2.5rem 2.5rem 2.25rem',
              borderBottom: '1px solid var(--border-md)',
              background: 'linear-gradient(135deg, rgba(10,8,4,0) 0%, rgba(184,146,46,0.04) 100%)',
            }}>
              <div>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: '5.5rem', fontWeight: 700,
                  color: 'var(--gold2)', lineHeight: 0.95, letterSpacing: '-0.03em',
                }}>
                  {MOCK_RESULT.grade}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--text3)',
                  textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: '12px',
                }}>Estimated Grade</div>
              </div>
              {/* Card image — slightly rotated */}
              <div style={{
                width: '128px', height: '178px', borderRadius: '10px',
                background: 'var(--bg3)', border: '1px solid var(--border-md)',
                overflow: 'hidden', flexShrink: 0,
                transform: 'rotate(-2.5deg)',
                boxShadow: '0 10px 36px rgba(0,0,0,0.55)',
              }}>
                {frontUrl ? (
                  <img src={frontUrl} alt="Card front" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🃏</div>
                )}
              </div>
            </div>

            {/* Sub-grades row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--border-md)' }}>
              {MOCK_RESULT.subgrades.map((sg, i) => (
                <div key={sg.label} style={{
                  padding: '1.2rem 0.75rem', textAlign: 'center',
                  borderLeft: i > 0 ? '1px solid var(--border-md)' : 'none',
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold2)', lineHeight: 1 }}>
                    {sg.score.toFixed(1)}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text3)', marginTop: '7px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {sg.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Condition summary */}
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-md)' }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                textTransform: 'uppercase', letterSpacing: '0.12em',
                color: 'var(--text3)', marginBottom: '10px',
              }}>— Condition Summary</div>
              <p style={{
                fontFamily: 'var(--font-display)', fontSize: '0.87rem',
                color: 'var(--text2)', lineHeight: 1.7, margin: 0,
              }}>{MOCK_RESULT.summary}</p>
            </div>

            {/* Action buttons */}
            <div style={{ padding: '1.2rem 2rem', display: 'flex', gap: '10px' }}>
              <button
                onClick={reset}
                style={{
                  flex: 1, padding: '11px',
                  background: 'none', border: '1px solid var(--border-md)', borderRadius: '8px',
                  color: 'var(--text2)', fontFamily: 'var(--font-display)', fontSize: '0.83rem', fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                }}
              >
                <span style={{ fontSize: '1rem' }}>↺</span> Scan Another Card
              </button>
              <button style={{
                flex: 1, padding: '11px',
                background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
                border: 'none', borderRadius: '8px', color: '#0d1117',
                fontFamily: 'var(--font-display)', fontSize: '0.83rem', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              }}>
                + Add to Collection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
