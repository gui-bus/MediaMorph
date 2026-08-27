import React from 'react'
import { FileItem } from '../types'
import { formatBytes } from '../lib/utils'
import {
  FolderSearch,
  Loader2,
  Flame,
  Eye,
  Video as VideoIcon,
} from 'lucide-react'
import {
  ImageFileSvg,
  VideoFileSvg,
  AudioFileSvg,
  FileDocSvg,
  CloseSvg,
  EditImageSvg,
  ScissorSvg,
} from './CustomIcons'
import { AudioPlayerMini } from './AudioPlayerMini'
import { useLanguage } from '../i18n/LanguageContext'

interface FileCardProps {
  file: FileItem
  onRemove: (id: string) => void
  onCompare?: (file: FileItem) => void
  onOpenSettings?: (file: FileItem) => void
  onOpenTrimmer?: (file: FileItem) => void
  disabled?: boolean
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  onRemove,
  onCompare,
  onOpenSettings,
  onOpenTrimmer,
  disabled,
}) => {
  const { t } = useLanguage()

  const handleRevealInExplorer = () => {
    if (file.result?.outputPath && (window as any).electronAPI) {
      ;(window as any).electronAPI.showItemInFolder(file.result.outputPath)
    }
  }

  const isCompleted = file.status === 'completed'
  const isProcessing = file.status === 'processing'
  const isError = file.status === 'error'

  return (
    <div
      className={`relative group bg-surface border rounded-xl p-3.5 sm:p-4 transition-all duration-200 shadow-sm ${
        isCompleted
          ? 'border-emerald-500/40 bg-emerald-500/5'
          : isError
          ? 'border-red-500/40 bg-red-500/5'
          : isProcessing
          ? 'border-emerald-500/50 bg-emerald-500/5'
          : 'border-border hover:border-gray-400 dark:hover:border-gray-500'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-background border border-border">
            {file.thumbnail ? (
              <img src={file.thumbnail} alt="" className="h-full w-full object-cover" />
            ) : file.isImage ? (
              <ImageFileSvg className="h-6 w-6" />
            ) : file.isVideo ? (
              <VideoFileSvg className="h-6 w-6" />
            ) : file.isAudio ? (
              <AudioFileSvg className="h-6 w-6" />
            ) : (
              <FileDocSvg className="h-6 w-6" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" title={file.name}>
                {file.name}
              </h4>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-background border border-border text-gray-500 dark:text-gray-400">
                {file.ext.replace('.', '')}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <span className="font-mono">{formatBytes(file.size)}</span>

              {isCompleted && file.result && (
                <>
                  <span>•</span>
                  <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                    {formatBytes(file.result.newSize)}
                  </span>
                  {file.result.savedBytes > 0 && (
                    <span className="flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                      <Flame className="h-3 w-3 fill-emerald-500/20" />
                      -{file.result.savingsPercent}%
                    </span>
                  )}
                </>
              )}

              {isError && file.error && (
                <span className="text-red-500 dark:text-red-400 truncate max-w-xs block" title={file.error}>
                  • {file.error}
                </span>
              )}
            </div>

            {file.isAudio && (
              <div className="mt-2">
                <AudioPlayerMini filePath={file.path} />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!isCompleted && !isProcessing && file.isVideo && onOpenTrimmer && (
            <button
              disabled={disabled}
              onClick={() => onOpenTrimmer(file)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all"
              title={t('fileCard.trimBtn')}
            >
              <ScissorSvg className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{t('fileCard.trimBtn')}</span>
            </button>
          )}

          {!isCompleted && !isProcessing && onOpenSettings && (
            <button
              disabled={disabled}
              onClick={() => onOpenSettings(file)}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-surface-hover border border-transparent hover:border-border transition-all flex items-center justify-center"
              title={t('fileCard.settingsBtn')}
            >
              <EditImageSvg className="h-5 w-5" />
            </button>
          )}

          {isCompleted && file.isImage && file.result?.outputPath && onCompare && (
            <button
              onClick={() => onCompare(file)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/25 text-xs font-semibold transition-all"
              title={t('fileCard.compareBtn')}
            >
              <Eye className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              <span className="hidden sm:inline">{t('fileCard.compareBtn')}</span>
            </button>
          )}

          {isCompleted && (
            <button
              onClick={handleRevealInExplorer}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-background border border-border text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:border-emerald-500/40 text-xs font-medium transition-all"
              title={t('fileCard.exploreBtn')}
            >
              <FolderSearch className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              <span className="hidden sm:inline">Explorer</span>
            </button>
          )}

          {isProcessing && (
            <div className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400 text-xs px-3 py-2">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}

          {!isProcessing && (
            <button
              disabled={disabled}
              onClick={() => onRemove(file.id)}
              className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all flex items-center justify-center disabled:opacity-40"
              title={t('fileCard.removeBtn')}
            >
              <CloseSvg className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {isProcessing && (
        <div className="mt-3 w-full bg-background rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.max(5, file.progress)}%` }}
          />
        </div>
      )}
    </div>
  )
}
