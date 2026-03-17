export interface ScanHistoryItem {
  id: string
  type: 'image' | 'video' | 'audio' | 'news'
  result: 'AUTHENTIC' | 'FAKE' | 'SUSPICIOUS' | 'VERIFIED' | 'MISLEADING' | 'FABRICATED' | 'MIXED'
  score: number
  time: string
  timestamp: number
  status: string
  details?: string
  platform?: string
  caseId?: string // Link to complaint
  sha256Hash?: string // For certificates
  issuedAt?: string // For certificates
  name?: string // File name
}

export interface ComplaintData {
  caseId: string
  name: string
  email: string
  phone: string
  city: string
  state: string
  description: string
  timestamp: number
  status: 'Registered' | 'Investigation' | 'Escalated' | 'Resolved'
  scanId?: string
}

const STORAGE_KEY = 'antigravity_scan_history'
const COMPLAINT_KEY = 'antigravity_complaints'

export const historyService = {
  // Scans
  saveScan: (item: Omit<ScanHistoryItem, 'timestamp' | 'time'>) => {
    const history = historyService.getScans()
    const newItem: ScanHistoryItem = {
      ...item,
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today'
    }
    const updatedHistory = [newItem, ...history].slice(0, 50)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
    return newItem
  },

  getScans: (): ScanHistoryItem[] => {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    try { return JSON.parse(data) } catch { return [] }
  },

  getScanById: (id: string) => historyService.getScans().find(s => s.id === id),

  // Complaints
  saveComplaint: (data: Omit<ComplaintData, 'timestamp' | 'status'>) => {
    const complaints = historyService.getComplaints()
    const newComplaint: ComplaintData = {
      ...data,
      timestamp: Date.now(),
      status: 'Registered'
    }
    localStorage.setItem(COMPLAINT_KEY, JSON.stringify([newComplaint, ...complaints]))
    return newComplaint
  },

  getComplaints: (): ComplaintData[] => {
    const data = localStorage.getItem(COMPLAINT_KEY)
    if (!data) return []
    try { return JSON.parse(data) } catch { return [] }
  },

  getComplaintById: (id: string) => historyService.getComplaints().find(c => c.caseId === id),

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(COMPLAINT_KEY)
  }
}
