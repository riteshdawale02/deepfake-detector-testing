import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Send, AlertTriangle, User, Phone, Mail, MapPin, CheckCircle } from 'lucide-react'
import { historyService } from '../utils/historyService'

export default function ComplaintPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const result = location.state?.result

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    description: result?.antigravity ? `${result.antigravity.explanation.legal} [TruthScore: ${result.antigravity.truthScore}/100, Case ID: ${result.antigravity.caseId}]` : '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [caseId, setCaseId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    const newCaseId = `CC-2026-${Math.floor(100000 + Math.random() * 900000)}`
    
    // Save to persistence
    historyService.saveComplaint({
      caseId: newCaseId,
      name: form.name,
      email: form.email,
      phone: form.phone,
      city: form.city,
      state: form.state,
      description: form.description,
      scanId: result?.antigravity?.caseId
    })

    setCaseId(newCaseId)
    setSubmitted(true)
    setIsLoading(false)
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' }}
          className="rounded-2xl p-10"
          style={{ background: '#0D1225', border: '1px solid #00FF8830', boxShadow: '0 0 40px rgba(0,255,136,0.1)' }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: 2, duration: 0.5 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(0,255,136,0.15)', border: '1px solid #00FF8840' }}
          >
            <CheckCircle size={32} style={{ color: '#00FF88' }} />
          </motion.div>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif', color: '#E8EDF5' }}>
            Complaint Submitted Successfully
          </h2>
          <p className="text-sm mb-6" style={{ color: '#8B9AB5', fontFamily: 'JetBrains Mono, monospace' }}>
            Your complaint has been registered with the India Cyber Crime Portal.
          </p>
          <div
            className="rounded-xl p-4 mb-6"
            style={{ background: '#0A0E1A', border: '1px solid #1E2D4A' }}
          >
            <p className="text-xs mb-1" style={{ color: '#8B9AB5', fontFamily: 'JetBrains Mono, monospace' }}>CASE ID</p>
            <p className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#00F5FF' }}>
              {caseId}
            </p>
            <p className="text-xs mt-2" style={{ color: '#8B9AB5' }}>Save this ID to track your case status</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/tracker', { state: { caseId } })}
              className="flex-1 py-3 rounded-xl text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #00F5FF, #0066CC)', color: '#0A0E1A', fontFamily: 'Syne, sans-serif' }}
            >
              Track Case
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-3 rounded-xl text-sm"
              style={{ background: '#111827', border: '1px solid #1E2D4A', color: '#8B9AB5', fontFamily: 'JetBrains Mono, monospace' }}
            >
              Home
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid #1E2D4A' }}
      >
        {/* Header */}
        <div
          className="p-6 flex items-center gap-4"
          style={{ background: '#0D1225', borderBottom: '1px solid #1E2D4A' }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,61,61,0.1)', border: '1px solid #FF3D3D30' }}
          >
            <FileText size={22} style={{ color: '#FF3D3D' }} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#E8EDF5' }}>
              File Cyber Crime Complaint
            </h2>
            <p className="text-xs" style={{ color: '#8B9AB5', fontFamily: 'JetBrains Mono, monospace' }}>
              India Cyber Crime Portal — cybercrime.gov.in (Mock Integration)
            </p>
          </div>
        </div>

        {/* AI Pre-fill notice */}
        {result?.antigravity && (
          <div
            className="px-6 py-3 flex items-center gap-2"
            style={{ background: 'rgba(255, 184, 0, 0.1)', borderBottom: '1px solid #1E2D4A' }}
          >
            <AlertTriangle size={14} style={{ color: '#FFB800' }} />
            <p className="text-xs" style={{ color: '#FFB800', fontFamily: 'JetBrains Mono, monospace' }}>
              Case description auto-filled from AntiGravity legal analysis — {result.antigravity.caseId}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4" style={{ background: '#0A0E1A' }}>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'name', label: 'Full Name', icon: User, placeholder: 'Rahul Sharma', required: true },
              { key: 'email', label: 'Email Address', icon: Mail, placeholder: 'rahul@example.com', required: true },
              { key: 'phone', label: 'Phone Number', icon: Phone, placeholder: '+91 9876543210', required: true },
              { key: 'city', label: 'City', icon: MapPin, placeholder: 'Mumbai', required: true },
            ].map(({ key, label, icon: Icon, placeholder, required }) => (
              <div key={key}>
                <label className="block text-xs mb-2" style={{ color: '#8B9AB5', fontFamily: 'JetBrains Mono, monospace' }}>
                  {label}
                </label>
                <div className="relative">
                  <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#8B9AB5' }} />
                  <input
                    type="text"
                    placeholder={placeholder}
                    required={required}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: '#0D1225',
                      border: '1px solid #1E2D4A',
                      color: '#E8EDF5',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                    onFocus={e => e.target.style.borderColor = '#00F5FF55'}
                    onBlur={e => e.target.style.borderColor = '#1E2D4A'}
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs mb-2" style={{ color: '#8B9AB5', fontFamily: 'JetBrains Mono, monospace' }}>
              State
            </label>
            <select
              value={form.state}
              onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: '#0D1225', border: '1px solid #1E2D4A', color: form.state ? '#E8EDF5' : '#8B9AB5', fontFamily: 'JetBrains Mono, monospace' }}
            >
              <option value="">Select State</option>
              {['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Gujarat', 'Rajasthan', 'West Bengal', 'Telangana', 'Kerala', 'Other'].map(s => (
                <option key={s} value={s} style={{ background: '#0D1225' }}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs mb-2" style={{ color: '#8B9AB5', fontFamily: 'JetBrains Mono, monospace' }}>
              Incident Description
            </label>
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg text-xs outline-none resize-none"
              style={{ background: '#0D1225', border: '1px solid #1E2D4A', color: '#E8EDF5', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.7 }}
              onFocus={e => e.target.style.borderColor = '#00F5FF55'}
              onBlur={e => e.target.style.borderColor = '#1E2D4A'}
            />
          </div>

          {/* Evidence from scan */}
          {result?.antigravity && (
            <div className="rounded-lg p-4" style={{ background: '#0D1225', border: '1px solid var(--red-border, rgba(255, 61, 61, 0.2))' }}>
              <p className="text-xs mb-3 font-bold" style={{ color: 'var(--red)', fontFamily: 'JetBrains Mono, monospace' }}>
                ATTACHED EVIDENCE (AntiGravity Forensic Analysis)
              </p>
              <div className="grid grid-cols-3 gap-3 text-xs">
                {[
                  ['Case ID', result.antigravity.caseId],
                  ['TruthScore', `${result.antigravity.truthScore}/100`],
                  ['Hash (SHA)', `${result.antigravity.certificate.sha256.slice(0, 32)}...`],
                  ['Risk Level', result.antigravity.legalAssessment.riskLevel],
                ].map(([k, v]) => (
                  <div key={k} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    <p style={{ color: '#8B9AB5' }}>{k}</p>
                    <p style={{ color: '#00F5FF' }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.97 } : {}}
            className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{
              background: isLoading ? '#1E2D4A' : 'linear-gradient(135deg, #FF3D3D, #AA1111)',
              color: isLoading ? '#8B9AB5' : '#fff',
              fontFamily: 'Syne, sans-serif',
              boxShadow: isLoading ? 'none' : '0 0 25px rgba(255,61,61,0.3)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 rounded-full border-2"
                  style={{ borderColor: '#8B9AB5', borderTopColor: '#E8EDF5' }}
                />
                Submitting to Cybercrime Portal...
              </>
            ) : (
              <>
                <Send size={16} />
                SUBMIT COMPLAINT
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
