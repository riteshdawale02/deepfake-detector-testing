import { motion } from 'framer-motion'
import { Shield, Zap, Eye, FileText, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { historyService } from '../utils/historyService'
import type { ScanHistoryItem } from '../utils/historyService'

const stats = [
  { label: 'Files Analyzed', value: '48,291', icon: Eye, color: '#00F5FF', change: '+12% today' },
  { label: 'Fakes Detected', value: '11,843', icon: AlertTriangle, color: '#FF3D3D', change: '+8% today' },
  { label: 'Certified Genuine', value: '36,448', icon: CheckCircle, color: '#00FF88', change: '+15% today' },
  { label: 'Complaints Filed', value: '2,107', icon: FileText, color: '#FFB800', change: '+5% today' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
}

export default function HomePage() {
  const navigate = useNavigate()
  const [history, setHistory] = useState<ScanHistoryItem[]>([])

  useEffect(() => {
    const data = historyService.getScans()
    if (data.length > 0) {
      setHistory(data)
    } else {
      // Fallback to placeholders if empty
      setHistory([
        { id: 'AG-18290', type: 'video', result: 'AUTHENTIC', score: 94, status: 'Certified', timestamp: Date.now() - 5 * 60 * 1000, platform: 'YouTube', time: '5m ago' },
        { id: 'AG-18287', type: 'audio', result: 'FAKE', score: 8, status: 'Reported', timestamp: Date.now() - 11 * 60 * 1000, platform: 'TikTok', time: '11m ago' },
      ])
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl p-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 50%, var(--bg-secondary) 100%)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Decorative glow */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, var(--cyan), transparent)', transform: 'translate(30%, -30%)' }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={18} style={{ color: '#00F5FF' }} />
            <span className="text-xs font-semibold tracking-widest" style={{ color: '#00F5FF', fontFamily: 'JetBrains Mono, monospace' }}>
              ANTIGRAVITY INTELLIGENCE PLATFORM
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
            Truth Detection System <br />
            <span style={{ color: 'var(--cyan)', textShadow: '0 0 20px var(--accent-glow)' }}>v2.1 — Active</span>
          </h1>
          <p className="text-sm max-w-xl mb-6" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Upload any image, video, or audio file for AI-powered deepfake analysis. Get an explainable TruthScore™, 
            forensic heatmap overlay, and optionally file a verified government complaint — all in under 60 seconds.
          </p>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/scan')}
              className="px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #00F5FF, #0080FF)',
                color: '#0A0E1A',
                fontFamily: 'Syne, sans-serif',
                boxShadow: '0 0 20px rgba(0, 245, 255, 0.35)',
              }}
            >
              <Zap size={16} />
              Launch Forensic Scanner
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/tracker')}
              className="px-6 py-3 rounded-xl text-sm flex items-center gap-2"
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              <Eye size={16} />
              Track Case
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, change }, i) => (
          <motion.div
            key={label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="card-hover rounded-xl p-5"
            style={{ 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--card-shadow)'
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'var(--bg-primary)', border: `1px solid var(--border-color)` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <TrendingUp size={12} style={{ color: 'var(--green)', marginTop: 4 }} />
            </div>
            <p className="text-2xl font-bold mb-1" style={{ fontFamily: 'JetBrains Mono, monospace', color }}>
              {value}
            </p>
            <p className="text-xs mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>{label}</p>
            <p className="text-xs" style={{ color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace' }}>{change}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
      >
        <div className="p-5 border-b flex items-center gap-3" style={{ borderColor: 'var(--border-color)' }}>
          <Clock size={16} style={{ color: 'var(--cyan)' }} />
          <h3 className="font-semibold text-sm" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
            Recent Analysis Activity
          </h3>
          <span
            className="ml-auto text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'var(--cyan-glow, rgba(0, 245, 255, 0.1))', color: 'var(--cyan)', border: '1px solid var(--cyan-border, rgba(0, 245, 255, 0.2))' }}
          >
            LIVE
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['Case ID', 'Type', 'TruthScore™', 'Result', 'Status', 'Time'].map(h => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-medium"
                    style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map(({ id, type, result, score, time, status }) => (
                <tr
                  key={id}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid var(--border-color)', opacity: 0.9 }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-5 py-3 font-mono text-xs" style={{ color: 'var(--cyan)' }}>{id}</td>
                  <td className="px-5 py-3 text-xs capitalize" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>{type}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full" style={{ background: 'var(--border-color)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${score}%`,
                            background: score > 70 ? 'var(--green)' : score > 40 ? 'var(--amber)' : 'var(--red)',
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono" style={{ color: score > 70 ? 'var(--green)' : score > 40 ? 'var(--amber)' : 'var(--red)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {score}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-mono font-bold"
                      style={{
                        background: result === 'AUTHENTIC' || result === 'VERIFIED' ? 'rgba(0, 255, 136, 0.1)' : result === 'FAKE' || result === 'FABRICATED' || result === 'MISLEADING' ? 'rgba(255, 61, 61, 0.1)' : 'rgba(255, 184, 0, 0.1)',
                        color: result === 'AUTHENTIC' || result === 'VERIFIED' ? 'var(--green)' : result === 'FAKE' || result === 'FABRICATED' || result === 'MISLEADING' ? 'var(--red)' : 'var(--amber)',
                        border: `1px solid ${result === 'AUTHENTIC' || result === 'VERIFIED' ? 'rgba(0, 255, 136, 0.2)' : result === 'FAKE' || result === 'FABRICATED' || result === 'MISLEADING' ? 'rgba(255, 61, 61, 0.2)' : 'rgba(255, 184, 0, 0.2)'}`,
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                    >
                      {result}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>{status}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>{time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
