import path from 'node:path'
import fs from 'node:fs/promises'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ffprobeInstaller from '@ffprobe-installer/ffprobe'
import { GpuAcceleration, VideoCrop, AudioExtractFormat } from '../../src/types'

function getBinaryPath(installerPath: string): string {
  let resolved = installerPath
  if (resolved.includes('app.asar')) {
    resolved = resolved.replace('app.asar', 'app.asar.unpacked')
  }
  return resolved
}

const ffmpegPath = getBinaryPath(ffmpegInstaller.path)
const ffprobePath = getBinaryPath(ffprobeInstaller.path)

ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath)

export interface VideoProcessOptions {
  jobId: string
  inputPath: string
  outputPath?: string
  format: 'mp4' | 'webm' | 'mkv' | 'gif' | 'mp3'
  preset: 'balanced' | 'high_compression' | 'custom_crf' | 'target_size' | 'extract_audio'
  crf?: number
  targetSizeMB?: number
  resolution?: 'original' | '1080p' | '720p' | '480p' | '360p'
  muteAudio?: boolean
  fps?: number
  speed?: number
  gpu?: GpuAcceleration
  crop?: VideoCrop
  audioExtractFormat?: AudioExtractFormat
  trimStart?: string
  trimEnd?: string
}

export interface VideoProgressEvent {
  jobId: string
  percent: number
  timemark: string
  currentFps?: number
  currentKbps?: number
}

export interface VideoProcessResult {
  jobId: string
  success: boolean
  inputPath: string
  outputPath: string
  originalSize: number
  newSize: number
  savedBytes: number
  savingsPercent: number
  durationMs: number
  error?: string
}

export function probeVideo(filePath: string): Promise<ffmpeg.FfprobeData> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) reject(err)
      else resolve(metadata)
    })
  })
}

export async function getVideoMetadata(filePath: string): Promise<{ duration: number; width?: number; height?: number }> {
  try {
    const meta = await probeVideo(filePath)
    const videoStream = meta.streams?.find((s) => s.codec_type === 'video')
    return {
      duration: meta.format.duration || 0,
      width: videoStream?.width,
      height: videoStream?.height,
    }
  } catch {
    return { duration: 0 }
  }
}

