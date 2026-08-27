import React from 'react'
import { FileItem, MediaTab } from '../types'
import { FileCard } from './FileCard'
import { Layers } from 'lucide-react'

interface FileListProps {
  files: FileItem[]
  activeTab: MediaTab
  onRemove: (id: string) => void
  onCompare?: (file: FileItem) => void
  onOpenSettings?: (file: FileItem) => void
  onOpenTrimmer?: (file: FileItem) => void
  disabled?: boolean
}

export const FileList: React.FC<FileListProps> = ({
  files,
  activeTab,
  onRemove,
  onCompare,
  onOpenSettings,
  onOpenTrimmer,
  disabled,
}) => {
  if (files.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Fila de Arquivos ({files.length})
          </h3>
        </div>
      </div>

      <div className="space-y-2.5">
        {files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            onRemove={onRemove}
            onCompare={onCompare}
            onOpenSettings={onOpenSettings}
            onOpenTrimmer={onOpenTrimmer}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
}
