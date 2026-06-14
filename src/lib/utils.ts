import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function compressImage(file: File, maxPx = 512, quality = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(maxPx / img.width, maxPx / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas를 지원하지 않는 브라우저입니다.')); return }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      // Canvas가 이미지를 읽지 못한 경우 (드문 포맷)
      // 파일이 5MB 초과면 sessionStorage에 넣을 수 없으므로 거부
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error(`지원하지 않는 이미지 형식이거나 파일이 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(1)}MB). JPEG로 저장 후 다시 시도해주세요.`))
        return
      }
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('이미지를 읽을 수 없습니다.'))
      reader.readAsDataURL(file)
    }
    img.src = url
  })
}

export function scoreColor(score: number): string {
  if (score >= 90) return '#10B981'
  if (score >= 75) return '#1B3A6B'
  if (score >= 60) return '#C9A84C'
  return '#EF4444'
}

export function scoreLabel(score: number): string {
  if (score >= 90) return '우수'
  if (score >= 75) return '양호'
  if (score >= 60) return '보통'
  return '노력 요망'
}

export function totalScoreGrade(score: number): string {
  if (score >= 95) return 'A+'
  if (score >= 90) return 'A'
  if (score >= 80) return 'B+'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  return 'D'
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}
