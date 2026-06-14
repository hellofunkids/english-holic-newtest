import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { supabase } from '../lib/supabase'
import { loadLocalReports, deleteLocalReport, type LocalReport } from '../lib/history'
import { formatDate, scoreColor, totalScoreGrade } from '../lib/utils'
import type { Report, ReportRow } from '../types'
import { Search, Trash2 } from 'lucide-react'

interface DisplayRow {
  key: string
  name: string
  grade: string
  school: string
  testName: string
  totalScore: number
  createdAt: string
  isLocal: boolean
  report: Report
}

function fromSupabase(row: ReportRow): DisplayRow {
  return {
    key: row.id,
    name: row.student_name,
    grade: row.grade,
    school: row.school,
    testName: row.test_name,
    totalScore: row.total_score,
    createdAt: row.created_at,
    isLocal: false,
    report: {
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
    },
  }
}

function fromLocal(r: LocalReport): DisplayRow {
  return {
    key: r.localId,
    name: r.student.name,
    grade: r.student.grade,
    school: r.student.school,
    testName: r.student.testName,
    totalScore: r.totalScore,
    createdAt: r.savedAt,
    isLocal: true,
    report: r,
  }
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<DisplayRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [usingLocal, setUsingLocal] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setRows(loadLocalReports().map(fromLocal))
      setUsingLocal(true)
      setLoading(false)
      return
    }

    supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error(error)
          setRows(loadLocalReports().map(fromLocal))
          setUsingLocal(true)
        } else {
          setRows((data as ReportRow[]).map(fromSupabase))
        }
        setLoading(false)
      })
  }, [])

  const filtered = rows.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.testName.toLowerCase().includes(search.toLowerCase()) ||
    r.school.toLowerCase().includes(search.toLowerCase()),
  )

  function handleView(row: DisplayRow) {
    sessionStorage.setItem('eh-report', JSON.stringify(row.report))
    navigate('/result')
  }

  function handleDelete(row: DisplayRow) {
    if (!row.isLocal) return
    deleteLocalReport(row.key)
    setRows(prev => prev.filter(r => r.key !== row.key))
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-navy">📊 레포트 기록</h1>
          {usingLocal && (
            <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">
              이 기기에 저장됨
            </span>
          )}
        </div>

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

        {loading && (
          <div className="text-center py-16 text-gray-400 text-sm">불러오는 중...</div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm text-gray-500 mb-4">
              {search ? '검색 결과가 없습니다.' : '아직 저장된 레포트가 없습니다.'}
            </p>
            {!search && (
              <button onClick={() => navigate('/upload')} className="btn-gold px-6">
                첫 레포트 만들기
              </button>
            )}
          </div>
        )}

        <div className="space-y-3">
          {filtered.map(row => {
            const grade = totalScoreGrade(row.totalScore)
            const color = scoreColor(row.totalScore)
            return (
              <button
                key={row.key}
                onClick={() => handleView(row)}
                className="card w-full text-left hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-150 flex items-center gap-4"
              >
                {/* Grade badge */}
                <div
                  className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                  style={{ background: `${color}18`, border: `2px solid ${color}` }}
                >
                  <span className="text-sm font-extrabold" style={{ color }}>{grade}</span>
                  <span className="text-[10px]" style={{ color }}>{row.totalScore}점</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-navy">{row.name}</span>
                    <span className="text-xs text-gray-400">{row.grade} · {row.school}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-0.5">{row.testName}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(row.createdAt)}</p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {row.isLocal && (
                    <button
                      className="p-2 text-gray-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50"
                      onClick={e => { e.stopPropagation(); handleDelete(row) }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <span className="text-gray-300 text-lg px-1">›</span>
                </div>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
