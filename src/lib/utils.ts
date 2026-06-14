import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function compressImage(file: File, maxPx = 512, quality = 0.6): Promise<string> {
  // createImageBitmap handles HEIC/HEIF natively on iOS 15+,
  // and is more reliable than <img> tag approach
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    // Fallback: load via <img> tag (older iOS, some Android)
    bitmap = await new Promise<ImageBitmap>((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        createImageBitmap(img).then(resolve).catch(reject)
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error(
          `이미지를 열 수 없습니다. 파일: ${file.name} (${file.type || '알 수 없는 형식'}, ${(file.size / 1024 / 1024).toFixed(1)}MB)`
        ))
      }
      img.src = url
    })
  }

  const scale = Math.min(maxPx / bitmap.width, maxPx / bitmap.height, 1)
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('Canvas를 사용할 수 없습니다.')
  }
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', quality)
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
