import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import ReportContent from '../components/ReportContent'
import type { Report } from '../types'
import { totalScoreGrade } from '../lib/utils'
import { saveLocalReport } from '../lib/history'

export default function ResultPage() {
  const navigate = useNavigate()
  const reportRef = useRef<HTMLDivElement>(null)
  const [report, setReport] = useState<Report | null>(null)
  const [downloading, setDownloading] = useState(false)
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

  async function handleDownloadPDF() {
    if (!reportRef.current || !report) return
    setDownloading(true)
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])

      await document.fonts.ready
      await new Promise(r => setTimeout(r, 400))

      const el = reportRef.current
      const CAPTURE_W = 680

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: CAPTURE_W,
        onclone: (_doc, clone) => {
          clone.style.width = `${CAPTURE_W}px`
          clone.style.maxWidth = `${CAPTURE_W}px`
          clone.style.position = 'static'
          clone.style.overflow = 'visible'
          // Ensure SVGs have explicit dimensions
          clone.querySelectorAll('svg').forEach(svg => {
            const w = svg.getAttribute('width') || '260'
            const h = svg.getAttribute('height') || '240'
            svg.setAttribute('width', w)
            svg.setAttribute('height', h)
          })
        },
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()

      const imgW = pageW
      const imgH = (canvas.height / canvas.width) * imgW

      let yOffset = 0
      let pagesAdded = 0

      while (yOffset < imgH) {
        if (pagesAdded > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, -yOffset, imgW, imgH, undefined, 'FAST')
        yOffset += pageH
        pagesAdded++
      }

      const grade = totalScoreGrade(report.totalScore)
      pdf.save(`${report.student.name}_${report.student.testName}_${grade}.pdf`)
    } catch (e) {
      console.error('PDF error:', e)
      alert('PDF 생성에 실패했습니다. 인쇄(🖨️) 버튼을 사용해주세요.')
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
            ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />생성 중...</>
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
      <div id="report-print-wrapper" className="max-w-2xl mx-auto px-4 pb-12">
        <ReportContent ref={reportRef} report={report} />
      </div>
    </div>
  )
}
