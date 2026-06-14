import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function drawToJpeg(source: CanvasImageSource, srcW: number, srcH: number, maxPx: number, quality: number): string {
  const scale = Math.min(maxPx / srcW, maxPx / srcH, 1)
  const w = Math.round(srcW * scale)
  const h = Math.round(srcH * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas를 사용할 수 없습니다.')
  ctx.drawImage(source, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', quality)
}

export async function compressImage(file: File, maxPx = 512, quality = 0.6): Promise<string> {
  // 1차 시도: createImageBitmap (JPEG/PNG/WebP에 빠름, HEIC는 실패할 수 있음)
  try {
    const bitmap = await createImageBitmap(file)
    const result = drawToJpeg(bitmap, bitmap.width, bitmap.height, maxPx, quality)
    bitmap.close()
    return result
  } catch {
    // HEIC 등 미지원 포맷 → <img> 태그로 재시도
  }

  // 2차 시도: <img> 태그 (iOS Safari가 HEIC를 네이티브로 렌더링함)
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      try {
        resolve(drawToJpeg(img, img.naturalWidth, img.naturalHeight, maxPx, quality))
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(
        `이 이미지 형식은 지원하지 않습니다 (${file.type || 'unknown'}, ${(file.size / 1024 / 1024).toFixed(1)}MB). ` +
        `갤러리 앱에서 JPEG로 내보낸 후 다시 시도해주세요.`
      ))
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
