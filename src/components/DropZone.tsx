import React, { useState } from 'react'
import { MediaTab } from '../types'
import {
  UploadSvg,
  OpenFolderSvg,
  ImageSvg,
  VideoCameraSvg,
  AudioFileSvg,
  FileDocSvg,
} from './CustomIcons'

interface DropZoneProps {
  activeTab: MediaTab
  onFilesSelected: (files: Array<any>) => void
  disabled?: boolean
}

export const DropZone: React.FC<DropZoneProps> = ({ activeTab, onFilesSelected, disabled }) => {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    if (disabled) return

    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length === 0) return

    const parsedList: Array<any> = []

    for (const file of droppedFiles) {
      const filePath = (file as any).path || ''
      if (!filePath) continue

      if ((window as any).electronAPI) {
        const info = await (window as any).electronAPI.getFileInfo(filePath)
        if (info) {
          if (Array.isArray(info)) {
            parsedList.push(...info)
          } else {
            parsedList.push(info)
          }
        }
      }
    }

    if (parsedList.length > 0) {
      onFilesSelected(parsedList)
    }
  }

  const handleClickSelect = async () => {
    if (disabled) return
    if ((window as any).electronAPI) {
      const files = await (window as any).electronAPI.selectFiles(activeTab)
      if (files && files.length > 0) {
        onFilesSelected(files)
      }
    }
  }

  const handleSelectFolder = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (disabled) return
    if ((window as any).electronAPI) {
      const files = await (window as any).electronAPI.selectFolderFiles()
      if (files && files.length > 0) {
        onFilesSelected(files)
      }
    }
  }

  const isImages = activeTab === 'images'
  const isVideos = activeTab === 'videos'
  const isAudio = activeTab === 'audio'

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClickSelect}
      className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-8 sm:p-10 flex flex-col items-center justify-center text-center overflow-hidden w-full ${
        isDragOver
          ? 'border-emerald-500 bg-emerald-500/10 shadow-xl shadow-emerald-500/15 scale-[1.008]'
          : 'border-border bg-surface/60 hover:bg-surface hover:border-emerald-500/50 hover:shadow-md'
      }`}
    >

      <div
        className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-3.5 transition-all duration-300 transform group-hover:scale-110 shadow-md ${
          isDragOver
            ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-emerald-500/40'
            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
        }`}
      >
        {isImages ? (
          <ImageSvg className="h-8 w-8" />
        ) : isVideos ? (
          <VideoCameraSvg className="h-8 w-8" />
        ) : isAudio ? (
          <AudioFileSvg className="h-8 w-8" />
        ) : (
          <FileDocSvg className="h-8 w-8" />
        )}
      </div>

      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
        <span>Arraste arquivos ou pastas inteiras aqui</span>
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mb-4">
        {activeTab === 'pdf'
          ? 'Junte fotos em um arquivo PDF único ou solte arquivos PDF para extrair cada página em imagem'
          : 'Clique para selecionar arquivos locais ou arraste diretórios completos'}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        <button
          type="button"
          onClick={handleSelectFolder}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-background hover:bg-surface-hover border border-border text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white text-xs font-semibold transition-all shadow-sm"
        >
          <OpenFolderSvg className="h-4 w-4" />
          <span>Importar Pasta Inteira</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-mono font-medium text-gray-600 dark:text-gray-400">
        {isImages ? (
          <>
            <span className="px-2 py-0.5 rounded-md bg-background border border-border">PNG</span>
            <span className="px-2 py-0.5 rounded-md bg-background border border-border">JPG</span>
            <span className="px-2 py-0.5 rounded-md bg-background border border-border">WEBP</span>
            <span className="px-2 py-0.5 rounded-md bg-background border border-border">AVIF</span>
            <span className="px-2 py-0.5 rounded-md bg-background border border-border">ICO</span>
            <span className="px-2 py-0.5 rounded-md bg-background border border-border">GIF</span>
            <span className="px-2 py-0.5 rounded-md bg-background border border-border">TIFF</span>
          </>
        ) : isVideos ? (
          <>
            <span className="px-2 py-0.5 rounded-md bg-background border border-border">MP4</span>
            <span className="px-2 py-0.5 rounded-md bg-background border border-border">MKV</span>
            <span className="px-2 py-0.5 rounded-md bg-background border border-border">MOV</span>
            <span className="px-2 py-0.5 rounded-md bg-background border border-border">WEBM</span>
            <span className="px-2 py-0.5 rounded-md bg-background border border-border">AVI</span>
          </>
        ) : isAudio ? (
          <>
            <span className="px-2 py-0.5 rounded-md bg-background border border-border">MP3</span>
            <span className="px-2 py-0.5 rounded-md bg-background border border-border">WAV</span>
            <span className="px-2 py-0.5 rounded-md bg-background border border-border">FLAC</span>
            <span className="px-2 py-0.5 rounded-md bg-background border border-border">AAC</span>
            <span className="px-2 py-0.5 rounded-md bg-background border border-border">OGG</span>
          </>
        ) : (
          <>
            <span className="px-2 py-0.5 rounded-md bg-background border border-border">PDF</span>
            <span className="px-2 py-0.5 rounded-md bg-background border border-border">PNG</span>
            <span className="px-2 py-0.5 rounded-md bg-background border border-border">JPG</span>
            <span className="px-2 py-0.5 rounded-md bg-background border border-border">WEBP</span>
          </>
        )}
      </div>
    </div>
  )
}
