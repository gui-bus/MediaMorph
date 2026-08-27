import React from 'react'
import { AudioGlobalSettings, AudioFormat, AudioBitrate } from '../types'
import { Sliders, Volume2 } from 'lucide-react'
import { SearchableSelect, SelectOption } from './SearchableSelect'

interface AudioSettingsProps {
  settings: AudioGlobalSettings
  onChange: (settings: AudioGlobalSettings) => void
  disabled?: boolean
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({ settings, onChange, disabled }) => {
  const formatOptions: SelectOption[] = [
    { value: 'mp3', label: 'MP3', desc: 'Compatibilidade universal em qualquer player', badge: 'Universal' },
    { value: 'aac', label: 'AAC / M4A', desc: 'Alta eficiência sonora da Apple / Web', badge: 'Alta Eficiência' },
    { value: 'flac', label: 'FLAC', desc: 'Áudio sem perdas (Lossless) de alta fidelidade', badge: 'Lossless' },
    { value: 'wav', label: 'WAV', desc: 'Áudio bruto sem compressão (PCM studio)', badge: 'Sem Compressão' },
    { value: 'ogg', label: 'OGG Vorbis', desc: 'Formato aberto de excelente definição', badge: 'Open Source' },
  ]

  const bitrateOptions: SelectOption[] = [
    { value: '320k', label: '320 kbps (Qualidade Máxima)', desc: 'Fidelidade cristalina para música', badge: 'Top Quality' },
    { value: '256k', label: '256 kbps (Alta Fidelidade)', desc: 'Excelente qualidade com peso equilibrado', badge: 'High' },
    { value: '192k', label: '192 kbps (Padrão Recomendado)', desc: 'O melhor equilíbrio entre peso e qualidade', badge: 'Recomendado' },
    { value: '128k', label: '128 kbps (Econômico / Voz)', desc: 'Ideal para podcasts, palestras e voz', badge: 'Econômico' },
  ]

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-5 transition-colors">
      <div className="flex items-center gap-2">
        <Sliders className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
          Configurações de Áudio
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        <div className="space-y-2">
          <SearchableSelect
            label="Formato de Áudio"
            options={formatOptions}
            value={settings.format}
            onChange={(val) => onChange({ ...settings, format: val as AudioFormat })}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <SearchableSelect
            label="Taxa de Bits (Bitrate)"
            options={bitrateOptions}
            value={settings.bitrate}
            onChange={(val) => onChange({ ...settings, bitrate: val as AudioBitrate })}
            disabled={disabled || settings.format === 'wav' || settings.format === 'flac'}
          />
          {(settings.format === 'wav' || settings.format === 'flac') && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              * WAV e FLAC utilizam compressão sem perdas automática.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Volume2 className="h-3.5 w-3.5 text-gray-400" />
            Canais de Áudio
          </label>

          <div className="grid grid-cols-2 gap-1.5">
            {[
              { value: 'stereo', label: 'Estéreo (2 Canais)' },
              { value: 'mono', label: 'Mono (1 Canal)' },
            ].map((ch) => (
              <button
                key={ch.value}
                disabled={disabled}
                onClick={() => onChange({ ...settings, channels: ch.value as 'stereo' | 'mono' })}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  settings.channels === ch.value
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-300 font-semibold'
                    : 'bg-background border-border text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-surface-hover'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={settings.normalizeVolume}
              disabled={disabled}
              onChange={(e) => onChange({ ...settings, normalizeVolume: e.target.checked })}
              className="rounded border-border bg-background text-emerald-500 focus:ring-0 h-3.5 w-3.5"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">
              Normalizar Volume (EBU R128 loudness)
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}
