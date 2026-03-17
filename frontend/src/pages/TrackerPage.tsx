import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Clock, CheckCircle, AlertTriangle, Loader, ChevronRight } from 'lucide-react'
import { historyService } from '../utils/historyService'
import type { ComplaintData } from '../utils/historyService'

interface StatusStep {
  status: string
  timestamp: string
  description: string
  done: boolean
}

function generateCaseTimeline(caseId: string): StatusStep[] {
  const base = new Date()
  const fmt = (d: Date) => d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const minus = (mins: number) => new Date(base.getTime() - mins * 60 * 1000)

  return [
    { status: 'Complaint Registered', timestamp: fmt(minus(45)), description: 'Complaint received by India Cyber Crime Portal. Acknowledgment sent to registered email.', done: true },
    { status: 'AI Evidence Validated', timestamp: fmt(minus(40)), description: `AntiGravity forensic report (${caseId}) verified and attached to the investigation file.`, done: true },
    { status: 'Assigned to Cyber Cell', timestamp: fmt(minus(30)), description: 'Case forwarded to Mumbai Cyber Crime Investigation Unit. Officer assigned: #CC-7813.', done: true },
    { status: 'Under Investigation', timestamp: fmt(minus(10)), description: 'Active investigation in progress. Media has been sent for secondary lab analysis.', done: true },
    { status: 'Escalated to CERT-In', timestamp: fmt(base), description: 'Case flagged for national-level escalation to CERT-In due to potential widespread impact.', done: false },
    { status: 'Resolution Pending', timestamp: '—', description: 'Awaiting confirmation from CERT-In. Expected resolution within 7 working days.', done: false },
  ]
}

const sampleCases = ['CC-2026-384729', 'CC-2026-291847', 'CC-2026-501923']

