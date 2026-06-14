import { useNavigate } from 'react-router-dom'
import { Camera, Brain, FileDown, ChevronRight, Star } from 'lucide-react'

const STEPS = [
  { icon: Camera, title: '시험지 촬영', desc: '학생 시험지를 카메라로 찍거나 갤러리에서 선택합니다.' },
  { icon: Brain,  title: 'AI 자동 분석', desc: '6개 영역을 AI가 자동으로 분석하고 점수를 산정합니다.' },
  { icon: FileDown, title: '레포트 생성', desc: '학부모 상담용 전문 레포트를 PDF로 즉시 다운로드합니다.' },
]

const FEATURES = [
  '6개 영역 육각형 성취도 차트',
  '학습 성향 자동 진단',
  '실수 패턴 분석',
  '4주 학습 전략 제안',
  '학부모 상담 코멘트 생성',
  'A4 PDF 즉시 다운로드',
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-navy px-6 pt-16 pb-20 text-white text-center">
        <div className="inline-flex items-center gap-1.5 bg-gold/20 border border-gold/30 rounded-full px-4 py-1.5 text-gold text-xs font-bold mb-6">
          <Star className="w-3 h-3 fill-gold" /> AI 기반 성취도 분석 레포트
        </div>
        <h1 className="text-3xl font-extrabold leading-tight mb-3">
          영어홀릭<br />
          <span className="text-gold">어취브먼트 테스트</span> 레포트
        </h1>
        <p className="text-navy-200 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
          시험지 사진만 올리면 AI가 1분 안에<br />
          학부모 상담용 전문 레포트를 생성합니다
        </p>
        <button
          onClick={() => navigate('/upload')}
          className="inline-flex items-center gap-2 bg-gold text-white font-bold px-8 py-4 rounded-2xl shadow-gold hover:bg-gold-dark active:scale-95 transition-all text-base"
        >
          레포트 만들기 시작 <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Steps */}
      <div className="px-6 py-12 max-w-lg mx-auto">
        <h2 className="text-xl font-extrabold text-navy text-center mb-8">이렇게 사용하세요</h2>
        <div className="space-y-5">
          {STEPS.map((step, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center flex-shrink-0 shadow-card">
                <step.icon className="w-5 h-5 text-gold" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-gold">STEP {i + 1}</span>
                </div>
                <p className="font-bold text-navy text-sm">{step.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-navy-50 px-6 py-10">
        <div className="max-w-lg mx-auto">
          <h2 className="text-xl font-extrabold text-navy text-center mb-6">포함된 분석 항목</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-xl px-4 py-3 flex items-center gap-2 shadow-sm">
                <span className="text-gold font-bold text-sm">✓</span>
                <span className="text-xs font-medium text-gray-700">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA bottom */}
      <div className="px-6 py-10 text-center max-w-lg mx-auto">
        <button
          onClick={() => navigate('/upload')}
          className="btn-primary w-full text-base py-4"
        >
          지금 바로 시작하기
        </button>
        <p className="text-xs text-gray-400 mt-3">무료로 사용해보세요 · 가입 불필요</p>
      </div>
    </div>
  )
}
