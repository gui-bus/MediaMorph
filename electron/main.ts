import { app, BrowserWindow, ipcMain, dialog, shell, Notification, nativeImage } from 'electron'
import path from 'node:path'
import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ffmpeg from 'fluent-ffmpeg'
import { processImage, ImageProcessOptions } from './services/imageService'
import { processVideo, VideoProcessOptions, VideoProgressEvent, getVideoMetadata } from './services/videoService'
import { processAudio, AudioProcessOptions } from './services/audioService'
import { convertImagesToPdf, ImagesToPdfOptions, savePdfPagesToImages, SavePdfPagesOptions, mergePdfs, MergePdfsOptions, splitPdf, SplitPdfOptions } from './services/pdfService'

if (process.platform === 'win32') {
  app.setAppUserModelId('com.mediamorph.app')
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

const videoThumbnailCache = new Map<string, string>()

async function getVideoThumbnail(filePath: string): Promise<string | undefined> {
  if (videoThumbnailCache.has(filePath)) {
    return videoThumbnailCache.get(filePath)
  }

  return new Promise((resolve) => {
    const bufs: Buffer[] = []
    let isSettled = false

    const finish = (result?: string) => {
      if (isSettled) return
      isSettled = true
      if (result) {
        videoThumbnailCache.set(filePath, result)
      }
      resolve(result)
    }

    const timer = setTimeout(() => {
      try {
        proc.kill('SIGKILL')
      } catch {}
      finish(undefined)
    }, 3000)

    const proc = ffmpeg(filePath)
      .seekInput('00:00:01')
      .frames(1)
      .size('120x?')
      .format('image2')
      .outputOptions(['-vcodec mjpeg', '-q:v 3'])
      .on('error', () => {
        clearTimeout(timer)
        const fbBufs: Buffer[] = []
        ffmpeg(filePath)
          .frames(1)
          .size('120x?')
          .format('image2')
          .outputOptions(['-vcodec mjpeg', '-q:v 3'])
          .on('error', () => finish(undefined))
          .pipe()
          .on('data', (c: Buffer) => fbBufs.push(c))
          .on('end', () => {
            if (fbBufs.length > 0) {
              finish(`data:image/jpeg;base64,${Buffer.concat(fbBufs).toString('base64')}`)
            } else {
              finish(undefined)
            }
          })
      })

    proc.pipe()
      .on('data', (c: Buffer) => bufs.push(c))
      .on('end', () => {
        clearTimeout(timer)
        if (bufs.length > 0) {
          finish(`data:image/jpeg;base64,${Buffer.concat(bufs).toString('base64')}`)
        } else {
          finish(undefined)
        }
      })
  })
}

function getAppIcon(): Electron.NativeImage | string {
  const root = process.env.APP_ROOT || path.join(__dirname, '..')
  const possiblePaths = [
    path.join(root, 'build', 'icon.ico'),
    path.join(root, 'public', 'icon.ico'),
    path.join(root, 'public', 'icon.png'),
    path.join(root, 'dist', 'icon.ico'),
    path.join(root, 'dist', 'icon.png'),
    path.join(process.resourcesPath, 'app.asar', 'build', 'icon.ico'),
    path.join(process.resourcesPath, 'app.asar', 'public', 'icon.png'),
    path.join(app.getAppPath(), 'build', 'icon.ico'),
    path.join(app.getAppPath(), 'public', 'icon.png'),
    path.join(__dirname, '../build/icon.ico'),
    path.join(__dirname, '../public/icon.png'),
  ]

  for (const p of possiblePaths) {
    if (fsSync.existsSync(p)) {
      try {
        const img = nativeImage.createFromPath(p)
        if (!img.isEmpty()) return img
      } catch {}
    }
  }
  return path.join(root, 'build', 'icon.ico')
}

function getPreloadPath(): string {
  const candidates = [
    path.join(__dirname, 'preload.js'),
    path.join(__dirname, 'preload.mjs'),
    path.join(__dirname, 'preload.cjs'),
    path.join(process.env.APP_ROOT || '', 'dist-electron', 'preload.js'),
    path.join(process.env.APP_ROOT || '', 'dist-electron', 'preload.mjs'),
  ]
  for (const c of candidates) {
    if (fsSync.existsSync(c)) return c
  }
  return path.join(__dirname, 'preload.js')
}

async function scanDirectoryRecursive(dirPath: string): Promise<any[]> {
  const results: any[] = []
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      if (entry.isDirectory()) {
        const subFiles = await scanDirectoryRecursive(fullPath)
        results.push(...subFiles)
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()
        const isImg = isImageFile(ext)
        const isVid = isVideoFile(ext)
        const isAud = isAudioFile(ext)
        const isPdf = isPdfFile(ext)

        if (isImg || isVid || isAud || isPdf) {
          try {
            const stat = await fs.stat(fullPath)
            let thumbnail: string | undefined

            if (isImg && stat.size < 50 * 1024 * 1024) {
              try {
                const thumbBuf = await sharp(fullPath)
                  .resize(100, 100, { fit: 'inside' })
                  .jpeg({ quality: 60 })
                  .toBuffer()
                thumbnail = `data:image/jpeg;base64,${thumbBuf.toString('base64')}`
              } catch {}
            } else if (isVid) {
              try {
                thumbnail = await getVideoThumbnail(fullPath)
              } catch {}
            }

            results.push({
              name: entry.name,
              path: fullPath,
              size: stat.size,
              ext,
              isImage: isImg,
              isVideo: isVid,
              isAudio: isAud,
              isPdf,
              thumbnail,
            })
          } catch {}
        }
      }
    }
  } catch (err) {
    console.error(`Erro ao ler pasta ${dirPath}:`, err)
  }
  return results
}

