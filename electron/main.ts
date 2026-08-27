import { app, BrowserWindow, ipcMain, dialog, shell, Notification, protocol, net } from 'electron'
import path from 'node:path'
import fs from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import sharp from 'sharp'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ffmpeg from 'fluent-ffmpeg'
import { processImage, ImageProcessOptions } from './services/imageService'
import { processVideo, VideoProcessOptions, VideoProgressEvent, getVideoMetadata } from './services/videoService'
import { processAudio, AudioProcessOptions } from './services/audioService'
import { convertImagesToPdf, ImagesToPdfOptions } from './services/pdfService'

process.env.APP_ROOT = path.join(__dirname, '..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

function getFfmpegPath(): string {
  let installerPath = ffmpegInstaller.path
  if (app.isPackaged) {
    installerPath = installerPath.replace('app.asar', 'app.asar.unpacked')
  }
  return installerPath
}
ffmpeg.setFfmpegPath(getFfmpegPath())

let win: BrowserWindow | null = null

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.tiff', '.bmp', '.svg', '.ico']
const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.mov', '.webm', '.avi', '.flv', '.wmv', '.m4v', '.3gp', '.ts']
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.flac', '.aac', '.m4a', '.ogg', '.opus', '.wma', '.aiff']
const PDF_EXTENSIONS = ['.pdf']

function isImageFile(ext: string): boolean {
  return IMAGE_EXTENSIONS.includes(ext.toLowerCase())
}

function isVideoFile(ext: string): boolean {
  return VIDEO_EXTENSIONS.includes(ext.toLowerCase())
}

function isAudioFile(ext: string): boolean {
  return AUDIO_EXTENSIONS.includes(ext.toLowerCase())
}

function isPdfFile(ext: string): boolean {
  return PDF_EXTENSIONS.includes(ext.toLowerCase())
}

async function generateThumbnail(filePath: string, isImage: boolean, isVideo: boolean): Promise<string | undefined> {
  if (isImage) {
    try {
      const buffer = await sharp(filePath)
        .resize(120, 120, { fit: 'cover' })
        .webp({ quality: 60 })
        .toBuffer()
      return `data:image/webp;base64,${buffer.toString('base64')}`
    } catch {
      return undefined
    }
  }

  if (isVideo) {
    try {
      return await new Promise((resolve) => {
        const chunks: Buffer[] = []
        ffmpeg(filePath)
          .seekInput(1)
          .frames(1)
          .size('120x120')
          .format('image2')
          .outputOptions('-vcodec mjpeg')
          .on('error', () => resolve(undefined))
          .pipe()
          .on('data', (chunk: Buffer) => chunks.push(chunk))
          .on('end', () => {
            const buf = Buffer.concat(chunks)
            if (buf.length > 0) {
              resolve(`data:image/jpeg;base64,${buf.toString('base64')}`)
            } else {
              resolve(undefined)
            }
          })
      })
    } catch {
      return undefined
    }
  }

  return undefined
}

async function getFileInfo(filePath: string) {
  try {
    const stat = await fs.stat(filePath)
    if (!stat.isFile()) return null
    const ext = path.extname(filePath).toLowerCase()
    const isImage = isImageFile(ext)
    const isVideo = isVideoFile(ext)
    const isAudio = isAudioFile(ext)
    const isPdf = isPdfFile(ext)
    const thumbnail = await generateThumbnail(filePath, isImage, isVideo)

    return {
      name: path.basename(filePath),
      path: filePath,
      size: stat.size,
      ext,
      isImage,
      isVideo,
      isAudio,
      isPdf,
      thumbnail,
    }
  } catch {
    return null
  }
}

async function scanDirectoryRecursive(dirPath: string): Promise<any[]> {
  const results: any[] = []
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'optimized', '$Recycle.Bin', 'System Volume Information'].includes(entry.name)) {
          const subFiles = await scanDirectoryRecursive(fullPath)
          results.push(...subFiles)
        }
      } else if (entry.isFile()) {
        const info = await getFileInfo(fullPath)
        if (info && (info.isImage || info.isVideo || info.isAudio || info.isPdf)) {
          results.push(info)
        }
      }
    }
  } catch (err) {
    console.error('Erro ao varrer diretório:', err)
  }
  return results
}

function createWindow() {
  const root = process.env.APP_ROOT || path.join(__dirname, '..')
  const iconPath = path.join(root, 'public', 'icon.png')

  win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 650,
    title: 'MediaMorph - Conversor & Compressor',
    icon: iconPath,
    backgroundColor: '#161616',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'media',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
])

ipcMain.handle('app:getVersion', () => app.getVersion())

ipcMain.handle('media:getVideoMetadata', async (_event, filePath: string) => {
  return await getVideoMetadata(filePath)
})

ipcMain.handle('app:notify', (_event, title: string, body: string) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show()
  }
})

ipcMain.handle('shell:openPath', async (_event, targetPath: string) => {
  return await shell.openPath(targetPath)
})

ipcMain.handle('shell:showItemInFolder', async (_event, filePath: string) => {
  shell.showItemInFolder(filePath)
})

ipcMain.handle('media:getFileInfo', async (_event, filePath: string) => {
  try {
    const stat = await fs.stat(filePath)
    if (stat.isDirectory()) {
      return await scanDirectoryRecursive(filePath)
    }
    return await getFileInfo(filePath)
  } catch {
    return null
  }
})

