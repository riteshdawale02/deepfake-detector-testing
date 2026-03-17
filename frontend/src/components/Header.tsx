import { Bell, Clock, Cpu, Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

interface HeaderProps {
  toggleTheme: () => void
  theme: 'dark' | 'light'
}

const pageTitles: Record<string, string> = {
  '/': 'Intelligence Overview',
  '/scan': 'Forensic Scanner',
  '/certificate': 'Authenticity Certificates',
  '/complaint': 'File Complaint',
  '/tracker': 'Case Tracker',
}

export default function Header({ toggleTheme, theme }: HeaderProps) {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'AntiGravity'
  const now = new Date()
  const timeString = now.toLocaleTimeString('en-IN', { hour12: false })

  return (
    <header
      className="px-6 py-4 flex items-center justify-between sticky top-0 z-40 glass"
      style={{
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div>
        <h2 className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
          {title}
        </h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)', opacity: 0.8, fontFamily: 'JetBrains Mono, monospace' }}>
          AntiGravity Deepfake Detection Platform
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* AI Status */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
        >
          <Cpu size={12} style={{ color: 'var(--cyan)' }} />
          <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
            AI MODELS READY
          </span>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--cyan)' }}
          />
        </div>

        {/* Time */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
        >
          <Clock size={12} style={{ color: 'var(--text-secondary)' }} />
          <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
            {timeString} IST
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-all duration-300 relative overflow-hidden"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme}
              initial={{ y: 20, opacity: 0, rotate: 45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -20, opacity: 0, rotate: -45 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'dark' ? <Sun size={16} className="text-[#00F5FF]" /> : <Moon size={16} className="text-[#0077CC]" />}
            </motion.div>
          </AnimatePresence>
        </button>

        {/* Alerts */}
        <button
          className="relative p-2 rounded-lg transition-colors"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <Bell size={16} style={{ color: 'var(--text-secondary)' }} />
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ background: 'var(--amber)', boxShadow: '0 0 6px var(--amber)' }}
          />
        </button>
      </div>
    </header>
  )
}
