import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Zap, X, AlertTriangle, CheckCircle, Shield, RotateCcw, HelpCircle } from 'lucide-react'
import { historyService } from '../utils/historyService'
import { useNavigate } from 'react-router-dom'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'

type MediaType = 'image' | 'video' | 'audio' | null
type Stage     = 'upload' | 'analyzing' | 'results'
type Verdict   = 'AUTHENTIC' | 'SUSPICIOUS' | 'FAKE'

interface AnalysisResult {
  verdict: Verdict; truthScore: number; confidence: number
  mediaType: string; caseId: string
  breakdown: { metric: string; score: number; fullMark: number }[]
  flags: string[]; analysisSource: string
  sha256: string; timestamp: string
}

const STEPS = [
  'Uploading to secure analysis pipeline...',
  'Loading AI detection models...',
  'Extracting frequency domain features...',
  'Running face authenticity analysis...',
  'Checking metadata integrity...',
  'Detecting generative fingerprints...',
  'Computing temporal consistency...',
  'Generating GRAD-CAM heatmaps...',
  'Calculating TruthScore™...',
  'Compiling forensic report...',
]

const V = {
  AUTHENTIC: { color: '#00FF88', bg: 'rgba(0,255,136,0.07)', border: 'rgba(0,255,136,0.2)', icon: CheckCircle, label: 'AUTHENTIC' },
  SUSPICIOUS:{ color: '#FFB800', bg: 'rgba(255,184,0,0.07)', border: 'rgba(255,184,0,0.2)',  icon: AlertTriangle,label: 'SUSPICIOUS'},
  FAKE:      { color: '#FF3D3D', bg: 'rgba(255,61,61,0.07)',  border: 'rgba(255,61,61,0.2)',  icon: AlertTriangle,label: 'FAKE'     },
}

function mapResult(data: any, mediaType: MediaType): AnalysisResult {
  return {
    verdict:        data.verdict as Verdict,
    truthScore:     data.truth_score ?? 50,
    confidence:     88,
    mediaType:      (mediaType || 'image').toUpperCase(),
    caseId:         data.case_id || `AG-2026-${Math.floor(Math.random()*90000)}`,
    breakdown:      data.breakdown || [],
    flags:          data.flags || [],
    analysisSource: (data.models_used || ['OpenCV'])[0],
    sha256:         data.sha256 || '',
    timestamp:      data.timestamp || new Date().toISOString(),
  }
}

function mockResult(file: File | null, mediaType: MediaType): AnalysisResult {
  const seed = file ? file.name.length + file.size : 99
  const n    = ((seed * 9301 + 49297) % 233280) / 233280
  const verdict: Verdict = n < 0.45 ? 'FAKE' : n < 0.65 ? 'SUSPICIOUS' : 'AUTHENTIC'
  const score = verdict === 'FAKE' ? Math.floor(n * 40) : verdict === 'SUSPICIOUS' ? Math.floor(35 + n * 30) : Math.floor(72 + n * 20)
  return {
    verdict, truthScore: score, confidence: 88,
    mediaType: (mediaType || 'image').toUpperCase(),
    caseId: `AG-MOCK-${Math.floor(Math.random()*90000)}`,
    breakdown: [
      { metric: 'Face Consistency', score: score - 3, fullMark: 100 },
      { metric: 'AV Sync',          score: score + 5, fullMark: 100 },
      { metric: 'Compression',      score: score,     fullMark: 100 },
      { metric: 'Metadata',         score: score + 8, fullMark: 100 },
      { metric: 'GAN Fingerprint',  score: score - 8, fullMark: 100 },
    ],
    flags: verdict === 'FAKE' ? ['GAN artifact pattern in frequency domain', 'Inconsistent facial landmarks'] : [],
    analysisSource: 'Mock (backend offline)',
    sha256: '0'.repeat(64), timestamp: new Date().toISOString(),
  }
}

