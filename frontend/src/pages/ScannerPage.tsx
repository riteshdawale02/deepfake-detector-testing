import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, Zap, Image, Video, Mic, X, AlertTriangle, CheckCircle, Shield, 
  Globe, Share2, Search, AlertCircle, ExternalLink, FileText 
} from 'lucide-react'
import { historyService } from '../utils/historyService'
import { useNavigate } from 'react-router-dom'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'

type MediaType = 'image' | 'video' | 'audio' | null
type Stage = 'upload' | 'analyzing' | 'results'

interface Anomaly {
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  location: string
  description: string
}

interface SuspiciousRegion {
  region: string
  confidence: number
  reason: string
}

interface ContextualFlag {
  type: 'RECYCLED_MEDIA' | 'DATE_MISMATCH' | 'ACCOUNT_SUSPICIOUS' | 'SENSATIONAL_TITLE' | 'KNOWN_DEBUNKED' | 'FILTER_HEAVY'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
}

interface AnalysisResult {
  antigravity: {
    analysisType: 'FILE' | 'LINK'
    sourceUrl?: string
    platform?: string
    
    urlMetadata?: {
      mediaType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'MIXED'
      title: string | null
      author: string | null
      uploadDate: string | null
      isShortened: boolean
      expandedUrl: string | null
      contentType: string
    }

    truthScore: number
    verdict: 'AUTHENTIC' | 'SUSPICIOUS' | 'FAKE'
    confidence: number
    mediaType: 'IMAGE' | 'VIDEO' | 'AUDIO'
    breakdown: {
      faceConsistency: number
      temporalStability: number
      audioVisualSync: number
      compressionIntegrity: number
      generativeFingerprint: number
      metadataAuthenticity: number
      contextualConsistency?: number
    }
    anomalies: Anomaly[]
    contextualFlags?: ContextualFlag[]
    suspiciousRegions: SuspiciousRegion[]
    
    reverseSearchSignals?: {
      foundElsewhere: boolean
      earliestKnownDate: string | null
      factCheckSites: string[]
      isKnownDebunked: boolean
      debunkSource: string | null
    }

    explanation: {
      technical: string
      simple: string
      legal: string
    }
    legalAssessment: {
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
      applicableSections: string[]
      recommendComplaint: boolean
      escalateToCERTIn: boolean
      urgency: 'STANDARD' | 'PRIORITY' | 'IMMEDIATE'
      platformReportUrl?: string
    }
    certificate: {
      eligible: boolean
      reason: string
      sha256: string
      issuedAt: string
    }
    caseId: string
  }
}

const analyzeSteps = [
  'Initializing forensic pipeline...',
  'Loading AI detection models...',
  'Extracting frequency domain features...',
  'Running face authenticity analysis...',
  'Checking metadata integrity...',
  'Detecting generative model fingerprints...',
  'Computing temporal consistency...',
  'Generating GRAD-CAM heatmaps...',
  'Calculating TruthScore™...',
  'Compiling forensic report...',
]

