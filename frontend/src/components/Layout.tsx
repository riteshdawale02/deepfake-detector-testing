import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { Menu, X, Sun, Moon, Shield, Activity, Scan, Newspaper, Award, FileText, Search, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

interface LayoutProps {
  toggleTheme: () => void
  theme: 'dark' | 'light'
}

const navItems = [
  { path: '/',          icon: Activity,   label: 'Overview',         exact: true },
  { path: '/scan',      icon: Scan,        label: 'Forensic Scanner' },
  { path: '/newswatch', icon: Newspaper,   label: 'NewsWatch AI'     },
  { path: '/certificate',icon: Award,      label: 'Certificates'     },
  { path: '/complaint', icon: FileText,    label: 'File Complaint'   },
  { path: '/tracker',   icon: Search,      label: 'Case Tracker'     },
]

export default function Layout({ toggleTheme, theme }: LayoutProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="app-layout">

      {/* ── Overlay ──────────────────────────────────────────── */}
      <div
        className={`sidebar-overlay ${open ? 'open' : ''}`}
        onClick={() => setOpen(false)}
      />

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Shield size={18} color="var(--cyan)" />
          </div>
          <div>
            <div className="sidebar-logo-text">ANTIGRAVITY</div>
            <div className="sidebar-logo-sub">TRUTH DETECTION SYSTEM</div>
          </div>
        </div>

        {/* Status */}
        <div className="sidebar-status">
          <div className="status-dot" />
          <span style={{ fontSize: '10px', color: 'var(--green)', fontFamily: 'JetBrains Mono', letterSpacing: '0.05em' }}>
            ALL SYSTEMS NOMINAL
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '9px', color: 'var(--text-muted)' }}>v2.1</span>
        </div>

        {/* Nav */}
        <div className="sidebar-nav-label">NAVIGATION</div>
        <nav className="sidebar-nav">
          {navItems.map(({ path, icon: Icon, label, exact }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={15} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* AI Models indicator */}
        <div style={{ padding: '12px 16px', margin: '8px 10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: '8px' }}>AI MODELS ACTIVE</div>
          {['OpenCV Analysis', 'AWS Rekognition', 'Gemini 1.5 Flash'].map(m => (
            <div key={m} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{m}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div>v2.1.0 — INDIA CYBER CELL</div>
          <div style={{ opacity: 0.6, marginTop: '2px' }}>© 2026 AntiGravity Platform</div>
        </div>
      </aside>

      {/* ── Hamburger ────────────────────────────────────────── */}
      <button className="hamburger" onClick={() => setOpen(v => !v)} aria-label="Menu">
        {open ? <X size={17} /> : <Menu size={17} />}
      </button>

      {/* ── Main ─────────────────────────────────────────────── */}
      <div className="main-content">

        {/* Topbar */}
        <div className="topbar">
          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: 'auto' }}>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)' }}
            />
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
              AI MODELS READY
            </span>
          </div>

          {/* Time */}
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
            {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
          </span>

          {/* Theme toggle */}
          <button className="theme-btn" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>

        {/* Page content */}
        <div className="main-inner">
          <Outlet />
        </div>
      </div>
    </div>
  )
}