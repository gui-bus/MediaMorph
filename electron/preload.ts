import { contextBridge, ipcRenderer } from 'electron'
import type { ImageProcessOptions, ProcessResult } from './services/imageService'
import type { VideoProcessOptions, VideoProgressEvent, VideoProcessResult } from './services/videoService'
import type { AudioProcessOptions, AudioProcessResult } from './services/audioService'
import type { ImagesToPdfOptions, PdfProcessResult } from './services/pdfService'

export interface FileItemInfo {
  name: string
  path: string
  size: number
  ext: string
  isImage: boolean
  isVideo: boolean
  isAudio: boolean
  isPdf?: boolean
  thumbnail?: string
  isDirectory?: boolean
}

export interface SystemLocation {
  name: string
  path: string
  icon: string
}

export interface ElectronAPI {
  selectFiles: (type: 'images' | 'videos' | 'audio' | 'pdf' | 'all') => Promise<FileItemInfo[]>
  selectFolder: () => Promise<string | null>
  selectFolderFiles: () => Promise<FileItemInfo[]>
  scanDirectory: (dirPath: string) => Promise<FileItemInfo[]>
  getSystemLocations: () => Promise<SystemLocation[]>
  listDirectory: (dirPath: string) => Promise<FileItemInfo[]>
  openPath: (dirPath: string) => Promise<string>
  showItemInFolder: (filePath: string) => Promise<void>
  getFileInfo: (filePath: string) => Promise<FileItemInfo | FileItemInfo[] | null>
  getVideoMetadata: (filePath: string) => Promise<{ duration: number; width?: number; height?: number }>
  readFileBase64: (filePath: string) => Promise<string | null>
  processImage: (options: ImageProcessOptions) => Promise<ProcessResult>
  processVideo: (options: VideoProcessOptions) => Promise<VideoProcessResult>
  processAudio: (options: AudioProcessOptions) => Promise<AudioProcessResult>
  imagesToPdf: (options: ImagesToPdfOptions) => Promise<PdfProcessResult>
  onVideoProgress: (callback: (event: VideoProgressEvent) => void) => () => void
  notify: (title: string, body: string) => Promise<void>
  getAppVersion: () => Promise<string>
}

const api: ElectronAPI = {
  selectFiles: (type) => ipcRenderer.invoke('dialog:selectFiles', type),
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  selectFolderFiles: () => ipcRenderer.invoke('dialog:selectFolderFiles'),
  scanDirectory: (dirPath) => ipcRenderer.invoke('media:scanDirectory', dirPath),
  getSystemLocations: () => ipcRenderer.invoke('fs:getSystemLocations'),
  listDirectory: (dirPath) => ipcRenderer.invoke('fs:listDirectory', dirPath),
  openPath: (dirPath) => ipcRenderer.invoke('shell:openPath', dirPath),
  showItemInFolder: (filePath) => ipcRenderer.invoke('shell:showItemInFolder', filePath),
  getFileInfo: (filePath) => ipcRenderer.invoke('media:getFileInfo', filePath),
  getVideoMetadata: (filePath) => ipcRenderer.invoke('media:getVideoMetadata', filePath),
  readFileBase64: (filePath) => ipcRenderer.invoke('media:readFileBase64', filePath),
  processImage: (options) => ipcRenderer.invoke('media:processImage', options),
  processVideo: (options) => ipcRenderer.invoke('media:processVideo', options),
  processAudio: (options) => ipcRenderer.invoke('media:processAudio', options),
  imagesToPdf: (options) => ipcRenderer.invoke('media:imagesToPdf', options),
  onVideoProgress: (callback) => {
    const listener = (_event: any, data: VideoProgressEvent) => callback(data)
    ipcRenderer.on('video:progress', listener)
    return () => {
      ipcRenderer.removeListener('video:progress', listener)
    }
  },
  notify: (title, body) => ipcRenderer.invoke('app:notify', title, body),
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
}

contextBridge.exposeInMainWorld('electronAPI', api)