ipcMain.handle('media:scanDirectory', async (_event, dirPath: string) => {
  return await scanDirectoryRecursive(dirPath)
})

ipcMain.handle('fs:getSystemLocations', async () => {
  const locations = [
    { name: 'Downloads', path: app.getPath('downloads'), icon: 'downloads' },
    { name: 'Área de Trabalho', path: app.getPath('desktop'), icon: 'desktop' },
    { name: 'Imagens', path: app.getPath('pictures'), icon: 'pictures' },
    { name: 'Vídeos', path: app.getPath('videos'), icon: 'videos' },
    { name: 'Documentos', path: app.getPath('documents'), icon: 'documents' },
    { name: 'Disco Local (C:)', path: 'C:\\', icon: 'drive' },
  ]
  return locations
})

ipcMain.handle('fs:listDirectory', async (_event, dirPath: string) => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    const items: any[] = []

    for (const entry of entries) {
      if (entry.name.startsWith('.') || ['node_modules', 'System Volume Information', '$Recycle.Bin'].includes(entry.name)) {
        continue
      }
      const fullPath = path.join(dirPath, entry.name)
      if (entry.isDirectory()) {
        items.push({
          name: entry.name,
          path: fullPath,
          isDirectory: true,
        })
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()
        if (isImageFile(ext) || isVideoFile(ext) || isAudioFile(ext) || isPdfFile(ext)) {
          const info = await getFileInfo(fullPath)
          if (info) {
            items.push({
              ...info,
              isDirectory: false,
            })
          }
        }
      }
    }

    items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1
      if (!a.isDirectory && b.isDirectory) return 1
      return a.name.localeCompare(b.name)
    })

    return items
  } catch (err: any) {
    return []
  }
})

ipcMain.handle('media:readFileBase64', async (_event, filePath: string) => {
  try {
    const data = await fs.readFile(filePath)
    const ext = path.extname(filePath).toLowerCase().replace('.', '')
    const mime = ext === 'jpg' ? 'jpeg' : ext === 'svg' ? 'svg+xml' : ext
    return `data:image/${mime};base64,${data.toString('base64')}`
  } catch {
    return null
  }
})

ipcMain.handle('dialog:selectFolder', async () => {
  if (!win) return null
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Selecione a Pasta de Saída',
  })
  if (result.canceled || result.filePaths.length === 0) return null
  return result.filePaths[0]
})

ipcMain.handle('dialog:selectFolderFiles', async () => {
  if (!win) return []
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory'],
    title: 'Selecione a Pasta com Mídias para Importar',
  })
  if (result.canceled || result.filePaths.length === 0) return []
  return await scanDirectoryRecursive(result.filePaths[0])
})

ipcMain.handle('dialog:selectFiles', async (_event, type: 'images' | 'videos' | 'audio' | 'pdf' | 'all') => {
  if (!win) return []

  let filters: { name: string; extensions: string[] }[] = []

  if (type === 'images') {
    filters = [
      { name: 'Imagens', extensions: ['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'tiff', 'bmp', 'svg', 'ico'] },
      { name: 'Todos os Arquivos', extensions: ['*'] }
    ]
  } else if (type === 'videos') {
    filters = [
      { name: 'Vídeos', extensions: ['mp4', 'mkv', 'mov', 'webm', 'avi', 'flv', 'wmv', 'm4v'] },
      { name: 'Todos os Arquivos', extensions: ['*'] }
    ]
  } else if (type === 'audio') {
    filters = [
      { name: 'Áudio', extensions: ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'opus', 'wma', 'aiff'] },
      { name: 'Todos os Arquivos', extensions: ['*'] }
    ]
  } else if (type === 'pdf') {
    filters = [
      { name: 'PDFs & Imagens', extensions: ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'avif'] },
      { name: 'Todos os Arquivos', extensions: ['*'] }
    ]
  } else {
    filters = [
      { name: 'Todos os Arquivos Suportados', extensions: ['*'] }
    ]
  }

  const result = await dialog.showOpenDialog(win, {
    properties: ['openFile', 'multiSelections'],
    filters,
    title: 'Selecione os Arquivos',
  })

  if (result.canceled) return []

  const fileInfos = []
  for (const filePath of result.filePaths) {
    const info = await getFileInfo(filePath)
    if (info) fileInfos.push(info)
  }

  return fileInfos
})

ipcMain.handle('media:processImage', async (_event, options: ImageProcessOptions) => {
  return await processImage(options)
})

ipcMain.handle('media:processVideo', async (_event, options: VideoProcessOptions) => {
  return await processVideo(options, (progress: VideoProgressEvent) => {
    if (win && !win.isDestroyed()) {
      win.webContents.send('video:progress', progress)
    }
  })
})

ipcMain.handle('media:processAudio', async (_event, options: AudioProcessOptions) => {
  return await processAudio(options)
})

ipcMain.handle('media:imagesToPdf', async (_event, options: ImagesToPdfOptions) => {
  return await convertImagesToPdf(options)
})

app.whenReady().then(() => {

  protocol.handle('media', (request) => {
    try {
      const decodedUrl = decodeURIComponent(request.url.slice('media://'.length))
      const filePath = decodedUrl.startsWith('/') && process.platform === 'win32'
        ? decodedUrl.slice(1)
        : decodedUrl
      return net.fetch(pathToFileURL(filePath).toString())
    } catch {
      return new Response('Not found', { status: 404 })
    }
  })

  createWindow()
})
