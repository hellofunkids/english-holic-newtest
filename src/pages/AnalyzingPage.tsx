import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { StudentInfo } from '../types'

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

    const imagesRaw = sessionStorage.getItem('eh-images')
    const studentRaw = sessionStorage.getItem('eh-student')

    if (!imagesRaw || !studentRaw) {
      navigate('/')
      return
    }

    const images: string[] = JSON.parse(imagesRaw)
    const student: StudentInfo = JSON.parse(studentRaw)

    // Simulate step progression
    const t1 = setTimeout(() => setStep(1), 5000)
    const t2 = setTimeout(() => setStep(2), 15000)

    async function run() {
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images, student }),
        })

        clearTimeout(t1)
        clearTimeout(t2)

        if (!res.ok) {
          const { error: msg } = await res.json() as { error: string }
          throw new Error(msg ?? 'API error')
        }

        const report = await res.json()
        setStep(3)

        sessionStorage.removeItem('eh-images')
        sessionStorage.setItem('eh-report', JSON.stringify({ ...report, student }))

        setTimeout(() => navigate('/result'), 1000)
      } catch (err) {
        clearTimeout(t1)
        clearTimeout(t2)
        setError(err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.')
      }
    }

    run()
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen bg-navy-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-6">😔</div>
        <h2 className="text-lg font-extrabold text-navy mb-2">분석 중 오류가 발생했습니다</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">{error}</p>
        <div className="space-y-3 w-full max-w-xs">
          <p className="text-xs text-gray-400">
            {error.includes('OPENAI_API_KEY') || error.includes('API')
              ? 'Vercel 환경 변수에 OPENAI_API_KEY를 설정해주세요.'
              : '잠시 후 다시 시도해주세요.'}
          </p>
          <button onClick={() => navigate('/upload')} className="btn-outline w-full">
            다시 시도하기
          </button>
        </div>
      </div>
    )
  }

  const pct = step === 0 ? 15 : step === 1 ? 45 : step === 2 ? 75 : 100

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-6 text-center">
      {/* Animated icon */}
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

      {/* Progress bar */}
      <div className="w-64 h-2 bg-navy-light rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gold rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-gold font-bold text-sm">{pct}%</p>

      {/* Step indicators */}
      <div className="flex gap-3 mt-10">
        {STEPS.map((s, i) => (
          <div key={i} className={`text-xs font-semibold transition-all ${
            i <= step ? 'text-gold' : 'text-navy-light'
          }`}>
            <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${
              i < step ? 'bg-gold' : i === step ? 'bg-gold animate-pulse' : 'bg-navy-light'
            }`} />
            {s.label.replace('...', '').replace('!', '')}
          </div>
        ))}
      </div>
    </div>
  )
}
