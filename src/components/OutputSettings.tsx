import React from 'react'
import { OutputSettingsState, NamingPattern } from '../types'
import { DownloadSvg, OpenFolderSvg } from './CustomIcons'
import { FileSignature, Tags } from 'lucide-react'
import { SearchableSelect, SelectOption } from './SearchableSelect'

interface OutputSettingsProps {
  settings: OutputSettingsState
  onChange: (settings: OutputSettingsState) => void
  disabled?: boolean
}

export const OutputSettings: React.FC<OutputSettingsProps> = ({
  settings,
  onChange,
  disabled,
}) => {
  const namingOptions: SelectOption[] = [
    { value: 'original', label: 'Nome Original', desc: 'Ex: foto.webp' },
    { value: '{name}_optimized', label: '{name}_optimized', desc: 'Ex: foto_optimized.webp', badge: 'Recomendado' },
    { value: '{name}_{date}', label: '{name}_{data}', desc: 'Ex: foto_2026-08-27.webp' },
    { value: '{counter}_{name}', label: '{contador}_{name}', desc: 'Ex: 01_foto.webp, 02_foto.webp' },
    { value: 'custom', label: 'Padrão Personalizado...', desc: 'Use tags como {name}, {date}, {counter}' },
  ]

  const handleSelectCustomFolder = async () => {
    if (disabled) return
    if ((window as any).electronAPI) {
      const selected = await (window as any).electronAPI.selectFolder()
      if (selected) {
        onChange({
          ...settings,
          mode: 'custom_directory',
          customPath: selected,
        })
      }
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DownloadSvg className="h-4 w-4" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
            Destino & Nomenclatura dos Arquivos
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label
          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
            settings.mode === 'same_directory'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-gray-900 dark:text-white shadow-sm'
              : 'bg-background border-border text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <input
            type="radio"
            name="output_mode"
            disabled={disabled}
            checked={settings.mode === 'same_directory'}
            onChange={() => onChange({ ...settings, mode: 'same_directory' })}
            className="mt-0.5 text-emerald-500 focus:ring-0"
          />
          <div className="text-xs">
            <span className="font-semibold block mb-0.5">
              Pasta "optimized" no mesmo local
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              Salva automaticamente dentro da subpasta <code className="bg-surface px-1 py-0.5 rounded border border-border">optimized/</code>.
            </span>
          </div>
        </label>

        <label
          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
            settings.mode === 'custom_directory'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-gray-900 dark:text-white shadow-sm'
              : 'bg-background border-border text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <input
            type="radio"
            name="output_mode"
            disabled={disabled}
            checked={settings.mode === 'custom_directory'}
            onChange={() => onChange({ ...settings, mode: 'custom_directory' })}
            className="mt-0.5 text-emerald-500 focus:ring-0"
          />
          <div className="text-xs flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="font-semibold">Pasta Personalizada</span>
              {settings.mode === 'custom_directory' && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={handleSelectCustomFolder}
                  className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                >
                  <OpenFolderSvg className="h-3 w-3" />
                  <span>Alterar</span>
                </button>
              )}
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 block truncate" title={settings.customPath || 'Nenhuma pasta selecionada'}>
              {settings.customPath || 'Clique para escolher onde salvar todos os arquivos'}
            </span>
          </div>
        </label>
      </div>

      <div className="pt-2 border-t border-border/80 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div className="space-y-1">
          <SearchableSelect
            label="Padrão de Nome do Arquivo de Saída"
            options={namingOptions}
            value={settings.namingPattern || 'original'}
            onChange={(val) => onChange({ ...settings, namingPattern: val as NamingPattern })}
            disabled={disabled}
          />
        </div>

        {settings.namingPattern === 'custom' && (
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Tags className="h-3 w-3 text-emerald-500" />
              Template Personalizado ({'{name}'}, {'{date}'}, {'{counter}'})
            </label>
            <input
              type="text"
              placeholder="Ex: {date}_{name}_web"
              disabled={disabled}
              value={settings.customNamingPattern || ''}
              onChange={(e) => onChange({ ...settings, customNamingPattern: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}
      </div>
    </div>
  )
}
