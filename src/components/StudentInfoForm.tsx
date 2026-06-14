import type { StudentInfo } from '../types'

interface Props {
  info: StudentInfo
  onChange: (info: StudentInfo) => void
}

type Field = { key: keyof StudentInfo; label: string; placeholder: string; required?: boolean; type?: string }

const FIELDS: Field[] = [
  { key: 'name',       label: '학생 이름',  placeholder: '홍길동',               required: true },
  { key: 'grade',      label: '학년',       placeholder: '예) 초등 3학년',        required: true },
  { key: 'school',     label: '학교명',     placeholder: '예) 행복초등학교',       required: true },
  { key: 'testName',   label: '테스트명',   placeholder: '예) 2024년 2학기 중간',  required: true },
  { key: 'instructor', label: '담당 강사',  placeholder: '선생님 이름 (선택)' },
  { key: 'testDate',   label: '테스트 날짜',placeholder: '',                       type: 'date' },
]

export default function StudentInfoForm({ info, onChange }: Props) {
  function set(key: keyof StudentInfo, value: string) {
    onChange({ ...info, [key]: value })
  }

  return (
    <div className="space-y-4">
      {FIELDS.map(f => (
        <div key={f.key}>
          <label className="label">
            {f.label}
            {f.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
          <input
            type={f.type ?? 'text'}
            value={info[f.key]}
            onChange={e => set(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="input-field"
          />
        </div>
      ))}
    </div>
  )
}
