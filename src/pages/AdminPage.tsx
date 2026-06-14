import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { supabase } from '../lib/supabase'
import { formatDate, scoreColor, totalScoreGrade } from '../lib/utils'
import type { ReportRow } from '../types'
import { Search } from 'lucide-react'

export default function AdminPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<ReportRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [noDb, setNoDb] = useState(false)

  useEffect(() => {
    if (!supabase) { setNoDb(true); setLoading(false); return }

    supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error)
        setRows((data as ReportRow[]) ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = rows.filter(r =>
    r.student_name.toLowerCase().includes(search.toLowerCase()) ||
    r.test_name.toLowerCase().includes(search.toLowerCase()) ||
    r.school.toLowerCase().includes(search.toLowerCase()),
  )

  function viewReport(row: ReportRow) {
    const report = {
      id: row.id,
      totalScore: row.total_score,
      scores: row.scores,
      analysis: row.analysis,
      student: {
        name: row.student_name,
        grade: row.grade,
        school: row.school,
        testName: row.test_name,
        instructor: row.instructor ?? '',
        testDate: row.test_date ?? '',
      },
    }
    sessionStorage.setItem('eh-report', JSON.stringify(report))
    navigate('/result')
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-extrabold text-navy mb-6">📊 레포트 기록</h1>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="학생명, 테스트명, 학교로 검색..."
            className="input-field pl-9"
          />
        </div>

        {noDb && (
          <div className="card text-center py-10">
            <p className="text-4xl mb-4">🗄️</p>
            <p className="font-bold text-navy mb-2">Supabase 미연결</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              .env 파일에 <code className="bg-gray-100 rounded px-1 text-xs">VITE_SUPABASE_URL</code>과<br />
              <code className="bg-gray-100 rounded px-1 text-xs">VITE_SUPABASE_ANON_KEY</code>를 설정하면<br />
              레포트 기록을 조회할 수 있습니다.
            </p>
          </div>
        )}

        {!noDb && loading && (
          <div className="text-center py-16 text-gray-400 text-sm">불러오는 중...</div>
        )}

        {!noDb && !loading && filtered.length === 0 && (
          <div className="card text-center py-10">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm text-gray-500">{search ? '검색 결과가 없습니다.' : '아직 저장된 레포트가 없습니다.'}</p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map(row => {
            const grade = totalScoreGrade(row.total_score)
            const color = scoreColor(row.total_score)
            return (
              <button
                key={row.id}
                onClick={() => viewReport(row)}
                className="card w-full text-left hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-150 flex items-center gap-4"
              >
                {/* Grade badge */}
                <div
                  className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                  style={{ background: `${color}10`, border: `2px solid ${color}` }}
                >
                  <span className="text-sm font-extrabold" style={{ color }}>{grade}</span>
                  <span className="text-[10px]" style={{ color }}>{row.total_score}점</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-navy">{row.student_name}</span>
                    <span className="text-xs text-gray-400">{row.grade} · {row.school}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-0.5">{row.test_name}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(row.created_at)}</p>
                </div>

                <span className="text-gray-300 text-lg">›</span>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
