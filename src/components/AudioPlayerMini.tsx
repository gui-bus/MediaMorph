import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface AudioPlayerMiniProps {
  filePath: string
  title?: string
}

export const AudioPlayerMini: React.FC<AudioPlayerMiniProps> = ({ filePath, title }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [filePath])

  const handleTogglePlay = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!audioUrl) {
      if ((window as any).electronAPI) {
        const base64Data = await (window as any).electronAPI.readFileBase64(filePath)
        if (base64Data) {
          setAudioUrl(base64Data)
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.play()
              setIsPlaying(true)
            }
          }, 50)
          return
        }
      }
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime
      const dur = audioRef.current.duration
      if (dur > 0) {
        setProgress((cur / dur) * 100)
      }
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setProgress(0)
  }

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-2 px-2 py-1 rounded-lg bg-surface border border-border text-xs max-w-full"
    >
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />
      )}

      <button
        type="button"
        onClick={handleTogglePlay}
        className="p-1 rounded-md bg-emerald-500 text-black hover:bg-emerald-400 transition-colors shrink-0"
        title={isPlaying ? 'Pausar' : 'Ouvir prévia'}
      >
        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
      </button>

      <div className="flex-1 min-w-[60px] h-1.5 bg-background rounded-full overflow-hidden border border-border/50">
        <div
          className="h-full bg-emerald-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <button
        type="button"
        onClick={handleToggleMute}
        className="text-gray-400 hover:text-gray-200 transition-colors shrink-0"
        title={isMuted ? 'Desmutar' : 'Mutar'}
      >
        {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}
