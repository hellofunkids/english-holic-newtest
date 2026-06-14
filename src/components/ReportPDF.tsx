import {
  Document, Page, View, Text, Svg,
  Polygon, Line, Circle, Font, StyleSheet, pdf,
} from '@react-pdf/renderer'
import type { Report, Scores } from '../types'

Font.register({
  family: 'NotoSansKR',
  fonts: [
    { src: '/fonts/NotoSansKR-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/NotoSansKR-Bold.ttf',    fontWeight: 700 },
  ],
})

const NAVY   = '#1B3A6B'
const NAVY2  = '#0F2547'
const NAVY50 = '#F0F4FF'
const GOLD   = '#C9A84C'
const WHITE  = '#FFFFFF'
const GRAY3  = '#D1D5DB'
const GRAY5  = '#6B7280'
const GRAY7  = '#374151'

const DOMAINS = [
  { key: 'vocabulary' as const, labelKo: '어휘력', label: 'Vocabulary' },
  { key: 'grammar'    as const, labelKo: '문법',   label: 'Grammar' },
  { key: 'reading'    as const, labelKo: '독해',   label: 'Reading' },
  { key: 'writing'    as const, labelKo: '쓰기',   label: 'Writing' },
  { key: 'sentence'   as const, labelKo: '문장구조', label: 'Sentence' },
  { key: 'practical'  as const, labelKo: '활용능력', label: 'Practical' },
]

function scoreColor(s: number) {
  if (s >= 90) return '#10B981'
  if (s >= 75) return NAVY
  if (s >= 60) return GOLD
  return '#EF4444'
}

function scoreLabel(s: number) {
  if (s >= 90) return '우수'
  if (s >= 75) return '양호'
  if (s >= 60) return '보통'
  return '노력요망'
}

function totalScoreGrade(s: number) {
  if (s >= 95) return 'A+'
  if (s >= 90) return 'A'
  if (s >= 80) return 'B+'
  if (s >= 70) return 'B'
  if (s >= 60) return 'C'
  return 'D'
}

function gradeColor(s: number) {
  if (s >= 90) return '#10B981'
  if (s >= 75) return NAVY
  if (s >= 60) return GOLD
  return '#EF4444'
}

const F = 'NotoSansKR'

