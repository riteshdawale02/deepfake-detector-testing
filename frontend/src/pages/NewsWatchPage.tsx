import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Globe, AlertTriangle, CheckCircle, XCircle, HelpCircle, AlertCircle, RotateCcw } from 'lucide-react'

type Verdict = 'TRUE' | 'FALSE' | 'MISLEADING' | 'UNVERIFIED'
type Stage   = 'idle' | 'checking' | 'results'

interface NewsResult {
  verdict: Verdict; confidence: number; credibility: number
  summary: string; key_findings: string[]; red_flags: string[]
  recommendation: string; risk_level: string
  source_title: string; models_used: string[]
  case_id: string; timestamp: string
}

const STEPS = [
  'Fetching article via Jina Reader...',
  'Parsing metadata and source signals...',
  'Running Gemini 1.5 Flash analysis...',
  'Cross-referencing fact-check databases...',
  'Computing credibility score...',
  'Generating forensic report...',
]

const V: Record<Verdict, { color: string; bg: string; border: string; icon: any; label: string }> = {
  TRUE:       { color: '#00FF88', bg: 'rgba(0,255,136,0.07)',   border: 'rgba(0,255,136,0.2)',   icon: CheckCircle,   label: 'VERIFIED TRUE'  },
  FALSE:      { color: '#FF3D3D', bg: 'rgba(255,61,61,0.07)',   border: 'rgba(255,61,61,0.2)',   icon: XCircle,       label: 'FALSE / FAKE'   },
  MISLEADING: { color: '#FFB800', bg: 'rgba(255,184,0,0.07)',   border: 'rgba(255,184,0,0.2)',   icon: AlertTriangle, label: 'MISLEADING'     },
  UNVERIFIED: { color: '#6B8299', bg: 'rgba(107,130,153,0.07)', border: 'rgba(107,130,153,0.2)', icon: HelpCircle,    label: 'UNVERIFIED'     },
}

const REC: Record<string, { color: string; bg: string }> = {
  'SAFE TO SHARE':         { color: '#00FF88', bg: 'rgba(0,255,136,0.1)'  },
  'VERIFY BEFORE SHARING': { color: '#FFB800', bg: 'rgba(255,184,0,0.1)' },
  'DO NOT SHARE':          { color: '#FF3D3D', bg: 'rgba(255,61,61,0.1)' },
}

const SAMPLES = [
  'COVID-19 vaccine contains microchips for government tracking',
  '5G towers are causing cancer and spreading radiation disease',
  'Scientists confirm drinking warm water cures all viral infections',
  'Government planning to ban WhatsApp in India by next month',
]

