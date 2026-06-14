import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import FileUploader from '../components/FileUploader'
import StudentInfoForm from '../components/StudentInfoForm'
import { compressImage } from '../lib/utils'
import type { UploadedFile, StudentInfo } from '../types'

const EMPTY_STUDENT: StudentInfo = {
  name: '', grade: '', school: '', testName: '', instructor: '', testDate: '',
}

type Tab = 'files' | 'info'

export default function UploadPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('files')
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [student, setStudent] = useState<StudentInfo>(EMPTY_STUDENT)
  const [error, setError] = useState('')
  const [compressing, setCompressing] = useState(false)

  const imageFiles = files.filter(f => f.type === 'image')

  async function handleSubmit() {
    setError('')

    if (imageFiles.length === 0) {
      setTab('files')
      setError('시험지 이미지를 최소 1장 업로드해주세요.')
      return
    }
    if (!student.name || !student.grade || !student.school || !student.testName) {
      setTab('info')
      setError('필수 항목(이름, 학년, 학교, 테스트명)을 입력해주세요.')
      return
    }

    setCompressing(true)
    try {
      const compressed: string[] = []
      for (const f of imageFiles) {
        const b64 = await compressImage(f.file, 1024, 0.8)
        compressed.push(b64)
      }
      sessionStorage.setItem('eh-images', JSON.stringify(compressed))
      sessionStorage.setItem('eh-student', JSON.stringify(student))
      navigate('/analyzing')
    } catch {
      setError('이미지 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
      setCompressing(false)
    }
  }

  const filledInfo = student.name && student.grade && student.school && student.testName

  return (
    <div className="min-h-screen bg-navy-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-28">
        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 mb-6 shadow-sm">
          {(['files', 'info'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t ? 'bg-navy text-white shadow' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'files'
                ? `📎 파일 업로드 ${imageFiles.length > 0 ? `(${imageFiles.length})` : ''}`
                : `✏️ 학생 정보 ${filledInfo ? '✓' : ''}`}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="card">
          {tab === 'files' ? (
            <>
              <h2 className="section-title">시험지 업로드</h2>
              <FileUploader files={files} onChange={setFiles} />
            </>
          ) : (
            <>
              <h2 className="section-title">학생 정보 입력</h2>
              <StudentInfoForm info={student} onChange={setStudent} />
            </>
          )}
        </div>
      </main>

      {/* Sticky CTA */}
      <div className="no-print fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 px-4 py-4 safe-area-bottom">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={compressing}
            className="btn-gold w-full text-base py-4 flex items-center justify-center gap-2"
          >
            {compressing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                이미지 준비 중...
              </>
            ) : (
              '🚀 AI 분석 시작'
            )}
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">
            이미지 {imageFiles.length}장 · 분석까지 약 30~60초 소요
          </p>
        </div>
      </div>
    </div>
  )
}
