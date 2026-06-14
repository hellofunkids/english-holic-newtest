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

function isHeic(file: File): boolean {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.(heic|heif)$/i.test(file.name)
  )
}

async function blobToJpeg(blob: Blob, maxPx: number, quality: number): Promise<string> {
  // Try createImageBitmap first (fast path for JPEG/PNG/WebP)
  try {
    const bitmap = await createImageBitmap(blob)
    const result = drawToJpeg(bitmap, bitmap.width, bitmap.height, maxPx, quality)
    bitmap.close()
    return result
  } catch {
    // Fallback: <img> tag
  }
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(blob)
    img.onload = () => {
      URL.revokeObjectURL(url)
      try { resolve(drawToJpeg(img, img.naturalWidth, img.naturalHeight, maxPx, quality)) }
      catch (e) { reject(e) }
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('이미지 렌더링 실패')) }
    img.src = url
  })
}

export async function compressImage(file: File, maxPx = 512, quality = 0.6): Promise<string> {
  if (isHeic(file)) {
    // Method 1: heic2any — pure-JS HEIC decoder
    try {
      const mod = await import('heic2any')
      const fn = (mod.default ?? mod) as (
        opts: { blob: Blob; toType: string; quality?: number }
      ) => Promise<Blob | Blob[]>
      const out = await fn({ blob: file, toType: 'image/jpeg', quality: 0.92 })
      const jpeg = Array.isArray(out) ? out[0] : out
      return blobToJpeg(jpeg, maxPx, quality)
    } catch (e) {
      // heic2any throws plain objects: { code, message }
      const detail = (e != null && typeof e === 'object' && 'message' in e)
        ? String((e as { message: unknown }).message)
        : JSON.stringify(e)
      console.warn('heic2any failed:', detail)
      // Fall through to Method 2
    }

    // Method 2: native <img> tag (works on some iOS versions)
    try {
      return await blobToJpeg(file, maxPx, quality)
    } catch {
      // Fall through to final error
    }

    throw new Error(
      'HEIC 이미지를 변환할 수 없습니다.\n' +
      '해결 방법: iPhone 설정 → 카메라 → 포맷 → "가장 호환성 높은 포맷" 선택 후 다시 찍어주세요.\n' +
      '또는 앱의 카메라 버튼(📷)으로 직접 촬영하면 JPEG로 저장됩니다.'
    )
  }

  return blobToJpeg(file, maxPx, quality)
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