export default function TrackerPage() {
  const location = useLocation()
  const initialCaseId = location.state?.caseId || ''
  const [input, setInput] = useState(initialCaseId)
  const [trackedId, setTrackedId] = useState(initialCaseId)
  const [timeline, setTimeline] = useState<StatusStep[]>(initialCaseId ? generateCaseTimeline(initialCaseId) : [])
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [savedCase, setSavedCase] = useState<ComplaintData | null>(null)

  useEffect(() => {
    // Auto-load latest complaint if nothing in state
    if (!initialCaseId) {
      const complaints = historyService.getComplaints()
      if (complaints.length > 0) {
        const latest = complaints[0]
        setInput(latest.caseId)
        setSavedCase(latest)
        setTimeline(generateCaseTimeline(latest.caseId))
        setTrackedId(latest.caseId)
      }
    }
  }, [initialCaseId])

  const handleSearch = async (id?: string) => {
    const searchId = id || input.trim()
    if (!searchId) return
    setLoading(true)
    setNotFound(false)
    await new Promise(r => setTimeout(r, 1500))
    
    // Check local storage first
    const localCase = historyService.getComplaintById(searchId)
    if (localCase) {
      setSavedCase(localCase)
      setTimeline(generateCaseTimeline(searchId))
      setTrackedId(searchId)
    } else if (!searchId.startsWith('CC-') && !searchId.startsWith('AG-')) {
      setNotFound(true)
      setSavedCase(null)
    } else {
      setTimeline(generateCaseTimeline(searchId))
      setTrackedId(searchId)
      setSavedCase(null)
    }
    setLoading(false)
  }

  const recentCases = historyService.getComplaints().slice(0, 5)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-5"
        style={{ background: '#0D1225', border: '1px solid #1E2D4A' }}
      >
        <p className="text-xs mb-3" style={{ color: '#8B9AB5', fontFamily: 'JetBrains Mono, monospace' }}>
          ENTER CASE ID
        </p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#8B9AB5' }} />
            <input
              type="text"
              placeholder="CC-2026-XXXXXX or AG-XXXX-XXXXX"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-4 py-3 rounded-lg text-sm outline-none"
              style={{
                background: '#0A0E1A',
                border: '1px solid #1E2D4A',
                color: '#E8EDF5',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-6 py-3 rounded-lg text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #00F5FF, #0066CC)', color: '#0A0E1A', fontFamily: 'Syne, sans-serif' }}
          >
            {loading ? '...' : 'Track'}
          </motion.button>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {recentCases.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase">Your Recent Investigations</p>
              <div className="flex flex-wrap gap-2">
                {recentCases.map(c => (
                  <button
                    key={c.caseId}
                    onClick={() => { setInput(c.caseId); handleSearch(c.caseId) }}
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ background: '#111827', color: '#00F5FF', border: '1px solid #1E2D4A', fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {c.caseId}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2 items-center pt-2">
            <span className="text-[10px] uppercase font-bold text-[#4A5770] font-mono">Samples:</span>
            {sampleCases.map(c => (
              <button
                key={c}
                onClick={() => { setInput(c); handleSearch(c) }}
                className="text-[10px] px-2 py-0.5 rounded opacity-60 hover:opacity-100 transition-all font-mono"
                style={{ background: '#111827', color: '#8B9AB5', border: '1px solid #1E2D4A' }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 rounded-full border-2 mb-4"
            style={{ borderColor: '#1E2D4A', borderTopColor: '#00F5FF' }}
          />
          <p className="text-xs" style={{ color: '#8B9AB5', fontFamily: 'JetBrains Mono, monospace' }}>Querying Cybercrime Portal...</p>
        </div>
      )}

      {/* Not Found */}
      {notFound && !loading && (
        <div
          className="text-center rounded-xl p-8"
          style={{ background: '#0D1225', border: '1px solid #1E2D4A' }}
        >
          <AlertTriangle size={32} style={{ color: '#FFB800' }} className="mx-auto mb-3" />
          <p className="text-sm font-semibold mb-1" style={{ fontFamily: 'Syne, sans-serif', color: '#E8EDF5' }}>
            Case Not Found
          </p>
          <p className="text-xs" style={{ color: '#8B9AB5', fontFamily: 'JetBrains Mono, monospace' }}>
            Ensure the ID starts with CC- or AG- and is correct.
          </p>
        </div>
      )}

      {/* Timeline */}
      {timeline.length > 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid #1E2D4A' }}
        >
          <div
            className="px-6 py-4 flex items-center gap-3"
            style={{ background: '#0D1225', borderBottom: '1px solid #1E2D4A' }}
          >
            <Clock size={16} style={{ color: '#00F5FF' }} />
            <h3 className="text-sm font-semibold" style={{ fontFamily: 'Syne, sans-serif', color: '#E8EDF5' }}>
              Case Timeline
            </h3>
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full font-mono"
              style={{ background: '#00F5FF15', color: '#00F5FF', border: '1px solid #00F5FF30' }}
            >
              {trackedId}
            </span>
          </div>

          {/* Persistent Case Details */}
          {savedCase && (
            <div className="px-6 py-4 border-b border-[#1E2D4A]" style={{ background: '#0A0E1A' }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-[#4A5770] font-mono mb-1">COMPLAINANT</p>
                  <p className="text-xs text-[#E8EDF5] font-semibold">{savedCase.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#4A5770] font-mono mb-1">LOCATION</p>
                  <p className="text-xs text-[#E8EDF5] font-semibold">{savedCase.city}, {savedCase.state}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-[#4A5770] font-mono mb-1">INCIDENT DESCRIPTION</p>
                  <p className="text-xs text-[#8B9AB5] leading-relaxed line-clamp-2">{savedCase.description}</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 space-y-1" style={{ background: '#0A0E1A' }}>
            {timeline.map((step: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: step.done ? 1 : 0.4, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4"
              >
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: step.done ? 'rgba(0,245,255,0.1)' : '#111827',
                      border: `1px solid ${step.done ? '#00F5FF30' : '#1E2D4A'}`,
                    }}
                  >
                    {step.done ? (
                      <CheckCircle size={14} style={{ color: '#00F5FF' }} />
                    ) : (
                      <Loader size={14} style={{ color: '#4A5770' }} />
                    )}
                  </div>
                  {i < timeline.length - 1 && (
                    <div className="w-px flex-1 my-1" style={{ background: step.done ? '#1E2D4A' : '#111827', minHeight: '24px' }} />
                  )}
                </div>
                <div className="pb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <p
                      className="text-sm font-semibold"
                      style={{ fontFamily: 'Syne, sans-serif', color: step.done ? '#E8EDF5' : '#4A5770' }}
                    >
                      {step.status}
                    </p>
                    {i === 3 && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#FFB80015', color: '#FFB800', border: '1px solid #FFB80030', fontFamily: 'JetBrains Mono, monospace' }}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs mb-1" style={{ color: '#4A5770', fontFamily: 'JetBrains Mono, monospace' }}>
                    {step.timestamp}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: '#8B9AB5', fontFamily: 'JetBrains Mono, monospace' }}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="p-5 flex items-center justify-between" style={{ background: '#0D1225', borderTop: '1px solid #1E2D4A' }}>
            <p className="text-xs" style={{ color: '#8B9AB5', fontFamily: 'JetBrains Mono, monospace' }}>
              For escalations: helpdesk@cybercrime.gov.in
            </p>
            <button
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded"
              style={{ background: '#111827', border: '1px solid #1E2D4A', color: '#00F5FF', fontFamily: 'JetBrains Mono, monospace' }}
            >
              Full Report <ChevronRight size={12} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
