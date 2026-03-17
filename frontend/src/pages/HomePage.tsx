import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Shield, Scan, Newspaper, TrendingUp, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react'
import { historyService } from '../utils/historyService'

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' },
})

export default function HomePage() {
  const navigate = useNavigate()
  const history = historyService.getScans()

  const stats = [
    { label: 'Files Analyzed',    value: history.length || 0,                                  trend: '+12% today', color: 'var(--cyan)'  },
    { label: 'Fakes Detected',    value: history.filter((h:any) => h.result === 'FAKE').length, trend: '+8% today',  color: 'var(--red)'   },
    { label: 'Certified Genuine', value: history.filter((h:any) => h.result === 'AUTHENTIC').length, trend: '+15% today', color: 'var(--green)' },
    { label: 'Cases Filed',       value: 0,                                                     trend: '+5% today',  color: 'var(--amber)' },
  ]

  return (
    <div>
      {/* ── Page header ── */}
      <motion.div {...fade(0)} className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{ padding: '8px 14px', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.15)', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)' }} />
            <span style={{ fontSize: '10px', color: 'var(--cyan)', letterSpacing: '0.1em' }}>ANTIGRAVITY INTELLIGENCE PLATFORM</span>
          </div>
        </div>
        <h1 className="page-title">Truth Detection System</h1>
        <p style={{ fontSize: '14px', color: 'var(--cyan)', fontFamily: 'Syne', fontWeight: 600, margin: '4px 0 8px' }}>v2.1 — Active</p>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: 1.6 }}>
          Upload any image, video, or audio for AI-powered deepfake analysis. Get an explainable TruthScore™, forensic heatmap, and optionally file a verified government complaint.
        </p>
      </motion.div>

      {/* ── CTA Buttons ── */}
      <motion.div {...fade(0.05)} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <button className="btn btn-primary" onClick={() => navigate('/scan')} style={{ fontSize: '14px', padding: '13px 24px' }}>
          <Scan size={16} /> Launch Forensic Scanner
        </button>
        <button className="btn btn-ghost" onClick={() => navigate('/tracker')} style={{ fontSize: '13px' }}>
          <Shield size={14} /> Track Case
        </button>
      </motion.div>

      {/* ── Stats grid ── */}
      <motion.div {...fade(0.1)} className="grid-4" style={{ marginBottom: '28px' }}>
        {stats.map(({ label, value, trend, color }) => (
          <div key={label} className="metric-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="metric-label">{label}</span>
              <TrendingUp size={12} style={{ color: 'var(--green)', opacity: 0.7 }} />
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '32px', fontWeight: 700, color, lineHeight: 1 }}>{value.toLocaleString()}</div>
            <div style={{ fontSize: '10px', color: 'var(--green)', marginTop: '6px' }}>{trend}</div>
          </div>
        ))}
      </motion.div>

      {/* ── Recent activity + Quick actions ── */}
      <motion.div {...fade(0.15)} className="grid-2" style={{ marginBottom: '28px' }}>

        {/* Recent scans */}
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Recent Analysis Activity</span>
            <span style={{ color: 'var(--green)', fontSize: '9px' }}>● LIVE</span>
          </div>

          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '12px' }}>
              <Shield size={28} style={{ margin: '0 auto 12px', opacity: 0.3, display: 'block' }} />
              No scans yet — upload media to begin
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 80px 80px', gap: '8px', padding: '6px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
                {['Case ID', 'Type', 'Result', 'Status'].map(h => (
                  <span key={h} style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{h}</span>
                ))}
              </div>
              {history.slice(0, 5).map((scan: any) => (
                <div key={scan.id} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 80px 80px', gap: '8px', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scan.id}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{scan.type?.toUpperCase()}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: scan.result === 'AUTHENTIC' ? 'var(--green)' : scan.result === 'FAKE' ? 'var(--red)' : 'var(--amber)' }}>{scan.result}</span>
                  <span style={{ fontSize: '11px', color: scan.status === 'Certified' ? 'var(--green)' : 'var(--text-secondary)' }}>{scan.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { icon: Scan,      label: 'Forensic Scanner',  sub: 'Analyze images, videos & audio',  path: '/scan',        color: 'var(--cyan)'   },
            { icon: Newspaper, label: 'NewsWatch AI',       sub: 'Fact-check news & social claims', path: '/newswatch',   color: 'var(--purple)' },
            { icon: Shield,    label: 'File Complaint',     sub: 'Register with Cyber Cell',        path: '/complaint',   color: 'var(--red)'    },
            { icon: Clock,     label: 'Case Tracker',       sub: 'Monitor your filed cases',        path: '/tracker',     color: 'var(--amber)'  },
          ].map(({ icon: Icon, label, sub, path, color }) => (
            <button key={path} onClick={() => navigate(path)}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease', width: '100%' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = color; (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'; }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${color}12`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontFamily: 'Syne', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{sub}</div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Platform capabilities ── */}
      <motion.div {...fade(0.2)} className="card">
        <div className="card-title">PLATFORM CAPABILITIES</div>
        <div className="grid-3">
          {[
            { icon: '🔍', title: 'Multi-Modal Detection',  desc: 'Images, videos and audio deepfake analysis using AWS Rekognition and OpenCV frame sampling' },
            { icon: '📰', title: 'NewsWatch Intelligence', desc: 'Real-time fact-checking powered by Gemini 2.0 Flash and Jina Reader content extraction' },
            { icon: '⚖️', title: 'Legal Risk Assessment',  desc: 'Automatic IT Act section identification with CERT-In escalation and complaint filing support' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
              <div style={{ fontSize: '22px', marginBottom: '10px' }}>{icon}</div>
              <div style={{ fontFamily: 'Syne', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{title}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}