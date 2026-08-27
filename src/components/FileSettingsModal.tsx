import React, { useState } from 'react'
import { FileItem } from '../types'
import { X, Settings, RotateCcw } from 'lucide-react'
import { SearchableSelect, SelectOption } from './SearchableSelect'

interface FileSettingsModalProps {
  file: FileItem
  onSave: (id: string, customSettings?: { format?: string; quality?: number }) => void
  onClose: () => void
}

export const FileSettingsModal: React.FC<FileSettingsModalProps> = ({ file, onSave, onClose }) => {
  const [format, setFormat] = useState(file.customSettings?.format || '')
  const [quality, setQuality] = useState(file.customSettings?.quality || 80)

  const imageFormats: SelectOption[] = [
    { value: 'webp', label: 'WebP', desc: 'Moderno e leve' },
    { value: 'avif', label: 'AVIF', desc: 'Máxima compressão' },
    { value: 'jpeg', label: 'JPEG', desc: 'Universal' },
    { value: 'png', label: 'PNG', desc: 'Transparência' },
    { value: 'gif', label: 'GIF', desc: 'Animado' },
  ]

  const videoFormats: SelectOption[] = [
    { value: 'mp4', label: 'MP4 (H.264)', desc: 'Universal' },
    { value: 'webm', label: 'WebM (VP9)', desc: 'Alta eficiência' },
    { value: 'gif', label: 'GIF Animado', desc: 'Adesivo' },
    { value: 'mp3', label: 'Áudio MP3', desc: 'Som' },
  ]

  const handleSave = () => {
    if (!format) {
      onSave(file.id, undefined)
    } else {
      onSave(file.id, { format, quality })
    }
    onClose()
  }

  const handleReset = () => {
    onSave(file.id, undefined)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">

        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary-400" />
            <h3 className="text-sm font-bold text-white">Configuração Individual</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-surface-hover"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <span className="text-xs text-gray-400 block mb-0.5">Arquivo selecionado:</span>
          <p className="text-xs font-mono text-gray-200 truncate bg-background p-2 rounded-lg border border-border">
            {file.name}
          </p>
        </div>

        <div className="space-y-4">
          <SearchableSelect
            label="Formato Específico para este Arquivo"
            options={file.isImage ? imageFormats : videoFormats}
            value={format}
            onChange={setFormat}
            placeholder="Usar padrão da fila..."
          />

          {file.isImage && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-300">
                <span>Qualidade Individual</span>
                <span className="text-primary-400 font-mono">{quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/80">
          <button
            onClick={handleReset}
            className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Restaurar Padrão
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs text-gray-300 hover:bg-surface-hover"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-primary-500 hover:bg-primary-400 text-white shadow-md shadow-primary-500/20"
            >
              Salvar Ajuste
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
