import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip,
} from 'recharts'
import type { Scores } from '../types'

const DOMAINS = [
  { key: 'vocabulary', label: '어휘력' },
  { key: 'grammar',    label: '문법' },
  { key: 'reading',    label: '독해' },
  { key: 'writing',    label: '쓰기' },
  { key: 'sentence',   label: '문장구조' },
  { key: 'practical',  label: '활용능력' },
] as const

interface Props {
  scores: Scores
  size?: number
}

export default function HexagonChart({ scores, size = 260 }: Props) {
  const data = DOMAINS.map(d => ({
    subject: d.label,
    score: scores[d.key],
    fullMark: 100,
  }))

  return (
    <ResponsiveContainer width="100%" height={size}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="#E0E9FF" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#1B3A6B', fontSize: 11, fontWeight: 700 }}
        />
        <PolarRadiusAxis
          domain={[0, 100]}
          tickCount={5}
          tick={{ fill: '#94A3B8', fontSize: 9 }}
          angle={90}
        />
        <Radar
          name="점수"
          dataKey="score"
          stroke="#C9A84C"
          strokeWidth={2}
          fill="#1B3A6B"
          fillOpacity={0.3}
        />
        <Tooltip
          formatter={(value: number) => [`${value}점`, '점수']}
          contentStyle={{
            borderRadius: '12px',
            border: '1px solid #E0E9FF',
            fontSize: '12px',
            fontWeight: 600,
            color: '#1B3A6B',
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
