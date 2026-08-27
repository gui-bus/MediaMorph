import React from 'react'
import { PdfGlobalSettings } from '../types'
import { Sliders, FileText } from 'lucide-react'
import { SearchableSelect, SelectOption } from './SearchableSelect'

interface PdfSettingsProps {
  settings: PdfGlobalSettings
  onChange: (settings: PdfGlobalSettings) => void
  disabled?: boolean
}

export const PdfSettings: React.FC<PdfSettingsProps> = ({ settings, onChange, disabled }) => {
  const pageSizeOptions: SelectOption[] = [
    {
      value: 'fit_image',
      label: 'Ajustar ao Tamanho da Imagem',
      desc: 'Preserva a resolução exata e proporção original da foto',
      badge: 'Pixel Perfect',
    },
    {
      value: 'a4',
      label: 'Formato A4 Padrão (Documento)',
      desc: 'Organiza as imagens centralizadas com margens em páginas A4',
      badge: 'A4 Oficial',
    },
  ]

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-5 transition-colors">
      <div className="flex items-center gap-2">
        <Sliders className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
          Configurações de Compilação em PDF
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        <div className="space-y-2">
          <SearchableSelect
            label="Layout / Tamanho da Página"
            options={pageSizeOptions}
            value={settings.pageSize}
            onChange={(val) => onChange({ ...settings, pageSize: val as 'fit_image' | 'a4' })}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Qualidade das Imagens no PDF ({settings.quality}%)
            </label>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
              {settings.quality}/100
            </span>
          </div>

          <input
            type="range"
            min="20"
            max="100"
            step="1"
            disabled={disabled}
            value={settings.quality}
            onChange={(e) => onChange({ ...settings, quality: Number(e.target.value) })}
            className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-40"
          />

          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {settings.quality >= 85
              ? 'Alta definição (Ideal para impressão e leitura nítida)'
              : 'Otimizado para envio por email e WhatsApp'}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
            Nome do Arquivo PDF (Opcional)
          </label>
          <input
            type="text"
            placeholder="Ex: documento_final.pdf"
            disabled={disabled}
            value={settings.customPdfName || ''}
            onChange={(e) => onChange({ ...settings, customPdfName: e.target.value })}
            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  )
}
