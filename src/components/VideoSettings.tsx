import React, { useState } from 'react'
import { VideoGlobalSettings, VideoFormat, VideoPreset, VideoResolution, GpuAcceleration, VideoCrop, AudioExtractFormat } from '../types'
import { VolumeX, RotateCcw, Cpu, Gauge, Zap, Crop, ChevronDown, ChevronUp } from 'lucide-react'
import { SearchableSelect, SelectOption } from './SearchableSelect'
import { VideoCameraSvg, ScissorSvg } from './CustomIcons'
import { useLanguage } from '../i18n/LanguageContext'

interface VideoSettingsProps {
  settings: VideoGlobalSettings
  onChange: (settings: VideoGlobalSettings) => void
  onOpenTrimmer?: () => void
  disabled?: boolean
}

export const VideoSettings: React.FC<VideoSettingsProps> = ({
  settings,
  onChange,
  onOpenTrimmer,
  disabled,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { t } = useLanguage()

  const formatOptions: SelectOption[] = [
    { value: 'mp4', label: t('videoSettings.formats.mp4'), desc: t('videoSettings.formats.mp4Desc'), badge: t('common.universal') },
    { value: 'webm', label: t('videoSettings.formats.webm'), desc: t('videoSettings.formats.webmDesc'), badge: 'Web' },
    { value: 'mkv', label: t('videoSettings.formats.mkv'), desc: t('videoSettings.formats.mkvDesc'), badge: 'MKV' },
    { value: 'gif', label: t('videoSettings.formats.gif'), desc: t('videoSettings.formats.gifDesc'), badge: 'GIF' },
    { value: 'mp3', label: t('videoSettings.formats.mp3'), desc: t('videoSettings.formats.mp3Desc'), badge: 'Audio' },
  ]

  const presetOptions: SelectOption[] = [
    { value: 'balanced', label: t('videoSettings.presets.balanced'), desc: t('videoSettings.presets.balancedDesc'), badge: t('common.recommended') },
    { value: 'high_compression', label: t('videoSettings.presets.high_compression'), desc: t('videoSettings.presets.high_compressionDesc'), badge: 'Small' },
    { value: 'target_size_25', label: t('videoSettings.presets.target_25'), desc: t('videoSettings.presets.target_25Desc'), badge: '25 MB' },
    { value: 'target_size_16', label: t('videoSettings.presets.target_16'), desc: t('videoSettings.presets.target_16Desc'), badge: '16 MB' },
    { value: 'target_size_50', label: t('videoSettings.presets.target_50'), desc: t('videoSettings.presets.target_50Desc'), badge: '50 MB' },
    { value: 'target_size_8', label: t('videoSettings.presets.target_8'), desc: t('videoSettings.presets.target_8Desc'), badge: '8 MB' },
    { value: 'custom_crf', label: t('videoSettings.presets.custom_crf'), desc: t('videoSettings.presets.custom_crfDesc') },
  ]

  const resolutionOptions: SelectOption[] = [
    { value: 'original', label: 'Original', desc: '1:1' },
    { value: '1080p', label: '1080p (Full HD - 1920x1080)', desc: '1080p', badge: 'Full HD' },
    { value: '720p', label: '720p (HD - 1280x720)', desc: '720p', badge: 'HD' },
    { value: '480p', label: '480p (SD - 854x480)', desc: '480p', badge: 'SD' },
    { value: '360p', label: '360p (Ultra Leve / Compact)', desc: '360p', badge: '360p' },
  ]

  const gpuOptions: SelectOption[] = [
    { value: 'auto', label: 'Auto / CPU (libx264)', desc: 'Standard CPU', badge: 'CPU' },
    { value: 'nvenc', label: 'NVIDIA NVENC (GeForce)', desc: 'Nvidia RTX/GTX', badge: 'Nvidia' },
    { value: 'qsv', label: 'Intel QuickSync (iGPU)', desc: 'Intel Core', badge: 'Intel' },
    { value: 'amf', label: 'AMD AMF (Radeon)', desc: 'AMD Radeon', badge: 'AMD' },
  ]

  const fpsOptions: SelectOption[] = [
    { value: 'keep', label: t('common.keep') },
    { value: '60', label: '60 FPS', badge: '60 FPS' },
    { value: '30', label: '30 FPS', badge: '30 FPS' },
    { value: '24', label: '24 FPS', badge: '24 FPS' },
  ]

  const speedOptions: SelectOption[] = [
    { value: '1', label: '1.0x (Normal)' },
    { value: '0.5', label: '0.5x (Slow Motion)', badge: '0.5x' },
    { value: '1.5', label: '1.5x (Speed Up)', badge: '1.5x' },
    { value: '2', label: '2.0x (Fast / Timelapse)', badge: '2.0x' },
    { value: '4', label: '4.0x (Hyperlapse)', badge: '4.0x' },
  ]

  const cropOptions: SelectOption[] = [
    { value: 'keep', label: t('common.keep') },
    { value: '9:16', label: '9:16 Vertical (Stories / TikTok / Reels)', badge: '9:16' },
    { value: '1:1', label: '1:1 Square (Instagram Post)', badge: '1:1' },
    { value: '16:9', label: '16:9 Landscape (YouTube / PC)', badge: '16:9' },
    { value: '4:5', label: '4:5 Portrait (Feed)', badge: '4:5' },
  ]

  const audioExtractOptions: SelectOption[] = [
    { value: 'mp3', label: 'MP3 (MPEG Audio Layer 3)', badge: 'MP3' },
    { value: 'wav', label: 'WAV (Sem Perdas / Lossless)', badge: 'WAV' },
    { value: 'flac', label: 'FLAC (Lossless Compacto)', badge: 'FLAC' },
    { value: 'aac', label: 'AAC (Alta Qualidade Apple/Web)', badge: 'AAC' },
    { value: 'ogg', label: 'OGG (Vorbis)', badge: 'OGG' },
  ]

  const currentPresetValue =
    settings.preset === 'target_size'
      ? `target_size_${settings.targetSizeMB || 25}`
      : settings.preset

  const handlePresetChange = (val: string) => {
    if (val.startsWith('target_size_')) {
      const size = Number(val.replace('target_size_', ''))
      onChange({
        ...settings,
        preset: 'target_size',
        targetSizeMB: size,
      })
    } else {
      onChange({
        ...settings,
        preset: val as VideoPreset,
      })
    }
  }

  const hasTrim = !!(settings.trimStart || settings.trimEnd)

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-5 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <VideoCameraSvg className="h-4 w-4" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
            {t('videoSettings.title')}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
            showAdvanced
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-background border-border text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Zap className="h-3.5 w-3.5 text-emerald-500" />
          <span>{t('videoSettings.advancedBtn')}</span>
          {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="space-y-2">
          <SearchableSelect
            label={t('videoSettings.formatLabel')}
            options={formatOptions}
            value={settings.format}
            onChange={(val) => onChange({ ...settings, format: val as VideoFormat })}
            disabled={disabled}
          />
        </div>

        {settings.format === 'mp3' ? (
          <div className="space-y-2">
            <SearchableSelect
              label={t('videoSettings.audioExtractLabel')}
              options={audioExtractOptions}
              value={settings.audioExtractFormat || 'mp3'}
              onChange={(val) => onChange({ ...settings, audioExtractFormat: val as AudioExtractFormat })}
              disabled={disabled}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <SearchableSelect
              label={t('videoSettings.presetLabel')}
              options={presetOptions}
              value={currentPresetValue}
              onChange={handlePresetChange}
              disabled={disabled}
            />
          </div>
        )}

        <div className="space-y-2">
          <SearchableSelect
            label={t('videoSettings.resolutionLabel')}
            options={resolutionOptions}
            value={settings.resolution}
            onChange={(val) => onChange({ ...settings, resolution: val as VideoResolution })}
            disabled={disabled || settings.format === 'mp3'}
          />

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.muteAudio}
                disabled={disabled || settings.format === 'mp3'}
                onChange={(e) => onChange({ ...settings, muteAudio: e.target.checked })}
                className="rounded border-border bg-background text-emerald-500 focus:ring-0 h-3.5 w-3.5"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <VolumeX className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                {t('videoSettings.muteAudio')}
              </span>
            </label>
          </div>
        </div>
      </div>

      {showAdvanced && (
        <div className="p-4 rounded-xl bg-background/80 border border-border/80 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              {t('videoSettings.advancedTitle')}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <SearchableSelect
                label={t('videoSettings.gpuLabel')}
                options={gpuOptions}
                value={settings.gpu || 'auto'}
                onChange={(val) => onChange({ ...settings, gpu: val as GpuAcceleration })}
                disabled={disabled || settings.format === 'mp3'}
              />
            </div>

            <div className="space-y-1.5">
              <SearchableSelect
                label={t('videoSettings.fpsLabel')}
                options={fpsOptions}
                value={settings.fps ? String(settings.fps) : 'keep'}
                onChange={(val) => onChange({ ...settings, fps: val === 'keep' ? undefined : Number(val) })}
                disabled={disabled || settings.format === 'mp3'}
              />
            </div>

            <div className="space-y-1.5">
              <SearchableSelect
                label={t('videoSettings.speedLabel')}
                options={speedOptions}
                value={String(settings.speed || 1)}
                onChange={(val) => onChange({ ...settings, speed: Number(val) })}
                disabled={disabled}
              />
            </div>

            <div className="space-y-1.5">
              <SearchableSelect
                label={t('videoSettings.cropLabel')}
                options={cropOptions}
                value={settings.crop || 'keep'}
                onChange={(val) => onChange({ ...settings, crop: val as VideoCrop })}
                disabled={disabled || settings.format === 'mp3'}
              />
            </div>
          </div>
        </div>
      )}

      {onOpenTrimmer && (
        <div className="pt-2 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScissorSvg className="h-4 w-4" />
            <div>
              <span className="text-xs font-medium text-gray-900 dark:text-white block">
                {t('videoSettings.trimmerCardTitle')}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                {hasTrim
                  ? t('videoSettings.trimmerCardConfigured', { start: settings.trimStart || '00:00:00', end: settings.trimEnd || 'Fim' })
                  : t('videoSettings.trimmerCardHint')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasTrim && (
              <button
                type="button"
                onClick={() => onChange({ ...settings, trimStart: undefined, trimEnd: undefined })}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>{t('videoSettings.removeTrim')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenTrimmer}
              disabled={disabled}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background hover:bg-surface-hover border border-border text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white text-xs font-semibold transition-all shadow-sm"
            >
              <ScissorSvg className="h-3.5 w-3.5 text-emerald-500" />
              <span>{hasTrim ? t('videoSettings.editTrim') : t('videoSettings.openTrimmer')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
