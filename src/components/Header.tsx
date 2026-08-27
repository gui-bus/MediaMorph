import React from 'react'
import {
  History,
  Bookmark,
} from 'lucide-react'
import { MediaTab, ThemeMode } from '../types'
import { Logo } from './Logo'
import { ImageSvg, VideoCameraSvg, AudioFileSvg, FileDocSvg } from './CustomIcons'

interface HeaderProps {
  activeTab: MediaTab
  onTabChange: (tab: MediaTab) => void
  totalCount: number
  historyCount: number
  onOpenHistory: () => void
  onOpenPresets: () => void
  theme: ThemeMode
  onToggleTheme: () => void
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  totalCount,
  historyCount,
  onOpenHistory,
  onOpenPresets,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark'

  const getTabClass = (tab: MediaTab) => {
    const isActive = activeTab === tab
    return `flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
      isActive
        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/25 font-semibold'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-surface'
    }`
  }

  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-3 bg-surface/90 backdrop-blur-xl border-b border-border sticky top-0 z-30 transition-colors shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <Logo className="h-7 w-auto" isDark={isDark} />
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            v1.2
          </span>
        </div>
      </div>

      <div className="flex items-center p-1 bg-background/90 rounded-xl border border-border overflow-x-auto max-w-full transition-colors shadow-inner">
        <button
          onClick={() => onTabChange('images')}
          className={getTabClass('images')}
        >
          <ImageSvg className="h-4 w-4" />
          <span>Imagens</span>
        </button>

        <button
          onClick={() => onTabChange('videos')}
          className={getTabClass('videos')}
        >
          <VideoCameraSvg className="h-4 w-4" />
          <span>Vídeos</span>
        </button>

        <button
          onClick={() => onTabChange('audio')}
          className={getTabClass('audio')}
        >
          <AudioFileSvg className="h-4 w-4" />
          <span>Áudios</span>
        </button>

        <button
          onClick={() => onTabChange('pdf')}
          className={getTabClass('pdf')}
        >
          <FileDocSvg className="h-4 w-4" />
          <span>PDFs</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenPresets}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500 text-xs font-medium transition-all shadow-sm"
          title="Salvar e carregar predefinições personalizadas"
        >
          <Bookmark className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
          <span className="hidden sm:inline">Presets</span>
        </button>

        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500 text-xs font-medium transition-all shadow-sm relative"
          title="Abrir histórico de conversões"
        >
          <History className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
          <span className="hidden sm:inline">Histórico</span>
          {historyCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
              {historyCount}
            </span>
          )}
        </button>

        <button
          onClick={onToggleTheme}
          className="px-3 py-1.5 rounded-xl bg-surface border border-border text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500 text-xs font-medium transition-all shadow-sm"
          title="Alternar tema claro/escuro"
        >
          {isDark ? 'Tema Claro' : 'Tema Escuro'}
        </button>
      </div>
    </header>
  )
}
