import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.tsx'
import Header from './Header.tsx'

interface LayoutProps {
  toggleTheme: () => void
  theme: 'dark' | 'light'
}

export default function Layout({ toggleTheme, theme }: LayoutProps) {
  return (
    <div className="flex min-h-screen grid-bg transition-colors duration-300" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1" style={{ marginLeft: '16rem' }}>
        <Header toggleTheme={toggleTheme} theme={theme} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