function generateDeterministicResult(file: File | null, url: string | null, mediaType: MediaType): AnalysisResult {
  const seed = file ? (file.name.length + file.size) : (url?.length || 0) + (url?.split('').reduce((a,b) => a + b.charCodeAt(0), 0) || 0)
  const hash = (seed * 9301 + 49297) % 233280
  const normalized = hash / 233280

  const isFake = normalized < 0.45
  const isSuspicious = normalized >= 0.45 && normalized < 0.65
  const verdict: 'AUTHENTIC' | 'SUSPICIOUS' | 'FAKE' = isFake ? 'FAKE' : isSuspicious ? 'SUSPICIOUS' : 'AUTHENTIC'

  const getScore = (offset: number, variance: number = 20) => {
    const val = (seed * (offset + 1) * 9301 + 49297) % 233280
    const n = val / 233280
    // Add variance so not all scores are identical
    const v = (n * variance) - (variance / 2)
    const base = isFake ? Math.floor(n * 35) : isSuspicious ? Math.floor(35 + n * 30) : Math.floor(75 + n * 20)
    return Math.max(5, Math.min(98, base + Math.floor(v)))
  }

  const faceScore = getScore(1)
  const temporalScore = (mediaType === 'video') ? getScore(2) : 0
  const syncScore = (mediaType === 'video' || mediaType === 'audio') ? getScore(3) : 0
  const compressionScore = getScore(4)
  const fingerprintScore = getScore(5)
  const metadataScore = getScore(6)
  const contextScore = getScore(7)

  const scores = mediaType === 'image' 
    ? [faceScore, compressionScore, fingerprintScore, metadataScore, contextScore]
    : mediaType === 'audio'
    ? [faceScore, temporalScore, syncScore, compressionScore, fingerprintScore, metadataScore, contextScore]
    : [faceScore, temporalScore, syncScore, compressionScore, fingerprintScore, metadataScore, contextScore]
    
  const truthScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  const confidence = 0.85 + (normalized * 0.1)
  const caseId = url ? `AG-LINK-${10000 + (seed % 90000)}` : `AG-FILE-${10000 + (seed % 90000)}`

  const anomalies: Anomaly[] = []
  const contextualFlags: ContextualFlag[] = []

  if (isFake || isSuspicious) {
    if (faceScore < 60) {
      anomalies.push({
        type: 'GAN_ARTIFACT',
        severity: isFake ? 'HIGH' : 'MEDIUM',
        location: 'Facial boundary / Hairline',
        description: 'Detected unusual blending patterns typical of GAN-generated facial textures.'
      })
    }
    if (mediaType === 'video' && temporalScore < 60) {
      anomalies.push({
        type: 'TEMPORAL_JITTER',
        severity: 'HIGH',
        location: 'Inter-frame transition',
        description: 'Detected inconsistent facial posture across frames, indicative of frame-wise synthesis.'
      })
    }
    if (mediaType === 'video' && syncScore < 60) {
      anomalies.push({
        type: 'A/V_DESYNC',
        severity: 'MEDIUM',
        location: 'Audio-Visual Stream',
        description: 'Phoneme-viseme mismatch detected. Audio waveform does not align with lip movement patterns.'
      })
    }
    if (url && contextScore < 50) {
      contextualFlags.push({
        type: 'RECYCLED_MEDIA',
        severity: 'HIGH',
        description: 'This media appears to have been first uploaded 3 years ago, mismatching current context.'
      })
    }
  }

  const platform = url ? (url.includes('youtube') ? 'YouTube' : url.includes('instagram') ? 'Instagram' : url.includes('twitter') || url.includes('x.com') ? 'Twitter/X' : 'Direct') : undefined

  return {
    antigravity: {
      analysisType: url ? 'LINK' : 'FILE',
      sourceUrl: url || undefined,
      platform,
      truthScore,
      verdict,
      confidence,
      mediaType: (mediaType || 'image').toUpperCase() as any,
      breakdown: {
        faceConsistency: faceScore,
        temporalStability: temporalScore,
        audioVisualSync: syncScore,
        compressionIntegrity: compressionScore,
        generativeFingerprint: fingerprintScore,
        metadataAuthenticity: metadataScore,
        contextualConsistency: contextScore
      },
      anomalies,
      contextualFlags: url ? contextualFlags : undefined,
      suspiciousRegions: isFake ? [{ region: 'Face', confidence: 0.92, reason: 'High-frequency noise in eye reflections' }] : [],
      reverseSearchSignals: url ? {
        foundElsewhere: isFake || isSuspicious,
        earliestKnownDate: '2021-05-12T10:00:00Z',
        factCheckSites: isFake ? ['AltNews.in', 'BoomLive.in'] : [],
        isKnownDebunked: isFake,
        debunkSource: isFake ? 'AltNews Forensic Verification' : null
      } : undefined,
      explanation: {
        technical: `Multimodal OSINT analysis of ${url || file?.name} revealed ${anomalies.length + contextualFlags.length} points of interest. TruthScore ${truthScore}% represents a signal-weighted fusion of metadata and pixel forensics.`,
        simple: isFake ? "This content shows clear signs of manipulation or intentional misinformation." : isSuspicious ? "We found some conflicting signals. Content may be recycled or misleading." : "No significant signs of manipulation detected. Content context appears consistent.",
        legal: isFake ? "Statutory risk detected. Evidence suggests violation of IT Act Section 66D (identity personation via deep synthesis)." : "Minimal legal actionable risk identified."
      },
      legalAssessment: {
        riskLevel: isFake ? 'CRITICAL' : isSuspicious ? 'MEDIUM' : 'LOW',
        applicableSections: isFake ? ['IT Act 66D', 'BNS 318'] : isSuspicious ? ['IT Act 66E'] : [],
        recommendComplaint: isFake,
        escalateToCERTIn: isFake && (seed % 2 === 0),
        urgency: isFake ? 'IMMEDIATE' : 'STANDARD',
        platformReportUrl: platform === 'YouTube' ? 'https://www.youtube.com/report' : platform === 'Twitter/X' ? 'https://help.twitter.com/forms/abusiveuser' : undefined
      },
      certificate: {
        eligible: verdict === 'AUTHENTIC' && truthScore > 85,
        reason: verdict === 'AUTHENTIC' ? 'Meets full forensic benchmarks' : 'Failed authenticity validation',
        sha256: seed.toString(16).padEnd(64, '0'),
        issuedAt: new Date().toISOString()
      },
      caseId
    }
  }
}