export default function NewsWatchPage() {
  const [url,      setUrl]      = useState('')
  const [claim,    setClaim]    = useState('')
  const [stage,    setStage]    = useState<Stage>('idle')
  const [step,     setStep]     = useState(0)
  const [result,   setResult]   = useState<NewsResult | null>(null)
  const [error,    setError]    = useState('')
  const [animated, setAnimated] = useState(0)

  const check = async () => {
    if (!url.trim() && !claim.trim()) { setError('Please enter a URL or a claim to fact-check.'); return }
    setError(''); setStage('checking'); setStep(0)

    for (let i = 0; i < STEPS.length - 1; i++) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400))
      setStep(i)
    }

    try {
      const r = await fetch('http://localhost:8000/api/newswatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), claim: claim.trim() }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data: NewsResult = await r.json()
      setStep(STEPS.length - 1)
      setResult(data); setStage('results')
      let cur = 0
      const iv = setInterval(() => {
        cur += 2
        if (cur >= data.credibility) { setAnimated(data.credibility); clearInterval(iv) }
        else setAnimated(cur)
      }, 18)
    } catch (e) {
      setError('Cannot reach backend. Make sure python main.py is running.')
      setStage('idle')
    }
  }

  const reset = () => { setStage('idle'); setResult(null); setUrl(''); setClaim(''); setError(''); setAnimated(0) }

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <h1 className="page-title">NewsWatch AI</h1>
        <p className="page-sub">Multi-layer misinformation detection powered by Gemini 1.5 Flash + Jina Reader</p>
      </div>

      {/* Model badges */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <span className="badge badge-cyan">● JINA INTEGRATED</span>
        <span className="badge badge-purple">● GEMINI 1.5 FLASH</span>
        <span className="badge badge-green">● FACTSEARCH ACTIVE</span>
      </div>

      <AnimatePresence mode="wait">

        {/* ── INPUT ───────────────────────────────────────── */}
        {stage === 'idle' && (
          <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="card" style={{ marginBottom: '14px' }}>

              <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: '8px' }}>ARTICLE URL</label>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <Globe size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: url ? 'var(--cyan)' : 'var(--text-muted)' }} />
                <input type="text" placeholder="https://timesofindia.com/article..." value={url}
                  onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()}
                  className="input" style={{ paddingLeft: '36px' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>OR PASTE CLAIM</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
              </div>

              <textarea placeholder="e.g. 'Vaccine causes DNA modification according to new study...'" value={claim}
                onChange={e => setClaim(e.target.value)} className="input" rows={4} />

              {error && (
                <div style={{ marginTop: '10px', padding: '10px 14px', background: 'rgba(255,61,61,0.08)', border: '1px solid rgba(255,61,61,0.2)', borderRadius: '8px', color: 'var(--red)', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>
                  ⚠ {error}
                </div>
              )}

              <button onClick={check} className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '14px' }}>
                <Search size={15} /> FACT-CHECK NOW
              </button>
            </div>

            {/* Samples */}
            <div className="card">
              <div className="card-title">TRY THESE SAMPLE CLAIMS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {SAMPLES.map(s => (
                  <button key={s} onClick={() => setClaim(s)}
                    style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'JetBrains Mono', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--cyan)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}>
                    → {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── CHECKING ────────────────────────────────────── */}
        {stage === 'checking' && (
          <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '88px', height: '88px', margin: '0 auto 20px' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--cyan)', borderRightColor: 'rgba(0,229,255,0.15)', animation: 'spin-cw 3s linear infinite' }} />
              <div style={{ position: 'absolute', inset: '14px', borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#A78BFA', borderRightColor: 'rgba(167,139,250,0.15)', animation: 'spin-ccw 2s linear infinite' }} />
              <div style={{ position: 'absolute', inset: '28px', borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Search size={16} style={{ color: 'var(--cyan)' }} />
              </div>
            </div>
            <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', margin: '0 0 6px' }}>FACT-CHECKING IN PROGRESS</p>
            <motion.p key={step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              style={{ color: 'var(--cyan)', fontSize: '11px', fontFamily: 'JetBrains Mono', margin: '0 0 20px' }}>
              {STEPS[step]}
            </motion.p>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', textAlign: 'left', maxHeight: '140px', overflowY: 'auto' }}>
              {STEPS.slice(0, step + 1).map((s, i) => (
                <motion.p key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  style={{ color: i === step ? 'var(--cyan)' : 'var(--text-muted)', fontSize: '10px', fontFamily: 'JetBrains Mono', margin: '0 0 3px' }}>
                  {i === step ? '▶' : '✓'} {s}
                </motion.p>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── RESULTS ─────────────────────────────────────── */}
        {stage === 'results' && result && (() => {
          const cfg    = V[result.verdict] || V.UNVERIFIED
          const VIcon  = cfg.icon
          const recCfg = REC[result.recommendation] || REC['VERIFY BEFORE SHARING']
          return (
            <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Verdict */}
              <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '14px', padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '9px', fontFamily: 'JetBrains Mono', letterSpacing: '0.12em', margin: '0 0 8px' }}>FACT-CHECK VERDICT</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <VIcon size={28} style={{ color: cfg.color }} />
                      <span style={{ fontFamily: 'Syne', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: cfg.color }}>{cfg.label}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '9px', fontFamily: 'JetBrains Mono', margin: '0 0 4px' }}>CREDIBILITY SCORE</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', justifyContent: 'flex-end' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '36px', fontWeight: 700, color: cfg.color }}>{animated}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>/100</span>
                    </div>
                  </div>
                </div>
                <div className="score-bar-wrap" style={{ marginBottom: '14px' }}>
                  <motion.div className="score-bar-fill" initial={{ width: 0 }} animate={{ width: `${result.credibility}%` }} style={{ background: `linear-gradient(90deg, ${cfg.color}66, ${cfg.color})` }} />
                </div>
                <p style={{ fontFamily: 'Syne', color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.55, margin: '0 0 12px' }}>{result.summary}</p>
                <span style={{ display: 'inline-block', padding: '5px 14px', borderRadius: '20px', fontSize: '11px', fontFamily: 'JetBrains Mono', fontWeight: 700, background: recCfg.bg, color: recCfg.color, border: `1px solid ${recCfg.color}30` }}>
                  {result.recommendation}
                </span>
              </div>

              {/* Findings + Red flags */}
              <div className="grid-2">
                <div className="card" style={{ padding: '16px' }}>
                  <div className="card-title" style={{ color: 'var(--cyan)' }}>KEY FINDINGS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.key_findings.length > 0
                      ? result.key_findings.map((f, i) => (
                          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <span style={{ color: 'var(--cyan)', flexShrink: 0, fontSize: '12px' }}>→</span>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'JetBrains Mono', margin: 0, lineHeight: 1.5 }}>{f}</p>
                          </div>
                        ))
                      : <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>No specific findings</p>
                    }
                  </div>
                </div>
                <div className="card" style={{ padding: '16px', borderColor: result.red_flags.length > 0 ? 'rgba(255,61,61,0.2)' : 'var(--border-color)' }}>
                  <div className="card-title" style={{ color: result.red_flags.length > 0 ? 'var(--red)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {result.red_flags.length > 0 && <AlertTriangle size={11} />}
                    RED FLAGS ({result.red_flags.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.red_flags.length > 0
                      ? result.red_flags.map((f, i) => (
                          <div key={i} style={{ display: 'flex', gap: '8px', padding: '8px 10px', background: 'rgba(255,61,61,0.05)', border: '1px solid rgba(255,61,61,0.1)', borderRadius: '6px', alignItems: 'flex-start' }}>
                            <AlertCircle size={11} style={{ color: 'var(--red)', flexShrink: 0, marginTop: '2px' }} />
                            <p style={{ color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'JetBrains Mono', margin: 0, lineHeight: 1.5 }}>{f}</p>
                          </div>
                        ))
                      : <p style={{ color: 'var(--green)', fontSize: '12px', fontFamily: 'JetBrains Mono', margin: 0 }}>✓ No red flags detected</p>
                    }
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="card" style={{ padding: '14px 18px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div><p style={{ color: 'var(--text-muted)', fontSize: '9px', letterSpacing: '0.1em', margin: '0 0 3px' }}>CASE ID</p><p style={{ color: 'var(--text-primary)', fontSize: '12px', fontFamily: 'JetBrains Mono', margin: 0 }}>{result.case_id}</p></div>
                  <div><p style={{ color: 'var(--text-muted)', fontSize: '9px', letterSpacing: '0.1em', margin: '0 0 3px' }}>ENGINE</p><p style={{ color: 'var(--cyan)', fontSize: '11px', margin: 0 }}>{result.models_used[0]}</p></div>
                  <div><p style={{ color: 'var(--text-muted)', fontSize: '9px', letterSpacing: '0.1em', margin: '0 0 3px' }}>CONFIDENCE</p><p style={{ color: 'var(--text-primary)', fontSize: '12px', fontFamily: 'JetBrains Mono', margin: 0 }}>{result.confidence}%</p></div>
                </div>
                <button onClick={reset} className="btn btn-ghost" style={{ fontSize: '12px', padding: '8px 16px' }}>
                  <RotateCcw size={12} /> New Check
                </button>
              </div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}