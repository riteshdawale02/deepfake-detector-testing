import { NavLink } from 'react-router-dom'
import { Shield, Scan, Award, FileText, Search, Activity, Zap, Newspaper } from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { path: '/', icon: Activity, label: 'Overview', exact: true },
  { path: '/scan', icon: Scan, label: 'Forensic Scanner' },
  { path: '/newswatch', icon: Newspaper, label: 'NewsWatch AI' },
  { path: '/certificate', icon: Award, label: 'Certificates' },
  { path: '/complaint', icon: FileText, label: 'File Complaint' },
  { path: '/tracker', icon: Search, label: 'Case Tracker' },
]

export default function Sidebar() {
  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 flex flex-col z-50 transition-all duration-300"
      style={{
        background: 'var(--nav-bg)',
        borderRight: '1px solid var(--border-color)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--cyan-glow, rgba(0, 245, 255, 0.1)), var(--bg-primary))',
              border: '1px solid var(--border-color)',
              boxShadow: '0 0 20px var(--accent-glow)',
            }}
          >
            <Shield size={20} style={{ color: 'var(--cyan)' }} />
          </div>
          <div>
            <h1 className="text-base font-bold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--cyan)', textShadow: '0 0 10px var(--accent-glow)' }}>
              ANTIGRAVITY
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Truth Detection System</p>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="px-6 py-4">
        <div
          className="rounded-lg p-3"
          style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap size={12} style={{ color: 'var(--green)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
              SYSTEM STATUS
            </span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2 h-2 rounded-full"
              style={{ background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }}
            />
            <span className="text-xs" style={{ color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace' }}>
              ALL SYSTEMS NOMINAL
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 mt-2">
        <p className="text-xs px-2 mb-3" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
          NAVIGATION
        </p>
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3 py-3 rounded-lg mb-1 text-sm transition-all duration-300 ${
                isActive
                  ? 'bg-blue-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:bg-slate-500/10 hover:text-cyan-400'
              }`
            }
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {({ isActive }) => (
              <>
                {isActive && <motion.div layoutId="nav-line" className="nav-line" />}
                <Icon size={16} className={`${isActive ? 'text-[#00F5FF]' : 'group-hover:text-[#00F5FF]'} transition-colors duration-300`} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div className="text-center">
          <p className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
            v2.1.0 — INDIA CYBER CELL
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)', opacity: 0.8, fontFamily: 'JetBrains Mono, monospace' }}>
            © 2026 AntiGravity Platform
          </p>
        </div>
      </div>
    </aside>
  )
}
