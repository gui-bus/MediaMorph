import React, { useEffect } from 'react'
import { HistoryItem } from '../types'
import { formatBytes } from '../lib/utils'
import { X, History, Trash2, FolderSearch, Flame, Clock } from 'lucide-react'

interface HistoryDrawerProps {
  isOpen: boolean
  onClose: () => void
  history: HistoryItem[]
  onClearHistory: () => void
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleRevealInExplorer = (filePath: string) => {
    if ((window as any).electronAPI) {
      ;(window as any).electronAPI.showItemInFolder(filePath)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border-l border-border w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">

        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary-400" />
            <h3 className="text-sm font-bold text-white">Histórico de Conversões</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-background border border-border text-gray-400">
              {history.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Limpar histórico"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-surface-hover transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 space-y-2">
              <Clock className="h-10 w-10 text-gray-600 stroke-[1.5]" />
              <p className="text-xs">Nenhuma conversão registrada ainda.</p>
              <span className="text-[11px] text-gray-600">
                Os arquivos convertidos aparecerão aqui automaticamente.
              </span>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="bg-background/80 border border-border/80 rounded-xl p-3.5 hover:border-border transition-all flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-gray-200 truncate" title={item.name}>
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                    <span>{formatBytes(item.originalSize)}</span>
                    <span className="text-gray-600">➔</span>
                    <span className="text-gray-200 font-mono font-medium">
                      {formatBytes(item.newSize)}
                    </span>
                    {item.savingsPercent > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                        <Flame className="h-2.5 w-2.5" />
                        -{item.savingsPercent}%
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 block mt-0.5">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <button
                  onClick={() => handleRevealInExplorer(item.outputPath)}
                  className="p-2 rounded-lg bg-surface border border-border text-gray-300 hover:text-white hover:border-primary-500/40 text-xs transition-all shrink-0"
                  title="Abrir no Windows Explorer"
                >
                  <FolderSearch className="h-4 w-4 text-primary-400" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
