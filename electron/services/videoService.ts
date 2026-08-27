import path from 'node:path'
import fs from 'node:fs/promises'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ffprobeInstaller from '@ffprobe-installer/ffprobe'

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
    try {
      const metadata = await probeVideo(options.inputPath)
      durationSec = metadata.format.duration || 0
    } catch {}

    let outputPath = options.outputPath
    if (!outputPath) {
      const parsed = path.parse(options.inputPath)
      const ext = options.format === 'mp3' ? '.mp3' : `.${options.format}`
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

      if (options.muteAudio && options.format !== 'mp3') {
        command.noAudio()
      }

      let scaleFilter = ''
      if (options.resolution && options.resolution !== 'original') {
        switch (options.resolution) {
          case '1080p':
            scaleFilter = 'scale=-2:1080'
            break
          case '720p':
            scaleFilter = 'scale=-2:720'
            break
          case '480p':
            scaleFilter = 'scale=-2:480'
            break
          case '360p':
            scaleFilter = 'scale=-2:360'
            break
        }
      }

      if (options.format === 'mp3') {

        command
          .toFormat('mp3')
          .audioCodec('libmp3lame')
          .audioBitrate(192)
      } else if (options.format === 'gif') {

        const fps = options.fps || 15
        const scale = scaleFilter ? `${scaleFilter}:flags=lanczos,` : 'scale=-2:480:flags=lanczos,'
        command
          .fps(fps)
          .complexFilter([`${scale}split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer`])
          .toFormat('gif')
      } else {

        if (scaleFilter) {
          command.videoFilters(scaleFilter)
        }

        if (options.fps) {
          command.fps(options.fps)
        }

        if (options.preset === 'target_size' && options.targetSizeMB && durationSec > 0) {

          const targetTotalKbits = options.targetSizeMB * 8192 * 0.95
          const audioBitrateKbits = options.muteAudio ? 0 : 96
          const videoBitrateKbits = Math.max(100, Math.floor((targetTotalKbits / durationSec) - audioBitrateKbits))

          command
            .videoCodec('libx264')
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

          let crf = options.crf || 23
          if (options.preset === 'high_compression') {
            crf = 28
          } else if (options.preset === 'balanced') {
            crf = 23
          }

          if (options.format === 'webm') {
            command
              .videoCodec('libvpx-vp9')
              .outputOptions([
                `-crf ${crf}`,
                '-b:v 0',
                '-deadline good',
                '-cpu-used 2'
              ])
            if (!options.muteAudio) {
              command.audioCodec('libopus').audioBitrate('128k')
            }
          } else {

            command
              .videoCodec('libx264')
              .outputOptions([
                `-crf ${crf}`,
                '-preset medium',
                '-pix_fmt yuv420p',
                '-movflags +faststart'
              ])
            if (!options.muteAudio) {
              command.audioCodec('aac').audioBitrate('128k')
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
            percent = Math.min(99, Math.max(0, (currentSec / durationSec) * 100))
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
          const outStat = await fs.stat(outputPath!)
          const newSize = outStat.size
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
