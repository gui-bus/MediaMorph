import { useState, useEffect, useRef } from 'react'
import {
  MediaTab,
  FileItem,
  ThemeMode,
  ImageGlobalSettings,
  VideoGlobalSettings,
  AudioGlobalSettings,
  PdfGlobalSettings,
  OutputSettingsState,
  LifetimeStats,
  HistoryItem,
} from './types'
import { Header } from './components/Header'
import { DropZone } from './components/DropZone'
import { ImageSettings } from './components/ImageSettings'
import { VideoSettings } from './components/VideoSettings'
import { AudioSettings } from './components/AudioSettings'
import { PdfSettings } from './components/PdfSettings'
import { OutputSettings } from './components/OutputSettings'
import { FileList } from './components/FileList'
import { QueueSummary } from './components/QueueSummary'
import { StatsBanner } from './components/StatsBanner'
import { BeforeAfterModal } from './components/BeforeAfterModal'
import { HistoryDrawer } from './components/HistoryDrawer'
import { FileSettingsModal } from './components/FileSettingsModal'
import { IntegratedFileExplorer } from './components/IntegratedFileExplorer'
import { VideoTrimmerModal } from './components/VideoTrimmerModal'
import { PresetsModal } from './components/PresetsModal'
import { extractPagesFromPdf } from './utils/pdfExtractor'
import { playSuccessSound } from './lib/sound'

const STATS_STORAGE_KEY = 'mediamorph_lifetime_stats'
const HISTORY_STORAGE_KEY = 'mediamorph_history_list'
const THEME_STORAGE_KEY = 'mediamorph_theme_mode'

