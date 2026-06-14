import {
  Document, Page, View, Text, Svg,
  Polygon, Line, Circle, Font, StyleSheet, pdf,
} from '@react-pdf/renderer'
import type { Report, Scores } from '../types'

// ── constants ──────────────────────────────────────────────────
const NAVY   = '#1B3A6B'
const NAVY2  = '#0F2547'
const NAVY50 = '#EEF2FF'
const GOLD   = '#C9A84C'
const WHITE  = '#FFFFFF'
const GRAY2  = '#E5E7EB'
const GRAY5  = '#6B7280'
const GRAY7  = '#374151'
const GREEN  = '#10B981'
const RED    = '#EF4444'

const DOMAINS = [
  { key: 'vocabulary' as const, ko: '어휘력', en: 'Vocabulary' },
  { key: 'grammar'    as const, ko: '문법',   en: 'Grammar' },
  { key: 'reading'    as const, ko: '독해',   en: 'Reading' },
  { key: 'writing'    as const, ko: '쓰기',   en: 'Writing' },
  { key: 'sentence'   as const, ko: '문장구조', en: 'Sentence' },
  { key: 'practical'  as const, ko: '활용능력', en: 'Practical' },
]

function sc(v: number) {
  return v >= 90 ? GREEN : v >= 75 ? NAVY : v >= 60 ? GOLD : RED
}
function sl(v: number) {
  return v >= 90 ? '우수' : v >= 75 ? '양호' : v >= 60 ? '보통' : '노력요망'
}
function grade(v: number) {
  return v >= 95 ? 'A+' : v >= 90 ? 'A' : v >= 80 ? 'B+' : v >= 75 ? 'B' : v >= 60 ? 'C' : 'D'
}
function gc(v: number) {
  return v >= 90 ? GREEN : v >= 75 ? NAVY : v >= 60 ? GOLD : RED
}

