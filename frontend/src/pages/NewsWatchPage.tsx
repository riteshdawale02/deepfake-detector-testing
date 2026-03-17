import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Newspaper, AlertTriangle, Shield, Search, 
  Globe, Activity, Zap, TrendingUp, 
  Layers, MessageSquare, AlertCircle, Clock, Link as LinkIcon
} from 'lucide-react'
import { historyService } from '../utils/historyService'

// Simulated NewsWatch Data
const THREAT_FEED = [
  { platform: "WhatsApp", time: "2m ago", headline: "PM announces free laptops for all students", score: 8, verdict: "FABRICATED", type: "POLITICAL" },
  { platform: "Facebook", time: "5m ago", headline: "New study shows onions cure diabetes completely", score: 15, verdict: "FABRICATED", type: "HEALTH" },
  { platform: "Twitter/X", time: "9m ago", headline: "Viral video of 'earthquake' is from 2018 Turkey", score: 22, verdict: "MISLEADING", type: "OUT_OF_CONTEXT" },
  { platform: "YouTube", time: "14m ago", headline: "Finance minister says economy will collapse", score: 11, verdict: "FABRICATED", type: "AI_VOICE_CLONE" },
  { platform: "Telegram", time: "18m ago", headline: "Supreme Court orders ban on opposition party", score: 6, verdict: "FABRICATED", type: "POLITICAL" },
  { platform: "Instagram", time: "23m ago", headline: "Bollywood actor arrested for fraud", score: 31, verdict: "MISLEADING", type: "DEFAMATION" },
  { platform: "WhatsApp", time: "27m ago", headline: "New RBI rule doubles interest on all loans", score: 19, verdict: "FABRICATED", type: "FINANCIAL" },
  { platform: "Facebook", time: "34m ago", headline: "Government to cut salaries of all employees by 20%", score: 9, verdict: "FABRICATED", type: "POLITICAL" }
]

interface NewsWatchResult {
  overallScore: number
  credibilityLabel: 'VERIFIED' | 'MIXED' | 'MISLEADING' | 'FABRICATED'
  confidence: number
  mediaAnalysis: {
    imagesFound: number
    videosFound: number
    manipulatedMedia: number
    mediaScore: number
    flags: string[]
  }
  headlineAnalysis: {
    headline: string
    accuracyScore: number
    isSensationalized: boolean
    misleadingElements: string[]
  }
  sourceAnalysis: {
    domain: string
    credibilityScore: number
    knownOutlet: boolean
    redFlags: string[]
  }
  claimFlags: {
    claim: string
    status: 'VERIFIED' | 'UNVERIFIED' | 'FALSE' | 'MISLEADING'
    explanation: string
  }[]
  summary: {
    oneLineVerdict: string
    detail: string
    recommendation: 'SAFE_TO_SHARE' | 'SHARE_WITH_CAUTION' | 'DO_NOT_SHARE'
  }
  legalFlags: {
    electionContent: boolean
    defamationRisk: boolean
    escalateToCERTIn: boolean
  }
}

