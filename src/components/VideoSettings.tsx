import React, { useState } from 'react'
import { VideoGlobalSettings, VideoFormat, VideoPreset, VideoResolution, GpuAcceleration, VideoCrop, AudioExtractFormat } from '../types'
import { VolumeX, RotateCcw, Cpu, Gauge, Zap, Crop, ChevronDown, ChevronUp } from 'lucide-react'
import { SearchableSelect, SelectOption } from './SearchableSelect'
import { VideoCameraSvg, ScissorSvg } from './CustomIcons'

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

  const formatOptions: SelectOption[] = [
    { value: 'mp4', label: 'MP4 (H.264)', desc: 'Compatibilidade universal e recomendado para web/redes', badge: 'Universal' },
    { value: 'webm', label: 'WebM (VP9)', desc: 'Formato moderno e código aberto de alta compressão', badge: 'Web' },
    { value: 'mkv', label: 'MKV', desc: 'Preserva múltiplas trilhas de áudio e legendas', badge: 'Multitrack' },
    { value: 'gif', label: 'GIF Animado', desc: 'Converte trechos em GIF para chat e adesivos', badge: 'Animado' },
    { value: 'mp3', label: 'Extrair Faixa de Áudio', desc: 'Extrai o som do vídeo em MP3, WAV, FLAC...', badge: 'Extrair Som' },
  ]

  const presetOptions: SelectOption[] = [
    { value: 'balanced', label: 'Equilibrado (CRF 23)', desc: 'Excelente qualidade visual e tamanho moderado', badge: 'Padrão' },
    { value: 'high_compression', label: 'Super Comprimido (CRF 28)', desc: 'Máxima economia de espaço em disco', badge: 'Leve' },
    { value: 'target_size_25', label: 'Discord Limit (< 25 MB)', desc: 'Calcula bitrate para caber no limite do Discord', badge: '25 MB' },
    { value: 'target_size_16', label: 'WhatsApp Limit (< 16 MB)', desc: 'Calcula bitrate para envio no WhatsApp', badge: '16 MB' },
    { value: 'target_size_50', label: 'Limite de 50 MB', desc: 'Para uploads com restrição média de tamanho', badge: '50 MB' },
    { value: 'target_size_8', label: 'Limite de 8 MB (Discord Free)', desc: 'Máxima redução para envio rápido', badge: '8 MB' },
    { value: 'custom_crf', label: 'CRF Personalizado', desc: 'Ajuste fino manual da taxa de compressão' },
  ]

  const resolutionOptions: SelectOption[] = [
    { value: 'original', label: 'Resolução Original', desc: 'Mantém a mesma resolução de entrada' },
    { value: '1080p', label: '1080p (Full HD - 1920x1080)', desc: 'Alta definição nítida', badge: 'Full HD' },
    { value: '720p', label: '720p (HD - 1280x720)', desc: 'Ótimo para economizar espaço e enviar rápido', badge: 'HD' },
    { value: '480p', label: '480p (SD - 854x480)', desc: 'Ideal para arquivos leves em conexões lentas', badge: 'SD' },
    { value: '360p', label: '360p (Ultra Leve)', desc: 'Arquivos minúsculos para pré-visualizações', badge: '360p' },
  ]

  const gpuOptions: SelectOption[] = [
    { value: 'auto', label: 'Auto / CPU (libx264)', desc: 'Compatibilidade garantida em todos os computadores', badge: 'Padrão' },
    { value: 'nvenc', label: 'NVIDIA NVENC (GeForce)', desc: 'Aceleração máxima por placa Nvidia RTX/GTX', badge: 'Nvidia' },
    { value: 'qsv', label: 'Intel QuickSync (iGPU)', desc: 'Aceleração por processador Intel Core', badge: 'Intel' },
    { value: 'amf', label: 'AMD AMF (Radeon)', desc: 'Aceleração por placa de vídeo AMD Radeon', badge: 'AMD' },
  ]

  const fpsOptions: SelectOption[] = [
    { value: 'keep', label: 'Manter FPS Original' },
    { value: '60', label: '60 FPS (Ultra Fluido)', badge: '60 FPS' },
    { value: '30', label: '30 FPS (Padrão Web / Vídeo)', badge: '30 FPS' },
    { value: '24', label: '24 FPS (Cinemático)', badge: '24 FPS' },
  ]

  const speedOptions: SelectOption[] = [
    { value: '0.5', label: '0.5x (Câmera Lenta)', badge: '0.5x' },
    { value: '1', label: '1.0x (Velocidade Normal)', badge: 'Normal' },
    { value: '1.5', label: '1.5x (Acelerado)', badge: '1.5x' },
    { value: '2', label: '2.0x (Dobro da Velocidade)', badge: '2.0x' },
    { value: '4', label: '4.0x (Timelapse Rápido)', badge: '4.0x' },
  ]

  const cropOptions: SelectOption[] = [
    { value: 'keep', label: 'Manter Enquadramento Original' },
    { value: '9:16', label: '9:16 Vertical (TikTok / Reels / Shorts)', badge: '9:16' },
    { value: '1:1', label: '1:1 Quadrado (Feed Instagram)', badge: '1:1' },
    { value: '16:9', label: '16:9 Panorâmico (Widescreen)', badge: '16:9' },
    { value: '4:5', label: '4:5 Retrato (Feed Vertical)', badge: '4:5' },
  ]

  const audioExtractFormatOptions: SelectOption[] = [
    { value: 'mp3', label: 'MP3 (Universal 192k)', badge: 'MP3' },
    { value: 'wav', label: 'WAV (Sem Perdas PCM)', badge: 'WAV' },
    { value: 'flac', label: 'FLAC (Lossless Studio)', badge: 'FLAC' },
    { value: 'aac', label: 'AAC (Alta Fidelidade)', badge: 'AAC' },
    { value: 'ogg', label: 'OGG Vorbis (Web)', badge: 'OGG' },
  ]

  const currentPresetValue =
    settings.preset === 'target_size'
      ? `target_size_${settings.targetSizeMB || 25}`
      : settings.preset

  const handleSelectPreset = (val: string) => {
    if (val.startsWith('target_size_')) {
      const size = Number(val.replace('target_size_', ''))
      onChange({ ...settings, preset: 'target_size', targetSizeMB: size, format: 'mp4' })
    } else {
      onChange({ ...settings, preset: val as VideoPreset })
    }
  }

  const isAudioExtract = settings.format === 'mp3' || settings.preset === 'extract_audio'
  const hasTrim = Boolean(settings.trimStart || settings.trimEnd)

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-5 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <VideoCameraSvg className="h-4 w-4" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
            Configurações de Vídeo
          </h2>
        </div>

        {!isAudioExtract && (
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              showAdvanced
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-background border-border text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>GPU, FPS & Velocidade</span>
            {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="space-y-2">
          <SearchableSelect
            label="Formato de Saída"
            options={formatOptions}
            value={settings.format}
            onChange={(val) => onChange({ ...settings, format: val as VideoFormat })}
            disabled={disabled}
          />
        </div>

        {isAudioExtract ? (
          <div className="space-y-2">
            <SearchableSelect
              label="Formato do Áudio Extraído"
              options={audioExtractFormatOptions}
              value={settings.audioExtractFormat || 'mp3'}
              onChange={(val) => onChange({ ...settings, audioExtractFormat: val as AudioExtractFormat })}
              disabled={disabled}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <SearchableSelect
              label="Preset de Otimização & Limite de Tamanho"
              options={presetOptions}
              value={currentPresetValue}
              onChange={handleSelectPreset}
              disabled={disabled}
            />

            {settings.preset === 'custom_crf' && (
              <div className="pt-1 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-700 dark:text-gray-300">CRF: {settings.crf}</span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                    {settings.crf <= 20 ? 'Quase Lossless' : settings.crf <= 26 ? 'Balanceado' : 'Leve'}
                  </span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="35"
                  step="1"
                  disabled={disabled}
                  value={settings.crf}
                  onChange={(e) => onChange({ ...settings, crf: Number(e.target.value) })}
                  className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <SearchableSelect
            label="Resolução de Saída"
            options={resolutionOptions}
            value={settings.resolution}
            onChange={(val) => onChange({ ...settings, resolution: val as VideoResolution })}
            disabled={disabled || isAudioExtract}
          />

          {!isAudioExtract && (
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={settings.muteAudio}
                disabled={disabled}
                onChange={(e) => onChange({ ...settings, muteAudio: e.target.checked })}
                className="rounded border-border bg-background text-emerald-500 focus:ring-0 h-3.5 w-3.5"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <VolumeX className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                Remover áudio (Vídeo Mudo)
              </span>
            </label>
          )}
        </div>
      </div>

      {showAdvanced && !isAudioExtract && (
        <div className="p-4 rounded-xl bg-background/80 border border-border/80 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Aceleração por Hardware, FPS, Velocidade & Crop
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <SearchableSelect
                label="Aceleração por GPU"
                options={gpuOptions}
                value={settings.gpu || 'auto'}
                onChange={(val) => onChange({ ...settings, gpu: val as GpuAcceleration })}
                disabled={disabled}
              />
            </div>

            <div className="space-y-1.5">
              <SearchableSelect
                label="Taxa de Quadros (FPS)"
                options={fpsOptions}
                value={settings.fps ? String(settings.fps) : 'keep'}
                onChange={(val) => onChange({ ...settings, fps: val === 'keep' ? undefined : Number(val) })}
                disabled={disabled}
              />
            </div>

            <div className="space-y-1.5">
              <SearchableSelect
                label="Velocidade / Timelapse"
                options={speedOptions}
                value={String(settings.speed || 1)}
                onChange={(val) => onChange({ ...settings, speed: Number(val) })}
                disabled={disabled}
              />
            </div>

            <div className="space-y-1.5">
              <SearchableSelect
                label="Enquadramento (Crop)"
                options={cropOptions}
                value={settings.crop || 'keep'}
                onChange={(val) => onChange({ ...settings, crop: val as VideoCrop })}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-background/50 p-3.5 rounded-xl border">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
            <ScissorSvg className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-900 dark:text-white block">
              Cortador Visual de Vídeo
            </span>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {hasTrim
                ? `Trecho configurado: ${settings.trimStart || '00:00:00'} até ${settings.trimEnd || 'Fim'}`
                : 'Selecione um vídeo na fila ou clique no botão de tesoura no card para cortar com preview visual'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasTrim && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange({ ...settings, trimStart: undefined, trimEnd: undefined })}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-gray-600 dark:text-gray-400 hover:text-red-500 text-xs font-medium transition-colors"
              title="Remover corte e usar vídeo completo"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Remover Corte</span>
            </button>
          )}

          {onOpenTrimmer && (
            <button
              type="button"
              disabled={disabled}
              onClick={onOpenTrimmer}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-sm"
            >
              <ScissorSvg className="h-3.5 w-3.5 brightness-0 invert" />
              <span>{hasTrim ? 'Editar Corte com Preview' : 'Abrir Cortador Visual'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
