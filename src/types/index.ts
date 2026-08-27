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
}

export type VideoFormat = 'mp4' | 'webm' | 'mkv' | 'gif' | 'mp3'
export type VideoPreset = 'balanced' | 'high_compression' | 'custom_crf' | 'target_size' | 'extract_audio'
export type VideoResolution = 'original' | '1080p' | '720p' | '480p' | '360p'

export interface VideoGlobalSettings {
  format: VideoFormat
  preset: VideoPreset
  crf: number
  targetSizeMB: number
  resolution: VideoResolution
  muteAudio: boolean
  fps?: number
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

export type PdfMode = 'images_to_pdf' | 'pdf_to_images'
export type PdfExtractFormat = 'png' | 'webp' | 'jpeg' | 'avif' | 'tiff'

export interface PdfGlobalSettings {
  mode: PdfMode
  pageSize: 'fit_image' | 'a4'
  quality: number
  customPdfName?: string
  extractFormat: PdfExtractFormat
  extractScale: number
  extractQuality: number
}

export interface OutputSettingsState {
  mode: 'same_directory' | 'custom_directory'
  customPath: string
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
