import { CameraScanner } from '@/components/grading/camera-scanner'

export default function ScannerTestPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0804', padding: '1.5rem' }}>
      <h1 style={{ color: '#d4a843', fontFamily: 'var(--font-serif, serif)', fontSize: '1.4rem', margin: 0 }}>
        Quality Scanner — Calibration
      </h1>
      <p style={{ color: '#888', fontSize: 13, fontFamily: 'monospace', margin: '6px 0 16px' }}>
        Point the rear camera at a card. Watch the live metrics, then tune the
        thresholds in <code>src/lib/camera/quality.ts</code>.
      </p>
      <CameraScanner />
    </div>
  )
}