// ── styles ─────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: { fontFamily: 'NotoSansKR', backgroundColor: WHITE },

  // header
  hdr:  { backgroundColor: NAVY, paddingHorizontal: 30, paddingTop: 26, paddingBottom: 22 },
  hRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  hBadge: { fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: 1.5, marginBottom: 7 },
  hTitle: { fontSize: 26, color: WHITE, fontWeight: 700 },
  hSub:   { fontSize: 12, color: '#C0D0F0', marginTop: 4 },
  gBadge: {
    width: 64, height: 64, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
  gText: { fontSize: 30, fontWeight: 700 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 },
  infoItem: { width: '50%', flexDirection: 'row', marginBottom: 7 },
  infoLbl: { fontSize: 11, color: '#B0C4DE', width: 46 },
  infoVal: { fontSize: 11, color: WHITE, fontWeight: 700 },

  // body
  body: { paddingHorizontal: 30, paddingTop: 20 },

  // score row
  sRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 22, gap: 16 },
  sLeft:  { flex: 1, alignItems: 'center' },
  sRight: { flex: 1, alignItems: 'center' },

  // score circle
  sCirc: {
    width: 130, height: 130, borderRadius: 65,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 6,
  },
  sNum:  { fontSize: 44, fontWeight: 700, lineHeight: 1 },
  sDen:  { fontSize: 12, color: GRAY5, marginTop: 3 },
  sGrd:  { fontSize: 17, fontWeight: 700, marginTop: 10 },
  sLbl:  { fontSize: 11, color: GRAY5, marginTop: 3 },

  // score legend
  hexLeg: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8, justifyContent: 'center', paddingHorizontal: 4 },
  legItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legDot:  { width: 7, height: 7, borderRadius: 4, backgroundColor: GOLD },
  legTxt:  { fontSize: 10, color: NAVY, fontWeight: 700 },

  // section
  sec:   { marginBottom: 20 },
  secT:  { fontSize: 16, fontWeight: 700, color: NAVY, borderBottomWidth: 2, borderBottomColor: GOLD, paddingBottom: 6, marginBottom: 12 },

  // bars
  bRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  bKo:   { width: 62, fontSize: 12, fontWeight: 700, color: GRAY7 },
  bEn:   { width: 52, fontSize: 10, color: GRAY5 },
  bTrack:{ flex: 1, height: 12, backgroundColor: '#F3F4F6', borderRadius: 6, overflow: 'hidden' },
  bFill: { height: 12, borderRadius: 6 },
  bBadge:{ marginLeft: 6, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 },
  bBTxt: { fontSize: 9, fontWeight: 700 },
  bSc:   { width: 30, fontSize: 13, fontWeight: 700, textAlign: 'right' },

  // summary
  smBox: { backgroundColor: NAVY50, borderLeftWidth: 5, borderLeftColor: NAVY, borderRadius: 8, padding: 16 },
  smTxt: { fontSize: 14, color: GRAY7, lineHeight: 1.8 },

  // 2-col
  cols:  { flexDirection: 'row', gap: 12, marginBottom: 20 },
  col:   { flex: 1, borderRadius: 8, padding: 14 },
  colT:  { fontSize: 15, fontWeight: 700, marginBottom: 10 },
  colLi: { flexDirection: 'row', marginBottom: 7, gap: 5 },
  colN:  { fontSize: 13, fontWeight: 700 },
  colTx: { fontSize: 13, color: GRAY7, flex: 1, lineHeight: 1.6 },

  // style box
  stBox: { borderWidth: 1, borderColor: GRAY2, borderRadius: 8, padding: 14, flexDirection: 'row', gap: 12 },
  stTit: { fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 6 },
  stTxt: { fontSize: 13, color: GRAY7, lineHeight: 1.7 },

  // chips
  chipW: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip:  { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  chipT: { fontSize: 12, color: '#DC2626', fontWeight: 700 },

  // strategy
  strBox: { backgroundColor: NAVY2, borderRadius: 8, padding: 18 },
  strT:   { fontSize: 15, fontWeight: 700, color: GOLD, marginBottom: 10 },
  strTx:  { fontSize: 13, color: '#C0D0F0', lineHeight: 1.9 },

  // comment
  cmBox: { borderWidth: 2, borderColor: '#E8CC7A', borderRadius: 8, padding: 16, backgroundColor: '#FFFDF5' },
  cmT:   { fontSize: 15, fontWeight: 700, color: '#A88830', marginBottom: 8 },
  cmTx:  { fontSize: 13, color: GRAY7, lineHeight: 1.8 },

  // sig
  sigRow: { flexDirection: 'row', gap: 24, marginTop: 14, marginBottom: 10 },
  sigBox: { flex: 1, alignItems: 'center' },
  sigLn:  { borderBottomWidth: 1.5, borderBottomColor: GRAY2, borderStyle: 'dashed', width: '100%', height: 44, marginBottom: 6 },
  sigLbl: { fontSize: 11, color: GRAY5, textAlign: 'center' },

  footer: { fontSize: 10, color: GRAY2, textAlign: 'center', marginTop: 8, marginBottom: 24 },
})

// ── Hexagon SVG ────────────────────────────────────────────────
function HexSvg({ scores }: { scores: Scores }) {
  const W = 240, H = 224
  const cx = 120, cy = 108, R = 76
  const n = DOMAINS.length
  const angles = DOMAINS.map((_, i) => Math.PI / 2 - (2 * Math.PI * i) / n)

  function pt(r: number, a: number) {
    return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) }
  }
  function ring(r: number) {
    return angles.map(a => { const p = pt(r, a); return `${p.x},${p.y}` }).join(' ')
  }

  const scorePts = DOMAINS.map((d, i) => {
    const p = pt((scores[d.key] / 100) * R, angles[i])
    return `${p.x},${p.y}`
  }).join(' ')

  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Polygon points={ring(R)} fill={NAVY50} />
      {[20, 40, 60, 80, 100].map(lv => (
        <Polygon key={lv} points={ring((lv / 100) * R)}
          fill="none" stroke="#BFDBFE" strokeWidth={lv === 100 ? 1.2 : 0.7} />
      ))}
      {angles.map((a, i) => {
        const p = pt(R, a)
        return <Line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#BFDBFE" strokeWidth={0.7} />
      })}
      <Polygon points={scorePts} fill={NAVY} fillOpacity={0.18} stroke={GOLD} strokeWidth={2} />
      {DOMAINS.map((d, i) => {
        const p = pt((scores[d.key] / 100) * R, angles[i])
        return <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={GOLD} stroke={WHITE} strokeWidth={1} />
      })}
    </Svg>
  )
}

