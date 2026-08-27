import React, { useState, useEffect } from 'react'
import { X, Bookmark, Plus, Trash2, Check, Sparkles } from 'lucide-react'
import { UserPreset, MediaTab } from '../types'

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
    setTimeout(() => {
      onClose()
    }, 400)
  }

  const tabPresets = presets.filter((p) => p.category === activeTab)

  const getCategoryLabel = (tab: MediaTab) => {
    switch (tab) {
      case 'images': return 'Imagens'
      case 'videos': return 'Vídeos'
      case 'audio': return 'Áudios'
      case 'pdf': return 'PDFs'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-white">
              Predefinições ({getCategoryLabel(activeTab)})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-background transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-2 bg-background/60 p-3 rounded-xl border border-border">
            <label className="text-xs font-semibold text-gray-300 block">
              Salvar Configurações Atuais como Predefinição
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ex: Minhas Fotos Ecommerce 800x800"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="flex-1 bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleSaveCurrent}
                disabled={!newPresetName.trim()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 disabled:opacity-40 transition-all shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Salvar
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Suas Predefinições Salvas ({tabPresets.length})
            </span>

            {tabPresets.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500 border border-dashed border-border rounded-xl">
                Nenhum preset salvo para {getCategoryLabel(activeTab)}. Configure acima e salve com 1 clique!
              </div>
            ) : (
              <div className="space-y-2">
                {tabPresets.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-background border border-border hover:border-emerald-500/50 transition-all group"
                  >
                    <div className="min-w-0 flex-1 mr-3">
                      <span className="text-xs font-bold text-white block truncate">{p.name}</span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(p.createdAt).toLocaleDateString()} • {p.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleApply(p)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          appliedId === p.id
                            ? 'bg-emerald-500 text-black'
                            : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black'
                        }`}
                      >
                        {appliedId === p.id ? <Check className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                        {appliedId === p.id ? 'Aplicado!' : 'Carregar'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-surface transition-colors"
                        title="Excluir Preset"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
