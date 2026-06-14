import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { StudentInfo } from '../types'
import { loadImages, clearImages } from '../lib/imageStore'

const STEPS = [
  { label: '이미지 분석 중...', sub: 'AI가 시험지를 읽고 있습니다' },
  { label: 'AI 진단 중...',     sub: '6개 영역을 종합 평가하고 있습니다' },
  { label: '레포트 생성 중...', sub: '전문 상담 코멘트를 작성하고 있습니다' },
  { label: '완료!',             sub: '레포트가 준비되었습니다' },
]

export default function AnalyzingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const t1 = setTimeout(() => setStep(1), 5000)
    const t2 = setTimeout(() => setStep(2), 20000)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 55000)

    async function run() {
      try {
        // Read student from sessionStorage (small, safe)
        const studentRaw = sessionStorage.getItem('eh-student')
        if (!studentRaw) { navigate('/'); return }
        const student = JSON.parse(studentRaw) as StudentInfo

        // Read images from IndexedDB (no size limit)
        const images = await loadImages()
        if (!images?.length) { navigate('/'); return }

        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images, student }),
          signal: controller.signal,
        })

        clearTimeout(t1); clearTimeout(t2); clearTimeout(timeout)

        if (!res.ok) {
          let msg = `서버 오류 (HTTP ${res.status})`
          try {
            const body = await res.json() as { error?: string }
            if (body.error) msg = body.error
          } catch {}
          throw new Error(msg)
        }

        const report = await res.json()
        setStep(3)
        await clearImages()
        sessionStorage.setItem('eh-report', JSON.stringify({ ...report, student }))
        setTimeout(() => navigate('/result'), 800)

      } catch (err) {
        clearTimeout(t1); clearTimeout(t2); clearTimeout(timeout)
        if (err instanceof Error && err.name === 'AbortError') {
          setError('분석 시간이 초과되었습니다 (55초). 이미지 장수를 줄이고 다시 시도해주세요.')
        } else {
          setError(err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.')
        }
      }
    }

    run()
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(timeout); controller.abort() }
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen bg-navy-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-6">😔</div>
        <h2 className="text-lg font-extrabold text-navy mb-2">분석 중 오류가 발생했습니다</h2>
        <p className="text-sm text-gray-600 mb-2 max-w-xs font-mono bg-gray-100 rounded-xl px-4 py-2 break-words">{error}</p>
        <p className="text-xs text-gray-400 mb-6 max-w-xs">
          위 오류 메시지를 알려주시면 빠르게 수정할 수 있습니다.
        </p>
        <button onClick={() => navigate('/upload')} className="btn-gold w-full max-w-xs">
          다시 시도하기
        </button>
      </div>
    )
  }

  const pct = step === 0 ? 15 : step === 1 ? 45 : step === 2 ? 75 : 100

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-10">
        <div className="w-24 h-24 rounded-full border-4 border-navy-light border-t-gold animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl">
            {step === 0 ? '📄' : step === 1 ? '🧠' : step === 2 ? '✍️' : '✅'}
          </span>
        </div>
      </div>

      <h1 className="text-2xl font-extrabold text-white mb-2">{STEPS[step].label}</h1>
      <p className="text-navy-200 text-sm mb-10">{STEPS[step].sub}</p>

      <div className="w-64 h-2 bg-navy-light rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gold rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-gold font-bold text-sm">{pct}%</p>

      <div className="flex gap-3 mt-10">
        {STEPS.map((s, i) => (
          <div key={i} className={`text-xs font-semibold transition-all ${i <= step ? 'text-gold' : 'text-navy-light'}`}>
            <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${i < step ? 'bg-gold' : i === step ? 'bg-gold animate-pulse' : 'bg-navy-light'}`} />
            {s.label.replace('...', '').replace('!', '')}
          </div>
        ))}
      </div>
    </div>
  )
}
