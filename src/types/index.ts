export interface StudentInfo {
  name: string
  grade: string
  school: string
  testName: string
  instructor: string
  testDate: string
}

export interface Scores {
  vocabulary: number
  grammar: number
  reading: number
  writing: number
  sentence: number
  practical: number
}

export interface Analysis {
  summary: string
  strengths: string[]
  weaknesses: string[]
  learningStyle: string
  learningStyleDesc: string
  errorPatterns: string[]
  strategy: string
  parentComment: string
}

export interface Report {
  id: string | null
  totalScore: number
  scores: Scores
  analysis: Analysis
  student: StudentInfo
  createdAt?: string
}

// DB row shape from Supabase
export interface ReportRow {
  id: string
  student_name: string
  grade: string
  school: string
  test_name: string
  instructor: string | null
  test_date: string | null
  total_score: number
  scores: Scores
  analysis: Analysis
  created_at: string
}

export interface UploadedFile {
  id: string
  file: File
  preview: string
  type: 'image' | 'pdf'
}
