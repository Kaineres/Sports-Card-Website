'use client'

import { useState, useRef, useCallback } from 'react'

type GradingState = 'upload' | 'loading' | 'results'

interface SubGrade { label: string; score: number }

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

function gradeColor(g: number): string {
  if (g >= 9.5) return '#34c97a'
  if (g >= 8.0) return '#d4a843'
  if (g >= 6.0) return '#f0a050'
  return '#e05c5c'
}

export default function GradingPage() {
  const [state, setState]           = useState<GradingState>('upload')
  const [frontFile, setFrontFile]   = useState<File | null>(null)
  const [backFile, setBackFile]     = useState<File | null>(null)
  const [frontUrl, setFrontUrl]     = useState<string | null>(null)
  const [backUrl, setBackUrl]       = useState<string | null>(null)
  const [progress, setProgress]     = useState(0)
  const [msgIdx, setMsgIdx]         = useState(0)
  const [dragOver, setDragOver]     = useState<'front' | 'back' | null>(null)
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

    let p = 0
    let m = 0
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

  const result = MOCK_RESULT

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(180deg, var(--bg2) 0%, var(--bg) 100%)', borderBottom: '1px solid var(--border-md)', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--gold2)' }}>AI Card Grading</h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: '4px', fontFamily: 'var(--font-mono)', letterSpacing: '0.03em' }}>Upload your card. Instantly estimate condition and grade.</p>
          </div>
          <span style={{
            padding: '3px 10px', borderRadius: '5px',
            background: 'var(--gold-bg)', border: '1px solid var(--gold-border)',
            fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700,
            color: 'var(--gold2)', letterSpacing: '0.1em',
          }}>BETA</span>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>

        {/* ── Upload state ── */}
        {state === 'upload' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {(['front', 'back'] as const).map(side => {
                const file  = side === 'front' ? frontFile  : backFile
                const url   = side === 'front' ? frontUrl   : backUrl
                const isDrag = dragOver === side
                return (
                  <div
                    key={side}
                    onClick={() => (side === 'front' ? frontRef : backRef).current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(side) }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={e => handleDrop(e, side)}
                    style={{
                      border: `2px dashed ${file ? 'var(--gold-border)' : isDrag ? 'var(--gold2)' : 'var(--border-md)'}`,
                      borderRadius: 'var(--radius-xl)',
                      background: file ? 'var(--gold-bg)' : isDrag ? 'rgba(184,146,46,0.05)' : 'var(--bg2)',
                      padding: '2rem 1.5rem',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                      cursor: 'pointer', transition: '0.15s', position: 'relative', minHeight: '260px',
                      justifyContent: 'center',
                    }}
                  >
                    {/* Zone label */}
                    <div style={{ position: 'absolute', top: '12px', left: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {side === 'front' ? 'Front' : 'Back'}
                      </span>
                      {!file && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--red)', opacity: 0.8 }}>{side === 'front' ? '* Required' : 'Optional'}</span>}
                      {file && <span style={{ color: 'var(--green)', fontSize: '0.7rem' }}>✓</span>}
                    </div>

                    {url ? (
                      <>
                        <img src={url} alt={`${side} preview`} style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }} />
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text3)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{file?.name}</div>
                        <button
                          onClick={e => { e.stopPropagation(); if (side === 'front') { setFrontFile(null); setFrontUrl(null) } else { setBackFile(null); setBackUrl(null) } }}
                          style={{ background: 'var(--red-bg)', border: '1px solid rgba(224,92,92,0.2)', borderRadius: '5px', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', padding: '4px 10px', cursor: 'pointer' }}
                        >✕ Remove</button>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>🃏</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>
                          {side === 'front' ? 'Front of Card' : 'Back of Card'}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text3)' }}>Drag & drop or click to upload</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text3)', opacity: 0.6 }}>JPG or PNG</div>
                        <button
                          onClick={e => { e.stopPropagation(); (side === 'front' ? frontRef : backRef).current?.click() }}
                          style={{
                            padding: '8px 20px',
                            background: 'var(--bg3)', border: '1px solid var(--border-md)',
                            borderRadius: '7px', color: 'var(--text2)',
                            fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 600,
                            cursor: 'pointer', marginTop: '4px',
                          }}
                        >Upload {side === 'front' ? 'Front' : 'Back'}</button>
                      </>
                    )}

                    <input
                      ref={side === 'front' ? frontRef : backRef}
                      type="file" accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f, side) }}
                    />
                  </div>
                )
              })}
            </div>

            <button
              onClick={startGrading}
              disabled={!frontFile}
              style={{
                padding: '14px',
                background: frontFile
                  ? 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)'
                  : 'var(--bg3)',
                border: frontFile ? 'none' : '1px solid var(--border-md)',
                borderRadius: 'var(--radius-lg)',
                color: frontFile ? '#0d1117' : 'var(--text3)',
                fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700,
                cursor: frontFile ? 'pointer' : 'not-allowed', transition: '0.2s',
                letterSpacing: '0.01em',
              }}
            >
              {frontFile ? 'Analyze Card' : 'Upload front image to continue'}
            </button>

            {/* Disclaimer */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
              padding: '0.75rem 1rem',
              background: 'var(--gold-bg)', border: '1px solid var(--gold-border)', borderRadius: 'var(--radius-lg)',
            }}>
              <span style={{ fontSize: '0.9rem', marginTop: '1px', flexShrink: 0 }}>⚠️</span>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--gold2)', letterSpacing: '0.02em', lineHeight: 1.6, margin: 0 }}>
                <strong style={{ color: 'var(--gold3)' }}>Disclaimer:</strong> Grading accuracy depends on image quality. Higher resolution, well-lit photos with minimal glare produce the most accurate estimated grade. Blurry or low-quality images may result in reduced precision. This is an estimate only — not an official PSA/BGS/SGC grade.
              </p>
            </div>
          </div>
        )}

        {/* ── Loading state ── */}
        {state === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Processing Card</div>
            <div style={{ width: '100%', maxWidth: '400px', height: '4px', background: 'var(--bg3)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--gold) 0%, var(--gold3) 100%)',
                borderRadius: '2px', transition: 'width 0.3s ease',
              }} />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text2)' }}>
              {LOADING_MSGS[msgIdx]}<span className="loading-dots">...</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text3)' }}>{Math.round(progress)}%</div>
          </div>
        )}

        {/* ── Results state ── */}
        {state === 'results' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
            }}>
              {/* Top: grade + card preview */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-around',
                padding: '2.5rem 2rem', gap: '2rem', flexWrap: 'wrap',
                background: `linear-gradient(135deg, rgba(8,8,8,0) 0%, rgba(184,146,46,0.04) 100%)`,
                borderBottom: '1px solid var(--border-md)',
              }}>
                {/* Grade display */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '120px', height: '120px', borderRadius: '50%',
                    border: `3px solid ${gradeColor(result.grade)}`,
                    boxShadow: `0 0 40px ${gradeColor(result.grade)}30, 0 0 80px ${gradeColor(result.grade)}10`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${gradeColor(result.grade)}08`,
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2.4rem', fontWeight: 700, color: gradeColor(result.grade) }}>
                      {result.grade}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Estimated Grade</div>
                </div>

                {/* Card preview */}
                <div style={{
                  width: '140px', height: '196px', borderRadius: '12px',
                  background: 'var(--bg3)', border: '1px solid var(--border-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '3rem', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  overflow: 'hidden',
                }}>
                  {frontUrl ? (
                    <img src={frontUrl} alt="Card front" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span>🃏</span>
                  )}
                </div>
              </div>

              {/* Subgrades */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--border-md)' }}>
                {result.subgrades.map((sg, i) => (
                  <div key={sg.label} style={{
                    padding: '1.25rem 1rem', textAlign: 'center',
                    borderLeft: i > 0 ? '1px solid var(--border-md)' : 'none',
                  }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: gradeColor(sg.score), lineHeight: 1 }}>
                      {sg.score.toFixed(1)}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text3)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{sg.label}</div>
                    {/* Mini bar */}
                    <div style={{ height: '3px', background: 'var(--bg4)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${(sg.score / 10) * 100}%`, height: '100%', background: gradeColor(sg.score), borderRadius: '2px' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Condition summary */}
              <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid var(--border-md)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text3)', marginBottom: '8px' }}>Condition Summary</div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', color: 'var(--text2)', lineHeight: 1.7, margin: 0 }}>{result.summary}</p>
              </div>

              {/* Actions */}
              <div style={{ padding: '1.25rem 1.75rem', display: 'flex', gap: '10px' }}>
                <button
                  onClick={reset}
                  style={{
                    flex: 1, padding: '10px',
                    background: 'none', border: '1px solid var(--border-md)', borderRadius: '8px',
                    color: 'var(--text2)', fontFamily: 'var(--font-display)', fontSize: '0.83rem', fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >↺ Scan Another Card</button>
                <button style={{
                  flex: 1, padding: '10px',
                  background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
                  border: 'none', borderRadius: '8px', color: '#0d1117',
                  fontFamily: 'var(--font-display)', fontSize: '0.83rem', fontWeight: 700,
                  cursor: 'pointer',
                }}>＋ Add to Collection</button>
              </div>
            </div>

            {/* Tips */}
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text3)', marginBottom: '10px' }}>Tips for Higher Accuracy</div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  'Use natural light or a daylight lamp — avoid direct flash',
                  'Keep the card flat and parallel to the camera',
                  'Capture the full card with a few mm of clear background',
                  'Use at least 1000×1400 px resolution for best results',
                ].map(tip => (
                  <li key={tip} style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--text3)', lineHeight: 1.5 }}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
