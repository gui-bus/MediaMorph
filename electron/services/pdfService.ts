import path from 'node:path'
import fs from 'node:fs/promises'
import sharp from 'sharp'
import { PDFDocument, PageSizes } from 'pdf-lib'

export interface ImagesToPdfOptions {
  imagePaths: string[]
  outputPath?: string
  quality?: number
  pageSize?: 'fit_image' | 'a4'
}

export interface PdfProcessResult {
  success: boolean
  outputPath: string
  originalTotalSize: number
  newSize: number
  pageCount: number
  durationMs: number
  error?: string
}

export async function convertImagesToPdf(options: ImagesToPdfOptions): Promise<PdfProcessResult> {
  const startTime = Date.now()

  try {
    if (!options.imagePaths || options.imagePaths.length === 0) {
      throw new Error('Nenhuma imagem fornecida para compor o PDF')
    }

    let originalTotalSize = 0
    for (const imgPath of options.imagePaths) {
      try {
        const stat = await fs.stat(imgPath)
        originalTotalSize += stat.size
      } catch {}
    }

    let outputPath = options.outputPath
    if (!outputPath) {
      const firstDir = path.dirname(options.imagePaths[0])
      const optimizedDir = path.join(firstDir, 'optimized')
      outputPath = path.join(optimizedDir, `documento_compilado_${Date.now()}.pdf`)
    }

    await fs.mkdir(path.dirname(outputPath), { recursive: true })

    const pdfDoc = await PDFDocument.create()
    const quality = options.quality || 85

    for (const imgPath of options.imagePaths) {
      try {

        const jpegBuffer = await sharp(imgPath)
          .jpeg({ quality, mozjpeg: true })
          .toBuffer()

        const embeddedImage = await pdfDoc.embedJpg(jpegBuffer)
        const { width, height } = embeddedImage.scale(1)

        if (options.pageSize === 'a4') {

          const page = pdfDoc.addPage(PageSizes.A4)
          const pageWidth = page.getWidth()
          const pageHeight = page.getHeight()

          const margin = 20
          const maxW = pageWidth - margin * 2
          const maxH = pageHeight - margin * 2
          const scale = Math.min(maxW / width, maxH / height)
          const imgW = width * scale
          const imgH = height * scale
          const x = (pageWidth - imgW) / 2
          const y = (pageHeight - imgH) / 2

          page.drawImage(embeddedImage, {
            x,
            y,
            width: imgW,
            height: imgH,
          })
        } else {

          const page = pdfDoc.addPage([width, height])
          page.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width,
            height,
          })
        }
      } catch (err: any) {
        console.error(`Erro ao adicionar imagem ${imgPath} ao PDF:`, err)
      }
    }

    const pdfBytes = await pdfDoc.save()
    await fs.writeFile(outputPath, pdfBytes)

    const outStat = await fs.stat(outputPath)

    return {
      success: true,
      outputPath,
      originalTotalSize,
      newSize: outStat.size,
      pageCount: pdfDoc.getPageCount(),
      durationMs: Date.now() - startTime,
    }
  } catch (err: any) {
    return {
      success: false,
      outputPath: options.outputPath || '',
      originalTotalSize: 0,
      newSize: 0,
      pageCount: 0,
      durationMs: Date.now() - startTime,
      error: err.message || 'Falha ao gerar PDF',
    }
  }
}
