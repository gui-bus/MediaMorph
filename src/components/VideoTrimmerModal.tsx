import React, { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  Film,
  Check,
} from 'lucide-react'
import { CloseSvg, UndoSvg, ScissorSvg } from './CustomIcons'

interface VideoTrimmerModalProps {
  filePath: string
  fileName: string
  initialTrimStart?: string
  initialTrimEnd?: string
  onSave: (trimStart?: string, trimEnd?: string) => void
  onClose: () => void
}

export const VideoTrimmerModal: React.FC<VideoTrimmerModalProps> = ({
  filePath,
  fileName,
  initialTrimStart,
  initialTrimEnd,
  onSave,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [videoLoadError, setVideoLoadError] = useState<boolean>(false)

  const [trimStartSec, setTrimStartSec] = useState<number>(0)
  const [trimEndSec, setTrimEndSec] = useState<number>(60)

  const parseTimeToSeconds = (str?: string): number => {
    if (!str) return 0
    const parts = str.split(':').map(Number)
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]
    }
    return Number(str) || 0
  }

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '00:00:00.0'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 10)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${ms}`
  }

  const formatFfmpegTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  useEffect(() => {
    async function loadMeta() {
      if ((window as any).electronAPI?.getVideoMetadata) {
        try {
          const meta = await (window as any).electronAPI.getVideoMetadata(filePath)
          if (meta && meta.duration > 0) {
            setDuration(meta.duration)
            const parsedStart = parseTimeToSeconds(initialTrimStart)
            const parsedEnd = initialTrimEnd ? parseTimeToSeconds(initialTrimEnd) : meta.duration
            setTrimStartSec(Math.min(parsedStart, meta.duration))
            setTrimEndSec(Math.min(parsedEnd || meta.duration, meta.duration))
          }
        } catch (err) {
          console.error('Erro ao ler metadados do vídeo:', err)
        }
      }
    }
    loadMeta()
  }, [filePath])

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration
      if (dur && !isNaN(dur) && dur > 0) {
        setDuration(dur)
        if (trimEndSec === 0 || trimEndSec > dur || trimEndSec === 60) {
          const parsedEnd = initialTrimEnd ? parseTimeToSeconds(initialTrimEnd) : dur
          setTrimEndSec(Math.min(parsedEnd, dur))
        }
      }
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime
      setCurrentTime(cur)

      if (cur >= trimEndSec || cur < trimStartSec) {
        if (isPlaying) {
          videoRef.current.currentTime = trimStartSec
          videoRef.current.play()
        }
      }
    }
  }

  const togglePlayTrimmed = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      const cur = videoRef.current.currentTime
      if (cur < trimStartSec || cur >= trimEndSec) {
        videoRef.current.currentTime = trimStartSec
      }
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleSeek = (timeSec: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timeSec
      setCurrentTime(timeSec)
    }
  }

  const handleStartSliderChange = (newStart: number) => {
    const maxVal = duration > 0 ? duration : 3600
    const validStart = Math.min(newStart, Math.max(0, trimEndSec - 0.2))
    setTrimStartSec(Math.max(0, validStart))
    handleSeek(validStart)
  }

  const handleEndSliderChange = (newEnd: number) => {
    const maxVal = duration > 0 ? duration : 3600
    const validEnd = Math.max(newEnd, trimStartSec + 0.2)
    setTrimEndSec(Math.min(maxVal, validEnd))
    handleSeek(validEnd)
  }

  const handleReset = () => {
    setTrimStartSec(0)
    setTrimEndSec(duration || 60)
    handleSeek(0)
  }

  const handleSave = () => {
    const isFull = trimStartSec === 0 && (trimEndSec >= duration || trimEndSec === 0)
    if (isFull && duration > 0) {
      onSave(undefined, undefined)
    } else {
      onSave(formatFfmpegTime(trimStartSec), formatFfmpegTime(trimEndSec))
    }
    onClose()
  }

  const maxDuration = Math.max(1, duration || 60)
  const selectedDuration = Math.max(0, trimEndSec - trimStartSec)

  const fileUrl = `file:///${filePath.replace(/\\/g, '/')}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

        <div className="p-4 px-6 border-b border-border flex items-center justify-between bg-surface/90">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <ScissorSvg className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate" title={fileName}>
                Cortador Visual de Vídeo
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {fileName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-surface-hover transition-colors"
          >
            <CloseSvg className="h-4 w-4" />
          </button>
        </div>

        <div className="relative bg-black flex items-center justify-center min-h-[260px] max-h-[380px] overflow-hidden group">
          {!videoLoadError ? (
            <video
              ref={videoRef}
              src={fileUrl}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={() => setVideoLoadError(true)}
              className="max-h-[360px] max-w-full object-contain cursor-pointer"
              onClick={togglePlayTrimmed}
              playsInline
            />
          ) : (
            <div className="p-8 text-center space-y-2 text-gray-400">
              <Film className="h-10 w-10 text-emerald-500 mx-auto opacity-70" />
              <p className="text-xs text-gray-300">
                Pré-visualização direta não disponível para este formato (ex: MKV/AVI).
              </p>
              <p className="text-[11px] text-gray-500">
                A régua de corte e a conversão do trecho com FFmpeg funcionam normalmente!
              </p>
            </div>
          )}

          {!videoLoadError && (
            <button
              onClick={togglePlayTrimmed}
              className="absolute inset-0 m-auto h-14 w-14 rounded-full bg-black/60 hover:bg-emerald-500 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all transform scale-95 group-hover:scale-100 shadow-xl"
              title="Assistir Trecho Cortado"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-white ml-0.5" />}
            </button>
          )}

          <div className="absolute bottom-3 left-4 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white font-mono text-xs border border-white/10 flex items-center gap-2">
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
        </div>

        <div className="p-5 px-6 space-y-4 bg-surface border-t border-border">

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Trecho Selecionado:</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs">
                  {formatTime(trimStartSec)} ➔ {formatTime(trimEndSec)} ({selectedDuration.toFixed(1)}s)
                </span>
              </div>
              <button
                onClick={handleReset}
                className="text-[11px] text-gray-500 dark:text-gray-400 hover:text-emerald-500 flex items-center gap-1 font-medium transition-colors"
                title="Resetar para o vídeo completo"
              >
                <UndoSvg className="h-3.5 w-3.5" />
                Resetar
              </button>
            </div>

            <div className="relative w-full h-8 bg-background rounded-xl border border-border overflow-hidden flex items-center select-none shadow-inner">

              <div
                className="absolute top-0 bottom-0 left-0 bg-black/40 dark:bg-black/60 transition-all"
                style={{ width: `${(trimStartSec / maxDuration) * 100}%` }}
              />

              <div
                className="absolute top-0 bottom-0 bg-gradient-to-r from-emerald-500/35 via-emerald-500/25 to-teal-400/35 border-y-2 border-emerald-500 transition-all"
                style={{
                  left: `${(trimStartSec / maxDuration) * 100}%`,
                  width: `${((trimEndSec - trimStartSec) / maxDuration) * 100}%`,
                }}
              />

              <div
                className="absolute top-0 bottom-0 right-0 bg-black/40 dark:bg-black/60 transition-all"
                style={{ width: `${((maxDuration - trimEndSec) / maxDuration) * 100}%` }}
              />

              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-md z-10 pointer-events-none rounded-full"
                style={{ left: `${(currentTime / maxDuration) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                  <span>Ponto Inicial</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatTime(trimStartSec)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxDuration}
                  step="0.1"
                  value={trimStartSec}
                  onChange={(e) => handleStartSliderChange(Number(e.target.value))}
                  className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                  <span>Ponto Final</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatTime(trimEndSec)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxDuration}
                  step="0.1"
                  value={trimEndSec}
                  onChange={(e) => handleEndSliderChange(Number(e.target.value))}
                  className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/80">
            <button
              type="button"
              onClick={togglePlayTrimmed}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-all"
              title="Assista apenas ao trecho selecionado em loop"
            >
              {isPlaying ? <Pause className="h-4 w-4 text-emerald-500" /> : <Play className="h-4 w-4 fill-emerald-500 text-emerald-500" />}
              <span>{isPlaying ? 'Pausar Trecho' : 'Assistir Trecho Cortado'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs transition-all transform active:scale-95"
              >
                <Check className="h-4 w-4 text-white stroke-[2.5]" />
                <span>Aplicar Corte</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
