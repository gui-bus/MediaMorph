import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ffprobeInstaller from '@ffprobe-installer/ffprobe'

export function getFfmpegPath(): string {
  const binaryName = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'
  const archPlatform = `${process.platform}-${process.arch}`

  const candidates: string[] = []

  if (process.resourcesPath) {
    candidates.push(
      path.join(process.resourcesPath, 'bin', binaryName),
      path.join(process.resourcesPath, binaryName),
      path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', '@ffmpeg-installer', archPlatform, binaryName),
      path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', '@ffmpeg-installer', 'win32-x64', binaryName)
    )
  }

  if (app && app.isPackaged) {
    const unpacked = app.getAppPath().replace('app.asar', 'app.asar.unpacked')
    candidates.push(
      path.join(unpacked, 'node_modules', '@ffmpeg-installer', archPlatform, binaryName),
      path.join(unpacked, 'node_modules', '@ffmpeg-installer', 'win32-x64', binaryName),
      path.join(path.dirname(unpacked), 'bin', binaryName)
    )
  }

  candidates.push(
    path.join(process.cwd(), 'node_modules', '@ffmpeg-installer', archPlatform, binaryName),
    path.join(process.cwd(), 'node_modules', '@ffmpeg-installer', 'win32-x64', binaryName),
    path.join(__dirname, '..', '..', 'node_modules', '@ffmpeg-installer', archPlatform, binaryName)
  )

  if (ffmpegInstaller && ffmpegInstaller.path) {
    let p = ffmpegInstaller.path
    if (app && app.isPackaged && p.includes('app.asar')) {
      p = p.replace('app.asar', 'app.asar.unpacked')
    }
    candidates.push(p)
  }

  for (const c of candidates) {
    try {
      if (c && fs.existsSync(c)) {
        return c
      }
    } catch {}
  }

  return binaryName
}

export function getFfprobePath(): string {
  const binaryName = process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe'
  const archPlatform = `${process.platform}-${process.arch}`

  const candidates: string[] = []

  if (process.resourcesPath) {
    candidates.push(
      path.join(process.resourcesPath, 'bin', binaryName),
      path.join(process.resourcesPath, binaryName),
      path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', '@ffprobe-installer', archPlatform, binaryName),
      path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', '@ffprobe-installer', 'win32-x64', binaryName)
    )
  }

  if (app && app.isPackaged) {
    const unpacked = app.getAppPath().replace('app.asar', 'app.asar.unpacked')
    candidates.push(
      path.join(unpacked, 'node_modules', '@ffprobe-installer', archPlatform, binaryName),
      path.join(unpacked, 'node_modules', '@ffprobe-installer', 'win32-x64', binaryName),
      path.join(path.dirname(unpacked), 'bin', binaryName)
    )
  }

  candidates.push(
    path.join(process.cwd(), 'node_modules', '@ffprobe-installer', archPlatform, binaryName),
    path.join(process.cwd(), 'node_modules', '@ffprobe-installer', 'win32-x64', binaryName),
    path.join(__dirname, '..', '..', 'node_modules', '@ffprobe-installer', archPlatform, binaryName)
  )

  if (ffprobeInstaller && ffprobeInstaller.path) {
    let p = ffprobeInstaller.path
    if (app && app.isPackaged && p.includes('app.asar')) {
      p = p.replace('app.asar', 'app.asar.unpacked')
    }
    candidates.push(p)
  }

  for (const c of candidates) {
    try {
      if (c && fs.existsSync(c)) {
        return c
      }
    } catch {}
  }

  return binaryName
}

export function initFfmpeg(): void {
  const ffmpegP = getFfmpegPath()
  const ffprobeP = getFfprobePath()
  ffmpeg.setFfmpegPath(ffmpegP)
  ffmpeg.setFfprobePath(ffprobeP)
}
