import { forwardRef } from 'react'
import HexagonChart from './HexagonChart'
import type { Report } from '../types'
import { scoreColor, scoreLabel, totalScoreGrade } from '../lib/utils'

const DOMAINS = [
  { key: 'vocabulary' as const, label: 'Vocabulary', labelKo: '어휘력' },
  { key: 'grammar'    as const, label: 'Grammar',    labelKo: '문법' },
  { key: 'reading'    as const, label: 'Reading',    labelKo: '독해' },
  { key: 'writing'    as const, label: 'Writing',    labelKo: '쓰기' },
  { key: 'sentence'   as const, label: 'Sentence Structure', labelKo: '문장구조' },
  { key: 'practical'  as const, label: 'Practical Usage',    labelKo: '활용능력' },
]

const STYLE_ICONS: Record<string, string> = {
  '반복형': '🔄', '감각형': '🎨', '분석형': '🔍', '완벽주의형': '⭐', '실수형': '⚡',
}

interface Props { report: Report }

const ReportContent = forwardRef<HTMLDivElement, Props>(({ report }, ref) => {
  const { student, totalScore, scores, analysis } = report
  const grade = totalScoreGrade(totalScore)

  const gradeColor =
    totalScore >= 90 ? '#10B981' :
    totalScore >= 75 ? '#1B3A6B' :
    totalScore >= 60 ? '#C9A84C' : '#EF4444'

  return (
    <div ref={ref} className="bg-white max-w-2xl mx-auto">
      {/* ── Report header ─────────────────────────────────────── */}
      <div className="bg-navy px-8 py-10 text-white print-header">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gold text-xs font-bold tracking-widest uppercase mb-2">영어홀릭 Achievement Report</p>
            <h1 className="text-2xl font-extrabold leading-tight">어취브먼트 테스트 레포트</h1>
            <p className="text-navy-200 text-sm mt-1">English Achievement Test Report</p>
          </div>
          <div className="text-right">
            <div
              className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center"
              style={{ background: `${gradeColor}30`, border: `2px solid ${gradeColor}` }}
            >
              <span className="text-2xl font-extrabold" style={{ color: gradeColor }}>{grade}</span>
            </div>
          </div>
        </div>

        {/* Student info */}
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div className="flex gap-2"><span className="text-navy-200 w-16">학생</span><span className="font-semibold">{student.name}</span></div>
          <div className="flex gap-2"><span className="text-navy-200 w-16">학년</span><span className="font-semibold">{student.grade}</span></div>
          <div className="flex gap-2"><span className="text-navy-200 w-16">학교</span><span className="font-semibold">{student.school}</span></div>
          <div className="flex gap-2"><span className="text-navy-200 w-16">테스트</span><span className="font-semibold">{student.testName}</span></div>
          {student.instructor && <div className="flex gap-2"><span className="text-navy-200 w-16">강사</span><span className="font-semibold">{student.instructor}</span></div>}
          {student.testDate && <div className="flex gap-2"><span className="text-navy-200 w-16">날짜</span><span className="font-semibold">{student.testDate}</span></div>}
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* ── Score + Chart ──────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-6 items-center">
          {/* Total score */}
          <div className="text-center">
            <div
              className="w-32 h-32 rounded-full mx-auto flex flex-col items-center justify-center mb-3"
              style={{ background: `${gradeColor}10`, border: `4px solid ${gradeColor}` }}
            >
              <span className="text-4xl font-extrabold" style={{ color: gradeColor }}>{totalScore}</span>
              <span className="text-xs text-gray-400">/ 100</span>
            </div>
            <p className="text-lg font-extrabold text-navy">{grade} 등급</p>
            <p className="text-xs text-gray-400">종합 점수</p>
          </div>
          {/* Radar chart */}
          <HexagonChart scores={scores} />
        </div>

        {/* ── Domain scores ─────────────────────────────────── */}
        <section>
          <h2 className="section-title">영역별 성취도</h2>
          <div className="space-y-3">
            {DOMAINS.map(d => {
              const score = scores[d.key]
              const color = scoreColor(score)
              return (
                <div key={d.key}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">{d.labelKo}</span>
                      <span className="text-xs text-gray-400">{d.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{scoreLabel(score)}</span>
                      <span className="text-sm font-extrabold" style={{ color }}>{score}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Summary ───────────────────────────────────────── */}
        <section className="bg-navy-50 rounded-2xl p-5 border-l-4 border-navy">
          <h2 className="section-title">종합 평가</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{analysis.summary}</p>
        </section>

        {/* ── Strengths & Weaknesses ────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <section className="bg-green-50 rounded-2xl p-5">
            <h2 className="text-base font-extrabold text-green-700 mb-3">💪 강점</h2>
            <ul className="space-y-2">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">{i + 1}.</span>{s}
                </li>
              ))}
            </ul>
          </section>
          <section className="bg-amber-50 rounded-2xl p-5">
            <h2 className="text-base font-extrabold text-amber-700 mb-3">📌 개선 영역</h2>
            <ul className="space-y-2">
              {analysis.weaknesses.map((w, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-amber-500 font-bold flex-shrink-0">{i + 1}.</span>{w}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ── Learning Style ────────────────────────────────── */}
        <section className="border border-navy-100 rounded-2xl p-5">
          <h2 className="section-title">학습 성향</h2>
          <div className="flex items-start gap-4">
            <span className="text-4xl">{STYLE_ICONS[analysis.learningStyle] ?? '📚'}</span>
            <div>
              <p className="font-extrabold text-navy text-lg">{analysis.learningStyle}</p>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{analysis.learningStyleDesc}</p>
            </div>
          </div>
        </section>

        {/* ── Error Patterns ────────────────────────────────── */}
        <section>
          <h2 className="section-title">실수 패턴 분석</h2>
          <div className="flex flex-wrap gap-2">
            {analysis.errorPatterns.map((p, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                {p}
              </span>
            ))}
          </div>
        </section>

        {/* ── 4-Week Strategy ───────────────────────────────── */}
        <section className="bg-navy rounded-2xl p-6">
          <h2 className="text-base font-extrabold text-gold mb-3">📅 향후 4주 학습 전략</h2>
          <p className="text-sm text-navy-200 leading-relaxed whitespace-pre-line">{analysis.strategy}</p>
        </section>

        {/* ── Parent Comment ────────────────────────────────── */}
        <section className="border-2 border-gold/30 rounded-2xl p-6 bg-gold-50">
          <h2 className="section-title text-gold-dark">💬 학부모 상담 코멘트</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{analysis.parentComment}</p>
        </section>

        {/* ── Signature area ────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-8 pt-4">
          <div className="text-center">
            <div className="h-14 border-b-2 border-dashed border-gray-200 mb-2" />
            <p className="text-xs text-gray-400">담당 강사 서명</p>
          </div>
          <div className="text-center">
            <div className="h-14 border-b-2 border-dashed border-gray-200 mb-2" />
            <p className="text-xs text-gray-400">원장 확인</p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-300 pt-2">
          본 레포트는 영어홀릭 어취브먼트 테스트 레포트 시스템에서 자동 생성되었습니다.
        </p>
      </div>
    </div>
  )
})

ReportContent.displayName = 'ReportContent'
export default ReportContent
