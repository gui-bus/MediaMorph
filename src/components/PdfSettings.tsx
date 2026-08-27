import React from 'react'
import { PdfGlobalSettings, PdfExtractFormat, PdfMode } from '../types'
import { Sliders, FileStack, Image as ImageIcon, Combine, Minimize2 } from 'lucide-react'
import { SearchableSelect, SelectOption } from './SearchableSelect'
import { useLanguage } from '../i18n/LanguageContext'

interface PdfSettingsProps {
  settings: PdfGlobalSettings
  onChange: (settings: PdfGlobalSettings) => void
  disabled?: boolean
}

export const PdfSettings: React.FC<PdfSettingsProps> = ({ settings, onChange, disabled }) => {
  const { t } = useLanguage()

  const pageSizeOptions: SelectOption[] = [
    {
      value: 'fit_image',
      label: 'Fit Image Dimensions (Pixel-Perfect)',
      desc: 'Preserves exact photo resolution and aspect ratio',
      badge: 'Pixel Perfect',
    },
    {
      value: 'a4',
      label: 'Standard A4 Document (Margins)',
      desc: 'Centers images inside standard A4 portrait pages',
      badge: 'A4',
    },
  ]

  const extractFormatOptions: SelectOption[] = [
    {
      value: 'webp',
      label: 'WebP (.webp)',
      desc: 'Modern lightweight format (up to 40% smaller)',
      badge: t('common.recommended'),
    },
    {
      value: 'png',
      label: 'PNG (.png)',
      desc: 'Lossless sharp text and vectors',
      badge: 'Lossless',
    },
    {
      value: 'jpeg',
      label: 'JPEG / JPG (.jpg)',
      desc: 'Universal compatibility across all devices',
      badge: t('common.universal'),
    },
    {
      value: 'avif',
      label: 'AVIF (.avif)',
      desc: 'Next-gen extreme compression',
      badge: 'Next-Gen',
    },
    {
      value: 'tiff',
      label: 'TIFF (.tiff)',
      desc: 'Uncompressed raw format for print',
      badge: 'Print',
    },
  ]

  const extractScaleOptions: SelectOption[] = [
    {
      value: '1',
      label: '1.0x (~150 DPI)',
      desc: 'Fast rendering and compact size',
    },
    {
      value: '2',
      label: '2.0x (~300 DPI - High Definition)',
      desc: 'Ultra sharp text for OCR & reading',
      badge: t('common.recommended'),
    },
    {
      value: '3',
      label: '3.0x (~450 DPI - Ultra Definition)',
      desc: 'Maximum sharpness for complex charts',
    },
  ]

  const compressPresetOptions: SelectOption[] = [
    {
      value: '65',
      label: t('pdfSettings.compressPresets.balanced'),
      desc: t('pdfSettings.compressPresets.balancedDesc'),
      badge: t('common.recommended'),
    },
    {
      value: '75',
      label: t('pdfSettings.compressPresets.high'),
      desc: t('pdfSettings.compressPresets.highDesc'),
      badge: 'High Quality',
    },
    {
      value: '45',
      label: t('pdfSettings.compressPresets.extreme'),
      desc: t('pdfSettings.compressPresets.extremeDesc'),
      badge: 'Super Light',
    },
    {
      value: 'custom',
      label: t('pdfSettings.compressPresets.custom'),
      desc: t('pdfSettings.compressPresets.customDesc'),
    },
  ]

  const currentCompressPreset =
    settings.compressQuality === 65
      ? '65'
      : settings.compressQuality === 75
      ? '75'
      : settings.compressQuality === 45
      ? '45'
      : 'custom'

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-5 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
            {t('pdfSettings.title')}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-background/90 rounded-xl border border-border">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange({ ...settings, mode: 'compress_pdf' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              settings.mode === 'compress_pdf'
                ? 'bg-emerald-500 text-white shadow-sm font-semibold'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-surface'
            }`}
          >
            <Minimize2 className="h-3.5 w-3.5" />
            {t('pdfSettings.compressTab')}
          </button>

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
            {t('pdfSettings.imgToPdfTab')}
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
            {t('pdfSettings.pdfToImgTab')}
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
            {t('pdfSettings.mergeSplitTab')}
          </button>
        </div>
      </div>

      {settings.mode === 'compress_pdf' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="space-y-2">
            <SearchableSelect
              label={t('pdfSettings.compressPresetLabel')}
              options={compressPresetOptions}
              value={currentCompressPreset}
              onChange={(val) => {
                if (val !== 'custom') {
                  onChange({ ...settings, compressQuality: Number(val) })
                }
              }}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {t('pdfSettings.compressLevelLabel')} ({settings.compressQuality || 65}%)
              </label>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                {settings.compressQuality || 65}/100
              </span>
            </div>

            <input
              type="range"
              min="15"
              max="95"
              step="5"
              disabled={disabled}
              value={settings.compressQuality || 65}
              onChange={(e) => onChange({ ...settings, compressQuality: Number(e.target.value) })}
              className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-40"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {t('pdfSettings.customPdfName')}
            </label>
            <input
              type="text"
              placeholder="Ex: documento_comprimido.pdf"
              value={settings.customPdfName || ''}
              disabled={disabled}
              onChange={(e) => onChange({ ...settings, customPdfName: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>
        </div>
      )}

      {settings.mode === 'images_to_pdf' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="space-y-2">
            <SearchableSelect
              label={t('pdfSettings.pageSizeLabel')}
              options={pageSizeOptions}
              value={settings.pageSize}
              onChange={(val) => onChange({ ...settings, pageSize: val as any })}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {t('pdfSettings.imgQualityLabel')} ({settings.quality}%)
              </label>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                {settings.quality}/100
              </span>
            </div>

            <input
              type="range"
              min="20"
              max="100"
              step="5"
              disabled={disabled}
              value={settings.quality}
              onChange={(e) => onChange({ ...settings, quality: Number(e.target.value) })}
              className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-40"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {t('pdfSettings.customPdfName')}
            </label>
            <input
              type="text"
              placeholder="Ex: documento_final.pdf"
              value={settings.customPdfName || ''}
              disabled={disabled}
              onChange={(e) => onChange({ ...settings, customPdfName: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>
        </div>
      )}

      {settings.mode === 'pdf_to_images' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="space-y-2">
            <SearchableSelect
              label={t('pdfSettings.extractFormatLabel')}
              options={extractFormatOptions}
              value={settings.extractFormat || 'png'}
              onChange={(val) => onChange({ ...settings, extractFormat: val as PdfExtractFormat })}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <SearchableSelect
              label={t('pdfSettings.extractDpiLabel')}
              options={extractScaleOptions}
              value={String(settings.extractScale || 2)}
              onChange={(val) => onChange({ ...settings, extractScale: Number(val) as any })}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {t('imageSettings.qualityLabel')} ({settings.extractQuality || 85}%)
              </label>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                {settings.extractQuality || 85}/100
              </span>
            </div>

            <input
              type="range"
              min="20"
              max="100"
              step="5"
              disabled={disabled || settings.extractFormat === 'png' || settings.extractFormat === 'tiff'}
              value={settings.extractQuality || 85}
              onChange={(e) => onChange({ ...settings, extractQuality: Number(e.target.value) })}
              className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-40"
            />
          </div>
        </div>
      )}

      {settings.mode === 'merge_split_pdf' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 rounded-xl bg-background/80 border border-border space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                <Combine className="h-4 w-4" />
                <span>{t('pdfSettings.mergeTitle')}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {t('pdfSettings.mergeDesc')}
              </p>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                  {t('pdfSettings.mergeNameLabel')}
                </label>
                <input
                  type="text"
                  placeholder="documento_unificado.pdf"
                  value={settings.customPdfName || ''}
                  onChange={(e) => onChange({ ...settings, customPdfName: e.target.value })}
                  className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-background/80 border border-border space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                <Combine className="h-4 w-4" />
                <span>{t('pdfSettings.splitTitle')}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {t('pdfSettings.splitDesc')}
              </p>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                  {t('pdfSettings.splitRangeLabel')}
                </label>
                <input
                  type="text"
                  placeholder="Ex: 1-3, 5, 7-10"
                  value={settings.splitRange || ''}
                  onChange={(e) => onChange({ ...settings, splitRange: e.target.value })}
                  className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