export function App() {
  const [activeTab, setActiveTab] = useState<MediaTab>('images')
  const [files, setFiles] = useState<FileItem[]>([])
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const isPausedRef = useRef<boolean>(false)

  const [comparingFile, setComparingFile] = useState<FileItem | null>(null)
  const [settingsModalFile, setSettingsModalFile] = useState<FileItem | null>(null)
  const [trimmingFile, setTrimmingFile] = useState<FileItem | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false)
  const [isPresetsOpen, setIsPresetsOpen] = useState<boolean>(false)

  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) || 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return []
  })

  const [lifetimeStats, setLifetimeStats] = useState<LifetimeStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return { totalFiles: 0, totalBytesSaved: 0 }
  })

  const [imageSettings, setImageSettings] = useState<ImageGlobalSettings>({
    format: 'webp',
    quality: 80,
    lossless: false,
    resizeMode: 'none',
    scalePercentage: 100,
    maxWidth: 1920,
    maxHeight: 1080,
    stripMetadata: true,
    watermark: {
      enabled: false,
      type: 'text',
      text: '© MediaMorph',
      fontSize: 32,
      color: '#ffffff',
      opacity: 50,
      position: 'center',
    },
    adjustments: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      sharpen: false,
      rotate: 0,
      flipHorizontal: false,
      flipVertical: false,
      svgScale: 2,
    },
  })

  const [videoSettings, setVideoSettings] = useState<VideoGlobalSettings>({
    format: 'mp4',
    preset: 'balanced',
    crf: 23,
    targetSizeMB: 25,
    resolution: 'original',
    muteAudio: false,
    speed: 1,
    gpu: 'auto',
    crop: 'keep',
    audioExtractFormat: 'mp3',
  })

  const [audioSettings, setAudioSettings] = useState<AudioGlobalSettings>({
    format: 'mp3',
    bitrate: '192k',
    channels: 'stereo',
    normalizeVolume: true,
  })

  const [pdfSettings, setPdfSettings] = useState<PdfGlobalSettings>({
    mode: 'images_to_pdf',
    pageSize: 'fit_image',
    quality: 85,
    customPdfName: '',
    extractFormat: 'webp',
    extractScale: 2,
    extractQuality: 85,
    compressQuality: 80,
    splitRange: '',
  })

  const [outputSettings, setOutputSettings] = useState<OutputSettingsState>({
    mode: 'same_directory',
    customPath: '',
    namingPattern: 'original',
    customNamingPattern: '{name}_optimized',
  })

  useEffect(() => {
    if (!(window as any).electronAPI) return

    const unsubscribe = (window as any).electronAPI.onVideoProgress((data: any) => {
      setFiles((prev) =>
        prev.map((item) => {
          if (item.id === data.jobId) {
            return {
              ...item,
              progress: data.percent,
              timemark: data.timemark,
            }
          }
          return item
        })
      )
    })

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [])

  const addHistoryItems = (newItems: HistoryItem[]) => {
    setHistory((prev) => {
      const updated = [...newItems, ...prev].slice(0, 100)
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated))
      } catch {}
      return updated
    })
  }

  const updateLifetimeStats = (savedBytes: number, fileCount: number) => {
    setLifetimeStats((prev) => {
      const updated = {
        totalFiles: prev.totalFiles + fileCount,
        totalBytesSaved: prev.totalBytesSaved + savedBytes,
      }
      try {
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(updated))
      } catch {}
      return updated
    })
  }

  const handleFilesSelected = (newFiles: any[]) => {
    const formatted: FileItem[] = newFiles.map((f) => ({
      id: f.id || `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: f.name,
      path: f.path,
      size: f.size,
      ext: f.ext,
      isImage: f.isImage,
      isVideo: f.isVideo,
      isAudio: f.isAudio,
      isPdf: f.isPdf,
      thumbnail: f.thumbnail,
      status: f.status || 'idle',
      progress: f.progress || 0,
      customSettings: f.customSettings,
      result: f.result,
    }))

    setFiles((prev) => {
      const existingPaths = new Set(prev.map((f) => f.path))
      const unique = formatted.filter((f) => !existingPaths.has(f.path))
      return [...prev, ...unique]
    })
  }

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleClearCompleted = () => {
    setFiles((prev) => prev.filter((f) => f.status !== 'completed'))
  }

  const handleClearAll = () => {
    setFiles((prev) => prev.filter((f) => f.status === 'processing'))
  }

  const handleOpenGlobalTrimmer = () => {
    const videoFiles = files.filter((f) => f.isVideo)
    if (videoFiles.length > 0) {
      setTrimmingFile(videoFiles[0])
    }
  }

  const handleTogglePause = () => {
    const next = !isPaused
    setIsPaused(next)
    isPausedRef.current = next
  }

  const buildCustomOutputPath = (inputPath: string, targetExt: string, counterIndex: number = 1): string | undefined => {
    const parsed = (window as any).path ? (window as any).path.parse(inputPath) : {
      dir: inputPath.substring(0, inputPath.lastIndexOf('\\')),
      name: inputPath.substring(inputPath.lastIndexOf('\\') + 1, inputPath.lastIndexOf('.')),
    }

    const baseDir =
      outputSettings.mode === 'custom_directory' && outputSettings.customPath
        ? outputSettings.customPath
        : (window as any).path
        ? (window as any).path.join(parsed.dir, 'optimized')
        : `${parsed.dir}\\optimized`

    const cleanExt = targetExt.startsWith('.') ? targetExt.substring(1) : targetExt
    const dateStr = new Date().toISOString().split('T')[0]
    const counterStr = String(counterIndex).padStart(2, '0')

    let baseName = parsed.name
    const pattern = outputSettings.namingPattern || 'original'

    if (pattern === '{name}_optimized') {
      baseName = `${parsed.name}_optimized`
    } else if (pattern === '{name}_{date}') {
      baseName = `${parsed.name}_${dateStr}`
    } else if (pattern === '{counter}_{name}') {
      baseName = `${counterStr}_${parsed.name}`
    } else if (pattern === 'custom' && outputSettings.customNamingPattern) {
      baseName = outputSettings.customNamingPattern
        .replace(/\{name\}/g, parsed.name)
        .replace(/\{date\}/g, dateStr)
        .replace(/\{counter\}/g, counterStr)
        .replace(/\{ext\}/g, cleanExt)
    }

    const fileName = `${baseName}.${cleanExt}`
    return (window as any).path ? (window as any).path.join(baseDir, fileName) : `${baseDir}\\${fileName}`
  }

  const handleStartProcess = async () => {
    if (isProcessing) return
    setIsProcessing(true)
    setIsPaused(false)
    isPausedRef.current = false

    const pending = files.filter((f) => f.status === 'idle' || f.status === 'error')
    if (pending.length === 0) {
      setIsProcessing(false)
      return
    }

    let batchSavedBytes = 0
    let batchCompletedCount = 0
    const newHistoryItems: HistoryItem[] = []

    if (activeTab === 'pdf') {
      if (pdfSettings.mode === 'images_to_pdf') {
        const imagePaths = files.map((f) => f.path)

        setFiles((prev) =>
          prev.map((f) => ({ ...f, status: 'processing', progress: 50 }))
        )

        try {
          const firstDir = files[0].path.substring(0, files[0].path.lastIndexOf('\\'))
          const customName = pdfSettings.customPdfName?.trim()
            ? pdfSettings.customPdfName.endsWith('.pdf')
              ? pdfSettings.customPdfName
              : `${pdfSettings.customPdfName}.pdf`
            : `documento_compilado_${Date.now()}.pdf`

          const targetDir =
            outputSettings.mode === 'custom_directory' && outputSettings.customPath
              ? outputSettings.customPath
              : `${firstDir}\\optimized`

          const targetOut = `${targetDir}\\${customName}`

          const result = await (window as any).electronAPI.imagesToPdf({
            imagePaths,
            outputPath: targetOut,
            quality: pdfSettings.quality,
            pageSize: pdfSettings.pageSize,
          })

          if (result.success) {
            batchCompletedCount = files.length
            batchSavedBytes = Math.max(0, result.originalTotalSize - result.newSize)

            setFiles((prev) =>
              prev.map((f) => ({
                ...f,
                status: 'completed',
                progress: 100,
                result: {
                  outputPath: result.outputPath,
                  newSize: result.newSize,
                  savedBytes: Math.max(0, result.originalTotalSize - result.newSize),
                  savingsPercent:
                    result.originalTotalSize > 0
                      ? Number((((result.originalTotalSize - result.newSize) / result.originalTotalSize) * 100).toFixed(1))
                      : 0,
                  durationMs: result.durationMs,
                },
              }))
            )

            newHistoryItems.push({
              id: `hist_${Date.now()}`,
              name: `Compilação de ${imagePaths.length} imagens ➔ PDF`,
              originalSize: result.originalTotalSize,
              newSize: result.newSize,
              savingsPercent:
                result.originalTotalSize > 0
                  ? Number((((result.originalTotalSize - result.newSize) / result.originalTotalSize) * 100).toFixed(1))
                  : 0,
              outputPath: result.outputPath,
              type: 'pdf',
              timestamp: Date.now(),
            })
          } else {
            setFiles((prev) =>
              prev.map((f) => ({ ...f, status: 'error', error: result.error || 'Falha ao compilar PDF' }))
            )
          }
        } catch (err: any) {
          setFiles((prev) =>
            prev.map((f) => ({ ...f, status: 'error', error: err.message || 'Erro ao gerar PDF' }))
          )
        }
      } else if (pdfSettings.mode === 'merge_split_pdf') {
        const pdfItems = files.filter((f) => f.isPdf)

        if (pdfSettings.splitRange && pdfSettings.splitRange.trim()) {
          for (const item of pdfItems) {
            setFiles((prev) =>
              prev.map((f) => (f.id === item.id ? { ...f, status: 'processing', progress: 50 } : f))
            )
            try {
              const splitRes = await (window as any).electronAPI.splitPdf({
                pdfPath: item.path,
                range: pdfSettings.splitRange.trim(),
                outputPath: outputSettings.mode === 'custom_directory' && outputSettings.customPath ? outputSettings.customPath : undefined,
              })

              if (splitRes.success) {
                batchCompletedCount += 1
                setFiles((prev) =>
                  prev.map((f) =>
                    f.id === item.id
                      ? {
                          ...f,
                          status: 'completed',
                          progress: 100,
                          result: {
                            outputPath: splitRes.outputPath,
                            newSize: splitRes.newSize,
                            savedBytes: 0,
                            savingsPercent: 0,
                            durationMs: splitRes.durationMs,
                          },
                        }
                      : f
                  )
                )

                newHistoryItems.push({
                  id: `hist_${Date.now()}_${item.id}`,
                  name: `Divisão de PDF (${pdfSettings.splitRange}) ➔ ${item.name}`,
                  originalSize: splitRes.originalTotalSize,
                  newSize: splitRes.newSize,
                  savingsPercent: 0,
                  outputPath: splitRes.outputPath,
                  type: 'pdf',
                  timestamp: Date.now(),
                })
              } else {
                setFiles((prev) =>
                  prev.map((f) => (f.id === item.id ? { ...f, status: 'error', error: splitRes.error } : f))
                )
              }
            } catch (err: any) {
              setFiles((prev) =>
                prev.map((f) => (f.id === item.id ? { ...f, status: 'error', error: err.message } : f))
              )
            }
          }
        } else if (pdfItems.length >= 2) {
          setFiles((prev) => prev.map((f) => ({ ...f, status: 'processing', progress: 50 })))
          try {
            const firstDir = pdfItems[0].path.substring(0, pdfItems[0].path.lastIndexOf('\\'))
            const customName = pdfSettings.customPdfName?.trim()
              ? pdfSettings.customPdfName.endsWith('.pdf') ? pdfSettings.customPdfName : `${pdfSettings.customPdfName}.pdf`
              : `pdf_mesclado_${Date.now()}.pdf`
            const targetOut = outputSettings.mode === 'custom_directory' && outputSettings.customPath
              ? `${outputSettings.customPath}\\${customName}`
              : `${firstDir}\\optimized\\${customName}`

            const mergeRes = await (window as any).electronAPI.mergePdfs({
              pdfPaths: pdfItems.map((p) => p.path),
              outputPath: targetOut,
            })

            if (mergeRes.success) {
              batchCompletedCount = pdfItems.length
              setFiles((prev) =>
                prev.map((f) => ({
                  ...f,
                  status: 'completed',
                  progress: 100,
                  result: {
                    outputPath: mergeRes.outputPath,
                    newSize: mergeRes.newSize,
                    savedBytes: 0,
                    savingsPercent: 0,
                    durationMs: mergeRes.durationMs,
                  },
                }))
              )
              newHistoryItems.push({
                id: `hist_${Date.now()}`,
                name: `Mesclagem de ${pdfItems.length} PDFs em documento único`,
                originalSize: mergeRes.originalTotalSize,
                newSize: mergeRes.newSize,
                savingsPercent: 0,
                outputPath: mergeRes.outputPath,
                type: 'pdf',
                timestamp: Date.now(),
              })
            } else {
              setFiles((prev) => prev.map((f) => ({ ...f, status: 'error', error: mergeRes.error })))
            }
          } catch (err: any) {
            setFiles((prev) => prev.map((f) => ({ ...f, status: 'error', error: err.message })))
          }
        }
      } else {
        for (const item of pending) {
          setFiles((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, status: 'processing', progress: 5 } : f))
          )

          try {
            const base64 = await (window as any).electronAPI.readFileBase64(item.path)
            if (!base64) throw new Error('Não foi possível ler o arquivo PDF')

            const pages = await extractPagesFromPdf(
              base64,
              pdfSettings.extractScale || 2,
              (curr, tot) => {
                setFiles((prev) =>
                  prev.map((f) =>
                    f.id === item.id
                      ? { ...f, progress: Math.min(85, Math.round((curr / tot) * 80)) }
                      : f
                  )
                )
              }
            )

            const saveResult = await (window as any).electronAPI.savePdfPages({
              pdfPath: item.path,
              pages,
              format: pdfSettings.extractFormat,
              quality: pdfSettings.extractQuality,
              outputPath:
                outputSettings.mode === 'custom_directory' && outputSettings.customPath
                  ? outputSettings.customPath
                  : undefined,
            })

            if (saveResult.success) {
              batchCompletedCount += 1
              const savedBytes = Math.max(0, saveResult.totalOriginalSize - saveResult.totalNewSize)
              batchSavedBytes += savedBytes

              setFiles((prev) =>
                prev.map((f) => {
                  if (f.id === item.id) {
                    return {
                      ...f,
                      status: 'completed',
                      progress: 100,
                      result: {
                        outputPath: saveResult.outputDir,
                        newSize: saveResult.totalNewSize,
                        savedBytes,
                        savingsPercent: 0,
                        durationMs: saveResult.durationMs,
                      },
                    }
                  }
                  return f
                })
              )

              newHistoryItems.push({
                id: `hist_${Date.now()}_${item.id}`,
                name: `${item.name} ➔ ${saveResult.pageCount} imagens (.${pdfSettings.extractFormat})`,
                originalSize: saveResult.totalOriginalSize,
                newSize: saveResult.totalNewSize,
                savingsPercent: 0,
                outputPath: saveResult.outputDir,
                type: 'pdf',
                timestamp: Date.now(),
              })
            } else {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === item.id
                    ? { ...f, status: 'error', error: saveResult.error || 'Falha ao salvar imagens' }
                    : f
                )
              )
            }
          } catch (err: any) {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === item.id
                  ? { ...f, status: 'error', error: err.message || 'Falha ao extrair páginas do PDF' }
                  : f
              )
            )
          }
        }
      }

      setIsProcessing(false)
      if (batchCompletedCount > 0) {
        playSuccessSound()
        updateLifetimeStats(batchSavedBytes, batchCompletedCount)
        addHistoryItems(newHistoryItems)
        if ((window as any).electronAPI?.notify) {
          ;(window as any).electronAPI.notify(
            'MediaMorph',
            pdfSettings.mode === 'images_to_pdf'
              ? 'PDF gerado com sucesso!'
              : 'Operação de PDF concluída com sucesso!'
          )
        }
      }
      return
    }

    let fileIndex = 1
    for (const item of pending) {
      while (isPausedRef.current) {
        await new Promise((r) => setTimeout(r, 200))
      }

      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'processing', progress: 0 } : f))
      )

      try {
        if (item.isImage) {
          const targetFormat = (item.customSettings?.format || imageSettings.format) as any
          const targetQuality = item.customSettings?.quality || imageSettings.quality
          const ext = targetFormat === 'jpeg' ? 'jpg' : targetFormat
          const customOut = buildCustomOutputPath(item.path, ext, fileIndex++)

          const result = await (window as any).electronAPI.processImage({
            inputPath: item.path,
            outputPath: customOut,
            format: targetFormat,
            quality: targetQuality,
            lossless: imageSettings.lossless,
            resizeMode: imageSettings.resizeMode,
            scalePercentage: imageSettings.scalePercentage,
            maxWidth: imageSettings.maxWidth,
            maxHeight: imageSettings.maxHeight,
            stripMetadata: imageSettings.stripMetadata,
            watermark: imageSettings.watermark,
            adjustments: imageSettings.adjustments,
          })

          setFiles((prev) =>
            prev.map((f) => {
              if (f.id === item.id) {
                if (result.success) {
                  batchSavedBytes += result.savedBytes || 0
                  batchCompletedCount += 1
                  newHistoryItems.push({
                    id: `hist_${Date.now()}_${Math.random()}`,
                    name: item.name,
                    originalSize: result.originalSize,
                    newSize: result.newSize,
                    savingsPercent: result.savingsPercent,
                    outputPath: result.outputPath,
                    type: 'image',
                    timestamp: Date.now(),
                  })
                  return {
                    ...f,
                    status: 'completed',
                    progress: 100,
                    result: {
                      outputPath: result.outputPath,
                      newSize: result.newSize,
                      savedBytes: result.savedBytes,
                      savingsPercent: result.savingsPercent,
                      durationMs: result.durationMs,
                    },
                  }
                } else {
                  return { ...f, status: 'error', error: result.error || 'Falha ao processar imagem' }
                }
              }
              return f
            })
          )
        } else if (item.isVideo) {
          const isAudioExtract = videoSettings.format === 'mp3' || videoSettings.preset === 'extract_audio'
          const ext = isAudioExtract ? (videoSettings.audioExtractFormat || 'mp3') : videoSettings.format
          const customOut = buildCustomOutputPath(item.path, ext, fileIndex++)

          const result = await (window as any).electronAPI.processVideo({
            jobId: item.id,
            inputPath: item.path,
            outputPath: customOut,
            format: videoSettings.format,
            preset: videoSettings.preset,
            crf: videoSettings.crf,
            targetSizeMB: videoSettings.targetSizeMB,
            resolution: videoSettings.resolution,
            muteAudio: videoSettings.muteAudio,
            fps: videoSettings.fps,
            speed: videoSettings.speed,
            gpu: videoSettings.gpu,
            crop: videoSettings.crop,
            audioExtractFormat: videoSettings.audioExtractFormat,
            trimStart: videoSettings.trimStart,
            trimEnd: videoSettings.trimEnd,
          })

          setFiles((prev) =>
            prev.map((f) => {
              if (f.id === item.id) {
                if (result.success) {
                  batchSavedBytes += result.savedBytes || 0
                  batchCompletedCount += 1
                  newHistoryItems.push({
                    id: `hist_${Date.now()}_${Math.random()}`,
                    name: item.name,
                    originalSize: result.originalSize,
                    newSize: result.newSize,
                    savingsPercent: result.savingsPercent,
                    outputPath: result.outputPath,
                    type: 'video',
                    timestamp: Date.now(),
                  })
                  return {
                    ...f,
                    status: 'completed',
                    progress: 100,
                    result: {
                      outputPath: result.outputPath,
                      newSize: result.newSize,
                      savedBytes: result.savedBytes,
                      savingsPercent: result.savingsPercent,
                      durationMs: result.durationMs,
                    },
                  }
                } else {
                  return { ...f, status: 'error', error: result.error || 'Falha ao processar vídeo' }
                }
              }
              return f
            })
          )
        } else if (item.isAudio) {
          const ext = audioSettings.format
          const customOut = buildCustomOutputPath(item.path, ext, fileIndex++)

          const result = await (window as any).electronAPI.processAudio({
            jobId: item.id,
            inputPath: item.path,
            outputPath: customOut,
            format: audioSettings.format,
            bitrate: audioSettings.bitrate,
            channels: audioSettings.channels,
            normalizeVolume: audioSettings.normalizeVolume,
          })

          setFiles((prev) =>
            prev.map((f) => {
              if (f.id === item.id) {
                if (result.success) {
                  batchSavedBytes += result.savedBytes || 0
                  batchCompletedCount += 1
                  newHistoryItems.push({
                    id: `hist_${Date.now()}_${Math.random()}`,
                    name: item.name,
                    originalSize: result.originalSize,
                    newSize: result.newSize,
                    savingsPercent: result.savingsPercent,
                    outputPath: result.outputPath,
                    type: 'audio',
                    timestamp: Date.now(),
                  })
                  return {
                    ...f,
                    status: 'completed',
                    progress: 100,
                    result: {
                      outputPath: result.outputPath,
                      newSize: result.newSize,
                      savedBytes: result.savedBytes,
                      savingsPercent: result.savingsPercent,
                      durationMs: result.durationMs,
                    },
                  }
                } else {
                  return { ...f, status: 'error', error: result.error || 'Falha ao processar áudio' }
                }
              }
              return f
            })
          )
        }
      } catch (err: any) {
        setFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: 'error', error: err.message || 'Erro inesperado' } : f))
        )
      }
    }

    setIsProcessing(false)
    setIsPaused(false)
    isPausedRef.current = false

    if (batchCompletedCount > 0) {
      playSuccessSound()
      updateLifetimeStats(batchSavedBytes, batchCompletedCount)
      addHistoryItems(newHistoryItems)
      if ((window as any).electronAPI?.notify) {
        ;(window as any).electronAPI.notify(
          'MediaMorph',
          `Conversão de ${batchCompletedCount} arquivo(s) concluída com sucesso!`
        )
      }
    }
  }

  const filteredFiles = files.filter((f) => {
    if (activeTab === 'images') return f.isImage
    if (activeTab === 'videos') return f.isVideo
    if (activeTab === 'audio') return f.isAudio
    if (activeTab === 'pdf') {
      if (pdfSettings.mode === 'images_to_pdf') return f.isImage
      return f.isPdf
    }
    return true
  })

  const handleApplyPreset = (presetSettings: any) => {
    if (activeTab === 'images') setImageSettings(presetSettings)
    else if (activeTab === 'videos') setVideoSettings(presetSettings)
    else if (activeTab === 'audio') setAudioSettings(presetSettings)
    else if (activeTab === 'pdf') setPdfSettings(presetSettings)
  }

  const getCurrentTabSettings = () => {
    if (activeTab === 'images') return imageSettings
    if (activeTab === 'videos') return videoSettings
    if (activeTab === 'audio') return audioSettings
    return pdfSettings
  }

  return (
    <div className="min-h-screen bg-background text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalCount={filteredFiles.length}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 space-y-6 pb-12">
        <StatsBanner stats={lifetimeStats} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 xl:col-span-3 space-y-5">
            <IntegratedFileExplorer onAddFiles={handleFilesSelected} />
          </div>

          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            <DropZone
              activeTab={activeTab}
              onFilesSelected={handleFilesSelected}
              disabled={isProcessing}
            />

            {activeTab === 'images' && (
              <ImageSettings
                settings={imageSettings}
                onChange={setImageSettings}
                disabled={isProcessing}
              />
            )}

            {activeTab === 'videos' && (
              <VideoSettings
                settings={videoSettings}
                onChange={setVideoSettings}
                onOpenTrimmer={handleOpenGlobalTrimmer}
                disabled={isProcessing}
              />
            )}

            {activeTab === 'audio' && (
              <AudioSettings
                settings={audioSettings}
                onChange={setAudioSettings}
                disabled={isProcessing}
              />
            )}

            {activeTab === 'pdf' && (
              <PdfSettings
                settings={pdfSettings}
                onChange={setPdfSettings}
                disabled={isProcessing}
              />
            )}

            <OutputSettings
              settings={outputSettings}
              onChange={setOutputSettings}
              disabled={isProcessing}
            />

            <FileList
              files={filteredFiles}
              activeTab={activeTab}
              onRemove={handleRemoveFile}
              onCompare={(file: FileItem) => setComparingFile(file)}
              onOpenSettings={(file: FileItem) => setSettingsModalFile(file)}
              onOpenTrimmer={(file: FileItem) => setTrimmingFile(file)}
              disabled={isProcessing}
            />

            {filteredFiles.length > 0 && (
              <div className="sticky bottom-4 z-20 pt-2">
                <QueueSummary
                  files={filteredFiles}
                  activeTab={activeTab}
                  pdfMode={pdfSettings.mode}
                  isProcessing={isProcessing}
                  isPaused={isPaused}
                  onTogglePause={handleTogglePause}
                  onStartProcess={handleStartProcess}
                  onClearCompleted={handleClearCompleted}
                  onClearAll={handleClearAll}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {comparingFile && comparingFile.result && (
        <BeforeAfterModal
          originalPath={comparingFile.path}
          outputPath={comparingFile.result.outputPath}
          originalSize={comparingFile.size}
          newSize={comparingFile.result.newSize}
          savingsPercent={comparingFile.result.savingsPercent}
          onClose={() => setComparingFile(null)}
        />
      )}

      {settingsModalFile && (
        <FileSettingsModal
          file={settingsModalFile}
          onClose={() => setSettingsModalFile(null)}
          onSave={(id: string, customSettings?: { format?: string; quality?: number }) => {
            setFiles((prev) =>
              prev.map((f) => (f.id === id ? { ...f, customSettings } : f))
            )
            setSettingsModalFile(null)
          }}
        />
      )}

      {trimmingFile && (
        <VideoTrimmerModal
          filePath={trimmingFile.path}
          fileName={trimmingFile.name}
          initialTrimStart={videoSettings.trimStart}
          initialTrimEnd={videoSettings.trimEnd}
          onClose={() => setTrimmingFile(null)}
          onSave={(start?: string, end?: string) => {
            setVideoSettings((prev) => ({
              ...prev,
              trimStart: start,
              trimEnd: end,
            }))
            setTrimmingFile(null)
          }}
        />
      )}

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={() => {
          setHistory([])
          try {
            localStorage.removeItem(HISTORY_STORAGE_KEY)
          } catch {}
        }}
      />

      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        activeTab={activeTab}
        currentSettings={getCurrentTabSettings()}
        onApplyPreset={handleApplyPreset}
      />
    </div>
  )
}
