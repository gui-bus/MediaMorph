import path from 'node:path'
import fs from 'node:fs/promises'
import sharp from 'sharp'

import pngToIco from 'png-to-ico'

export interface ImageProcessOptions {
  inputPath: string
  outputPath?: string
  format: 'webp' | 'avif' | 'jpeg' | 'png' | 'gif' | 'tiff' | 'ico'
  quality: number
  lossless?: boolean
  resizeMode?: 'none' | 'scale' | 'dimensions'
  scalePercentage?: number
  maxWidth?: number
  maxHeight?: number
  stripMetadata?: boolean
}

export interface ProcessResult {
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

export async function processImage(options: ImageProcessOptions): Promise<ProcessResult> {
  const startTime = Date.now()

  try {
    const stat = await fs.stat(options.inputPath)
    const originalSize = stat.size

    let outputPath = options.outputPath
    if (!outputPath) {
      const parsed = path.parse(options.inputPath)
      const ext = options.format === 'jpeg' ? '.jpg' : `.${options.format}`
      const optimizedDir = path.join(parsed.dir, 'optimized')
      outputPath = path.join(optimizedDir, `${parsed.name}${ext}`)
    }

    await fs.mkdir(path.dirname(outputPath), { recursive: true })

    if (options.format === 'ico') {

      const pngBuffer = await sharp(options.inputPath)
        .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()

      const icoBuffer = await pngToIco(pngBuffer)
      await fs.writeFile(outputPath, icoBuffer)

      const outStat = await fs.stat(outputPath)
      const newSize = outStat.size
      const savedBytes = Math.max(0, originalSize - newSize)
      const savingsPercent = originalSize > 0 ? Number(((savedBytes / originalSize) * 100).toFixed(1)) : 0

      return {
        success: true,
        inputPath: options.inputPath,
        outputPath,
        originalSize,
        newSize,
        savedBytes,
        savingsPercent,
        durationMs: Date.now() - startTime,
      }
    }

    let pipeline = sharp(options.inputPath, {
      animated: options.format === 'gif' || options.format === 'webp',
    })

    if (!options.stripMetadata) {
      pipeline = pipeline.withMetadata()
    }

    if (options.resizeMode === 'scale' && options.scalePercentage && options.scalePercentage < 100) {
      const meta = await sharp(options.inputPath).metadata()
      if (meta.width && meta.height) {
        const factor = options.scalePercentage / 100
        const newWidth = Math.round(meta.width * factor)
        const newHeight = Math.round(meta.height * factor)
        pipeline = pipeline.resize(newWidth, newHeight, { fit: 'inside' })
      }
    } else if (options.resizeMode === 'dimensions' && (options.maxWidth || options.maxHeight)) {
      pipeline = pipeline.resize(options.maxWidth || null, options.maxHeight || null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
    }

    const q = Math.max(1, Math.min(100, options.quality))
    const isLossless = !!options.lossless

    switch (options.format) {
      case 'webp':
        pipeline = pipeline.webp({
          quality: q,
          lossless: isLossless,
          effort: 5,
        })
        break
      case 'avif':
        pipeline = pipeline.avif({
          quality: q,
          lossless: isLossless,
          effort: 5,
          chromaSubsampling: isLossless ? '4:4:4' : '4:2:0',
        })
        break
      case 'jpeg':
        pipeline = pipeline.jpeg({
          quality: q,
          mozjpeg: true,
          progressive: true,
        })
        break
      case 'png':
        pipeline = pipeline.png({
          compressionLevel: Math.round((100 - q) / 11) + 1,
          progressive: true,
          palette: !isLossless && q < 90,
          quality: q,
        })
        break
      case 'gif':
        pipeline = pipeline.gif({
          effort: 7,
        })
        break
      case 'tiff':
        pipeline = pipeline.tiff({
          quality: q,
          compression: 'deflate',
        })
        break
    }

    await pipeline.toFile(outputPath)

    const outStat = await fs.stat(outputPath)
    const newSize = outStat.size
    const savedBytes = Math.max(0, originalSize - newSize)
    const savingsPercent = originalSize > 0 ? Number(((savedBytes / originalSize) * 100).toFixed(1)) : 0
    const durationMs = Date.now() - startTime

    return {
      success: true,
      inputPath: options.inputPath,
      outputPath,
      originalSize,
      newSize,
      savedBytes,
      savingsPercent,
      durationMs,
    }
  } catch (err: any) {
    return {
      success: false,
      inputPath: options.inputPath,
      outputPath: options.outputPath || '',
      originalSize: 0,
      newSize: 0,
      savedBytes: 0,
      savingsPercent: 0,
      durationMs: Date.now() - startTime,
      error: err.message || 'Falha ao processar imagem',
    }
  }
}