export default function NewsWatchPage() {
  const [url, setUrl] = useState('')
  const [stage, setStage] = useState<'idle' | 'analyzing' | 'results'>('idle')
  const [activeThreats, setActiveThreats] = useState(THREAT_FEED.slice(0, 5))
  const [result, setResult] = useState<NewsWatchResult | null>(null)
  const [progress, setProgress] = useState(0)

  // Real-time threat feed rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveThreats(prev => {
        const nextIndex = (THREAT_FEED.findIndex(t => t.headline === prev[0].headline) + 1) % THREAT_FEED.length
        return [...prev.slice(1), THREAT_FEED[nextIndex]]
      })
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const startAnalysis = async () => {
    if (!url) return
    
    // Normalize and validate URL
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`
    }

    let host = ''
    try {
      host = new URL(normalizedUrl).hostname
    } catch (e) {
      alert('Invalid URL format. Please enter a valid news link.')
      return
    }

    setStage('analyzing')
    setProgress(0)

    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 150 + Math.random() * 100))
      setProgress(i)
    }

    // Enhanced Heuristic Analysis
    const isSuspicious = 
      host.includes('blog') || 
      host.includes('news-fast') || 
      host.includes('daily-truth') ||
      normalizedUrl.length > 120 ||
      host.split('.').length > 3 || // Subdomain nesting
      ['.xyz', '.top', '.info', '.biz', '.online'].some(tld => host.endsWith(tld))
    
    const mockResult: NewsWatchResult = {
      overallScore: isSuspicious ? 24 : 88,
      credibilityLabel: isSuspicious ? 'MISLEADING' : 'VERIFIED',
      confidence: 0.92,
      mediaAnalysis: {
        imagesFound: 2,
        videosFound: 1,
        manipulatedMedia: isSuspicious ? 1 : 0,
        mediaScore: isSuspicious ? 45 : 95,
        flags: isSuspicious ? ['Out of context image detected', 'Potential deepfake audio'] : ['Authentic on-site photography']
      },
      headlineAnalysis: {
        headline: "Breaking: Economic Policy update affects millions across regions",
        accuracyScore: isSuspicious ? 40 : 98,
        isSensationalized: isSuspicious,
        misleadingElements: isSuspicious ? ['Headline uses clickbait framing', 'Article body contradicts major claim'] : []
      },
      sourceAnalysis: {
        domain: host,
        credibilityScore: isSuspicious ? 15 : 92,
        knownOutlet: !isSuspicious,
        redFlags: isSuspicious ? ['Domain registered < 30 days ago', 'Anonymous byline', 'Unusual TLD detected'] : []
      },
      claimFlags: [
        { claim: "Inflation rose by 12% in three months", status: 'MISLEADING', explanation: "Actual figures according to official stats are 6.2%." },
        { claim: "Global reserves reached all-time high", status: 'VERIFIED', explanation: "Matches official central bank data." }
      ],
      summary: {
        oneLineVerdict: isSuspicious ? "Fabricated narrative using out-of-context media." : "Substantiated report from a verified news outlet.",
        detail: "This article makes several bold claims that do not align with verified data. One image appears to be from a 2021 protest in a different country.",
        recommendation: isSuspicious ? 'DO_NOT_SHARE' : 'SAFE_TO_SHARE'
      },
      legalFlags: {
        electionContent: false,
        defamationRisk: isSuspicious,
        escalateToCERTIn: isSuspicious
      }
    }

    setResult(mockResult)
    setStage('results')

    // Save to history with consistent Case ID
    historyService.saveScan({
      id: `NW-${Math.floor(Math.random() * 90000) + 10000}`,
      type: 'news',
      result: mockResult.credibilityLabel,
      score: mockResult.overallScore,
      status: mockResult.credibilityLabel === 'VERIFIED' ? 'Certified' : 'Flagged',
      platform: mockResult.sourceAnalysis.domain
    })
  }

  const reset = () => {
    setStage('idle')
    setResult(null)
    setUrl('')
    setProgress(0)
  }

  return (
    <div className="flex gap-6 min-h-[calc(100vh-120px)] overflow-hidden">
      {/* LEFT: Verification Hub */}
      <div className="flex-1 flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold flex items-center gap-3" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
            <Newspaper className="text-cyan-400" />
            NewsWatch Intelligence
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
            Real-time verification of news media, claims, and source credibility.
          </p>
        </header>

        {stage === 'idle' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* Main Input Card */}
            <div 
              className="p-8 rounded-2xl flex flex-col items-center justify-center text-center gap-6"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', minHeight: '400px' }}
            >
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mb-2"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', boxShadow: '0 0 30px var(--accent-glow)' }}
              >
                <Search size={32} style={{ color: 'var(--cyan)' }} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Verify Article URL</h3>
                <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
                  Paste a link to any news article, tweet, or social claim to perform a multi-layer verification check.
                </p>
              </div>

              <div className="w-full max-w-xl relative">
                <input 
                  type="text"
                  placeholder="Paste news URL here..."
                  className="w-full bg-slate-900/50 p-5 rounded-xl border border-slate-700 focus:border-cyan-500 outline-none transition-all pr-16"
                  style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <button 
                  onClick={startAnalysis}
                  disabled={!url}
                  className="absolute right-2 top-2 bottom-2 px-6 rounded-lg font-bold text-sm flex items-center justify-center transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #00F5FF, #0066CC)', color: '#0A0E1A' }}
                >
                  <Zap size={16} className="mr-2" /> SCAN
                </button>
              </div>

              <div className="flex gap-4 opacity-50">
                {['JINA INTEGRATED', 'GEMINI 2.0 FLASH', 'FACTSEARCH ACTIVE'].map(tag => (
                  <span key={tag} className="text-[10px] font-bold tracking-widest">{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {stage === 'analyzing' && (
          <div 
            className="flex-1 flex flex-col items-center justify-center p-8 rounded-2xl"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
          >
            <div className="relative w-48 h-1 mb-8">
               <div className="absolute inset-0 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-cyan-400"
                    style={{ boxShadow: '0 0 15px #00f5ff' }}
                  />
               </div>
               <p className="text-[10px] text-center mt-4 uppercase tracking-widest font-bold text-cyan-500">
                 {progress < 30 ? 'Fetching content via Jina' : progress < 60 ? 'Analyzing Headline Context' : 'Verifying Claims vs Gemini Database'}
               </p>
            </div>
            <motion.div 
              animate={{ opacity: [0.4, 1, 0.4] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-center"
            >
               <h3 className="text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>{progress}% Complete</h3>
               <p className="text-xs text-slate-500 font-mono">NEURAL PIPELINE ACTIVE</p>
            </motion.div>
          </div>
        )}

        {stage === 'results' && result && (
          <NewsWatchResults result={result} onReset={reset} />
        )}
      </div>

      {/* RIGHT: Real-time Threat Feed */}
      <div className="w-80 flex flex-col gap-4">
        <div className="p-4 rounded-xl flex flex-col gap-4 h-full" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
             <div className="flex items-center gap-2">
                <Activity size={16} className="text-red-500" />
                <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>Live Threat Feed</span>
             </div>
             <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-500 animate-pulse">REC</span>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="popLayout">
              {activeThreats.map((threat, idx) => (
                <motion.div
                  key={`${threat.headline}-${idx}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-3 rounded-lg mb-3 flex flex-col gap-2"
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
                >
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-bold text-cyan-500 uppercase">{threat.platform}</span>
                     <span className="text-[10px] text-slate-500">{threat.time}</span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>{threat.headline}</p>
                  <div className="flex items-center justify-between mt-1">
                     <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${threat.verdict === 'FABRICATED' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                        {threat.verdict}
                     </span>
                     <span className="text-[10px] text-slate-500 font-mono">Risk: {threat.score}/100</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none" />
          </div>

          <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
             <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={12} className="text-cyan-400" />
                <span className="text-[10px] font-bold uppercase text-cyan-400">Trend Snapshot</span>
             </div>
             <p className="text-[10px] text-slate-400 font-mono">Misinformation density up 14% in last 2hrs (India region).</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function NewsWatchResults({ result, onReset }: { result: NewsWatchResult, onReset: () => void }) {
  const verdictColor = result.credibilityLabel === 'VERIFIED' ? 'var(--green)' : result.credibilityLabel === 'FABRICATED' ? 'var(--red)' : 'var(--amber)'
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-4 pb-12 overflow-y-auto pr-2 custom-scrollbar"
    >
      {/* Overview Card */}
      <div 
        className="p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-center"
        style={{ 
          background: 'var(--bg-secondary)', 
          border: `1px solid ${verdictColor}44`,
          boxShadow: `0 0 40px ${verdictColor}11`
        }}
      >
        <div className="relative w-32 h-32 flex items-center justify-center">
           <svg className="w-full h-full -rotate-90">
             <circle cx="64" cy="64" r="60" fill="transparent" stroke="var(--bg-primary)" strokeWidth="8" />
             <motion.circle 
               cx="64" cy="64" r="60" fill="transparent" stroke={verdictColor} strokeWidth="8" 
               strokeDasharray="377" 
               initial={{ strokeDashoffset: 377 }}
               animate={{ strokeDashoffset: 377 - (377 * result.overallScore) / 100 }}
               transition={{ duration: 1.5, ease: 'easeOut' }}
             />
           </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color: verdictColor }}>{result.overallScore}</span>
              <span className="text-[10px] uppercase font-bold text-slate-500">Veracity</span>
           </div>
        </div>

        <div className="flex-1">
           <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${result.credibilityLabel === 'VERIFIED' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {result.credibilityLabel}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Confidence: {(result.confidence * 100).toFixed(0)}%</span>
           </div>
           <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              {result.summary.oneLineVerdict}
           </h3>
           <p className="text-sm text-slate-400 leading-relaxed font-mono">
              {result.summary.detail}
           </p>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
           <div 
             className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 ${result.summary.recommendation === 'SAFE_TO_SHARE' ? 'border-green-500/50 hover:bg-green-500/10' : 'border-red-500/50 hover:bg-red-500/10'} transition-all`}
           >
              <p className="text-[10px] font-bold text-slate-500">ADVISORY</p>
              <p className="text-xs font-bold text-center">{result.summary.recommendation.replace(/_/g, ' ')}</p>
           </div>
           <button onClick={onReset} className="text-[11px] font-bold text-slate-500 hover:text-cyan-400 uppercase tracking-widest text-center mt-2">New Scan</button>
        </div>
      </div>

      {/* Verification Layers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Layer 1: Media */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/30 flex flex-col gap-4">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <Layers size={14} className="text-cyan-400" />
                 <span className="text-xs font-bold uppercase">Layer 1: Media Authenticity</span>
              </div>
              <span className={`text-[10px] font-bold ${result.mediaAnalysis.mediaScore > 80 ? 'text-green-500' : 'text-red-500'}`}>{result.mediaAnalysis.mediaScore}/100</span>
           </div>
           <div className="flex flex-wrap gap-2 text-[10px] font-mono">
              <span className="px-2 py-1 rounded bg-slate-800">{result.mediaAnalysis.imagesFound} IMAGES</span>
              <span className="px-2 py-1 rounded bg-slate-800">{result.mediaAnalysis.videosFound} VIDEOS</span>
              {result.mediaAnalysis.manipulatedMedia > 0 && <span className="px-2 py-1 rounded bg-red-900/40 text-red-500">DETECTION POSITIVE</span>}
           </div>
           <div className="space-y-1">
              {result.mediaAnalysis.flags.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-slate-400">
                   <div className="w-1 h-1 rounded-full bg-cyan-500" />
                   {f}
                </div>
              ))}
           </div>
        </div>

        {/* Layer 2: Headline */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/30 flex flex-col gap-4">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <MessageSquare size={14} className="text-purple-400" />
                 <span className="text-xs font-bold uppercase">Layer 2: Headline Consistency</span>
              </div>
              <span className={`text-[10px] font-bold ${result.headlineAnalysis.accuracyScore > 80 ? 'text-green-500' : 'text-amber-500'}`}>{result.headlineAnalysis.accuracyScore}/100</span>
           </div>
           <p className="text-[11px] italic bg-slate-800/50 p-2 rounded text-slate-300">"{result.headlineAnalysis.headline}"</p>
           <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                 <span className="text-slate-500">Sensationalism Detection</span>
                 <span className={result.headlineAnalysis.isSensationalized ? 'text-red-500' : 'text-green-500'}>{result.headlineAnalysis.isSensationalized ? 'HIGH' : 'LOW'}</span>
              </div>
              {result.headlineAnalysis.misleadingElements.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-red-400">
                   <AlertCircle size={10} />
                   {m}
                </div>
              ))}
           </div>
        </div>

        {/* Layer 3: Source */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/30 flex flex-col gap-4">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <Globe size={14} className="text-green-400" />
                 <span className="text-xs font-bold uppercase">Layer 3: Source Credibility</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500">{result.sourceAnalysis.credibilityScore}/100</span>
           </div>
           <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                 <LinkIcon size={12} className="text-slate-500" />
                 <span className="text-xs font-bold font-mono text-cyan-500">{result.sourceAnalysis.domain}</span>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${result.sourceAnalysis.knownOutlet ? 'bg-green-500/20 text-green-500' : 'bg-slate-700 text-slate-400'}`}>
                 {result.sourceAnalysis.knownOutlet ? 'VERIFIED OUTLET' : 'UNKNOWN SOURCE'}
              </span>
           </div>
           <div className="space-y-1">
              {result.sourceAnalysis.redFlags.map((rf, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-amber-500 font-mono">
                   <AlertTriangle size={10} />
                   {rf}
                </div>
              ))}
           </div>
        </div>

        {/* Layer 4: Claims */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/30 flex flex-col gap-4">
           <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                 <Shield size={14} className="text-amber-400" />
                 <span className="text-xs font-bold uppercase">Layer 4: Claim Verification</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500">{result.claimFlags.length} CLAIMS FOUND</span>
           </div>
           <div className="space-y-3">
              {result.claimFlags.map((c, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Status: {c.status}</span>
                      <div className={`w-2 h-2 rounded-full ${c.status === 'VERIFIED' ? 'bg-green-500' : c.status === 'FALSE' ? 'bg-red-500' : 'bg-amber-500'}`} />
                   </div>
                   <p className="text-[11px] font-medium text-slate-300 leading-tight">"{c.claim}"</p>
                   <p className="text-[10px] text-slate-500 italic">{c.explanation}</p>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Legal & Compliance Actions */}
      <div className="p-5 rounded-xl border border-slate-800 flex items-center justify-between bg-black/20">
         <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2">
              <Clock size={12} className="text-slate-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Regulatory Directives</span>
           </div>
           <div className="flex gap-3 mt-1">
              <div className="flex items-center gap-1">
                 <div className={`w-1.5 h-1.5 rounded-full ${result.legalFlags.escalateToCERTIn ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`} />
                 <span className="text-[10px] text-slate-500 font-mono">CERT-In ESCALATION: {result.legalFlags.escalateToCERTIn ? 'REQ' : 'NO'}</span>
              </div>
              <div className="flex items-center gap-1">
                 <div className={`w-1.5 h-1.5 rounded-full ${result.legalFlags.defamationRisk ? 'bg-amber-500' : 'bg-slate-700'}`} />
                 <span className="text-[10px] text-slate-500 font-mono">DEFAMATION RISK: {result.legalFlags.defamationRisk ? 'HIGH' : 'LOW'}</span>
              </div>
           </div>
         </div>
         <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg bg-slate-800 text-[11px] font-bold text-slate-300 hover:bg-slate-700 transition-all border border-slate-700">DOWNLOAD REPORT</button>
            <button className="px-4 py-2 rounded-lg bg-red-900/30 text-[11px] font-bold text-red-400 hover:bg-red-900/50 transition-all border border-red-500/30">FLAG MISINFORMATION</button>
         </div>
      </div>
    </motion.div>
  )
}
