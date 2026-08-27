import React from 'react'
import { FileItem, MediaTab, PdfMode } from '../types'
import { formatBytes } from '../lib/utils'
import { Play, Pause, Loader2, Flame } from 'lucide-react'
import { CheckmarkSvg, RemoveImageSvg } from './CustomIcons'

interface QueueSummaryProps {
  files: FileItem[]
  activeTab: MediaTab
  pdfMode?: PdfMode
  isProcessing: boolean
  isPaused?: boolean
  onTogglePause?: () => void
  onStartProcess: () => void
  onClearCompleted: () => void
  onClearAll: () => void
}

export const QueueSummary: React.FC<QueueSummaryProps> = ({
  files,
  activeTab,
  pdfMode,
  isProcessing,
  isPaused,
  onTogglePause,
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

        {totalSavedBytes > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <Flame className="h-3.5 w-3.5 fill-emerald-500/20" />
            <span>
              Economia de {formatBytes(totalSavedBytes)} ({totalSavingsPercent}%)
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
        {completedFiles.length > 0 && (
          <button
            type="button"
            onClick={onClearCompleted}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-gray-700 dark:text-gray-300 bg-background hover:bg-border/60 active:bg-border transition-all border border-border disabled:opacity-50 disabled:pointer-events-none"
          >
            <CheckmarkSvg className="h-4 w-4 text-emerald-500" />
            <span>Limpar Concluídos</span>
          </button>
        )}

        <button
          type="button"
          onClick={onClearAll}
          disabled={isProcessing}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-rose-600 dark:text-rose-400 bg-background hover:bg-rose-500/10 active:bg-rose-500/20 transition-all border border-border disabled:opacity-50 disabled:pointer-events-none"
        >
          <RemoveImageSvg className="h-4 w-4 text-rose-500" />
          <span>Limpar Tudo</span>
        </button>

        {isProcessing && onTogglePause && (
          <button
            type="button"
            onClick={onTogglePause}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all border ${
              isPaused
                ? 'bg-amber-500 text-black border-amber-600 hover:bg-amber-400'
                : 'bg-background border-border text-amber-500 hover:bg-amber-500/10'
            }`}
          >
            {isPaused ? <Play className="h-3.5 w-3.5 fill-current" /> : <Pause className="h-3.5 w-3.5" />}
            <span>{isPaused ? 'Retomar Fila' : 'Pausar Fila'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onStartProcess}
          disabled={isProcessing || pendingFiles.length === 0}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 transition-all transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-sm"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{isPaused ? 'Fila Pausada' : 'Processando Fila...'}</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-white" />
              <span>
                {isPdf
                  ? pdfMode === 'compress_pdf'
                    ? `Comprimir ${pendingFiles.length} PDF(s)`
                    : pdfMode === 'pdf_to_images'
                    ? `Extrair Imagens (${pendingFiles.length} PDFs)`
                    : pdfMode === 'merge_split_pdf'
                    ? `Processar (${pendingFiles.length} PDFs)`
                    : `Gerar PDF com ${pendingFiles.length} imagens`
                  : `Converter ${pendingFiles.length > 0 ? `(${pendingFiles.length})` : 'Todos'}`}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
