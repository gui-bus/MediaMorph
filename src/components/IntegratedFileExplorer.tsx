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
import { useLanguage } from '../i18n/LanguageContext'

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
  const { t } = useLanguage()
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

  const navigateTo = async (dirPath: string) => {
    if (!dirPath || isLoading) return
    setIsLoading(true)

    if (currentPath && currentPath !== dirPath) {
      setHistory((prev) => [...prev, currentPath])
    }
    setCurrentPath(dirPath)

    if ((window as any).electronAPI) {
      const dirItems = await (window as any).electronAPI.listDirectory(dirPath)
      setItems(dirItems || [])
    }
    setIsLoading(false)
  }

  const handleGoBack = () => {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setHistory((h) => h.slice(0, -1))
    setCurrentPath(prev)
    if ((window as any).electronAPI) {
      setIsLoading(true)
      ;(window as any).electronAPI.listDirectory(prev).then((dirItems: FileItemInfo[]) => {
        setItems(dirItems || [])
        setIsLoading(false)
      })
    }
  }

  const handleGoUp = () => {
    if (!currentPath) return
    const lastSlash = Math.max(currentPath.lastIndexOf('\\'), currentPath.lastIndexOf('/'))
    if (lastSlash > 0) {
      const parent = currentPath.substring(0, lastSlash)
      navigateTo(parent.length === 2 && parent[1] === ':' ? `${parent}\\` : parent)
    }
  }

  const handleRefresh = () => {
    if (currentPath) {
      setIsLoading(true)
      if ((window as any).electronAPI) {
        ;(window as any).electronAPI.listDirectory(currentPath).then((dirItems: FileItemInfo[]) => {
          setItems(dirItems || [])
          setIsLoading(false)
        })
      }
    }
  }

  const handleAddAllMedia = () => {
    const mediaOnly = filteredItems.filter((i) => !i.isDirectory)
    if (mediaOnly.length > 0) {
      onAddFiles(mediaOnly)
    }
  }

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  const mediaFiles = filteredItems.filter((item) => !item.isDirectory)
  const folders = filteredItems.filter((item) => item.isDirectory)

  const getLocationName = (loc: SystemLocation) => {
    switch (loc.icon) {
      case 'downloads':
        return t('explorer.downloads')
      case 'desktop':
        return t('explorer.desktop')
      case 'pictures':
        return t('explorer.pictures')
      case 'videos':
        return t('explorer.videos')
      case 'documents':
        return t('explorer.documents')
      default:
        return t('explorer.localDisk')
    }
  }

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
    <div className="bg-surface border border-border rounded-2xl flex flex-col overflow-hidden shadow-sm transition-colors sticky top-20">
      <div className="p-3.5 px-4 border-b border-border flex flex-col gap-2.5 bg-surface/90">
        <div className="flex items-center gap-2">
          <OpenFolderSvg className="h-4 w-4" />
          <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            {t('explorer.title')}
          </h3>
        </div>

        <button
          onClick={handleAddAllMedia}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-sm"
          title={t('explorer.scanFolder')}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>+ {t('explorer.scanFolder')}</span>
        </button>
      </div>

      <div className="p-3 border-b border-border bg-background/50">
        <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider block mb-1.5 px-0.5">
          {t('explorer.shortcuts')}
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
                <span className="truncate">{getLocationName(loc)}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-2.5 border-b border-border bg-surface flex items-center gap-1.5">
        <button
          disabled={history.length === 0}
          onClick={handleGoBack}
          className="p-1.5 rounded-lg border border-border bg-background hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none transition-all text-gray-600 dark:text-gray-300 shrink-0"
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
            placeholder={t('explorer.searching')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-emerald-500 shadow-inner"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 min-h-[380px] max-h-[calc(100vh-320px)]">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-gray-500">
            {t('common.loading')}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500">
            {t('explorer.emptyDir')}
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
                  className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shrink-0 shadow-sm flex items-center justify-center"
                  title={t('explorer.addSelected')}
                >
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
