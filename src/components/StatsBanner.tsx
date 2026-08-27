import React from 'react'
import { LifetimeStats } from '../types'
import { formatBytes } from '../lib/utils'
import { Award, HardDrive } from 'lucide-react'

interface StatsBannerProps {
  stats: LifetimeStats
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ stats }) => {
  if (stats.totalFiles === 0 && stats.totalBytesSaved === 0) {
    return null
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-3.5 px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm transition-colors">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <Award className="h-4 w-4" />
        </div>
        <div>
          <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            Economia Total Acumulada
          </span>
          <p className="text-gray-600 dark:text-gray-400 text-[11px]">
            Você já processou <strong className="text-gray-800 dark:text-gray-200">{stats.totalFiles} arquivos</strong> com o MediaMorph.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border border-border">
          <HardDrive className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-gray-600 dark:text-gray-400 text-[11px]">Espaço economizado:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
            {formatBytes(stats.totalBytesSaved)}
          </span>
        </div>
      </div>
    </div>
  )
}
