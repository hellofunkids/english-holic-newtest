import type { Report } from '../types'

const KEY = 'eh-local-history'
const MAX = 200

export interface LocalReport extends Report {
  localId: string
  savedAt: string
}

export function saveLocalReport(report: Report): void {
  const all = loadLocalReports()
  const entry: LocalReport = {
    ...report,
    localId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: new Date().toISOString(),
  }
  try {
    localStorage.setItem(KEY, JSON.stringify([entry, ...all].slice(0, MAX)))
  } catch {
    try {
      localStorage.setItem(KEY, JSON.stringify([entry, ...all].slice(0, 30)))
    } catch {}
  }
}

export function loadLocalReports(): LocalReport[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as LocalReport[]
  } catch {
    return []
  }
}

export function deleteLocalReport(localId: string): void {
  const all = loadLocalReports().filter(r => r.localId !== localId)
  localStorage.setItem(KEY, JSON.stringify(all))
}
