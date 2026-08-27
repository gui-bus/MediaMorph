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

export interface SavePdfPagesOptions {
  pdfPath: string
  pages: Array<{ pageNumber: number; dataUrl: string }>
  format: 'png' | 'webp' | 'jpeg' | 'avif' | 'tiff'
  quality?: number
  outputPath?: string
}

export interface SavePdfPagesResult {
  success: boolean
  outputDir: string
  outputPaths: string[]
  pageCount: number
  totalOriginalSize: number
  totalNewSize: number
  durationMs: number
  error?: string
}

export interface MergePdfsOptions {
  pdfPaths: string[]
  outputPath?: string
}

export interface SplitPdfOptions {
  pdfPath: string
  range: string
  outputPath?: string
}

export interface CompressPdfOptions {
  pdfPath: string
  pages: Array<{ pageNumber: number; dataUrl: string; width?: number; height?: number }>
  quality?: number
  outputPath?: string
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

export async function savePdfPagesToImages(options: SavePdfPagesOptions): Promise<SavePdfPagesResult> {
  const startTime = Date.now()

  try {
    if (!options.pages || options.pages.length === 0) {
      throw new Error('Nenhuma página renderizada para salvar')
    }

    let origSize = 0
    try {
      const st = await fs.stat(options.pdfPath)
      origSize = st.size
    } catch {}

    const parsedPdf = path.parse(options.pdfPath)
    const targetDir = options.outputPath || path.join(parsedPdf.dir, 'optimized')
    await fs.mkdir(targetDir, { recursive: true })

    const outputPaths: string[] = []
    let totalNewSize = 0
    const ext = options.format.toLowerCase()
    const quality = options.quality || 85

    for (const p of options.pages) {
      const base64Data = p.dataUrl.replace(/^data:image\/\w+;base64,/, '')
      const imageBuffer = Buffer.from(base64Data, 'base64')

      let pipeline = sharp(imageBuffer)

      if (ext === 'png') {
        pipeline = pipeline.png({ compressionLevel: 9 })
      } else if (ext === 'webp') {
        pipeline = pipeline.webp({ quality })
      } else if (ext === 'jpeg' || ext === 'jpg') {
        pipeline = pipeline.jpeg({ quality, mozjpeg: true })
      } else if (ext === 'avif') {
        pipeline = pipeline.avif({ quality })
      } else if (ext === 'tiff') {
        pipeline = pipeline.tiff({ quality })
      }

      const outName = `${parsedPdf.name}_pagina_${String(p.pageNumber).padStart(3, '0')}.${ext}`
      const outPath = path.join(targetDir, outName)

      await pipeline.toFile(outPath)
      const st = await fs.stat(outPath)
      totalNewSize += st.size
      outputPaths.push(outPath)
    }

    return {
      success: true,
      outputDir: targetDir,
      outputPaths,
      pageCount: options.pages.length,
      totalOriginalSize: origSize,
      totalNewSize,
      durationMs: Date.now() - startTime,
    }
  } catch (err: any) {
    return {
      success: false,
      outputDir: '',
      outputPaths: [],
      pageCount: 0,
      totalOriginalSize: 0,
      totalNewSize: 0,
      durationMs: Date.now() - startTime,
      error: err.message || 'Falha ao salvar páginas do PDF como imagem',
    }
  }
}

export async function mergePdfs(options: MergePdfsOptions): Promise<PdfProcessResult> {
  const startTime = Date.now()

  try {
    if (!options.pdfPaths || options.pdfPaths.length < 2) {
      throw new Error('Selecione pelo menos 2 arquivos PDF para mesclar')
    }

    let originalTotalSize = 0
    for (const p of options.pdfPaths) {
      const st = await fs.stat(p)
      originalTotalSize += st.size
    }

    let outputPath = options.outputPath
    if (!outputPath) {
      const firstDir = path.dirname(options.pdfPaths[0])
      outputPath = path.join(firstDir, 'optimized', `pdf_mesclado_${Date.now()}.pdf`)
    }
    await fs.mkdir(path.dirname(outputPath), { recursive: true })

    const mergedPdf = await PDFDocument.create()

    for (const pdfPath of options.pdfPaths) {
      const pdfBytes = await fs.readFile(pdfPath)
      const pdfDoc = await PDFDocument.load(pdfBytes)
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())
      copiedPages.forEach((page) => mergedPdf.addPage(page))
    }

    const finalBytes = await mergedPdf.save()
    await fs.writeFile(outputPath, finalBytes)
    const outStat = await fs.stat(outputPath)

    return {
      success: true,
      outputPath,
      originalTotalSize,
      newSize: outStat.size,
      pageCount: mergedPdf.getPageCount(),
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
      error: err.message || 'Falha ao mesclar PDFs',
    }
  }
}