function getSystemLocations(): Array<{ name: string; path: string; icon: string }> {
  const locations: Array<{ name: string; path: string; icon: string }> = []
  try {
    locations.push({ name: 'Downloads', path: app.getPath('downloads'), icon: 'downloads' })
    locations.push({ name: 'Área de Trabalho', path: app.getPath('desktop'), icon: 'desktop' })
    locations.push({ name: 'Imagens', path: app.getPath('pictures'), icon: 'pictures' })
    locations.push({ name: 'Vídeos', path: app.getPath('videos'), icon: 'videos' })
    locations.push({ name: 'Documentos', path: app.getPath('documents'), icon: 'documents' })
    if (process.platform === 'win32') {
      locations.push({ name: 'Disco Local (C:)', path: 'C:\\', icon: 'drive' })
    }
  } catch (err) {
    console.error('Erro ao obter pastas do sistema:', err)
  }
  return locations
}

async function listDirectoryItems(dirPath: string): Promise<any[]> {
  const results: any[] = []
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      if (entry.isDirectory()) {
        results.push({
          name: entry.name,
          path: fullPath,
          size: 0,
          ext: '',
          isImage: false,
          isVideo: false,
          isAudio: false,
          isDirectory: true,
        })
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()
        const isImg = isImageFile(ext)
        const isVid = isVideoFile(ext)
        const isAud = isAudioFile(ext)
        const isPdf = isPdfFile(ext)

        if (isImg || isVid || isAud || isPdf) {
          try {
            const stat = await fs.stat(fullPath)
            let thumbnail: string | undefined

            if (isImg && stat.size < 50 * 1024 * 1024) {
              try {
                const thumbBuf = await sharp(fullPath)
                  .resize(100, 100, { fit: 'inside' })
                  .jpeg({ quality: 60 })
                  .toBuffer()
                thumbnail = `data:image/jpeg;base64,${thumbBuf.toString('base64')}`
              } catch {}
            } else if (isVid) {
              try {
                thumbnail = await getVideoThumbnail(fullPath)
              } catch {}
            }

            results.push({
              name: entry.name,
              path: fullPath,
              size: stat.size,
              ext,
              isImage: isImg,
              isVideo: isVid,
              isAudio: isAud,
              isPdf,
              thumbnail,
              isDirectory: false,
            })
          } catch {}
        }
      }
    }
  } catch (err) {
    console.error(`Erro ao listar itens de ${dirPath}:`, err)
  }
  return results
}

