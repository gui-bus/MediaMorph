import React, { useState, useEffect } from 'react'
import {
  ChevronRight,
  ArrowLeft,
  ArrowUp,
  HardDrive,
  Monitor,
  Plus,
  Search,
  Layers,
} from 'lucide-react'
import { formatBytes } from '../lib/utils'
import {
  FolderSvg,
  OpenFolderSvg,
  ImageSvg,
  ImageFileSvg,
  VideoCameraSvg,
  VideoFileSvg,
  AudioFileSvg,
  FileDocSvg,
  DownloadSvg,
  RefreshSvg,
} from './CustomIcons'

interface SystemLocation {
  name: string
  path: string
  icon: string
}

interface FileItemInfo {
  name: string
  path: string
  size: number
  ext: string
  isImage: boolean
  isVideo: boolean
  isAudio: boolean
  isPdf?: boolean
  thumbnail?: string
  isDirectory?: boolean
}

interface IntegratedFileExplorerProps {
  onAddFiles: (files: FileItemInfo[]) => void
}

export const IntegratedFileExplorer: React.FC<IntegratedFileExplorerProps> = ({ onAddFiles }) => {
  const [locations, setLocations] = useState<SystemLocation[]>([])
  const [currentPath, setCurrentPath] = useState<string>('')
  const [history, setHistory] = useState<string[]>([])
  const [items, setItems] = useState<FileItemInfo[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function loadLocations() {
      if ((window as any).electronAPI) {
        const locs = await (window as any).electronAPI.getSystemLocations()
        setLocations(locs)
        if (locs.length > 0 && !currentPath) {
          navigateTo(locs[0].path)
        }
      }
    }
    loadLocations()
  }, [])

  const navigateTo = async (targetPath: string, pushHistory = true) => {
    if (!targetPath || !(window as any).electronAPI) return
    setIsLoading(true)
    try {
      const dirItems = await (window as any).electronAPI.listDirectory(targetPath)
      setItems(dirItems || [])
      if (pushHistory && currentPath && currentPath !== targetPath) {
        setHistory((prev) => [...prev, currentPath])
      }
      setCurrentPath(targetPath)
      setSearch('')
    } catch (err) {
      console.error('Erro ao listar pasta:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setHistory((prevHist) => prevHist.slice(0, -1))
    navigateTo(prev, false)
  }

  const handleGoUp = () => {
    if (!currentPath) return
    const parts = currentPath.split(/[\\\/]/).filter(Boolean)
    if (parts.length <= 1) return
    parts.pop()
    const parentPath = currentPath.includes('\\') ? parts.join('\\') : `/${parts.join('/')}`
    navigateTo(parentPath)
  }

  const handleRefresh = () => {
    navigateTo(currentPath, false)
  }

  const handleAddAllMedia = async () => {
    if (!currentPath || !(window as any).electronAPI) return
    const scanned = await (window as any).electronAPI.scanDirectory(currentPath)
    if (scanned && scanned.length > 0) {
      onAddFiles(scanned)
    }
  }

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  const mediaFiles = filteredItems.filter((item) => !item.isDirectory)
  const folders = filteredItems.filter((item) => item.isDirectory)

  const getSystemIcon = (iconName: string) => {
    switch (iconName) {
      case 'downloads':
        return <DownloadSvg className="h-4 w-4 shrink-0" />
      case 'desktop':
        return <Monitor className="h-4 w-4 text-emerald-500 shrink-0" />
      case 'pictures':
        return <ImageSvg className="h-4 w-4 shrink-0" />
      case 'videos':
        return <VideoCameraSvg className="h-4 w-4 shrink-0" />
      case 'documents':
        return <FileDocSvg className="h-4 w-4 shrink-0" />
      default:
        return <HardDrive className="h-4 w-4 text-gray-400 shrink-0" />
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl flex flex-col h-full overflow-hidden shadow-sm transition-colors sticky top-20">

      <div className="p-3.5 px-4 border-b border-border flex items-center justify-between bg-surface/90">
        <div className="flex items-center gap-2">
          <OpenFolderSvg className="h-4 w-4" />
          <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Explorador Integrado
          </h3>
        </div>

        <button
          onClick={handleAddAllMedia}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-[11px] transition-all shadow-sm shrink-0"
          title="Adicionar todas as imagens e vídeos desta pasta para a fila"
        >
          <Layers className="h-3 w-3" />
          <span>+ Pasta Inteira</span>
        </button>
      </div>

      <div className="p-3 border-b border-border bg-background/50">
        <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider block mb-1.5 px-0.5">
          Acesso Rápido
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {locations.map((loc) => {
            const isSelected = currentPath === loc.path
            return (
              <button
                key={loc.path}
                onClick={() => navigateTo(loc.path)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-medium border transition-all text-left truncate ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-300 font-semibold'
                    : 'bg-surface border-border text-gray-700 dark:text-gray-300 hover:bg-surface-hover hover:border-gray-400'
                }`}
                title={loc.path}
              >
                {getSystemIcon(loc.icon)}
                <span className="truncate">{loc.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-2.5 border-b border-border bg-surface flex items-center gap-1.5">
        <button
          disabled={history.length === 0}
          onClick={handleGoBack}
          className="p-1.5 rounded-lg border border-border bg-background hover:bg-surface-hover disabled:opacity-30 transition-all text-gray-600 dark:text-gray-300 shrink-0"
          title="Voltar"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={handleGoUp}
          className="p-1.5 rounded-lg border border-border bg-background hover:bg-surface-hover transition-all text-gray-600 dark:text-gray-300 shrink-0"
          title="Subir Pasta"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={handleRefresh}
          className="p-1.5 rounded-lg border border-border bg-background hover:bg-surface-hover transition-all text-gray-600 dark:text-gray-300 shrink-0"
          title="Recarregar"
        >
          <RefreshSvg className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>

        <div className="flex-1 min-w-0 bg-background border border-border rounded-lg px-2.5 py-1 text-[11px] text-gray-700 dark:text-gray-300 font-mono truncate" title={currentPath}>
          {currentPath}
        </div>
      </div>

      <div className="p-2.5 border-b border-border bg-background/30">
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Filtrar nesta pasta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-emerald-500 shadow-inner"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 min-h-[380px] max-h-[calc(100vh-320px)]">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-gray-500">
            Carregando pasta...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500">
            Nenhuma mídia compatível nesta pasta.
          </div>
        ) : (
          <>

            {folders.map((folder) => (
              <div
                key={folder.path}
                onClick={() => navigateTo(folder.path)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-hover border border-transparent hover:border-border cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FolderSvg className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {folder.name}
                  </span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            ))}

            {mediaFiles.map((file) => (
              <div
                key={file.path}
                className="flex items-center justify-between p-2 rounded-xl bg-background/70 border border-border/80 hover:border-gray-400 dark:hover:border-gray-500 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                  <div className="h-8 w-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-surface border border-border">
                    {file.thumbnail ? (
                      <img src={file.thumbnail} alt="" className="h-full w-full object-cover" />
                    ) : file.isImage ? (
                      <ImageFileSvg className="h-5 w-5" />
                    ) : file.isVideo ? (
                      <VideoFileSvg className="h-5 w-5" />
                    ) : file.isAudio ? (
                      <AudioFileSvg className="h-5 w-5" />
                    ) : (
                      <FileDocSvg className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate" title={file.name}>
                      {file.name}
                    </h5>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                      {formatBytes(file.size)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onAddFiles([file])}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white text-xs font-semibold transition-all shrink-0 shadow-sm"
                  title="Adicionar à fila de conversão"
                >
                  <Plus className="h-3 w-3" />
                  <span>Fila</span>
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