const s = StyleSheet.create({
  page: { fontFamily: F, backgroundColor: WHITE, paddingBottom: 20 },
  // Header
  header: { backgroundColor: NAVY, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerBadge: { fontSize: 8, color: GOLD, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 },
  headerTitle: { fontSize: 18, color: WHITE, fontWeight: 700 },
  headerSub: { fontSize: 9, color: '#C0D0F0', marginTop: 3 },
  gradeBadge: {
    width: 52, height: 52, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  gradeText: { fontSize: 22, fontWeight: 700 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, gap: 0 },
  infoItem: { width: '50%', flexDirection: 'row', marginBottom: 5 },
  infoLabel: { fontSize: 8, color: '#C0D0F0', width: 36 },
  infoValue: { fontSize: 8, color: WHITE, fontWeight: 700 },
  // Body
  body: { paddingHorizontal: 24, paddingTop: 20 },
  // Score row
  scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  circleWrap: { alignItems: 'center', flex: 1 },
  circleLabel: { fontSize: 11, fontWeight: 700, marginTop: 6 },
  circleSubLabel: { fontSize: 8, color: GRAY5, marginTop: 2 },
  chartWrap: { flex: 1, alignItems: 'center' },
  // Domain bars
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: NAVY, borderBottomWidth: 2, borderBottomColor: GOLD, paddingBottom: 5, marginBottom: 10 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  barLabel: { width: 58, fontSize: 9, fontWeight: 700, color: GRAY7 },
  barSubLabel: { width: 42, fontSize: 7, color: GRAY5 },
  barTrack: { flex: 1, height: 7, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 7, borderRadius: 4 },
  barScore: { width: 24, fontSize: 10, fontWeight: 700, textAlign: 'right' },
  barBadge: { marginLeft: 6, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 10 },
  barBadgeText: { fontSize: 7, fontWeight: 700 },
  // Summary
  summaryBox: { backgroundColor: NAVY50, borderLeftWidth: 4, borderLeftColor: NAVY, borderRadius: 8, padding: 12, marginBottom: 18 },
  summaryText: { fontSize: 9, color: GRAY7, lineHeight: 1.7 },
  // Two col
  twoCol: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  col: { flex: 1, borderRadius: 8, padding: 12 },
  colTitle: { fontSize: 10, fontWeight: 700, marginBottom: 8 },
  colItem: { flexDirection: 'row', marginBottom: 5, gap: 4 },
  colBullet: { fontSize: 9, fontWeight: 700 },
  colText: { fontSize: 9, color: GRAY7, flex: 1, lineHeight: 1.5 },
  // Learning style
  styleBox: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginBottom: 18, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  styleIcon: { fontSize: 22 },
  styleTitle: { fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 },
  styleDesc: { fontSize: 9, color: GRAY7, lineHeight: 1.7 },
  // Error patterns
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  chipText: { fontSize: 8, color: '#DC2626', fontWeight: 700 },
  // Strategy
  strategyBox: { backgroundColor: NAVY2, borderRadius: 8, padding: 14, marginBottom: 18 },
  strategyTitle: { fontSize: 10, fontWeight: 700, color: GOLD, marginBottom: 8 },
  strategyText: { fontSize: 9, color: '#C0D0F0', lineHeight: 1.8 },
  // Parent comment
  commentBox: { borderWidth: 2, borderColor: '#E8CC7A', borderRadius: 8, padding: 14, backgroundColor: '#FFFDF5', marginBottom: 18 },
  commentTitle: { fontSize: 10, fontWeight: 700, color: GOLD, marginBottom: 6 },
  commentText: { fontSize: 9, color: GRAY7, lineHeight: 1.7 },
  // Signature
  sigRow: { flexDirection: 'row', gap: 20, marginTop: 8, marginBottom: 10 },
  sigBox: { flex: 1, alignItems: 'center' },
  sigLine: { borderBottomWidth: 1.5, borderBottomColor: GRAY3, borderStyle: 'dashed', width: '100%', height: 36, marginBottom: 4 },
  sigLabel: { fontSize: 8, color: GRAY5, textAlign: 'center' },
  footer: { fontSize: 7, color: GRAY3, textAlign: 'center', marginTop: 6 },
})

// ── Hexagon Chart ──────────────────────────────────────────────
function HexSvg({ scores }: { scores: Scores }) {
  const W = 160, H = 150
  const cx = 80, cy = 74, R = 52, labelR = 72
  const n = DOMAINS.length
  const angles = DOMAINS.map((_, i) => Math.PI / 2 - (2 * Math.PI * i) / n)
  const levels = [20, 40, 60, 80, 100]

  function pt(r: number, a: number) {
    return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) }
  }
  function polyPts(r: number) {
    return angles.map(a => { const p = pt(r, a); return `${p.x},${p.y}` }).join(' ')
  }

  const scorePts = DOMAINS.map((d, i) => {
    const p = pt((scores[d.key] / 100) * R, angles[i])
    return `${p.x},${p.y}`
  }).join(' ')

  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* Background */}
      <Polygon points={polyPts(R)} fill="#EEF2FF" />
      {/* Grid rings */}
      {levels.map(lv => (
        <Polygon key={lv} points={polyPts((lv / 100) * R)}
          fill="none" stroke="#BFDBFE" strokeWidth={lv === 100 ? 1.2 : 0.7} />
      ))}
      {/* Spokes */}
      {angles.map((a, i) => {
        const p = pt(R, a)
        return <Line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#BFDBFE" strokeWidth={0.7} />
      })}
      {/* Score polygon */}
      <Polygon points={scorePts} fill={NAVY} fillOpacity={0.18} stroke={GOLD} strokeWidth={1.8} />
      {/* Dots */}
      {DOMAINS.map((d, i) => {
        const p = pt((scores[d.key] / 100) * R, angles[i])
        return <Circle key={i} cx={p.x} cy={p.y} r={3} fill={GOLD} stroke={WHITE} strokeWidth={1} />
      })}
    </Svg>
  )
}

// ── Score circle ───────────────────────────────────────────────
function ScoreCircle({ score }: { score: number }) {
  const gc = gradeColor(score)
  const grade = totalScoreGrade(score)

  return (
    <View style={s.circleWrap}>
      <View style={{
        width: 100, height: 100, borderRadius: 50,
        borderWidth: 5, borderColor: gc,
        backgroundColor: gc + '18',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: 30, fontWeight: 700, color: gc, lineHeight: 1 }}>{score}</Text>
        <Text style={{ fontSize: 8, color: GRAY5, marginTop: 2 }}>/ 100</Text>
      </View>
      <Text style={[s.circleLabel, { color: gc }]}>{grade} 등급</Text>
      <Text style={s.circleSubLabel}>종합 점수</Text>
    </View>
  )
}

