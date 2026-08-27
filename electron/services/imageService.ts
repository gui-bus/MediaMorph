import path from 'node:path'
import fs from 'node:fs/promises'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { WatermarkSettings, ImageAdjustments } from '../../src/types'

export interface ImageProcessOptions {
  inputPath: string
  outputPath?: string
  format: 'original' | 'webp' | 'avif' | 'jpeg' | 'png' | 'gif' | 'tiff' | 'ico'
  quality: number
  lossless?: boolean
  resizeMode?: 'none' | 'scale' | 'dimensions'
  scalePercentage?: number
  maxWidth?: number
  maxHeight?: number
  stripMetadata?: boolean
  watermark?: WatermarkSettings
  adjustments?: ImageAdjustments
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

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case '\'': return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}

async function createTextWatermarkBuffer(
  text: string,
  fontSize: number,
  color: string,
  opacity: number,
  position: string,
  imgWidth: number,
  imgHeight: number
): Promise<Buffer> {
  const op = Math.max(0.05, Math.min(1, opacity / 100))
  const size = Math.max(12, Math.min(200, Math.round(fontSize * (imgWidth / 1000))))

  let x = '50%'
  let y = '50%'
  let anchor = 'middle'
  let dominantBaseline = 'middle'

  const padX = Math.round(imgWidth * 0.04)
  const padY = Math.round(imgHeight * 0.04)

  if (position === 'top-left') {
    x = `${padX}`
    y = `${padY + size}`
    anchor = 'start'
    dominantBaseline = 'auto'
  } else if (position === 'top-right') {
    x = `${imgWidth - padX}`
    y = `${padY + size}`
    anchor = 'end'
    dominantBaseline = 'auto'
  } else if (position === 'bottom-left') {
    x = `${padX}`
    y = `${imgHeight - padY}`
    anchor = 'start'
    dominantBaseline = 'auto'
  } else if (position === 'bottom-right') {
    x = `${imgWidth - padX}`
    y = `${imgHeight - padY}`
    anchor = 'end'
    dominantBaseline = 'auto'
  }

  const svg = `
    <svg width="${imgWidth}" height="${imgHeight}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .watermark-text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: ${size}px;
          font-weight: 700;
          fill: ${color};
          fill-opacity: ${op};
        }
      </style>
      <text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="${dominantBaseline}" class="watermark-text">
        ${escapeXml(text)}
      </text>
    </svg>
  `
  return Buffer.from(svg)
}

export async function processImage(options: ImageProcessOptions): Promise<ProcessResult> {
  const startTime = Date.now()

  try {
    const stat = await fs.stat(options.inputPath)
    const originalSize = stat.size

    const inputExt = path.extname(options.inputPath).toLowerCase().replace('.', '')
    let targetFormat = options.format
    if (targetFormat === 'original' || !targetFormat) {
      if (inputExt === 'jpg' || inputExt === 'jpeg') targetFormat = 'jpeg'
      else if (inputExt === 'png') targetFormat = 'png'
      else if (inputExt === 'webp') targetFormat = 'webp'
      else if (inputExt === 'avif') targetFormat = 'avif'
      else if (inputExt === 'gif') targetFormat = 'gif'
      else if (inputExt === 'tiff' || inputExt === 'tif') targetFormat = 'tiff'
      else targetFormat = 'webp'
    }

    let outputPath = options.outputPath
    if (!outputPath) {
      const parsed = path.parse(options.inputPath)
      const ext = targetFormat === 'jpeg' ? '.jpg' : `.${targetFormat}`
      const optimizedDir = path.join(parsed.dir, 'optimized')
      outputPath = path.join(optimizedDir, `${parsed.name}${ext}`)
    }

    await fs.mkdir(path.dirname(outputPath), { recursive: true })

    if (targetFormat === 'ico') {
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

    const isSvg = path.extname(options.inputPath).toLowerCase() === '.svg'
    const svgDensity = isSvg && options.adjustments?.svgScale ? 72 * options.adjustments.svgScale : 72

    let pipeline = sharp(options.inputPath, {
      density: svgDensity,
      animated: options.format === 'gif' || options.format === 'webp',
    })

    if (!options.stripMetadata) {
      pipeline = pipeline.withMetadata()
    }

    if (options.adjustments) {
      const { rotate, flipHorizontal, flipVertical, sharpen, brightness, contrast, saturation } = options.adjustments

      if (rotate) {
        pipeline = pipeline.rotate(rotate)
      }

      if (flipHorizontal) {
        pipeline = pipeline.flop()
      }

      if (flipVertical) {
        pipeline = pipeline.flip()
      }

      if (sharpen) {
        pipeline = pipeline.sharpen()
      }

      const bVal = 1 + (brightness || 0) / 100
      const sVal = 1 + (saturation || 0) / 100
      if (brightness !== 0 || saturation !== 0) {
        pipeline = pipeline.modulate({
          brightness: Math.max(0.1, bVal),
          saturation: Math.max(0, sVal),
        })
      }

      if (contrast && contrast !== 0) {
        const cFactor = 1 + contrast / 100
        pipeline = pipeline.linear(cFactor, -(128 * (cFactor - 1)))
      }
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

    if (options.watermark && options.watermark.enabled) {
      const { type, text, fontSize, color, opacity, position, imagePath } = options.watermark

      const bufferBeforeWatermark = await pipeline.toBuffer()
      const meta = await sharp(bufferBeforeWatermark).metadata()
      const w = meta.width || 800
      const h = meta.height || 600

      if (type === 'text' && text.trim()) {
        const wmSvgBuf = await createTextWatermarkBuffer(text, fontSize || 32, color || '#ffffff', opacity || 50, position || 'center', w, h)
        pipeline = sharp(bufferBeforeWatermark).composite([
          { input: wmSvgBuf, blend: 'over' }
        ])
      } else if (type === 'image' && imagePath) {
        try {
          const wmStat = await fs.stat(imagePath)
          if (wmStat.isFile()) {
            const wmScale = Math.max(0.1, Math.min(0.8, (fontSize || 30) / 100))
            const targetWmWidth = Math.round(w * wmScale)

            let wmImgPipeline = sharp(imagePath)
              .resize(targetWmWidth, null, { fit: 'inside' })

            if (opacity && opacity < 100) {
              const op = Math.max(0.05, Math.min(1, opacity / 100))
              wmImgPipeline = wmImgPipeline.composite([
                {
                  input: Buffer.from([255, 255, 255, Math.round(255 * op)]),
                  raw: { width: 1, height: 1, channels: 4 },
                  tile: true,
                  blend: 'dest-in'
                }
              ])
            }

            const wmImgBuffer = await wmImgPipeline.png().toBuffer()

            let gravity: sharp.Gravity = 'centre'
            if (position === 'top-left') gravity = 'northwest'
            else if (position === 'top-right') gravity = 'northeast'
            else if (position === 'bottom-left') gravity = 'southwest'
            else if (position === 'bottom-right') gravity = 'southeast'

            pipeline = sharp(bufferBeforeWatermark).composite([
              { input: wmImgBuffer, gravity }
            ])
          }
        } catch {}
      }
    }

    const q = Math.max(1, Math.min(100, options.quality))
    const isLossless = !!options.lossless

    switch (targetFormat) {
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
