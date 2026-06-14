import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import ReportContent from '../components/ReportContent'
import type { Report } from '../types'
import { totalScoreGrade } from '../lib/utils'

export default function ResultPage() {
  const navigate = useNavigate()
  const reportRef = useRef<HTMLDivElement>(null)
  const [report, setReport] = useState<Report | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('eh-report')
    if (!raw) { navigate('/'); return }
    setReport(JSON.parse(raw) as Report)
  }, [navigate])

  async function handleDownloadPDF() {
    if (!reportRef.current || !report) return
    setDownloading(true)
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const imgW = pageW
      const imgH = (canvas.height * imgW) / canvas.width

      let position = 0
      let remaining = imgH

      while (remaining > 0) {
        if (position > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, -position, imgW, imgH)
        position += pageH
        remaining -= pageH
      }

      const grade = totalScoreGrade(report.totalScore)
      pdf.save(`${report.student.name}_${report.student.testName}_${grade}.pdf`)
    } catch (e) {
      console.error('PDF error:', e)
      window.print()
    } finally {
      setDownloading(false)
    }
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
          disabled={downloading}
          className="btn-gold text-sm px-5 py-2 flex items-center gap-2"
        >
          {downloading
            ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 생성 중...</>
            : '📄 PDF 다운로드'}
        </button>
        <button
          onClick={() => window.print()}
          className="btn-outline text-sm px-4 py-2"
        >
          🖨️ 인쇄
        </button>
      </div>

      {/* Report */}
      <div className="max-w-2xl mx-auto px-4 pb-12">
        <ReportContent ref={reportRef} report={report} />
      </div>
    </div>
  )
}
