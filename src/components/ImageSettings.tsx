import React from 'react'
import { ImageGlobalSettings, ImageFormat } from '../types'
import { Sliders, Shield } from 'lucide-react'
import { SearchableSelect, SelectOption } from './SearchableSelect'

import { ImageSvg } from './CustomIcons'

interface ImageSettingsProps {
  settings: ImageGlobalSettings
  onChange: (settings: ImageGlobalSettings) => void
  disabled?: boolean
}

export const ImageSettings: React.FC<ImageSettingsProps> = ({ settings, onChange, disabled }) => {
  const formatOptions: SelectOption[] = [
    {
      value: 'webp',
      label: 'WebP',
      desc: 'Formato moderno, ultraleve e recomendado para web',
      badge: 'Recomendado',
    },
    {
      value: 'avif',
      label: 'AVIF',
      desc: 'Compressão extrema de nova geração (até 90% menor)',
      badge: 'Menor Tamanho',
    },
    {
      value: 'ico',
      label: 'ICO (Ícone Windows)',
      desc: 'Gera arquivos .ico para programas e atalhos do Windows',
      badge: 'Ícone .ico',
    },
    {
      value: 'jpeg',
      label: 'JPEG / JPG',
      desc: 'Compatibilidade universal com qualquer dispositivo',
      badge: 'Universal',
    },
    {
      value: 'png',
      label: 'PNG',
      desc: 'Preserva transparência e nitidez máxima de vetores',
      badge: 'Transparência',
    },
    {
      value: 'gif',
      label: 'GIF',
      desc: 'Imagens animadas para redes e chats',
      badge: 'Animado',
    },
    {
      value: 'tiff',
      label: 'TIFF',
      desc: 'Qualidade profissional para impressão gráfica',
      badge: 'Gráfico',
    },
  ]

  const presetOptions: SelectOption[] = [
    { value: 'none', label: 'Tamanho Original (100%)', desc: 'Mantém a resolução exata' },
    { value: 'story', label: 'Instagram Story / TikTok / Reels', desc: '1080 × 1920 px (Vertical 9:16)', badge: '1080x1920' },
    { value: 'feed', label: 'Post Feed Quadrado', desc: '1080 × 1080 px (Quadrado 1:1)', badge: '1080x1080' },
    { value: 'youtube', label: 'Thumbnail YouTube / Vídeo HD', desc: '1280 × 720 px (Widescreen 16:9)', badge: '1280x720' },
    { value: 'banner', label: 'Banner Twitter / X / Cabeçalho', desc: '1500 × 500 px (Banner 3:1)', badge: '1500x500' },
    { value: 'favicon', label: 'Favicon / Ícone de Site', desc: '32 × 32 px (Ícone compacto)', badge: '32x32' },
  ]

  const getQualityDescription = (q: number, lossless: boolean) => {
    if (lossless) return 'Lossless (100% fiel ao original, sem perda de pixel)'
    if (q >= 90) return 'Quase sem perdas (Arquivos moderados)'
    if (q >= 75) return 'Recomendado (Excelente equilíbrio entre peso e nitidez)'
    if (q >= 50) return 'Alta economia (Ideal para sites e mensagens)'
    return 'Compressão agressiva (Arquivos minúsculos)'
  }

  const handleSelectPreset = (val: string) => {
    switch (val) {
      case 'story':
        onChange({ ...settings, resizeMode: 'dimensions', maxWidth: 1080, maxHeight: 1920, presetName: 'Story' })
        break
      case 'feed':
        onChange({ ...settings, resizeMode: 'dimensions', maxWidth: 1080, maxHeight: 1080, presetName: 'Feed' })
        break
      case 'youtube':
        onChange({ ...settings, resizeMode: 'dimensions', maxWidth: 1280, maxHeight: 720, presetName: 'YouTube' })
        break
      case 'banner':
        onChange({ ...settings, resizeMode: 'dimensions', maxWidth: 1500, maxHeight: 500, presetName: 'Banner' })
        break
      case 'favicon':
        onChange({ ...settings, resizeMode: 'dimensions', maxWidth: 32, maxHeight: 32, presetName: 'Favicon' })
        break
      default:
        onChange({ ...settings, resizeMode: 'none', presetName: undefined })
        break
    }
  }

  const currentPresetValue =
    settings.resizeMode === 'dimensions'
      ? settings.maxWidth === 1080 && settings.maxHeight === 1920
        ? 'story'
        : settings.maxWidth === 1080 && settings.maxHeight === 1080
        ? 'feed'
        : settings.maxWidth === 1280 && settings.maxHeight === 720
        ? 'youtube'
        : settings.maxWidth === 1500 && settings.maxHeight === 500
        ? 'banner'
        : settings.maxWidth === 32 && settings.maxHeight === 32
        ? 'favicon'
        : 'none'
      : 'none'

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-5 transition-colors">
      <div className="flex items-center gap-2">
        <ImageSvg className="h-4 w-4" />
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
          Configurações de Imagem
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        <div className="space-y-2">
          <SearchableSelect
            label="Formato de Conversão"
            options={formatOptions}
            value={settings.format}
            onChange={(val) => onChange({ ...settings, format: val as ImageFormat })}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <SearchableSelect
            label="Dimensão / Preset de Redes Sociais"
            options={presetOptions}
            value={currentPresetValue}
            onChange={handleSelectPreset}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Qualidade ({settings.lossless ? 'Sem Perdas' : `${settings.quality}%`})
            </label>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
              {settings.lossless ? 'Lossless' : `${settings.quality}/100`}
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="100"
            step="1"
            disabled={disabled || settings.lossless || settings.format === 'ico'}
            value={settings.quality}
            onChange={(e) => onChange({ ...settings, quality: Number(e.target.value) })}
            className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-40"
          />

          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
            {settings.format === 'ico'
              ? 'Gera ícone Windows (.ico) com transparência e alta fidelidade'
              : getQualityDescription(settings.quality, settings.lossless)}
          </p>

          <div className="flex items-center justify-between gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.lossless}
                disabled={disabled || settings.format === 'ico'}
                onChange={(e) => onChange({ ...settings, lossless: e.target.checked })}
                className="rounded border-border bg-background text-emerald-500 focus:ring-0 h-3.5 w-3.5"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">Lossless</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.stripMetadata}
                disabled={disabled}
                onChange={(e) => onChange({ ...settings, stripMetadata: e.target.checked })}
                className="rounded border-border bg-background text-emerald-500 focus:ring-0 h-3.5 w-3.5"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Shield className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                Limpar EXIF
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
