import { useRef, useCallback, useState } from 'react'
import { Upload, Camera, ImageIcon, FileText, X, ChevronUp, ChevronDown } from 'lucide-react'
import type { UploadedFile } from '../types'

interface Props {
  files: UploadedFile[]
  onChange: (files: UploadedFile[]) => void
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export default function FileUploader({ files, onChange }: Props) {
  const [dragging, setDragging] = useState(false)
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const pdfRef = useRef<HTMLInputElement>(null)

  const imageCount = files.filter(f => f.type === 'image').length
  const pdfCount = files.filter(f => f.type === 'pdf').length

  const addRawFiles = useCallback((rawFiles: File[]) => {
    const toAdd: UploadedFile[] = []
    let imgCount = imageCount
    let pCount = pdfCount

    for (const file of rawFiles) {
      const isPdf = file.type === 'application/pdf'
      if (isPdf && pCount >= 1) continue
      if (!isPdf && imgCount >= 10) continue

      toAdd.push({
        id: makeId(),
        file,
        preview: isPdf ? '' : URL.createObjectURL(file),
        type: isPdf ? 'pdf' : 'image',
      })

      if (isPdf) { pCount++ } else { imgCount++ }
    }

    onChange([...files, ...toAdd])
  }, [files, onChange, imageCount, pdfCount])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addRawFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  const removeFile = (id: string) => {
    const f = files.find(x => x.id === id)
    if (f?.preview) URL.revokeObjectURL(f.preview)
    onChange(files.filter(x => x.id !== id))
  }

  const move = (id: string, dir: -1 | 1) => {
    const idx = files.findIndex(x => x.id === id)
    const target = idx + dir
    if (idx < 0 || target < 0 || target >= files.length) return
    const next = [...files]
    ;[next[idx], next[target]] = [next[target], next[idx]]
    onChange(next)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addRawFiles(Array.from(e.dataTransfer.files))
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          dragging
            ? 'border-navy bg-navy-50'
            : 'border-gray-200 hover:border-navy/40 hover:bg-navy-50/50'
        }`}
        onClick={() => galleryRef.current?.click()}
      >
        <Upload className="w-10 h-10 mx-auto mb-3 text-navy/30" />
        <p className="text-sm font-semibold text-gray-600">파일을 드래그하거나 탭하여 선택</p>
        <p className="text-xs text-gray-400 mt-1">이미지 최대 10장 · PDF 1개 · JPG, PNG, PDF</p>
      </div>

      {/* Upload buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-gray-200 hover:border-navy/30 hover:bg-navy-50 transition-all text-navy"
        >
          <Camera className="w-5 h-5" />
          <span className="text-xs font-medium">카메라</span>
        </button>
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          disabled={imageCount >= 10}
          className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-gray-200 hover:border-navy/30 hover:bg-navy-50 transition-all text-navy disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ImageIcon className="w-5 h-5" />
          <span className="text-xs font-medium">갤러리 {imageCount}/10</span>
        </button>
        <button
          type="button"
          onClick={() => pdfRef.current?.click()}
          disabled={pdfCount >= 1}
          className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-gray-200 hover:border-navy/30 hover:bg-navy-50 transition-all text-navy disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FileText className="w-5 h-5" />
          <span className="text-xs font-medium">PDF {pdfCount}/1</span>
        </button>
      </div>

      {/* Hidden inputs */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleInputChange} />
      <input ref={galleryRef} type="file" accept="image/jpg,image/jpeg,image/png" multiple className="hidden" onChange={handleInputChange} />
      <input ref={pdfRef} type="file" accept="application/pdf" className="hidden" onChange={handleInputChange} />

      {/* Thumbnail grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5">
          {files.map((f, idx) => (
            <div key={f.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
              {f.type === 'image' ? (
                <img src={f.preview} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-2">
                  <FileText className="w-7 h-7 text-navy/40" />
                  <span className="text-[10px] text-gray-400 text-center truncate w-full px-1">{f.file.name}</span>
                </div>
              )}

              {/* Number badge */}
              <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-navy text-white text-[10px] font-bold flex items-center justify-center shadow">
                {idx + 1}
              </div>

              {/* Controls overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                <button type="button" onClick={() => move(f.id, -1)} disabled={idx === 0}
                  className="p-1 bg-white/20 rounded-lg hover:bg-white/40 disabled:opacity-30 text-white">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => removeFile(f.id)}
                  className="p-1 bg-red-500/80 rounded-lg hover:bg-red-500 text-white">
                  <X className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => move(f.id, 1)} disabled={idx === files.length - 1}
                  className="p-1 bg-white/20 rounded-lg hover:bg-white/40 disabled:opacity-30 text-white">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
