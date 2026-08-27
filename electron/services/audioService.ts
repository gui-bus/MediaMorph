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

ffmpeg.setFfmpegPath(getBinaryPath(ffmpegInstaller.path))
ffmpeg.setFfprobePath(getBinaryPath(ffprobeInstaller.path))

export interface AudioProcessOptions {
  jobId: string
  inputPath: string
  outputPath?: string
  format: 'mp3' | 'wav' | 'flac' | 'aac' | 'ogg'
  bitrate: '128k' | '192k' | '256k' | '320k'
  channels: 'stereo' | 'mono'
  normalizeVolume?: boolean
}

export interface AudioProcessResult {
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

export async function processAudio(options: AudioProcessOptions): Promise<AudioProcessResult> {
  const startTime = Date.now()

  try {
    const stat = await fs.stat(options.inputPath)
    const originalSize = stat.size

    let outputPath = options.outputPath
    if (!outputPath) {
      const parsed = path.parse(options.inputPath)
      const ext = `.${options.format}`
      const optimizedDir = path.join(parsed.dir, 'optimized')
      outputPath = path.join(optimizedDir, `${parsed.name}${ext}`)
    }

    await fs.mkdir(path.dirname(outputPath), { recursive: true })

    return new Promise<AudioProcessResult>((resolve) => {
      const command = ffmpeg(options.inputPath)

      if (options.channels === 'mono') {
        command.audioChannels(1)
      } else {
        command.audioChannels(2)
      }

      if (options.normalizeVolume) {
        command.audioFilters('loudnorm')
      }

      switch (options.format) {
        case 'mp3':
          command
            .toFormat('mp3')
            .audioCodec('libmp3lame')
            .audioBitrate(options.bitrate.replace('k', ''))
          break
        case 'aac':
          command
            .toFormat('adts')
            .audioCodec('aac')
            .audioBitrate(options.bitrate.replace('k', ''))
          break
        case 'ogg':
          command
            .toFormat('ogg')
            .audioCodec('libvorbis')
            .audioBitrate(options.bitrate.replace('k', ''))
          break
        case 'flac':
          command
            .toFormat('flac')
            .audioCodec('flac')
          break
        case 'wav':
          command
            .toFormat('wav')
            .audioCodec('pcm_s16le')
          break
      }

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
          error: err.message || 'Falha ao converter áudio',
        })
      })

      command.on('end', async () => {
        try {
          const outStat = await fs.stat(outputPath!)
          const newSize = outStat.size
          const savedBytes = Math.max(0, originalSize - newSize)
          const savingsPercent =
            originalSize > 0 ? Number(((savedBytes / originalSize) * 100).toFixed(1)) : 0

          resolve({
            jobId: options.jobId,
            success: true,
            inputPath: options.inputPath,
            outputPath: outputPath!,
            originalSize,
            newSize,
            savedBytes,
            savingsPercent,
            durationMs: Date.now() - startTime,
          })
        } catch {
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
            error: 'Arquivo de áudio de saída não encontrado',
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
      error: err.message || 'Erro ao processar áudio',
    }
  }
}
