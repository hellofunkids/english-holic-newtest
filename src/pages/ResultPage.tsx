import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import ReportContent from '../components/ReportContent'
import type { Report } from '../types'
import { saveLocalReport } from '../lib/history'

export default function ResultPage() {
  const navigate = useNavigate()
  const reportRef = useRef<HTMLDivElement>(null)
  const [report, setReport] = useState<Report | null>(null)
  const savedRef = useRef(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('eh-report')
    if (!raw) { navigate('/'); return }
    const r = JSON.parse(raw) as Report
    setReport(r)
    if (!savedRef.current) {
      savedRef.current = true
      saveLocalReport(r)
    }
  }, [navigate])

  function handleDownloadPDF() {
    window.print()
  }

  if (!report) return null

  return (
    <div className="min-h-screen bg-navy-50">
      <div className="no-print">
        <Header />
      </div>

      {/* Action bar */}
      <div className="no-print max-w-2xl mx-auto px-4 py-4 flex gap-3 justify-end">
        <button
          onClick={() => { sessionStorage.removeItem('eh-report'); navigate('/upload') }}
          className="btn-outline text-sm px-4 py-2"
        >
          새 레포트 만들기
        </button>
        <button
          onClick={handleDownloadPDF}
          className="btn-gold text-sm px-5 py-2"
        >
          📄 PDF 저장
        </button>
      </div>

      {/* Report */}
      <div id="report-print-wrapper" className="max-w-2xl mx-auto px-4 pb-12">
        <ReportContent ref={reportRef} report={report} />
      </div>
    </div>
  )
}