// ── Document ───────────────────────────────────────────────────
function ReportDoc({ report }: { report: Report }) {
  const { student: st, totalScore, scores, analysis } = report
  const g  = grade(totalScore)
  const gc2 = gc(totalScore)

  return (
    <Document title={`${st.name} 어취브먼트 레포트`} author="영어홀릭">
      <Page size="A4" style={S.page}>

        {/* ── HEADER ── */}
        <View style={S.hdr}>
          <View style={S.hRow}>
            <View style={{ flex: 1 }}>
              <Text style={S.hBadge}>영어홀릭 ACHIEVEMENT REPORT</Text>
              <Text style={S.hTitle}>어취브먼트 테스트 레포트</Text>
              <Text style={S.hSub}>English Achievement Test Report</Text>
            </View>
            <View style={[S.gBadge, { backgroundColor: gc2 + '28', borderColor: gc2 }]}>
              <Text style={[S.gText, { color: gc2 }]}>{g}</Text>
            </View>
          </View>
          <View style={S.infoGrid}>
            <View style={S.infoItem}><Text style={S.infoLbl}>학생</Text><Text style={S.infoVal}>{st.name}</Text></View>
            <View style={S.infoItem}><Text style={S.infoLbl}>학년</Text><Text style={S.infoVal}>{st.grade}</Text></View>
            <View style={S.infoItem}><Text style={S.infoLbl}>학교</Text><Text style={S.infoVal}>{st.school}</Text></View>
            <View style={S.infoItem}><Text style={S.infoLbl}>테스트</Text><Text style={S.infoVal}>{st.testName}</Text></View>
            {st.instructor ? <View style={S.infoItem}><Text style={S.infoLbl}>강사</Text><Text style={S.infoVal}>{st.instructor}</Text></View> : null}
            {st.testDate   ? <View style={S.infoItem}><Text style={S.infoLbl}>날짜</Text><Text style={S.infoVal}>{st.testDate}</Text></View> : null}
          </View>
        </View>

        {/* ── BODY ── */}
        <View style={S.body}>

          {/* Score + Chart */}
          <View style={S.sRow}>
            <View style={S.sLeft}>
              <View style={[S.sCirc, { backgroundColor: gc2 + '15', borderColor: gc2 }]}>
                <Text style={[S.sNum, { color: gc2 }]}>{totalScore}</Text>
                <Text style={S.sDen}>/ 100</Text>
              </View>
              <Text style={[S.sGrd, { color: gc2 }]}>{g} 등급</Text>
              <Text style={S.sLbl}>종합 점수</Text>
            </View>
            <View style={S.sRight}>
              <HexSvg scores={scores} />
              <View style={S.hexLeg}>
                {DOMAINS.map(d => (
                  <View key={d.key} style={S.legItem}>
                    <View style={S.legDot} />
                    <Text style={S.legTxt}>{d.ko} {scores[d.key]}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Domain bars */}
          <View style={S.sec}>
            <Text style={S.secT}>영역별 성취도</Text>
            {DOMAINS.map(d => {
              const v = scores[d.key], c = sc(v), l = sl(v)
              return (
                <View key={d.key} style={S.bRow}>
                  <Text style={S.bKo}>{d.ko}</Text>
                  <Text style={S.bEn}>{d.en}</Text>
                  <View style={S.bTrack}>
                    <View style={[S.bFill, { width: `${v}%`, backgroundColor: c }]} />
                  </View>
                  <View style={[S.bBadge, { backgroundColor: c + '20' }]}>
                    <Text style={[S.bBTxt, { color: c }]}>{l}</Text>
                  </View>
                  <Text style={[S.bSc, { color: c }]}>{v}</Text>
                </View>
              )
            })}
          </View>

          {/* Summary */}
          <View style={S.sec}>
            <Text style={S.secT}>종합 평가</Text>
            <View style={S.smBox}>
              <Text style={S.smTxt}>{analysis.summary}</Text>
            </View>
          </View>

          {/* Strengths & Weaknesses */}
          <View style={S.cols}>
            <View style={[S.col, { backgroundColor: '#F0FDF4', borderLeftWidth: 3, borderLeftColor: GREEN }]}>
              <Text style={[S.colT, { color: '#065F46' }]}>강점</Text>
              {analysis.strengths.map((t, i) => (
                <View key={i} style={S.colLi}>
                  <Text style={[S.colN, { color: GREEN }]}>{i + 1}.</Text>
                  <Text style={S.colTx}>{t}</Text>
                </View>
              ))}
            </View>
            <View style={[S.col, { backgroundColor: '#FFFBEB', borderLeftWidth: 3, borderLeftColor: GOLD }]}>
              <Text style={[S.colT, { color: '#92400E' }]}>개선 영역</Text>
              {analysis.weaknesses.map((t, i) => (
                <View key={i} style={S.colLi}>
                  <Text style={[S.colN, { color: GOLD }]}>{i + 1}.</Text>
                  <Text style={S.colTx}>{t}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Learning style */}
          <View style={S.sec}>
            <Text style={S.secT}>학습 성향</Text>
            <View style={S.stBox}>
              <View style={{ flex: 1 }}>
                <Text style={S.stTit}>{analysis.learningStyle}</Text>
                <Text style={S.stTxt}>{analysis.learningStyleDesc}</Text>
              </View>
            </View>
          </View>

          {/* Error patterns */}
          <View style={S.sec}>
            <Text style={S.secT}>실수 패턴 분석</Text>
            <View style={S.chipW}>
              {analysis.errorPatterns.map((p, i) => (
                <View key={i} style={S.chip}>
                  <Text style={S.chipT}>{p}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Strategy */}
          <View style={S.sec}>
            <View style={S.strBox}>
              <Text style={S.strT}>향후 4주 학습 전략</Text>
              <Text style={S.strTx}>{analysis.strategy}</Text>
            </View>
          </View>

          {/* Parent comment */}
          <View style={S.sec}>
            <Text style={S.secT}>학부모 상담 코멘트</Text>
            <View style={S.cmBox}>
              <Text style={S.cmTx}>{analysis.parentComment}</Text>
            </View>
          </View>

          {/* Signature */}
          <View style={S.sigRow}>
            <View style={S.sigBox}>
              <View style={S.sigLn} />
              <Text style={S.sigLbl}>담당 강사 서명</Text>
            </View>
            <View style={S.sigBox}>
              <View style={S.sigLn} />
              <Text style={S.sigLbl}>원장 확인</Text>
            </View>
          </View>

          <Text style={S.footer}>
            본 레포트는 영어홀릭 어취브먼트 테스트 레포트 시스템에서 자동 생성되었습니다.
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// ── Download helper ────────────────────────────────────────────
export async function downloadReportPDF(report: Report) {
  // Register fonts with absolute URL (resolves correctly in browser + workers)
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  Font.register({
    family: 'NotoSansKR',
    fonts: [
      { src: `${base}/fonts/NotoSansKR-Regular.ttf`, fontWeight: 400 },
      { src: `${base}/fonts/NotoSansKR-Bold.ttf`,    fontWeight: 700 },
    ],
  })

  const { name, testName } = report.student
  const g = grade(report.totalScore)
  const blob = await pdf(<ReportDoc report={report} />).toBlob()
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${name}_${testName}_${g}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
