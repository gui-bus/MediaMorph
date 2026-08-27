import React, { useState } from 'react'
import { ImageGlobalSettings, ImageFormat, WatermarkPosition } from '../types'
import { Shield, Stamp, RotateCw, FlipHorizontal, FlipVertical, Sliders, ChevronDown, ChevronUp } from 'lucide-react'
import { SearchableSelect, SelectOption } from './SearchableSelect'
import { ImageSvg } from './CustomIcons'
import { useLanguage } from '../i18n/LanguageContext'

interface ImageSettingsProps {
  settings: ImageGlobalSettings
  onChange: (settings: ImageGlobalSettings) => void
  disabled?: boolean
}

export const ImageSettings: React.FC<ImageSettingsProps> = ({ settings, onChange, disabled }) => {
  const [showWatermark, setShowWatermark] = useState(false)
  const [showAdjustments, setShowAdjustments] = useState(false)
  const { t } = useLanguage()

  const formatOptions: SelectOption[] = [
    { value: 'original', label: t('imageSettings.formats.original'), desc: t('imageSettings.formats.originalDesc'), badge: 'TinyPNG' },
    { value: 'webp', label: t('imageSettings.formats.webp'), desc: t('imageSettings.formats.webpDesc'), badge: t('common.recommended') },
    { value: 'avif', label: t('imageSettings.formats.avif'), desc: t('imageSettings.formats.avifDesc'), badge: 'AVIF' },
    { value: 'ico', label: t('imageSettings.formats.ico'), desc: t('imageSettings.formats.icoDesc'), badge: '.ico' },
    { value: 'jpeg', label: t('imageSettings.formats.jpeg'), desc: t('imageSettings.formats.jpegDesc'), badge: t('common.universal') },
    { value: 'png', label: t('imageSettings.formats.png'), desc: t('imageSettings.formats.pngDesc'), badge: 'PNG' },
    { value: 'gif', label: t('imageSettings.formats.gif'), desc: t('imageSettings.formats.gifDesc'), badge: 'GIF' },
    { value: 'tiff', label: t('imageSettings.formats.tiff'), desc: t('imageSettings.formats.tiffDesc'), badge: 'TIFF' },
  ]

  const presetOptions: SelectOption[] = [
    { value: 'none', label: t('imageSettings.presets.original'), desc: t('imageSettings.presets.originalDesc') },
    { value: 'story', label: t('imageSettings.presets.story'), desc: t('imageSettings.presets.storyDesc'), badge: '1080x1920' },
    { value: 'feed', label: t('imageSettings.presets.feed'), desc: t('imageSettings.presets.feedDesc'), badge: '1080x1080' },
    { value: 'youtube', label: t('imageSettings.presets.youtube'), desc: t('imageSettings.presets.youtubeDesc'), badge: '1280x720' },
    { value: 'banner', label: t('imageSettings.presets.banner'), desc: t('imageSettings.presets.bannerDesc'), badge: '1500x500' },
    { value: 'favicon', label: t('imageSettings.presets.favicon'), desc: t('imageSettings.presets.faviconDesc'), badge: '32x32' },
  ]

  const watermarkPosOptions: SelectOption[] = [
    { value: 'center', label: t('imageSettings.posCenter') },
    { value: 'top-left', label: t('imageSettings.posTopLeft') },
    { value: 'top-right', label: t('imageSettings.posTopRight') },
    { value: 'bottom-left', label: t('imageSettings.posBottomLeft') },
    { value: 'bottom-right', label: t('imageSettings.posBottomRight') },
  ]

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

  const handleSelectWatermarkLogo = async () => {
    if ((window as any).electronAPI) {
      const files = await (window as any).electronAPI.selectFiles('images')
      if (files && files.length > 0) {
        onChange({
          ...settings,
          watermark: {
            ...settings.watermark,
            imagePath: files[0].path,
          },
        })
      }
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageSvg className="h-4 w-4" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
            {t('imageSettings.title')}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowWatermark(!showWatermark)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              settings.watermark?.enabled
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-background border-border text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Stamp className="h-3.5 w-3.5" />
            <span>{t('imageSettings.watermarkBtn')}</span>
            {showWatermark ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          <button
            type="button"
            onClick={() => setShowAdjustments(!showAdjustments)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              showAdjustments
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-background border-border text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>{t('imageSettings.filtersBtn')}</span>
            {showAdjustments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="space-y-2">
          <SearchableSelect
            label={t('imageSettings.formatLabel')}
            options={formatOptions}
            value={settings.format}
            onChange={(val) => onChange({ ...settings, format: val as ImageFormat })}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <SearchableSelect
            label={t('imageSettings.presetLabel')}
            options={presetOptions}
            value={currentPresetValue}
            onChange={handleSelectPreset}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {t('imageSettings.qualityLabel')} ({settings.lossless ? t('imageSettings.lossless') : `${settings.quality}%`})
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

          <div className="flex items-center justify-between gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.lossless}
                disabled={disabled || settings.format === 'ico'}
                onChange={(e) => onChange({ ...settings, lossless: e.target.checked })}
                className="rounded border-border bg-background text-emerald-500 focus:ring-0 h-3.5 w-3.5"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">{t('imageSettings.lossless')}</span>
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
                {t('imageSettings.stripExif')}
              </span>
            </label>
          </div>
        </div>
      </div>

      {showWatermark && (
        <div className="p-4 rounded-xl bg-background/80 border border-border/80 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stamp className="h-4 w-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                {t('imageSettings.watermarkTitle')}
              </h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.watermark?.enabled || false}
                disabled={disabled}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    watermark: {
                      ...settings.watermark,
                      enabled: e.target.checked,
                    },
                  })
                }
                className="rounded border-border bg-background text-emerald-500 focus:ring-0 h-4 w-4"
              />
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{t('imageSettings.enableWatermark')}</span>
            </label>
          </div>

          {settings.watermark?.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-border/50">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{t('imageSettings.watermarkTitle')}</label>
                <div className="flex rounded-lg bg-surface border border-border p-0.5">
                  <button
                    type="button"
                    onClick={() => onChange({ ...settings, watermark: { ...settings.watermark, type: 'text' } })}
                    className={`flex-1 py-1 text-xs rounded-md font-medium transition-all ${
                      settings.watermark.type === 'text' ? 'bg-emerald-500 text-black shadow-sm font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {t('imageSettings.typeText')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ ...settings, watermark: { ...settings.watermark, type: 'image' } })}
                    className={`flex-1 py-1 text-xs rounded-md font-medium transition-all ${
                      settings.watermark.type === 'image' ? 'bg-emerald-500 text-black shadow-sm font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {t('imageSettings.typeLogo')}
                  </button>
                </div>
              </div>

              {settings.watermark.type === 'text' ? (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{t('imageSettings.watermarkText')}</label>
                  <input
                    type="text"
                    placeholder="© MediaMorph"
                    value={settings.watermark.text || ''}
                    onChange={(e) => onChange({ ...settings, watermark: { ...settings.watermark, text: e.target.value } })}
                    className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{t('imageSettings.typeLogo')}</label>
                  <button
                    type="button"
                    onClick={handleSelectWatermarkLogo}
                    className="w-full bg-surface border border-border hover:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-gray-300 truncate text-left"
                    title={settings.watermark.imagePath || t('imageSettings.chooseLogo')}
                  >
                    {settings.watermark.imagePath ? settings.watermark.imagePath.split('\\').pop() : t('imageSettings.chooseLogo')}
                  </button>
                </div>
              )}

              <div className="space-y-1.5">
                <SearchableSelect
                  label={t('imageSettings.position')}
                  options={watermarkPosOptions}
                  value={settings.watermark.position || 'center'}
                  onChange={(val) => onChange({ ...settings, watermark: { ...settings.watermark, position: val as WatermarkPosition } })}
                  disabled={disabled}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{t('imageSettings.opacity')}</label>
                  <span className="text-[10px] text-emerald-400 font-mono">{settings.watermark.opacity || 50}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={settings.watermark.opacity || 50}
                  onChange={(e) => onChange({ ...settings, watermark: { ...settings.watermark, opacity: Number(e.target.value) } })}
                  className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {showAdjustments && (
        <div className="p-4 rounded-xl bg-background/80 border border-border/80 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              {t('imageSettings.filtersTitle')}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{t('imageSettings.brightness')}</label>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {settings.adjustments?.brightness ? `${settings.adjustments.brightness > 0 ? '+' : ''}${settings.adjustments.brightness}%` : '0%'}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="5"
                value={settings.adjustments?.brightness || 0}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    adjustments: { ...settings.adjustments, brightness: Number(e.target.value) },
                  })
                }
                className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{t('imageSettings.contrast')}</label>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {settings.adjustments?.contrast ? `${settings.adjustments.contrast > 0 ? '+' : ''}${settings.adjustments.contrast}%` : '0%'}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="5"
                value={settings.adjustments?.contrast || 0}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    adjustments: { ...settings.adjustments, contrast: Number(e.target.value) },
                  })
                }
                className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{t('imageSettings.saturation')}</label>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {settings.adjustments?.saturation ? `${settings.adjustments.saturation > 0 ? '+' : ''}${settings.adjustments.saturation}%` : '0%'}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="5"
                value={settings.adjustments?.saturation || 0}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    adjustments: { ...settings.adjustments, saturation: Number(e.target.value) },
                  })
                }
                className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{t('imageSettings.rotationMirror')}</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const nextRot = ((settings.adjustments?.rotate || 0) + 90) % 360 as 0 | 90 | 180 | 270
                    onChange({ ...settings, adjustments: { ...settings.adjustments, rotate: nextRot } })
                  }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${
                    settings.adjustments?.rotate ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-surface border-border text-gray-400'
                  }`}
                  title={t('imageSettings.rotateTitle')}
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>{settings.adjustments?.rotate || 0}°</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...settings,
                      adjustments: { ...settings.adjustments, flipHorizontal: !settings.adjustments?.flipHorizontal },
                    })
                  }
                  className={`p-1 rounded-md text-xs border ${
                    settings.adjustments?.flipHorizontal ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-surface border-border text-gray-400'
                  }`}
                  title={t('imageSettings.flipH')}
                >
                  <FlipHorizontal className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...settings,
                      adjustments: { ...settings.adjustments, flipVertical: !settings.adjustments?.flipVertical },
                    })
                  }
                  className={`p-1 rounded-md text-xs border ${
                    settings.adjustments?.flipVertical ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-surface border-border text-gray-400'
                  }`}
                  title={t('imageSettings.flipV')}
                >
                  <FlipVertical className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
