import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.tsx'
import HomePage from './pages/HomePage.tsx'
import ScannerPage from './pages/ScannerPage.tsx'
import CertificatePage from './pages/CertificatePage.tsx'
import ComplaintPage from './pages/ComplaintPage.tsx'
import TrackerPage from './pages/TrackerPage.tsx'
import NewsWatchPage from './pages/NewsWatchPage.tsx'

import { useState, useEffect } from 'react'

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout toggleTheme={toggleTheme} theme={theme} />}>
          <Route index element={<HomePage />} />
          <Route path="scan" element={<ScannerPage />} />
          <Route path="newswatch" element={<NewsWatchPage />} />
          <Route path="certificate" element={<CertificatePage />} />
          <Route path="complaint" element={<ComplaintPage />} />
          <Route path="tracker" element={<TrackerPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