function createWindow() {
  const appIcon = getAppIcon()
  const preloadScript = getPreloadPath()

  win = new BrowserWindow({
    title: 'MediaMorph',
    icon: appIcon,
    width: 1300,
    height: 860,
    minWidth: 900,
    minHeight: 650,
    autoHideMenuBar: true,
    backgroundColor: '#161616',
    webPreferences: {
      preload: preloadScript,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      sandbox: false,
    },
  })

  if (typeof appIcon !== 'string') {
    win.setIcon(appIcon)
  }

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
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

app.whenReady().then(() => {
  createWindow()

  ipcMain.handle('dialog:selectFiles', async (_event, type: 'images' | 'videos' | 'audio' | 'pdf' | 'all') => {
    if (!win) return []

    let filters: Electron.FileFilter[] = []

    if (type === 'images') {
      filters = [{ name: 'Imagens', extensions: ['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'tiff', 'bmp', 'svg', 'ico'] }]
    } else if (type === 'videos') {
      filters = [{ name: 'Vídeos', extensions: ['mp4', 'mkv', 'mov', 'webm', 'avi', 'flv', 'wmv', 'm4v', '3gp', 'ts'] }]
    } else if (type === 'audio') {
      filters = [{ name: 'Áudios', extensions: ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'opus', 'wma', 'aiff'] }]
    } else if (type === 'pdf') {
      filters = [{ name: 'PDFs & Imagens', extensions: ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'avif', 'tiff'] }]
    } else {
      filters = [
        { name: 'Todas as Mídias Suportadas', extensions: ['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'tiff', 'bmp', 'svg', 'ico', 'mp4', 'mkv', 'mov', 'webm', 'avi', 'flv', 'wmv', 'm4v', '3gp', 'ts', 'mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'opus', 'wma', 'aiff', 'pdf'] },
      ]
    }

    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'Selecionar Arquivos para Conversão',
      properties: ['openFile', 'multiSelections'],
      filters,
    })

    if (canceled || filePaths.length === 0) return []

    const items: any[] = []
    for (const filePath of filePaths) {
      const ext = path.extname(filePath).toLowerCase()
      const name = path.basename(filePath)
      const isImg = isImageFile(ext)
      const isVid = isVideoFile(ext)
      const isAud = isAudioFile(ext)
      const isPdf = isPdfFile(ext)

      try {
        const stat = await fs.stat(filePath)
        let thumbnail: string | undefined

        if (isImg && stat.size < 50 * 1024 * 1024) {
          try {
            const thumbBuf = await sharp(filePath)
              .resize(120, 120, { fit: 'inside' })
              .jpeg({ quality: 60 })
              .toBuffer()
            thumbnail = `data:image/jpeg;base64,${thumbBuf.toString('base64')}`
          } catch {}
        } else if (isVid) {
          try {
            thumbnail = await getVideoThumbnail(filePath)
          } catch {}
        }

        items.push({
          name,
          path: filePath,
          size: stat.size,
          ext,
          isImage: isImg,
          isVideo: isVid,
          isAudio: isAud,
          isPdf,
          thumbnail,
        })
      } catch {}
    }

    return items
  })

  ipcMain.handle('dialog:selectFolder', async () => {
    if (!win) return null
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'Selecionar Pasta de Destino',
      properties: ['openDirectory', 'createDirectory'],
    })
    if (canceled || filePaths.length === 0) return null
    return filePaths[0]
  })

  ipcMain.handle('dialog:selectFolderFiles', async () => {
    if (!win) return []
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'Selecionar Pasta para Importar Arquivos',
      properties: ['openDirectory'],
    })
    if (canceled || filePaths.length === 0) return []
    return await scanDirectoryRecursive(filePaths[0])
  })

  ipcMain.handle('media:scanDirectory', async (_event, dirPath: string) => {
    return await scanDirectoryRecursive(dirPath)
  })

  ipcMain.handle('fs:getSystemLocations', async () => {
    return getSystemLocations()
  })

  ipcMain.handle('fs:listDirectory', async (_event, dirPath: string) => {
    return await listDirectoryItems(dirPath)
  })

  ipcMain.handle('shell:openPath', async (_event, dirPath: string) => {
    return await shell.openPath(dirPath)
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
      const ext = path.extname(filePath).toLowerCase()
      const name = path.basename(filePath)
      const isImg = isImageFile(ext)
      const isVid = isVideoFile(ext)
      const isAud = isAudioFile(ext)
      const isPdf = isPdfFile(ext)

      let thumbnail: string | undefined
      if (isImg && stat.size < 50 * 1024 * 1024) {
        try {
          const thumbBuf = await sharp(filePath)
            .resize(120, 120, { fit: 'inside' })
            .jpeg({ quality: 60 })
            .toBuffer()
          thumbnail = `data:image/jpeg;base64,${thumbBuf.toString('base64')}`
        } catch {}
      } else if (isVid) {
        try {
          thumbnail = await getVideoThumbnail(filePath)
        } catch {}
      }

      return {
        name,
        path: filePath,
        size: stat.size,
        ext,
        isImage: isImg,
        isVideo: isVid,
        isAudio: isAud,
        isPdf,
        thumbnail,
      }
    } catch {
      return null
    }
  })

  ipcMain.handle('media:getVideoMetadata', async (_event, filePath: string) => {
    return await getVideoMetadata(filePath)
  })

  ipcMain.handle('media:readFileBase64', async (_event, filePath: string) => {
    try {
      const buffer = await fs.readFile(filePath)
      const ext = path.extname(filePath).toLowerCase().replace('.', '')
      const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
        : ext === 'png' ? 'image/png'
        : ext === 'webp' ? 'image/webp'
        : ext === 'avif' ? 'image/avif'
        : ext === 'gif' ? 'image/gif'
        : ext === 'svg' ? 'image/svg+xml'
        : ext === 'ico' ? 'image/x-icon'
        : ext === 'pdf' ? 'application/pdf'
        : 'application/octet-stream'
      return `data:${mime};base64,${buffer.toString('base64')}`
    } catch {
      return null
    }
  })

  ipcMain.handle('media:processImage', async (_event, options: ImageProcessOptions) => {
    return await processImage(options)
  })

  ipcMain.handle('media:processVideo', async (_event, options: VideoProcessOptions) => {
    const onProgress = (data: VideoProgressEvent) => {
      win?.webContents.send('video:progress', data)
    }
    return await processVideo(options, onProgress)
  })

  ipcMain.handle('media:processAudio', async (_event, options: AudioProcessOptions) => {
    return await processAudio(options)
  })

  ipcMain.handle('media:imagesToPdf', async (_event, options: ImagesToPdfOptions) => {
    return await convertImagesToPdf(options)
  })

  ipcMain.handle('media:savePdfPages', async (_event, options: SavePdfPagesOptions) => {
    return await savePdfPagesToImages(options)
  })

  ipcMain.handle('media:mergePdfs', async (_event, options: MergePdfsOptions) => {
    return await mergePdfs(options)
  })

  ipcMain.handle('media:splitPdf', async (_event, options: SplitPdfOptions) => {
    return await splitPdf(options)
  })

  ipcMain.handle('app:notify', async (_event, title: string, body: string) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show()
    }
  })

  ipcMain.handle('app:getVersion', () => {
    return app.getVersion()
  })
})
