export type MediaTab = 'images' | 'videos' | 'audio' | 'pdf'

export type ThemeMode = 'dark' | 'light'

export interface FileItem {
  id: string
  name: string
  path: string
  size: number
  ext: string
  isImage: boolean
  isVideo: boolean
  isAudio: boolean
  isPdf?: boolean
  thumbnail?: string
  status: 'idle' | 'processing' | 'completed' | 'error'
  progress: number
  timemark?: string
  error?: string
  customSettings?: {
    format?: string
    quality?: number
    resolution?: string
  }
  result?: {
    outputPath: string
    newSize: number
    savedBytes: number
    savingsPercent: number
    durationMs: number
  }
}

export type ImageFormat = 'webp' | 'avif' | 'jpeg' | 'png' | 'gif' | 'tiff' | 'ico'

export type WatermarkPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export interface WatermarkSettings {
  enabled: boolean
  type: 'text' | 'image'
  text: string
  fontSize: number
  color: string
  opacity: number
  imagePath?: string
  position: WatermarkPosition
}

export interface ImageAdjustments {
  brightness: number
  contrast: number
  saturation: number
  sharpen: boolean
  rotate: 0 | 90 | 180 | 270
  flipHorizontal: boolean
  flipVertical: boolean
  svgScale: 1 | 2 | 4 | 8
}

export interface ImageGlobalSettings {
  format: ImageFormat
  quality: number
  lossless: boolean
  resizeMode: 'none' | 'scale' | 'dimensions'
  scalePercentage: number
  maxWidth: number
  maxHeight: number
  stripMetadata: boolean
  presetName?: string
  watermark: WatermarkSettings
  adjustments: ImageAdjustments
}

export type VideoFormat = 'mp4' | 'webm' | 'mkv' | 'gif' | 'mp3'
export type VideoPreset = 'balanced' | 'high_compression' | 'custom_crf' | 'target_size' | 'extract_audio'
export type VideoResolution = 'original' | '1080p' | '720p' | '480p' | '360p'
export type GpuAcceleration = 'auto' | 'cpu' | 'nvenc' | 'qsv' | 'amf'
export type VideoCrop = 'keep' | '16:9' | '9:16' | '1:1' | '4:5'
export type AudioExtractFormat = 'mp3' | 'wav' | 'flac' | 'aac' | 'ogg'

export interface VideoGlobalSettings {
  format: VideoFormat
  preset: VideoPreset
  crf: number
  targetSizeMB: number
  resolution: VideoResolution
  muteAudio: boolean
  fps?: number
  speed: number
  gpu: GpuAcceleration
  crop: VideoCrop
  audioExtractFormat: AudioExtractFormat
  trimStart?: string
  trimEnd?: string
}

export type AudioFormat = 'mp3' | 'wav' | 'flac' | 'aac' | 'ogg'
export type AudioBitrate = '128k' | '192k' | '256k' | '320k'

export interface AudioGlobalSettings {
  format: AudioFormat
  bitrate: AudioBitrate
  channels: 'stereo' | 'mono'
  normalizeVolume: boolean
}

export type PdfMode = 'images_to_pdf' | 'pdf_to_images' | 'compress_pdf' | 'merge_split_pdf'
export type PdfExtractFormat = 'png' | 'webp' | 'jpeg' | 'avif' | 'tiff'

export interface PdfGlobalSettings {
  mode: PdfMode
  pageSize: 'fit_image' | 'a4'
  quality: number
  customPdfName?: string
  extractFormat: PdfExtractFormat
  extractScale: number
  extractQuality: number
  compressQuality: number
  splitRange?: string
}

export type NamingPattern = 'original' | '{name}_optimized' | '{name}_{date}' | '{counter}_{name}' | 'custom'

export interface OutputSettingsState {
  mode: 'same_directory' | 'custom_directory'
  customPath: string
  namingPattern: NamingPattern
  customNamingPattern: string
}

export interface LifetimeStats {
  totalFiles: number
  totalBytesSaved: number
}

export interface HistoryItem {
  id: string
  name: string
  originalSize: number
  newSize: number
  savingsPercent: number
  outputPath: string
  type: 'image' | 'video' | 'audio' | 'pdf'
  timestamp: number
}

export interface UserPreset {
  id: string
  name: string
  category: MediaTab
  createdAt: number
  settings: any
}