function parsePageRanges(rangeStr: string, totalPages: number): number[] {
  const indices = new Set<number>()
  const parts = rangeStr.split(',').map((s) => s.trim()).filter(Boolean)

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim())
      const start = parseInt(startStr, 10)
      const end = parseInt(endStr, 10)
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end))
        const max = Math.min(totalPages, Math.max(start, end))
        for (let i = min; i <= max; i++) {
          indices.add(i - 1)
        }
      }
    } else {
      const pageNum = parseInt(part, 10)
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        indices.add(pageNum - 1)
      }
    }
  }

  return Array.from(indices).sort((a, b) => a - b)
}

export async function splitPdf(options: SplitPdfOptions): Promise<PdfProcessResult> {
  const startTime = Date.now()

  try {
    const stat = await fs.stat(options.pdfPath)
    const originalTotalSize = stat.size

    const pdfBytes = await fs.readFile(options.pdfPath)
    const srcDoc = await PDFDocument.load(pdfBytes)
    const totalPages = srcDoc.getPageCount()

    const targetIndices = parsePageRanges(options.range, totalPages)
    if (targetIndices.length === 0) {
      throw new Error(`Intervalo de páginas inválido (${options.range}). O documento possui ${totalPages} páginas.`)
    }

    let outputPath = options.outputPath
    if (!outputPath) {
      const parsed = path.parse(options.pdfPath)
      outputPath = path.join(parsed.dir, 'optimized', `${parsed.name}_paginas_extraidas.pdf`)
    }
    await fs.mkdir(path.dirname(outputPath), { recursive: true })

    const splitDoc = await PDFDocument.create()
    const copiedPages = await splitDoc.copyPages(srcDoc, targetIndices)
    copiedPages.forEach((page) => splitDoc.addPage(page))

    const finalBytes = await splitDoc.save()
    await fs.writeFile(outputPath, finalBytes)
    const outStat = await fs.stat(outputPath)

    return {
      success: true,
      outputPath,
      originalTotalSize,
      newSize: outStat.size,
      pageCount: splitDoc.getPageCount(),
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
      error: err.message || 'Falha ao dividir PDF',
    }
  }
}

export async function compressPdf(options: CompressPdfOptions): Promise<PdfProcessResult> {
  const startTime = Date.now()

  try {
    if (!options.pages || options.pages.length === 0) {
      throw new Error('Nenhuma página renderizada para compressão')
    }

    let originalTotalSize = 0
    try {
      const stat = await fs.stat(options.pdfPath)
      originalTotalSize = stat.size
    } catch {}

    let outputPath = options.outputPath
    if (!outputPath) {
      const parsed = path.parse(options.pdfPath)
      outputPath = path.join(parsed.dir, 'optimized', `${parsed.name}_comprimido.pdf`)
    }
    await fs.mkdir(path.dirname(outputPath), { recursive: true })

    const rawQuality = options.quality || 65
    const quality = Math.max(20, Math.min(rawQuality, 75))
    const maxDim = quality >= 75 ? 1200 : quality >= 60 ? 1000 : 850

    const buildPdf = async (q: number, dim: number): Promise<Buffer> => {
      const pdfDoc = await PDFDocument.create()

      for (const pageItem of options.pages) {
        const base64Data = pageItem.dataUrl.replace(/^data:image\/\w+;base64,/, '')
        const imgBuffer = Buffer.from(base64Data, 'base64')

        const jpegBuffer = await sharp(imgBuffer)
          .resize(dim, dim, { fit: 'inside', withoutEnlargement: true })
          .jpeg({
            quality: q,
            mozjpeg: true,
            progressive: true,
            trellisQuantisation: true,
            overshootDeringing: true,
            optimizeScans: true,
            chromaSubsampling: '4:2:0',
          })
          .toBuffer()

        const embeddedImage = await pdfDoc.embedJpg(jpegBuffer)
        const targetW = pageItem.width || embeddedImage.width
        const targetH = pageItem.height || embeddedImage.height

        const page = pdfDoc.addPage([targetW, targetH])
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: targetW,
          height: targetH,
        })
      }

      const bytes = await pdfDoc.save()
      return Buffer.from(bytes)
    }

    let pdfBuffer = await buildPdf(quality, maxDim)

    if (originalTotalSize > 0 && pdfBuffer.length >= originalTotalSize) {
      const aggressiveBuffer = await buildPdf(Math.min(quality, 50), 750)
      if (aggressiveBuffer.length < pdfBuffer.length) {
        pdfBuffer = aggressiveBuffer
      }
    }

    if (originalTotalSize > 0 && pdfBuffer.length > originalTotalSize) {
      await fs.copyFile(options.pdfPath, outputPath)
    } else {
      await fs.writeFile(outputPath, pdfBuffer)
    }

    const outStat = await fs.stat(outputPath)
    const pageCount = options.pages.length

    return {
      success: true,
      outputPath,
      originalTotalSize,
      newSize: outStat.size,
      pageCount,
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
      error: err.message || 'Falha ao comprimir PDF',
    }
  }
}
