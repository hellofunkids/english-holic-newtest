import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function compressImage(file: File, maxPx = 1024, quality = 0.8): Promise<string> {
  // For HEIC/HEIF (iPhone), createObjectURL still works in modern Safari
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(maxPx / img.width, maxPx / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas not supported')); return }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      // Fallback: read as base64 directly (works for most HEIC on iOS Safari)
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