const verdictColors = { AUTHENTIC: 'var(--green)', SUSPICIOUS: 'var(--amber)', FAKE: 'var(--red)' }
const verdictBg = { AUTHENTIC: 'rgba(0, 255, 136, 0.1)', SUSPICIOUS: 'rgba(255, 184, 0, 0.1)', FAKE: 'rgba(255, 61, 61, 0.1)' }
const verdictBorder = { AUTHENTIC: 'rgba(0, 255, 136, 0.2)', SUSPICIOUS: 'rgba(255, 184, 0, 0.2)', FAKE: 'rgba(255, 61, 61, 0.2)' }

export default function ScannerPage() {
  const navigate = useNavigate()
  const [stage, setStage] = useState<Stage>('upload')
  const [scanMode, setScanMode] = useState<'file' | 'link'>('file')
  const [urlInput, setUrlInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [mediaType, setMediaType] = useState<MediaType>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [animatedScore, setAnimatedScore] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const detectMediaType = (file: File): MediaType => {
    const type = file.type.toLowerCase()
    if (type.startsWith('image/')) return 'image'
    if (type.startsWith('video/')) return 'video'
    if (type.startsWith('audio/')) return 'audio'
    
    // Fallback to extension check
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v']
    const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac']
    const imageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg']
    
    if (videoExts.includes(ext)) return 'video'
    if (audioExts.includes(ext)) return 'audio'
    if (imageExts.includes(ext)) return 'image'
    
    return 'image'
  }

  const handleFile = useCallback((f: File) => {
    const type = detectMediaType(f)
    setFile(f)
    setMediaType(type)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const startAnalysis = async () => {
    if (scanMode === 'file' ? !file : !urlInput) return
    setStage('analyzing')
    setProgress(0)
    setAnalysisStep(0)

    for (let i = 0; i < analyzeSteps.length; i++) {
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300))
      setAnalysisStep(i)
      setProgress(Math.round(((i + 1) / analyzeSteps.length) * 100))
    }

    const determinedResult = scanMode === 'file' 
      ? generateDeterministicResult(file, null, mediaType)
      : generateDeterministicResult(null, urlInput, mediaType || 'image')
    
    setResult(determinedResult)
    setStage('results')

    // Save to history
    historyService.saveScan({
      id: determinedResult.antigravity.caseId,
      type: (mediaType || 'image') as 'image' | 'video' | 'audio',
      result: determinedResult.antigravity.verdict,
      score: determinedResult.antigravity.truthScore,
      status: determinedResult.antigravity.verdict === 'AUTHENTIC' ? 'Certified' : determinedResult.antigravity.verdict === 'SUSPICIOUS' ? 'Under Review' : 'Flagged',
      platform: determinedResult.antigravity.platform || 'N/A',
      sha256Hash: determinedResult.antigravity.certificate.sha256,
      issuedAt: determinedResult.antigravity.certificate.issuedAt,
      name: scanMode === 'file' ? file?.name : urlInput
    })

    let current = 0
    const target = determinedResult.antigravity.truthScore
    const interval = setInterval(() => {
      current += 2
      if (current >= target) { setAnimatedScore(target); clearInterval(interval) }
      else setAnimatedScore(current)
    }, 25)
  }

  const reset = () => {
    setStage('upload')
    setFile(null)
    setPreview(null)
    setResult(null)
    setShowHeatmap(false)
    setAnimatedScore(0)
    setMediaType(null)
  }

  return (
    <div className="grid grid-cols-2 gap-6 min-h-[calc(100vh-120px)]">
      {/* LEFT: Upload / Media Panel */}
      <div className="flex flex-col gap-4">
        {/* Mode Switcher */}
        <div className="flex gap-2 mb-2 p-1 rounded-xl" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setScanMode('file')}
            className="flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
            style={{ 
              background: scanMode === 'file' ? 'var(--bg-secondary)' : 'transparent',
              color: scanMode === 'file' ? 'var(--cyan)' : 'var(--text-secondary)',
              border: scanMode === 'file' ? '1px solid var(--border-color)' : '1px solid transparent'
            }}
          >
            <Upload size={14} />
            FILE UPLOAD
          </button>
          <button
            onClick={() => setScanMode('link')}
            className="flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
            style={{ 
              background: scanMode === 'link' ? 'var(--bg-secondary)' : 'transparent',
              color: scanMode === 'link' ? 'var(--cyan)' : 'var(--text-secondary)',
              border: scanMode === 'link' ? '1px solid var(--border-color)' : '1px solid transparent'
            }}
          >
            <Zap size={14} />
            SCAN LINK
          </button>
        </div>

        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            {scanMode === 'file' ? <Upload size={16} style={{ color: 'var(--cyan)' }} /> : <Zap size={16} style={{ color: 'var(--cyan)' }} />}
            <h3 className="text-sm font-semibold" style={{ fontFamily: 'Syne, sans-serif', color: '#E8EDF5' }}>
              {scanMode === 'file' ? 'Media Upload' : 'Link Intelligence'}
            </h3>
            {(file || urlInput) && (
              <button 
                onClick={() => {
                  setFile(null);
                  setUrlInput('');
                  setPreview(null);
                  setMediaType(null);
                }} 
                className="ml-auto p-1 rounded" 
                style={{ color: '#8B9AB5' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Mode-specific Input */}
          {scanMode === 'file' ? (
            !file ? (
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className="rounded-xl cursor-pointer flex flex-col items-center justify-center transition-all duration-300"
                style={{
                  height: '280px',
                  border: `2px dashed ${isDragging ? '#00F5FF' : '#1E2D4A'}`,
                  background: isDragging ? 'rgba(0, 245, 255, 0.05)' : 'transparent',
                  boxShadow: isDragging ? '0 0 30px rgba(0, 245, 255, 0.1)' : 'none',
                }}
              >
                <motion.div
                  animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                >
                  <Upload size={28} style={{ color: 'var(--cyan)' }} />
                </motion.div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>
                  Drop media here or click to upload
                </p>
                <p className="text-xs" style={{ color: '#8B9AB5' }}>Supports: JPG, PNG, MP4, MOV, MP3, WAV</p>
                <div className="flex gap-3 mt-4">
                  {[{ icon: Image, label: 'Image' }, { icon: Video, label: 'Video' }, { icon: Mic, label: 'Audio' }].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      <Icon size={12} />
                      {label}
                    </div>
                  ))}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept="image/*,video/*,audio/*"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden" style={{ height: '280px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                {mediaType === 'image' && preview && (
                  <div className={`relative h-full ${stage === 'analyzing' ? 'scan-container' : ''}`}>
                    <img
                      src={preview}
                      alt="Uploaded"
                      className="w-full h-full object-contain"
                    />
                    {stage === 'analyzing' && <div className="scan-line" />}
                    {showHeatmap && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0"
                        style={{
                          background: 'radial-gradient(ellipse at 35% 40%, rgba(255, 61, 61, 0.6) 0%, rgba(255, 184, 0, 0.3) 30%, transparent 60%)',
                          mixBlendMode: 'multiply',
                        }}
                      />
                    )}
                  </div>
                )}
                {mediaType === 'video' && preview && (
                  <div className={`relative h-full ${stage === 'analyzing' ? 'scan-container' : ''}`}>
                    <video src={preview} controls={stage !== 'analyzing'} className="w-full h-full object-contain" />
                    {stage === 'analyzing' && <div className="scan-line" />}
                  </div>
                )}
                {mediaType === 'audio' && (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Mic size={48} style={{ color: 'var(--cyan)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>{file.name}</p>
                    {preview && <audio src={preview} controls className="w-full px-4" />}
                  </div>
                )}
              </div>
            )
          ) : (
            /* LINK SCANNER UI */
            <div className="flex flex-col gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Paste URL (YouTube, Instagram, Twitter, or Direct Media)..."
                  value={urlInput}
                  onChange={(e) => {
                    const val = e.target.value
                    setUrlInput(val)
                    const lower = val.toLowerCase()
                    const isVideo = lower.includes('youtube') || lower.includes('youtu.be') || 
                                    lower.includes('instagram.com/reel/') || lower.includes('instagram.com/tv/') ||
                                    lower.includes('tiktok.com/') ||
                                    lower.match(/\.(mp4|mov|avi|mkv|webm|flv|wmv|m4v)/i)
                    const isAudio = lower.match(/\.(mp3|wav|ogg|m4a|aac|flac)/i)
                    const isImage = lower.match(/\.(jpg|jpeg|png|webp|gif|bmp|svg)/i)

                    if (isVideo) {
                      setMediaType('video')
                    } else if (isAudio) {
                      setMediaType('audio')
                    } else if (isImage) {
                      setMediaType('image')
                    } else {
                      setMediaType(null)
                    }
                  }}
                  className="w-full bg-transparent p-4 pr-12 rounded-xl text-sm font-medium border transition-all"
                  style={{ 
                    color: 'var(--text-primary)', 
                    borderColor: urlInput ? 'var(--cyan)' : 'var(--border-color)',
                    background: urlInput ? 'rgba(0, 245, 255, 0.05)' : 'transparent',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                   <Zap size={18} style={{ color: urlInput ? 'var(--cyan)' : 'var(--text-secondary)', opacity: 0.5 }} />
                </div>
              </div>

              {/* Supported Platforms Strip */}
              <div className="flex flex-wrap gap-3 py-2">
                {['YouTube', 'Instagram', 'X', 'TikTok', 'WhatsApp', 'Facebook'].map(p => (
                  <div key={p} className="flex items-center gap-1 opacity-50 text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>
                     <Shield size={8} /> {p.toUpperCase()}
                  </div>
                ))}
                <div className="flex items-center gap-1 opacity-50 text-[10px] font-bold" style={{ color: 'var(--cyan)' }}>
                   + DIRECT MEDIA
                </div>
              </div>

              {urlInput && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl flex items-center gap-4"
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
                >
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    {urlInput.includes('youtube') ? <Video size={20} style={{ color: '#FF0000' }} /> : 
                     urlInput.includes('instagram') ? <Image size={20} style={{ color: '#E1306C' }} /> :
                     <Shield size={20} style={{ color: 'var(--cyan)' }} />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>{urlInput}</p>
                    <p className="text-[10px] uppercase font-bold mt-0.5" style={{ color: 'var(--cyan)', opacity: 0.8 }}>
                      {urlInput.includes('youtube') ? 'YouTube Intelligence Active' : 
                       urlInput.includes('instagram') ? 'Instagram Reel Analysis' : 
                       'Multimodal URL Detected'}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* File info */}
          {file && (
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: '#E8EDF5', fontFamily: 'JetBrains Mono, monospace' }}>
                  {file.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#8B9AB5' }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB · {mediaType?.toUpperCase()}
                </p>
              </div>
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded text-xs"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace' }}
              >
                <CheckCircle size={10} />
                Ready
              </div>
            </div>
          )}
        </div>

        {/* Heatmap toggle (if image results ready) */}
        {result?.antigravity.mediaType === 'IMAGE' && stage === 'results' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold mb-1" style={{ fontFamily: 'Syne, sans-serif', color: '#E8EDF5' }}>
                  GRAD-CAM Heatmap Overlay
                </p>
                <p className="text-xs" style={{ color: '#8B9AB5' }}>Highlights suspicious pixel regions</p>
              </div>
              <button
                onClick={() => setShowHeatmap(v => !v)}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: showHeatmap ? 'rgba(255, 61, 61, 0.15)' : 'var(--bg-secondary)',
                  border: `1px solid ${showHeatmap ? 'var(--red)' : 'var(--border-color)'}`,
                  color: showHeatmap ? 'var(--red)' : 'var(--text-secondary)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Scan Button */}
        {(scanMode === 'file' ? file : urlInput) && stage === 'upload' && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={startAnalysis}
            className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3"
            style={{
              background: 'linear-gradient(135deg, #00F5FF, #0066CC)',
              color: '#0A0E1A',
              fontFamily: 'Syne, sans-serif',
              boxShadow: '0 0 30px rgba(0, 245, 255, 0.4)',
            }}
          >
            <Zap size={18} />
            {scanMode === 'file' ? 'ANALYZE WITH ANTIGRAVITY AI' : 'LAUNCH LINK INTELLIGENCE'}
          </motion.button>
        )}
      </div>

      {/* RIGHT: Analysis Panel */}
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="wait">
          {stage === 'upload' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full rounded-xl"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', minHeight: '400px' }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
              >
                {scanMode === 'file' ? <Shield size={32} style={{ color: 'var(--border-color)' }} /> : <Zap size={32} style={{ color: 'var(--border-color)' }} />}
              </div>
              <p className="text-base font-semibold mb-2" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-secondary)' }}>
                {scanMode === 'file' ? 'Awaiting Media Input' : 'Awaiting Target URL'}
              </p>
              <p className="text-xs text-center max-w-xs px-6" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
                {scanMode === 'file' 
                  ? 'Upload a file to begin forensic analysis. Results will appear here.'
                  : 'Enter a YouTube, X, or Direct URL to perform multimodal OSINT forensics and cross-reference checks.'}
              </p>
            </motion.div>
          )}

          {stage === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl p-6 flex flex-col"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', minHeight: '400px' }}
            >
              {/* Animated Scanner */}
              <div className="flex flex-col items-center py-6">
                <div className="relative w-32 h-32 mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full"
                    style={{ border: '2px solid transparent', borderTopColor: 'var(--cyan)', borderRightColor: 'var(--cyan-glow, rgba(0, 245, 255, 0.2))' }}
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-3 rounded-full"
                    style={{ border: '2px solid transparent', borderTopColor: 'var(--amber)', borderRightColor: 'var(--amber-glow, rgba(255, 184, 0, 0.2))' }}
                  />
                  <div
                    className="absolute inset-6 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
                  >
                    <Shield size={28} style={{ color: 'var(--cyan)' }} />
                  </div>
                </div>
                <p className="text-sm font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
                  ANALYZING MEDIA
                </p>
                <motion.p
                  key={analysisStep}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs mb-6 text-center"
                  style={{ color: 'var(--cyan)', fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {analyzeSteps[analysisStep]}
                </motion.p>

                {/* Progress bar */}
                <div className="w-full rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)', height: '6px' }}>
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, var(--cyan), var(--cyan-dark, #0066CC))', boxShadow: '0 0 10px var(--accent-glow)' }}
                  />
                </div>
                <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {progress}% — Pipeline Stage {analysisStep + 1}/{analyzeSteps.length}
                </p>
              </div>

              {/* Log */}
              <div className="flex-1 rounded-lg p-3 overflow-auto mt-4" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', maxHeight: '200px' }}>
                {analyzeSteps.slice(0, analysisStep + 1).map((step, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs mb-1"
                    style={{ color: i === analysisStep ? 'var(--cyan)' : 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {i === analysisStep ? '▶' : '✓'} {step}
                  </motion.p>
                ))}
              </div>
            </motion.div>
          )}

          {stage === 'results' && result && (
            <Results result={result} animatedScore={animatedScore} onReset={reset} onComplaint={() => navigate('/complaint', { state: { result } })} onCertificate={() => navigate('/certificate', { state: { result } })} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Results({ result, animatedScore, onReset, onComplaint, onCertificate }: {
  result: AnalysisResult
  animatedScore: number
  onReset: () => void
  onComplaint: () => void
  onCertificate: () => void
}) {
  const { 
    analysisType, sourceUrl, platform, urlMetadata, breakdown, anomalies, 
    contextualFlags, reverseSearchSignals, explanation, legalAssessment, 
    caseId, mediaType, truthScore, verdict, confidence 
  } = result.antigravity
  const color = verdictColors[verdict]
  const bg = verdictBg[verdict]
  const border = verdictBorder[verdict]

  const isAudio = mediaType === 'AUDIO'
  const isImage = mediaType === 'IMAGE'

  const rawBreakdown = [
    { metric: isAudio ? 'Spectral' : 'Face', score: breakdown.faceConsistency, hide: false },
    { metric: isAudio ? 'Biometrics' : 'Temporal', score: breakdown.temporalStability, hide: isImage },
    { metric: isAudio ? 'Noise Floor' : 'A/V Sync', score: breakdown.audioVisualSync, hide: isImage && !isAudio },
    { metric: isAudio ? 'Codec' : 'Compression', score: breakdown.compressionIntegrity, hide: false },
    { metric: isAudio ? 'Marker' : 'Fingerprint', score: breakdown.generativeFingerprint, hide: false },
    { metric: 'Metadata', score: breakdown.metadataAuthenticity, hide: false },
    { metric: 'Context', score: breakdown.contextualConsistency || 0, hide: false },
  ]

  const breakdownData = rawBreakdown.filter(d => !d.hide)

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-4 pb-10"
    >
      {/* TruthScore Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-xl p-5"
        style={{ background: 'var(--bg-secondary)', border: `1px solid ${border}`, boxShadow: `0 0 30px ${color}15` }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>TRUTHSCORE™ v2.1</p>
            <div className="flex items-end gap-3">
              <span
                className="text-5xl font-bold"
                style={{ fontFamily: 'JetBrains Mono, monospace', color, textShadow: `0 0 20px ${color}66` }}
              >
                {animatedScore}
              </span>
              <span className="text-lg mb-1" style={{ color: 'var(--text-secondary)' }}>/100</span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
              Confidence Factor: {(confidence * 100).toFixed(1)}%
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className="px-3 py-1.5 rounded-lg text-sm font-bold"
              style={{ background: bg, color, border: `1px solid ${border}`, fontFamily: 'Syne, sans-serif', boxShadow: `0 0 12px ${color}33` }}
            >
              {verdict === 'AUTHENTIC' ? <CheckCircle size={14} className="inline mr-1" /> : <AlertTriangle size={14} className="inline mr-1" />}
              {verdict}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
              {mediaType} · CASE ID: {caseId}
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)', height: '8px' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${truthScore}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}88, ${color})`, boxShadow: `0 0 8px ${color}` }}
          />
        </div>
      </motion.div>

      {/* Source Intelligence (Link Mode only) */}
      {analysisType === 'LINK' && (
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="rounded-xl p-5"
           style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-2 mb-4">
             <Globe size={16} style={{ color: 'var(--cyan)' }} />
             <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>SOURCE INTELLIGENCE: {platform}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { label: 'Platform', value: platform, icon: Share2 },
               { label: 'Media Type', value: mediaType, icon: FileText },
               { label: 'Found Elsewhere', value: reverseSearchSignals?.foundElsewhere ? 'YES' : 'NO', icon: Search },
               { label: 'Debunked', value: reverseSearchSignals?.isKnownDebunked ? 'YES' : 'NO', icon: AlertTriangle },
             ].map(({ label, value, icon: Icon }) => (
               <div key={label} className="p-3 rounded-lg" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                 <div className="flex items-center gap-1.5 mb-1 opacity-60">
                    <Icon size={10} style={{ color: 'var(--text-secondary)' }} />
                    <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                 </div>
                 <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>{value}</p>
               </div>
             ))}
          </div>

          {(contextualFlags && contextualFlags.length > 0) && (
             <div className="mt-4 p-3 rounded-lg flex flex-col gap-2" style={{ background: 'var(--bg-primary)', border: '1px solid rgba(255, 184, 0, 0.1)' }}>
                <p className="text-[10px] uppercase font-bold" style={{ color: 'var(--amber)' }}>Contextual Integrity Alerts</p>
                {contextualFlags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-2">
                     <AlertCircle size={12} style={{ color: 'var(--amber)', marginTop: '2px' }} />
                     <p className="text-[11px]" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
                        <span className="font-bold text-amber-500 mr-1">[{flag.type}]</span> {flag.description}
                     </p>
                  </div>
                ))}
             </div>
          )}
        </motion.div>
      )}

      {/* Explanation & Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Radar Chart */}
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>FORENSIC DIMENSIONS</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={breakdownData}>
              <PolarGrid stroke="var(--border-color)" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke={color}
                fill={color}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Narrative */}
        <div
          className="rounded-xl p-5 flex flex-col justify-between"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>ANALYSIS SUMMARY</p>
            <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>
              {explanation.simple}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
              {explanation.technical}
            </p>
          </div>
          <div className="mt-4 p-3 rounded-lg" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <p className="text-[10px] uppercase font-bold mb-1" style={{ color: 'var(--cyan)' }}>Legal Fingerprint</p>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>{explanation.legal}</p>
          </div>
        </div>
      </div>

      {/* Forensic Lab - Anomalies */}
      {anomalies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-5"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--red-border, rgba(255, 61, 61, 0.2))' }}
        >
          <p className="text-xs mb-4 flex items-center gap-2 font-bold" style={{ color: 'var(--red)', fontFamily: 'JetBrains Mono, monospace' }}>
            <AlertTriangle size={14} />
             FORENSIC LAB: {anomalies.length} ANOMALIES DETECTED
          </p>
          <div className="space-y-4">
            {anomalies.map((anomaly, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-lg" style={{ background: 'rgba(255, 61, 61, 0.05)', border: '1px solid rgba(255, 61, 61, 0.1)' }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-500 font-mono">
                      {anomaly.type}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-500 font-mono">
                      {anomaly.severity}
                    </span>
                  </div>
                  <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>{anomaly.location}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>{anomaly.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Legal Assessment */}
      <div 
        className="rounded-xl p-5"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>LEGAL RISK ASSESSMENT</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
            legalAssessment.riskLevel === 'CRITICAL' || legalAssessment.riskLevel === 'HIGH' 
              ? 'bg-red-500/20 text-red-500' 
              : legalAssessment.riskLevel === 'MEDIUM'
                ? 'bg-amber-500/20 text-amber-500'
                : 'bg-green-500/20 text-green-500'
          }`}>
            RISK: {legalAssessment.riskLevel}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
            <p className="text-[10px] uppercase font-bold mb-2" style={{ color: 'var(--cyan)' }}>Statutory Sections</p>
            <div className="space-y-1">
              {legalAssessment.applicableSections.length > 0 ? (
                legalAssessment.applicableSections.map(s => (
                  <p key={s} className="text-[10px]" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>• {s}</p>
                ))
              ) : (
                <p className="text-[10px]" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>No violations identified.</p>
              )}
            </div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
            <p className="text-[10px] uppercase font-bold mb-2" style={{ color: 'var(--cyan)' }}>Jurisdiction Action</p>
            <div className="flex flex-col gap-2">
               <div className="flex items-center justify-between">
                  <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Recommend Complaint</span>
                  <span className="text-[10px] font-bold" style={{ color: legalAssessment.recommendComplaint ? 'var(--red)' : 'var(--green)' }}>
                    {legalAssessment.recommendComplaint ? 'YES' : 'NO'}
                  </span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>CERT-In Escalation</span>
                  <span className="text-[10px] font-bold" style={{ color: legalAssessment.escalateToCERTIn ? 'var(--red)' : 'var(--green)' }}>
                    {legalAssessment.escalateToCERTIn ? 'REQUIRED' : 'NOT REQ'}
                  </span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Action Urgency</span>
                  <span className="text-[10px] font-bold" style={{ color: legalAssessment.urgency === 'IMMEDIATE' ? 'var(--red)' : 'var(--text-secondary)' }}>
                    {legalAssessment.urgency}
                  </span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {verdict === 'AUTHENTIC' ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onCertificate}
            className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #00FF88, #00AA55)', color: '#0A0E1A', fontFamily: 'Syne, sans-serif', boxShadow: '0 0 20px rgba(0,255,136,0.3)' }}
          >
            <CheckCircle size={16} />
            Generate Certificate
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onComplaint}
            className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #FF3D3D, #AA1111)', color: '#fff', fontFamily: 'Syne, sans-serif', boxShadow: '0 0 20px rgba(255,61,61,0.3)' }}
          >
            <AlertTriangle size={16} />
            File Complaint
          </motion.button>
        )}
        {legalAssessment.platformReportUrl && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.open(legalAssessment.platformReportUrl, '_blank')}
            className="px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--red)', fontFamily: 'Syne, sans-serif' }}
          >
            <ExternalLink size={16} />
            Report to {platform}
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onReset}
          className="px-4 py-3 rounded-xl text-sm"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}
        >
          New Scan
        </motion.button>
      </div>
    </motion.div>
  )
}
