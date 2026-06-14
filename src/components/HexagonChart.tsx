import type { Scores } from '../types'

const DOMAINS = [
  { key: 'vocabulary' as const, label: '어휘력' },
  { key: 'grammar'    as const, label: '문법' },
  { key: 'reading'    as const, label: '독해' },
  { key: 'writing'    as const, label: '쓰기' },
  { key: 'sentence'   as const, label: '문장구조' },
  { key: 'practical'  as const, label: '활용능력' },
]

interface Props { scores: Scores }

function pt(cx: number, cy: number, r: number, a: number): [number, number] {
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)]
}

function anchor(a: number) {
  const c = Math.cos(a)
  if (Math.abs(c) < 0.25) return 'middle'
  return c > 0 ? 'start' : 'end'
}

function dy(a: number) {
  const s = Math.sin(a)
  if (s > 0.45) return -6
  if (s < -0.45) return 14
  return 5
}

export default function HexagonChart({ scores }: Props) {
  const W = 260, H = 240
  const cx = 130, cy = 120
  const R = 72
  const labelR = 100
  const n = DOMAINS.length
  const angles = DOMAINS.map((_, i) => Math.PI / 2 - (2 * Math.PI * i) / n)
  const levels = [20, 40, 60, 80, 100]
  const FONT = "'Pretendard','Noto Sans KR','Apple SD Gothic Neo',sans-serif"

  const poly = (r: number) =>
    angles.map(a => pt(cx, cy, r, a).join(',')).join(' ')

  return (
    <svg width={W} height={H} xmlns="http://www.w3.org/2000/svg">
      {/* Background fill */}
      <polygon points={poly(R)} fill="#F0F4FF" />

      {/* Grid rings */}
      {levels.map(lv => (
        <polygon key={lv} points={poly((lv / 100) * R)}
          fill="none" stroke="#DBEAFE" strokeWidth={lv === 100 ? 1.5 : 1} />
      ))}

      {/* Axis spokes */}
      {angles.map((a, i) => {
        const [x, y] = pt(cx, cy, R, a)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y}
          stroke="#DBEAFE" strokeWidth={1} />
      })}

      {/* Score polygon */}
      <polygon
        points={DOMAINS.map((d, i) => {
          const [x, y] = pt(cx, cy, (scores[d.key] / 100) * R, angles[i])
          return `${x},${y}`
        }).join(' ')}
        fill="#1B3A6B" fillOpacity={0.22}
        stroke="#C9A84C" strokeWidth={2.5}
      />

      {/* Score dots */}
      {DOMAINS.map((d, i) => {
        const [x, y] = pt(cx, cy, (scores[d.key] / 100) * R, angles[i])
        return <circle key={i} cx={x} cy={y} r={4} fill="#C9A84C" stroke="white" strokeWidth={1.5} />
      })}

      {/* Score values near dots */}
      {DOMAINS.map((d, i) => {
        const r = (scores[d.key] / 100) * R
        const [x, y] = pt(cx, cy, r + 10, angles[i])
        const s = scores[d.key]
        if (s < 20) return null
        return (
          <text key={i} x={x} y={y}
            textAnchor={anchor(angles[i])}
            dy={dy(angles[i]) * 0.5}
            fontSize={8} fontWeight={600} fill="#C9A84C"
            fontFamily={FONT}
          >{s}</text>
        )
      })}

      {/* Axis labels */}
      {DOMAINS.map((d, i) => {
        const [x, y] = pt(cx, cy, labelR, angles[i])
        return (
          <text key={i} x={x} y={y + dy(angles[i])}
            textAnchor={anchor(angles[i])}
            fontSize={11} fontWeight={700} fill="#1B3A6B"
            fontFamily={FONT}
          >{d.label}</text>
        )
      })}

      {/* Level tick on top axis */}
      {[20, 40, 60, 80].map(lv => {
        const [x, y] = pt(cx, cy, (lv / 100) * R + 2, angles[0])
        return (
          <text key={lv} x={x + 4} y={y}
            fontSize={8} fill="#94A3B8" textAnchor="start"
            fontFamily={FONT}
          >{lv}</text>
        )
      })}
    </svg>
  )
}
