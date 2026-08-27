import React from 'react'
import { PdfGlobalSettings, PdfExtractFormat, PdfMode } from '../types'
import { Sliders, FileText, FileStack, Image as ImageIcon, Combine, Scissors } from 'lucide-react'
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

  const extractFormatOptions: SelectOption[] = [
    {
      value: 'png',
      label: 'PNG (.png)',
      desc: 'Sem perdas, máxima nitidez para textos, vetores e diagramas',
      badge: 'Lossless',
    },
    {
      value: 'webp',
      label: 'WebP (.webp)',
      desc: 'Formato moderno do Google, até 40% menor com excelente qualidade',
      badge: 'Recomendado',
    },
    {
      value: 'jpeg',
      label: 'JPEG / JPG (.jpg)',
      desc: 'Padrão universal compatível com todos os dispositivos e sistemas',
      badge: 'Universal',
    },
    {
      value: 'avif',
      label: 'AVIF (.avif)',
      desc: 'Taxa extrema de compressão de última geração',
      badge: 'Next-Gen',
    },
    {
      value: 'tiff',
      label: 'TIFF (.tiff)',
      desc: 'Formato não-comprimido ideal para arquivamento e impressão',
      badge: 'Raw/Print',
    },
  ]

  const extractScaleOptions: SelectOption[] = [
    {
      value: '1',
      label: '1.0x (Padrão ~150 DPI)',
      desc: 'Renderização rápida e tamanho de arquivo reduzido',
    },
    {
      value: '2',
      label: '2.0x (Alta Definição ~300 DPI)',
      desc: 'Texto ultra nítido ideal para leitura, OCR e impressão',
      badge: 'Recomendado',
    },
    {
      value: '3',
      label: '3.0x (Ultra Definição ~450 DPI)',
      desc: 'Máxima resolução para documentos com gráficos e tabelas detalhadas',
    },
  ]

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-5 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
            Operações com Documentos PDF
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-background p-1 rounded-xl border border-border">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange({ ...settings, mode: 'images_to_pdf' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              settings.mode === 'images_to_pdf'
                ? 'bg-emerald-500 text-white shadow-sm font-semibold'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-surface'
            }`}
          >
            <FileStack className="h-3.5 w-3.5" />
            Imagens ➔ PDF Único
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange({ ...settings, mode: 'pdf_to_images' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              settings.mode === 'pdf_to_images'
                ? 'bg-emerald-500 text-white shadow-sm font-semibold'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-surface'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            PDF ➔ Extrair Imagens
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange({ ...settings, mode: 'merge_split_pdf' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              settings.mode === 'merge_split_pdf'
                ? 'bg-emerald-500 text-white shadow-sm font-semibold'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-surface'
            }`}
          >
            <Combine className="h-3.5 w-3.5" />
            Mesclar / Dividir PDFs
          </button>
        </div>
      </div>

      {settings.mode === 'images_to_pdf' && (
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
      )}

      {settings.mode === 'pdf_to_images' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="space-y-2">
            <SearchableSelect
              label="Formato das Imagens Extraídas"
              options={extractFormatOptions}
              value={settings.extractFormat}
              onChange={(val) => onChange({ ...settings, extractFormat: val as PdfExtractFormat })}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <SearchableSelect
              label="Resolução / Nitidez (DPI)"
              options={extractScaleOptions}
              value={String(settings.extractScale || 2)}
              onChange={(val) => onChange({ ...settings, extractScale: Number(val) })}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Qualidade de Compressão ({settings.extractQuality || 85}%)
              </label>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                {settings.extractQuality || 85}/100
              </span>
            </div>

            <input
              type="range"
              min="20"
              max="100"
              step="1"
              disabled={disabled}
              value={settings.extractQuality || 85}
              onChange={(e) => onChange({ ...settings, extractQuality: Number(e.target.value) })}
              className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-40"
            />

            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Cada página do PDF será exportada individualmente como uma imagem{' '}
              <strong className="text-emerald-500 dark:text-emerald-400 font-mono uppercase">
                .{settings.extractFormat}
              </strong>
            </p>
          </div>
        </div>
      )}

      {settings.mode === 'merge_split_pdf' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-4 rounded-xl bg-background/80 border border-border/80 space-y-3">
            <div className="flex items-center gap-2">
              <Combine className="h-4 w-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Mesclar PDFs em Lote
              </h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Adicione 2 ou mais arquivos PDF na fila para unificá-los em um único documento contínuo na ordem da lista.
            </p>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                Nome do PDF Mesclado (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: pdf_unificado.pdf"
                disabled={disabled}
                value={settings.customPdfName || ''}
                onChange={(e) => onChange({ ...settings, customPdfName: e.target.value })}
                className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-background/80 border border-border/80 space-y-3">
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Dividir / Extrair Intervalo de Páginas
              </h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Especifique quais páginas deseja extrair do PDF (deixe em branco se desejar mesclar múltiplos arquivos).
            </p>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                Intervalo de Páginas (Ex: 1-5, 8, 11-14)
              </label>
              <input
                type="text"
                placeholder="Ex: 1-3, 5, 8-10"
                disabled={disabled}
                value={settings.splitRange || ''}
                onChange={(e) => onChange({ ...settings, splitRange: e.target.value })}
                className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
