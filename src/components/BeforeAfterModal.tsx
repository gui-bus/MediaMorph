import React, { useState, useEffect, useRef } from 'react'
import { X, Flame, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { formatBytes } from '../lib/utils'

interface BeforeAfterModalProps {
  originalPath: string
  outputPath: string
  originalSize: number
  newSize: number
  savingsPercent: number
  onClose: () => void
}

export const BeforeAfterModal: React.FC<BeforeAfterModalProps> = ({
  originalPath,
  outputPath,
  originalSize,
  newSize,
  savingsPercent,
  onClose,
}) => {
  const [sliderPos, setSliderPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [originalSrc, setOriginalSrc] = useState<string | null>(null)
  const [optimizedSrc, setOptimizedSrc] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let isMounted = true

    async function loadImages() {
      if ((window as any).electronAPI) {
        const origBase64 = await (window as any).electronAPI.readFileBase64(originalPath)
        const optBase64 = await (window as any).electronAPI.readFileBase64(outputPath)
        if (isMounted) {
          const ensureDataUri = (data: string | null, filePath: string) => {
            if (!data) return null
            if (data.startsWith('data:')) return data
            const ext = filePath.split('.').pop()?.toLowerCase() || 'jpeg'
            const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'avif' ? 'image/avif' : ext === 'gif' ? 'image/gif' : 'image/jpeg'
            return `data:${mime};base64,${data}`
          }
          setOriginalSrc(ensureDataUri(origBase64, originalPath))
          setOptimizedSrc(ensureDataUri(optBase64, outputPath))
        }
      }
    }

    loadImages()
    return () => {
      isMounted = false
    }
  }, [originalPath, outputPath])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const percent = (x / rect.width) * 100
    setSliderPos(percent)
  }

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

        <div className="flex items-center justify-between px-5 py-4 border-b border-border/80 bg-surface">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-white">Comparador Antes & Depois</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-background border border-border text-gray-300">
                Original: {formatBytes(originalSize)}
              </span>
              <span className="text-gray-500">➔</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                Otimizado: {formatBytes(newSize)}
              </span>
              {savingsPercent > 0 && (
                <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500 text-black font-bold text-[11px]">
                  <Flame className="h-3 w-3" />
                  -{savingsPercent}%
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">

            <div className="flex items-center gap-1 bg-background rounded-lg border border-border p-1">
              <button
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                className="p-1 text-gray-400 hover:text-white rounded hover:bg-surface"
                title="Diminuir Zoom"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="text-[11px] font-mono text-gray-400 px-1">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                className="p-1 text-gray-400 hover:text-white rounded hover:bg-surface"
                title="Aumentar Zoom"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              {zoom !== 1 && (
                <button
                  onClick={() => setZoom(1)}
                  className="p-1 text-gray-400 hover:text-white rounded hover:bg-surface ml-1"
                  title="Resetar Zoom"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-surface-hover transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          className="relative flex-1 bg-[#090d13] min-h-[420px] max-h-[650px] overflow-hidden select-none cursor-ew-resize flex items-center justify-center"
        >

          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `radial-gradient(#484f58 1px, transparent 1px)`,
              backgroundSize: '16px 16px',
            }}
          />

          {originalSrc && optimizedSrc ? (
            <div
              className="relative max-w-full max-h-full transition-transform duration-75"
              style={{ transform: `scale(${zoom})` }}
            >

              <img
                src={optimizedSrc}
                alt="Optimized"
                className="max-h-[500px] w-auto object-contain pointer-events-none"
              />

              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              >
                <img
                  src={originalSrc}
                  alt="Original"
                  className="max-h-[500px] w-auto object-contain"
                />
              </div>

              <div
                className="absolute top-0 bottom-0 z-20 pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute inset-y-0 -left-[1px] w-[2px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)]" />
                <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-black shadow-xl flex items-center justify-center font-bold text-xs select-none">
                  ↔
                </div>
              </div>

              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white pointer-events-none">
                Original
              </div>
              <div className="absolute top-3 right-3 bg-emerald-950/80 backdrop-blur-sm border border-emerald-500/30 px-2.5 py-1 rounded-md text-[11px] font-semibold text-emerald-300 pointer-events-none">
                Otimizado ({savingsPercent}% menor)
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400 animate-pulse">Carregando imagens para comparação...</div>
          )}
        </div>

        <div className="px-5 py-3 bg-surface/50 border-t border-border flex items-center justify-between text-xs text-gray-400">
          <span>💡 Arraste o divisor horizontalmente para comparar a qualidade dos detalhes.</span>
          <span className="font-mono text-gray-500">Pressione ESC para fechar</span>
        </div>
      </div>
    </div>
  )
}