export async function processVideo(
  options: VideoProcessOptions,
  onProgress?: (progress: VideoProgressEvent) => void
): Promise<VideoProcessResult> {
  const startTime = Date.now()

  try {
    const stat = await fs.stat(options.inputPath)
    const originalSize = stat.size

    let durationSec = 0
    let originalBitrate = 0
    try {
      const metadata = await probeVideo(options.inputPath)
      durationSec = Number(metadata.format.duration) || 0
      if (metadata.format.bit_rate) {
        originalBitrate = Math.round(Number(metadata.format.bit_rate) / 1000)
      } else if (durationSec > 0 && originalSize > 0) {
        originalBitrate = Math.round((originalSize * 8) / (durationSec * 1000))
      }
    } catch {}

    const isAudioExtraction = options.preset === 'extract_audio' || options.format === 'mp3'
    const audioExt = options.audioExtractFormat || 'mp3'

    let outputPath = options.outputPath
    if (!outputPath) {
      const parsed = path.parse(options.inputPath)
      const ext = isAudioExtraction ? `.${audioExt}` : `.${options.format}`
      const optimizedDir = path.join(parsed.dir, 'optimized')
      outputPath = path.join(optimizedDir, `${parsed.name}${ext}`)
    }

    await fs.mkdir(path.dirname(outputPath), { recursive: true })

    return new Promise<VideoProcessResult>((resolve) => {
      const command = ffmpeg(options.inputPath)

      if (options.trimStart && options.trimStart.trim()) {
        command.setStartTime(options.trimStart.trim())
      }
      if (options.trimEnd && options.trimEnd.trim()) {
        command.outputOptions(['-to', options.trimEnd.trim()])
      }

      if (isAudioExtraction) {
        switch (audioExt) {
          case 'mp3':
            command.toFormat('mp3').audioCodec('libmp3lame').audioBitrate('192k')
            break
          case 'wav':
            command.toFormat('wav').audioCodec('pcm_s16le')
            break
          case 'flac':
            command.toFormat('flac').audioCodec('flac')
            break
          case 'aac':
            command.toFormat('adts').audioCodec('aac').audioBitrate('192k')
            break
          case 'ogg':
            command.toFormat('ogg').audioCodec('libvorbis').audioBitrate('192k')
            break
        }
      } else if (options.format === 'gif') {
        const fps = options.fps || 15
        const vfList: string[] = []

        if (options.crop && options.crop !== 'keep') {
          if (options.crop === '9:16') vfList.push('crop=min(iw\\,ih*9/16):min(ih\\,iw*16/9):(iw-ow)/2:(ih-oh)/2')
          else if (options.crop === '1:1') vfList.push('crop=min(iw\\,ih):min(iw\\,ih):(iw-ow)/2:(ih-oh)/2')
          else if (options.crop === '16:9') vfList.push('crop=min(iw\\,ih*16/9):min(ih\\,iw*9/16):(iw-ow)/2:(ih-oh)/2')
          else if (options.crop === '4:5') vfList.push('crop=min(iw\\,ih*4/5):min(ih\\,iw*5/4):(iw-ow)/2:(ih-oh)/2')
        }

        let scale = 'scale=-2:480:flags=lanczos'
        if (options.resolution && options.resolution !== 'original') {
          scale = `scale=-2:${options.resolution.replace('p', '')}:flags=lanczos`
        }
        vfList.push(scale)

        const vfStr = vfList.join(',')
        command
          .fps(fps)
          .complexFilter([`${vfStr ? vfStr + ',' : ''}split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer`])
          .toFormat('gif')
      } else {
        if (options.muteAudio) {
          command.noAudio()
        }

        const videoFilters: string[] = []

        if (options.crop && options.crop !== 'keep') {
          if (options.crop === '9:16') videoFilters.push('crop=min(iw\\,ih*9/16):min(ih\\,iw*16/9):(iw-ow)/2:(ih-oh)/2')
          else if (options.crop === '1:1') videoFilters.push('crop=min(iw\\,ih):min(iw\\,ih):(iw-ow)/2:(ih-oh)/2')
          else if (options.crop === '16:9') videoFilters.push('crop=min(iw\\,ih*16/9):min(ih\\,iw*9/16):(iw-ow)/2:(ih-oh)/2')
          else if (options.crop === '4:5') videoFilters.push('crop=min(iw\\,ih*4/5):min(ih\\,iw*5/4):(iw-ow)/2:(ih-oh)/2')
        }

        if (options.resolution && options.resolution !== 'original') {
          const height = options.resolution.replace('p', '')
          videoFilters.push(`scale=-2:${height}`)
        }

        if (options.speed && options.speed !== 1.0) {
          const ptsVal = (1 / options.speed).toFixed(4)
          videoFilters.push(`setpts=${ptsVal}*PTS`)

          if (!options.muteAudio) {
            let atempo = ''
            if (options.speed === 0.5) atempo = 'atempo=0.5'
            else if (options.speed === 1.5) atempo = 'atempo=1.5'
            else if (options.speed === 2.0) atempo = 'atempo=2.0'
            else if (options.speed === 4.0) atempo = 'atempo=2.0,atempo=2.0'
            if (atempo) command.audioFilters(atempo)
          }
        }

        if (videoFilters.length > 0) {
          command.videoFilters(videoFilters)
        }

        if (options.fps) {
          command.fps(options.fps)
        }

        let vCodec = 'libx264'
        if (options.gpu === 'nvenc') {
          vCodec = 'h264_nvenc'
        } else if (options.gpu === 'qsv') {
          vCodec = 'h264_qsv'
        } else if (options.gpu === 'amf') {
          vCodec = 'h264_amf'
        }

        if (options.preset === 'target_size' && options.targetSizeMB && durationSec > 0) {
          const effectiveDuration = options.speed && options.speed !== 1 ? durationSec / options.speed : durationSec
          const targetTotalKbits = options.targetSizeMB * 8192 * 0.95
          const audioBitrateKbits = options.muteAudio ? 0 : 96
          const videoBitrateKbits = Math.max(100, Math.floor((targetTotalKbits / effectiveDuration) - audioBitrateKbits))

          command
            .videoCodec(vCodec)
            .videoBitrate(`${videoBitrateKbits}k`)
            .outputOptions([
              '-preset fast',
              '-maxrate', `${Math.floor(videoBitrateKbits * 1.3)}k`,
              '-bufsize', `${Math.floor(videoBitrateKbits * 2)}k`,
              '-movflags +faststart'
            ])

          if (!options.muteAudio) {
            command.audioCodec('aac').audioBitrate('96k')
          }
        } else {
          let crf = options.crf || 26
          let audioKbps = '96k'
          let maxrateMultiplier = 0.85

          if (options.preset === 'high_compression') {
            crf = 30
            audioKbps = '64k'
            maxrateMultiplier = 0.65
          } else if (options.preset === 'balanced') {
            crf = 26
            audioKbps = '96k'
            maxrateMultiplier = 0.85
          }

          const outOptions: string[] = [
            options.gpu && options.gpu !== 'cpu' && options.gpu !== 'auto' ? `-cq ${crf}` : `-crf ${crf}`,
            '-preset fast',
            '-pix_fmt yuv420p',
            '-movflags +faststart',
          ]

          if (originalBitrate > 100) {
            const cappedMaxrate = Math.max(150, Math.round(originalBitrate * maxrateMultiplier))
            outOptions.push('-maxrate', `${cappedMaxrate}k`)
            outOptions.push('-bufsize', `${Math.round(cappedMaxrate * 1.5)}k`)
          }

          if (options.format === 'webm') {
            command
              .videoCodec('libvpx-vp9')
              .outputOptions([
                `-crf ${crf}`,
                '-b:v 0',
                '-deadline good',
                '-cpu-used 2',
              ])
            if (!options.muteAudio) {
              command.audioCodec('libopus').audioBitrate(audioKbps)
            }
          } else {
            command
              .videoCodec(vCodec)
              .outputOptions(outOptions)
            if (!options.muteAudio) {
              command.audioCodec('aac').audioBitrate(audioKbps)
            }
          }
        }
      }

      command.on('progress', (prog) => {
        let percent = 0
        if (prog.percent && prog.percent > 0) {
          percent = Math.min(100, Math.max(0, prog.percent))
        } else if (durationSec > 0 && prog.timemark) {
          const parts = prog.timemark.split(':')
          if (parts.length === 3) {
            const currentSec = parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2])
            const totalSec = options.speed && options.speed !== 1 ? durationSec / options.speed : durationSec
            percent = Math.min(99, Math.max(0, (currentSec / totalSec) * 100))
          }
        }

        if (onProgress) {
          onProgress({
            jobId: options.jobId,
            percent: Number(percent.toFixed(1)),
            timemark: prog.timemark || '00:00:00',
            currentFps: prog.currentFps,
            currentKbps: prog.currentKbps,
          })
        }
      })

      command.on('error', (err) => {
        resolve({
          jobId: options.jobId,
          success: false,
          inputPath: options.inputPath,
          outputPath: outputPath!,
          originalSize,
          newSize: 0,
          savedBytes: 0,
          savingsPercent: 0,
          durationMs: Date.now() - startTime,
          error: err.message || 'Falha ao processar vídeo com FFmpeg',
        })
      })

      command.on('end', async () => {
        try {
          let outStat = await fs.stat(outputPath!)
          let newSize = outStat.size

          const isSameFormat = path.extname(options.inputPath).toLowerCase() === path.extname(outputPath!).toLowerCase()
          const hasTransforms = (options.trimStart && options.trimStart.trim()) ||
                                (options.trimEnd && options.trimEnd.trim()) ||
                                (options.crop && options.crop !== 'keep') ||
                                (options.speed && options.speed !== 1.0) ||
                                (options.resolution && options.resolution !== 'original') ||
                                options.muteAudio

          if (!hasTransforms && isSameFormat && newSize >= originalSize && originalSize > 0) {
            await fs.copyFile(options.inputPath, outputPath!)
            outStat = await fs.stat(outputPath!)
            newSize = outStat.size
          }

          const savedBytes = Math.max(0, originalSize - newSize)
          const savingsPercent = originalSize > 0 ? Number(((savedBytes / originalSize) * 100).toFixed(1)) : 0
          const durationMs = Date.now() - startTime

          if (onProgress) {
            onProgress({
              jobId: options.jobId,
              percent: 100,
              timemark: 'Concluído',
            })
          }

          resolve({
            jobId: options.jobId,
            success: true,
            inputPath: options.inputPath,
            outputPath: outputPath!,
            originalSize,
            newSize,
            savedBytes,
            savingsPercent,
            durationMs,
          })
        } catch (err: any) {
          resolve({
            jobId: options.jobId,
            success: false,
            inputPath: options.inputPath,
            outputPath: outputPath!,
            originalSize,
            newSize: 0,
            savedBytes: 0,
            savingsPercent: 0,
            durationMs: Date.now() - startTime,
            error: 'Arquivo de saída não foi gerado.',
          })
        }
      })

      command.save(outputPath)
    })
  } catch (err: any) {
    return {
      jobId: options.jobId,
      success: false,
      inputPath: options.inputPath,
      outputPath: options.outputPath || '',
      originalSize: 0,
      newSize: 0,
      savedBytes: 0,
      savingsPercent: 0,
      durationMs: Date.now() - startTime,
      error: err.message || 'Erro ao inicializar conversão de vídeo',
    }
  }
}
