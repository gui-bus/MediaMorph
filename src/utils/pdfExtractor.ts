import * as pdfjsLib from 'pdfjs-dist'

if (typeof Uint8Array !== 'undefined' && !(Uint8Array.prototype as any).toHex) {
  ;(Uint8Array.prototype as any).toHex = function () {
    return Array.from(this)
      .map((b: any) => b.toString(16).padStart(2, '0'))
      .join('')
  }
}

if (typeof Number !== 'undefined' && !(Number.prototype as any).toHex) {
  ;(Number.prototype as any).toHex = function () {
    return this.toString(16)
  }
}

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
}

export interface ExtractedPage {
  pageNumber: number
  dataUrl: string
}

export async function extractPagesFromPdf(
  fileBase64: string,
  scale: number = 2.0,
  onProgress?: (current: number, total: number) => void
): Promise<ExtractedPage[]> {
  const binaryString = atob(fileBase64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  const loadingTask = pdfjsLib.getDocument({
    data: bytes,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
  })

  const pdf = await loadingTask.promise
  const numPages = pdf.numPages
  const pages: ExtractedPage[] = []

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    if (ctx) {
      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise

      const dataUrl = canvas.toDataURL('image/png')
      pages.push({
        pageNumber: i,
        dataUrl,
      })
    }

    if (onProgress) {
      onProgress(i, numPages)
    }
  }

  return pages
}
