import React, { useState, useEffect } from 'react'
import { X, Bookmark, Plus, Trash2, Check } from 'lucide-react'
import { UserPreset, MediaTab } from '../types'
import { useLanguage } from '../i18n/LanguageContext'

interface PresetsModalProps {
  isOpen: boolean
  onClose: () => void
  activeTab: MediaTab
  currentSettings: any
  onApplyPreset: (settings: any) => void
}

const STORAGE_KEY = 'mediamorph_user_presets_v1'

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  currentSettings,
  onApplyPreset,
}) => {
  const { t } = useLanguage()
  const [presets, setPresets] = useState<UserPreset[]>([])
  const [newPresetName, setNewPresetName] = useState('')
  const [appliedId, setAppliedId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setPresets(JSON.parse(saved))
      }
    } catch {}
  }, [isOpen])

  if (!isOpen) return null

  const handleSaveCurrent = () => {
    if (!newPresetName.trim()) return
    const newPreset: UserPreset = {
      id: `preset_${Date.now()}`,
      name: newPresetName.trim(),
      category: activeTab,
      createdAt: Date.now(),
      settings: currentSettings,
    }
    const updated = [newPreset, ...presets]
    setPresets(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setNewPresetName('')
  }

  const handleDelete = (id: string) => {
    const updated = presets.filter((p) => p.id !== id)
    setPresets(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const handleApply = (preset: UserPreset) => {
    onApplyPreset(preset.settings)
    setAppliedId(preset.id)
    setTimeout(() => setAppliedId(null), 1500)
  }

  const categoryPresets = presets.filter((p) => p.category === activeTab)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
              <Bookmark className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {t('presetsModal.title')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {t(`header.${activeTab}`)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-surface-hover transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="p-4 rounded-xl bg-background/80 border border-border space-y-3">
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 block">
              {t('presetsModal.saveCurrentTitle')}
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('presetsModal.namePlaceholder')}
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveCurrent()}
                className="flex-1 bg-surface border border-border rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleSaveCurrent}
                disabled={!newPresetName.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold transition-all shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>{t('presetsModal.saveBtn')}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block px-1">
              {t('presetsModal.savedListTitle')} ({categoryPresets.length})
            </span>

            {categoryPresets.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-background/40 border border-dashed border-border text-xs text-gray-500">
                {t('presetsModal.emptyList')}
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {categoryPresets.map((preset) => {
                  const isApplied = appliedId === preset.id
                  return (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-background/80 border border-border hover:border-gray-400 dark:hover:border-gray-500 transition-all group"
                    >
                      <div className="min-w-0 flex-1 mr-3">
                        <span className="text-xs font-semibold text-gray-900 dark:text-white block truncate">
                          {preset.name}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {new Date(preset.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleApply(preset)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            isApplied
                              ? 'bg-emerald-500 text-white'
                              : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white'
                          }`}
                        >
                          {isApplied ? <Check className="h-3.5 w-3.5" /> : null}
                          <span>{isApplied ? t('presetsModal.appliedBtn') : t('presetsModal.loadBtn')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(preset.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title={t('common.delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
