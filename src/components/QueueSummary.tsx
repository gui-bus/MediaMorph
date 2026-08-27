import React from 'react'
import { FileItem, MediaTab } from '../types'
import { formatBytes } from '../lib/utils'
import { Play, Loader2, Flame } from 'lucide-react'
import { CheckmarkSvg, RemoveImageSvg } from './CustomIcons'

interface QueueSummaryProps {
  files: FileItem[]
  activeTab: MediaTab
  isProcessing: boolean
  onStartProcess: () => void
  onClearCompleted: () => void
  onClearAll: () => void
}

export const QueueSummary: React.FC<QueueSummaryProps> = ({
  files,
  activeTab,
  isProcessing,
  onStartProcess,
  onClearCompleted,
  onClearAll,
}) => {
  if (files.length === 0) return null

  const completedFiles = files.filter((f) => f.status === 'completed')
  const pendingFiles = files.filter((f) => f.status === 'idle' || f.status === 'error')
  const totalOriginalBytes = completedFiles.reduce((acc, f) => acc + f.size, 0)
  const totalNewBytes = completedFiles.reduce((acc, f) => acc + (f.result?.newSize || f.size), 0)
  const totalSavedBytes = Math.max(0, totalOriginalBytes - totalNewBytes)
  const totalSavingsPercent =
    totalOriginalBytes > 0 ? Number(((totalSavedBytes / totalOriginalBytes) * 100).toFixed(1)) : 0

  const isPdf = activeTab === 'pdf'

  return (
    <div className="bg-surface/95 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">

      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="text-xs sm:text-sm">
          <span className="text-gray-500 dark:text-gray-400">Fila: </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {completedFiles.length} de {files.length} concluídos
          </span>
        </div>

        {completedFiles.length > 0 && totalSavedBytes > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <Flame className="h-3.5 w-3.5" />
            <span>
              Economia: {formatBytes(totalSavedBytes)} (-{totalSavingsPercent}%)
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        {completedFiles.length > 0 && !isProcessing && (
          <button
            onClick={onClearCompleted}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-background hover:bg-surface-hover text-gray-700 dark:text-gray-300 border border-border transition-all active:scale-95"
          >
            <CheckmarkSvg className="h-4 w-4" />
            <span>Limpar Concluídos</span>
          </button>
        )}

        {!isProcessing && (
          <button
            onClick={onClearAll}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-background hover:bg-red-500/10 text-gray-700 dark:text-gray-300 hover:text-red-500 border border-border transition-all active:scale-95"
            title="Limpar todos os itens da fila"
          >
            <RemoveImageSvg className="h-4 w-4" />
            <span>Limpar Tudo</span>
          </button>
        )}

        <button
          onClick={onStartProcess}
          disabled={isProcessing || pendingFiles.length === 0}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 transition-all transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processando Fila...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-white" />
              <span>
                {isPdf
                  ? `Gerar PDF com ${pendingFiles.length} imagens`
                  : `Converter ${pendingFiles.length > 0 ? `(${pendingFiles.length})` : 'Todos'}`}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
