import * as pdfjsLib from 'pdfjs-dist'

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`
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
    cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/cmaps/`,
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
        canvasContext: ctx as any,
        viewport,
        canvas: canvas as any,
      } as any).promise

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