// ── Main document ──────────────────────────────────────────────
export function ReportDocument({ report }: { report: Report }) {
  const { student, totalScore, scores, analysis } = report
  const grade = totalScoreGrade(totalScore)
  const gc = gradeColor(totalScore)

  return (
    <Document title={`${student.name} 어취브먼트 레포트`} author="영어홀릭">
      <Page size="A4" style={s.page}>

        {/* ── HEADER ─────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={s.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.headerBadge}>영어홀릭 ACHIEVEMENT REPORT</Text>
              <Text style={s.headerTitle}>어취브먼트 테스트 레포트</Text>
              <Text style={s.headerSub}>English Achievement Test Report</Text>
            </View>
            <View style={[s.gradeBadge, { backgroundColor: gc + '30', borderWidth: 2, borderColor: gc }]}>
              <Text style={[s.gradeText, { color: gc }]}>{grade}</Text>
            </View>
          </View>
          <View style={s.infoGrid}>
            <View style={s.infoItem}><Text style={s.infoLabel}>학생</Text><Text style={s.infoValue}>{student.name}</Text></View>
            <View style={s.infoItem}><Text style={s.infoLabel}>학년</Text><Text style={s.infoValue}>{student.grade}</Text></View>
            <View style={s.infoItem}><Text style={s.infoLabel}>학교</Text><Text style={s.infoValue}>{student.school}</Text></View>
            <View style={s.infoItem}><Text style={s.infoLabel}>테스트</Text><Text style={s.infoValue}>{student.testName}</Text></View>
            {student.instructor && <View style={s.infoItem}><Text style={s.infoLabel}>강사</Text><Text style={s.infoValue}>{student.instructor}</Text></View>}
            {student.testDate && <View style={s.infoItem}><Text style={s.infoLabel}>날짜</Text><Text style={s.infoValue}>{student.testDate}</Text></View>}
          </View>
        </View>

        {/* ── BODY ───────────────────────────────────────────── */}
        <View style={s.body}>

          {/* Score + Chart */}
          <View style={s.scoreRow}>
            <ScoreCircle score={totalScore} />
            <View style={s.chartWrap}>
              <HexSvg scores={scores} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4, justifyContent: 'center' }}>
                {DOMAINS.map(d => (
                  <Text key={d.key} style={{ fontSize: 7, color: NAVY, fontWeight: 700 }}>
                    {d.labelKo} {scores[d.key]}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          {/* Domain Bars */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>영역별 성취도</Text>
            {DOMAINS.map(d => {
              const sc = scores[d.key]
              const col = scoreColor(sc)
              const lbl = scoreLabel(sc)
              return (
                <View key={d.key} style={s.barRow}>
                  <Text style={s.barLabel}>{d.labelKo}</Text>
                  <Text style={s.barSubLabel}>{d.label}</Text>
                  <View style={s.barTrack}>
                    <View style={[s.barFill, { width: `${sc}%`, backgroundColor: col }]} />
                  </View>
                  <View style={[s.barBadge, { backgroundColor: col + '20' }]}>
                    <Text style={[s.barBadgeText, { color: col }]}>{lbl}</Text>
                  </View>
                  <Text style={[s.barScore, { color: col }]}>{sc}</Text>
                </View>
              )
            })}
          </View>

          {/* Summary */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>종합 평가</Text>
            <View style={s.summaryBox}>
              <Text style={s.summaryText}>{analysis.summary}</Text>
            </View>
          </View>

          {/* Strengths & Weaknesses */}
          <View style={s.twoCol}>
            <View style={[s.col, { backgroundColor: '#F0FDF4', borderLeftWidth: 3, borderLeftColor: '#10B981' }]}>
              <Text style={[s.colTitle, { color: '#065F46' }]}>💪 강점</Text>
              {analysis.strengths.map((str, i) => (
                <View key={i} style={s.colItem}>
                  <Text style={[s.colBullet, { color: '#10B981' }]}>{i + 1}.</Text>
                  <Text style={s.colText}>{str}</Text>
                </View>
              ))}
            </View>
            <View style={[s.col, { backgroundColor: '#FFFBEB', borderLeftWidth: 3, borderLeftColor: GOLD }]}>
              <Text style={[s.colTitle, { color: '#92400E' }]}>📌 개선 영역</Text>
              {analysis.weaknesses.map((w, i) => (
                <View key={i} style={s.colItem}>
                  <Text style={[s.colBullet, { color: GOLD }]}>{i + 1}.</Text>
                  <Text style={s.colText}>{w}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Learning Style */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>학습 성향</Text>
            <View style={s.styleBox}>
              <View>
                <Text style={s.styleTitle}>{analysis.learningStyle}</Text>
                <Text style={s.styleDesc}>{analysis.learningStyleDesc}</Text>
              </View>
            </View>
          </View>

          {/* Error Patterns */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>실수 패턴 분석</Text>
            <View style={s.chipWrap}>
              {analysis.errorPatterns.map((p, i) => (
                <View key={i} style={s.chip}>
                  <Text style={s.chipText}>{p}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 4-Week Strategy */}
          <View style={s.section}>
            <View style={s.strategyBox}>
              <Text style={s.strategyTitle}>📅 향후 4주 학습 전략</Text>
              <Text style={s.strategyText}>{analysis.strategy}</Text>
            </View>
          </View>

          {/* Parent Comment */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>학부모 상담 코멘트</Text>
            <View style={s.commentBox}>
              <Text style={s.commentText}>{analysis.parentComment}</Text>
            </View>
          </View>

          {/* Signature */}
          <View style={s.sigRow}>
            <View style={s.sigBox}>
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>담당 강사 서명</Text>
            </View>
            <View style={s.sigBox}>
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>원장 확인</Text>
            </View>
          </View>

          <Text style={s.footer}>
            본 레포트는 영어홀릭 어취브먼트 테스트 레포트 시스템에서 자동 생성되었습니다.
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export async function downloadReportPDF(report: Report) {
  const { name, testName } = report.student
  const grade = totalScoreGrade(report.totalScore)
  const blob = await pdf(<ReportDocument report={report} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}_${testName}_${grade}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