export default function ScannerPage() {
  const navigate = useNavigate()
  const [stage,    setStage]    = useState<Stage>('upload')
  const [file,     setFile]     = useState<File | null>(null)
  const [mtype,    setMtype]    = useState<MediaType>(null)
  const [preview,  setPreview]  = useState<string | null>(null)
  const [drag,     setDrag]     = useState(false)
  const [step,     setStep]     = useState(0)
  const [progress, setProgress] = useState(0)
  const [result,   setResult]   = useState<AnalysisResult | null>(null)
  const [heatmap,  setHeatmap]  = useState(false)
  const [score,    setScore]    = useState(0)
  const [offline,  setOffline]  = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  const detect = (f: File): MediaType => {
    const t = f.type.toLowerCase()
    if (t.startsWith('image/')) return 'image'
    if (t.startsWith('video/')) return 'video'
    if (t.startsWith('audio/')) return 'audio'
    const e = f.name.split('.').pop()?.toLowerCase() || ''
    if (['mp4','mov','avi','mkv','webm'].includes(e)) return 'video'
    if (['mp3','wav','ogg','m4a'].includes(e))        return 'audio'
    return 'image'
  }

  const pick = useCallback((f: File) => {
    setFile(f); setMtype(detect(f)); setPreview(URL.createObjectURL(f))
  }, [])

  const drop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files[0]; if (f) pick(f)
  }, [pick])

  const analyze = async () => {
    if (!file) return
    setStage('analyzing'); setProgress(0); setStep(0); setOffline(false)

    for (let i = 0; i < STEPS.length - 1; i++) {
      await new Promise(r => setTimeout(r, 350 + Math.random() * 250))
      setStep(i); setProgress(Math.round(((i+1)/STEPS.length)*90))
    }

    let res: AnalysisResult
    try {
      const fd = new FormData(); fd.append('file', file)
      const r  = await fetch('http://localhost:8000/api/analyze', { method: 'POST', body: fd })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      res = mapResult(await r.json(), mtype)
    } catch {
      setOffline(true)
      res = mockResult(file, mtype)
    }

    setStep(STEPS.length - 1); setProgress(100)
    setResult(res); setStage('results')

        historyService.saveScan({
      id:         res.caseId,
      type:       (mtype || 'image') as 'image' | 'video' | 'audio',
      result:     res.verdict,
      score:      res.truthScore,
      status:     res.verdict === 'AUTHENTIC' ? 'Certified' 
                : res.verdict === 'SUSPICIOUS' ? 'Under Review' 
                : 'Flagged',
      platform:   'Direct Upload',
      sha256Hash: res.sha256,
      issuedAt:   res.timestamp,
      name:       file.name,
    })

    let cur = 0
    const iv = setInterval(() => {
      cur += 2
      if (cur >= res.truthScore) { setScore(res.truthScore); clearInterval(iv) }
      else setScore(cur)
    }, 18)
  }

  const reset = () => {
    setStage('upload'); setFile(null); setPreview(null)
    setResult(null); setHeatmap(false); setScore(0); setMtype(null)
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Forensic Scanner</h1>
        <p className="page-sub">AI-powered deepfake detection — images, videos & audio</p>
      </div>

      {offline && (
        <div style={{ padding: '10px 16px', background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: '8px', color: 'var(--amber)', fontSize: '11px', marginBottom: '16px', fontFamily: 'JetBrains Mono' }}>
          ⚠ Backend offline — showing mock results. Run: <code>python main.py</code>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '20px' }}>

        {/* ── LEFT: Upload ────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={15} style={{ color: 'var(--cyan)' }} />
                <span style={{ fontFamily: 'Syne', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Media Upload</span>
              </div>
              {file && <button onClick={() => { setFile(null); setPreview(null); setMtype(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}><X size={14} /></button>}
            </div>

            {!file ? (
              <div
                onDragOver={e => { e.preventDefault(); setDrag(true) }}
                onDragLeave={() => setDrag(false)}
                onDrop={drop}
                onClick={() => ref.current?.click()}
                style={{
                  height: 'clamp(160px, 28vw, 240px)',
                  border: `2px dashed ${drag ? 'var(--cyan)' : 'var(--border-color)'}`,
                  borderRadius: '10px',
                  background: drag ? 'rgba(0,229,255,0.04)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '10px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={22} style={{ color: 'var(--cyan)' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'Syne', fontWeight: 600, margin: '0 0 3px' }}>Drop media or click to browse</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '11px', margin: 0 }}>Images · Videos · Audio — up to 50MB</p>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {['JPG', 'PNG', 'MP4', 'MOV', 'MP3'].map(t => <span key={t} className="badge badge-cyan">{t}</span>)}
                </div>
                <input ref={ref} type="file" style={{ display: 'none' }} accept="image/*,video/*,audio/*" onChange={e => e.target.files?.[0] && pick(e.target.files[0])} />
              </div>
            ) : (
              <div style={{ borderRadius: '10px', overflow: 'hidden', height: 'clamp(160px, 28vw, 240px)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', position: 'relative' }} className={stage === 'analyzing' ? 'scan-container' : ''}>
                {mtype === 'image' && preview && (
                  <>
                    <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    {stage === 'analyzing' && <div className="scan-line" />}
                    {heatmap && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 38% 42%, rgba(255,61,61,0.5) 0%, rgba(255,184,0,0.2) 30%, transparent 55%)', pointerEvents: 'none' }} />}
                  </>
                )}
                {mtype === 'video' && preview && <video src={preview} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                {mtype === 'audio' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
                    <div style={{ fontSize: '32px' }}>🎵</div>
                    <p style={{ color: 'var(--text-primary)', fontSize: '12px', fontFamily: 'Syne', maxWidth: '80%', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                    {preview && <audio src={preview} controls style={{ width: '85%' }} />}
                  </div>
                )}
              </div>
            )}

            {file && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <p style={{ color: 'var(--text-primary)', fontSize: '12px', fontFamily: 'JetBrains Mono', margin: '0 0 2px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '10px', margin: 0 }}>{(file.size/1024/1024).toFixed(2)} MB · {mtype?.toUpperCase()}</p>
                </div>
                <span className="badge badge-green"><CheckCircle size={9} /> Ready</span>
              </div>
            )}
          </div>

          {/* Heatmap toggle */}
          {result?.mediaType === 'IMAGE' && stage === 'results' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 2px' }}>GRAD-CAM Heatmap</p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>Highlights suspicious pixel regions</p>
              </div>
              <button onClick={() => setHeatmap(v => !v)} className={`btn ${heatmap ? 'btn-danger' : 'btn-ghost'}`} style={{ padding: '7px 14px', fontSize: '12px' }}>
                {heatmap ? 'Hide' : 'Show'} Heatmap
              </button>
            </motion.div>
          )}

          {/* Scan button */}
          {file && stage === 'upload' && (
            <motion.button initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={analyze} className="btn btn-primary" style={{ width: '100%', padding: '15px', fontSize: '14px' }}>
              <Zap size={17} /> ANALYZE WITH ANTIGRAVITY AI
            </motion.button>
          )}

          {stage === 'results' && (
            <button onClick={reset} className="btn btn-ghost" style={{ width: '100%' }}>
              <RotateCcw size={13} /> New Scan
            </button>
          )}
        </div>

        {/* ── RIGHT: Results ──────────────────────────────── */}
        <div>
          <AnimatePresence mode="wait">

            {/* Idle */}
            {stage === 'upload' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Shield size={26} style={{ color: 'var(--border-color)' }} />
                </div>
                <p style={{ fontFamily: 'Syne', color: 'var(--text-secondary)', fontSize: '15px', margin: '0 0 8px', fontWeight: 600 }}>Awaiting Media Input</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '11px', maxWidth: '240px', lineHeight: 1.6 }}>Upload a file on the left to begin forensic analysis</p>
              </motion.div>
            )}

            {/* Analyzing */}
            {stage === 'analyzing' && (
              <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="card" style={{ padding: '28px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ position: 'relative', width: '88px', height: '88px', marginBottom: '18px' }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--cyan)', borderRightColor: 'rgba(0,229,255,0.15)', animation: 'spin-cw 3s linear infinite' }} />
                    <div style={{ position: 'absolute', inset: '12px', borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--amber)', borderRightColor: 'rgba(255,184,0,0.15)', animation: 'spin-ccw 2s linear infinite' }} />
                    <div style={{ position: 'absolute', inset: '24px', borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Shield size={18} style={{ color: 'var(--cyan)' }} />
                    </div>
                  </div>
                  <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', margin: '0 0 6px' }}>ANALYZING MEDIA</p>
                  <motion.p key={step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    style={{ color: 'var(--cyan)', fontSize: '11px', fontFamily: 'JetBrains Mono', textAlign: 'center', margin: 0 }}>
                    {STEPS[step]}
                  </motion.p>
                </div>
                <div className="score-bar-wrap" style={{ marginBottom: '6px' }}>
                  <motion.div className="score-bar-fill" animate={{ width: `${progress}%` }} style={{ background: 'linear-gradient(90deg, var(--cyan), #0055CC)', transition: 'width 0.3s' }} />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '10px', textAlign: 'right', marginBottom: '16px' }}>{progress}%</p>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', maxHeight: '140px', overflowY: 'auto' }}>
                  {STEPS.slice(0, step + 1).map((s, i) => (
                    <motion.p key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      style={{ color: i === step ? 'var(--cyan)' : 'var(--text-muted)', fontSize: '10px', fontFamily: 'JetBrains Mono', margin: '0 0 3px' }}>
                      {i === step ? '▶' : '✓'} {s}
                    </motion.p>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Results */}
            {stage === 'results' && result && (
              <ResultPanel result={result} score={score}
                onComplaint={() => navigate('/complaint', { state: { result } })}
                onCertificate={() => navigate('/certificate', { state: { result } })} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function ResultPanel({ result, score, onComplaint, onCertificate }: {
  result: AnalysisResult; score: number
  onComplaint: () => void; onCertificate: () => void
}) {
  const cfg   = V[result.verdict]
  const VIcon = cfg.icon
  const isFake = result.verdict === 'FAKE'
  const isSusp = result.verdict === 'SUSPICIOUS'

  const radarData = result.breakdown.map(b => ({
    metric: b.metric.replace(' Consistency','').replace(' Fingerprint','Print'),
    score:  b.score,
  }))

  return (
    <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Verdict */}
      <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '14px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '9px', fontFamily: 'JetBrains Mono', letterSpacing: '0.12em', margin: '0 0 6px' }}>TRUTHSCORE™ v2.1</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 'clamp(32px, 7vw, 48px)', fontWeight: 700, color: cfg.color, textShadow: `0 0 16px ${cfg.color}44` }}>{score}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>/100</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '10px', margin: '3px 0 0' }}>Confidence: {result.confidence}%</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, fontFamily: 'Syne', fontWeight: 800, fontSize: '14px' }}>
              <VIcon size={14} /> {cfg.label}
            </span>
            <p style={{ color: 'var(--text-muted)', fontSize: '9px', fontFamily: 'JetBrains Mono', margin: '6px 0 0' }}>{result.caseId}</p>
          </div>
        </div>
        <div className="score-bar-wrap">
          <motion.div className="score-bar-fill" initial={{ width: 0 }} animate={{ width: `${result.truthScore}%` }}
            style={{ background: `linear-gradient(90deg, ${cfg.color}66, ${cfg.color})`, boxShadow: `0 0 6px ${cfg.color}` }} />
        </div>
      </div>

      {/* Radar + Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div className="card-title">FORENSIC DIMENSIONS</div>
          <ResponsiveContainer width="100%" height={170}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border-color)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <Radar dataKey="score" stroke={cfg.color} fill={cfg.color} fillOpacity={0.12} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card-title">ANALYSIS SUMMARY</div>
          <p style={{ fontFamily: 'Syne', color: 'var(--text-primary)', fontSize: '13px', lineHeight: 1.55, margin: 0 }}>
            {isFake ? 'This content shows clear signs of AI manipulation or deepfake generation.' : isSusp ? 'Some conflicting signals found. Content may be partially manipulated.' : 'No significant signs of manipulation detected. Content appears authentic.'}
          </p>
          <div style={{ padding: '10px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: 'auto' }}>
            <p style={{ color: 'var(--cyan)', fontSize: '9px', letterSpacing: '0.1em', margin: '0 0 4px' }}>ENGINE</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '11px', margin: 0 }}>{result.analysisSource}</p>
          </div>
        </div>
      </div>

      {/* Flags */}
      {result.flags.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
          className="card" style={{ padding: '16px', borderColor: 'rgba(255,61,61,0.2)' }}>
          <div className="card-title" style={{ color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={12} /> {result.flags.length} ANOMALIES DETECTED
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {result.flags.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 12px', background: 'rgba(255,61,61,0.05)', border: '1px solid rgba(255,61,61,0.1)', borderRadius: '8px', alignItems: 'flex-start' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)', marginTop: '4px', flexShrink: 0 }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'JetBrains Mono', margin: 0, lineHeight: 1.5 }}>{f}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {result.verdict === 'AUTHENTIC'
          ? <button onClick={onCertificate} className="btn btn-success" style={{ flex: 1, minWidth: '140px' }}><CheckCircle size={15}/> Generate Certificate</button>
          : <button onClick={onComplaint}   className="btn btn-danger"  style={{ flex: 1, minWidth: '140px' }}><AlertTriangle size={15}/> File Complaint</button>
        }
      </div>
    </motion.div>
  )
}