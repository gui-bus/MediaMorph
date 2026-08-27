import React, { useState, useEffect } from 'react'
import {
  MediaTab,
  ThemeMode,
  FileItem,
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
import { extractPagesFromPdf } from './utils/pdfExtractor'
import { playSuccessSound } from './lib/sound'

const STATS_STORAGE_KEY = 'mediamorph_lifetime_stats'
const HISTORY_STORAGE_KEY = 'mediamorph_history_list'
const THEME_STORAGE_KEY = 'mediamorph_theme_mode'

export function App() {
  const [activeTab, setActiveTab] = useState<MediaTab>('images')
  const [files, setFiles] = useState<FileItem[]>([])
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [comparingFile, setComparingFile] = useState<FileItem | null>(null)
  const [settingsModalFile, setSettingsModalFile] = useState<FileItem | null>(null)
  const [trimmingFile, setTrimmingFile] = useState<FileItem | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false)

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
  })

  const [videoSettings, setVideoSettings] = useState<VideoGlobalSettings>({
    format: 'mp4',
    preset: 'balanced',
    crf: 23,
    targetSizeMB: 25,
    resolution: 'original',
    muteAudio: false,
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
  })

  const [outputSettings, setOutputSettings] = useState<OutputSettingsState>({
    mode: 'same_directory',
    customPath: '',
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

  const handleClearHistory = () => {
    setHistory([])
    localStorage.removeItem(HISTORY_STORAGE_KEY)
  }

  const updateLifetimeStats = (newSavedBytes: number, newFilesCount: number) => {
    setLifetimeStats((prev) => {
      const updated = {
        totalFiles: prev.totalFiles + newFilesCount,
        totalBytesSaved: prev.totalBytesSaved + newSavedBytes,
      }
      try {
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(updated))
      } catch {}
      return updated
    })
  }

  const handleFilesSelected = (newFiles: Array<any>) => {
    setFiles((prev) => {
      const existingPaths = new Set(prev.map((f) => f.path))
      const toAdd: FileItem[] = newFiles
        .filter((f) => !existingPaths.has(f.path))
        .map((f) => ({
          id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          name: f.name,
          path: f.path,
          size: f.size,
          ext: f.ext,
          isImage: !!f.isImage,
          isVideo: !!f.isVideo,
          isAudio: !!f.isAudio,
          isPdf: !!f.isPdf,
          thumbnail: f.thumbnail,
          status: 'idle',
          progress: 0,
        }))
      return [...prev, ...toAdd]
    })
  }

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleClearCompleted = () => {
    setFiles((prev) => prev.filter((f) => f.status !== 'completed'))
  }

  const handleClearAll = () => {
    setFiles([])
  }

  const handleSaveIndividualSettings = (
    id: string,
    customSettings?: { format?: string; quality?: number }
  ) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, customSettings } : f))
    )
  }

  const handleSaveTrim = (trimStart?: string, trimEnd?: string) => {
    if (trimmingFile) {
      setVideoSettings((prev) => ({ ...prev, trimStart, trimEnd }))
    }
  }

  const handleOpenGlobalTrimmer = () => {
    const firstVideo = files.find((f) => f.isVideo)
    if (firstVideo) {
      setTrimmingFile(firstVideo)
    } else {
      if ((window as any).electronAPI) {
        ;(window as any).electronAPI.selectFiles('videos').then((selected: any[]) => {
          if (selected && selected.length > 0) {
            handleFilesSelected(selected)
            const newItem: FileItem = {
              id: `${Date.now()}`,
              name: selected[0].name,
              path: selected[0].path,
              size: selected[0].size,
              ext: selected[0].ext,
              isImage: false,
              isVideo: true,
              isAudio: false,
              thumbnail: selected[0].thumbnail,
              status: 'idle',
              progress: 0,
            }
            setTrimmingFile(newItem)
          }
        })
      }
    }
  }

  const buildCustomOutputPath = (inputPath: string, targetExt: string) => {
    if (outputSettings.mode !== 'custom_directory' || !outputSettings.customPath) {
      return undefined
    }
    const parts = inputPath.split(/[\/\\]/)
    const fileNameWithExt = parts[parts.length - 1]
    const lastDot = fileNameWithExt.lastIndexOf('.')
    const baseName = lastDot !== -1 ? fileNameWithExt.substring(0, lastDot) : fileNameWithExt
    const sep = outputSettings.customPath.includes('\\') || inputPath.includes('\\') ? '\\' : '/'
    return `${outputSettings.customPath}${sep}${baseName}.${targetExt}`
  }

  const handleStartProcess = async () => {
    if (isProcessing) return
    if (!(window as any).electronAPI) return

    const pending = files.filter((f) => f.status === 'idle' || f.status === 'error')
    if (pending.length === 0) return

    setIsProcessing(true)
    let batchSavedBytes = 0
    let batchCompletedCount = 0
    const newHistoryItems: HistoryItem[] = []

    if (activeTab === 'pdf') {
      if (pdfSettings.mode === 'images_to_pdf') {
        const imageFiles = pending.filter((f) => f.isImage)
        if (imageFiles.length > 0) {
          setFiles((prev) =>
            prev.map((f) => (imageFiles.some((img) => img.id === f.id) ? { ...f, status: 'processing', progress: 50 } : f))
          )

          let customOut: string | undefined = undefined
          if (pdfSettings.customPdfName && pdfSettings.customPdfName.trim()) {
            const rawName = pdfSettings.customPdfName.trim()
            const pdfName = rawName.endsWith('.pdf') ? rawName : `${rawName}.pdf`
            if (outputSettings.mode === 'custom_directory' && outputSettings.customPath) {
              customOut = `${outputSettings.customPath}\\${pdfName}`
            } else {
              const firstDir = imageFiles[0].path.substring(0, imageFiles[0].path.lastIndexOf('\\'))
              customOut = `${firstDir}\\optimized\\${pdfName}`
            }
          }

          const pdfResult = await (window as any).electronAPI.imagesToPdf({
            imagePaths: imageFiles.map((f) => f.path),
            outputPath: customOut,
            quality: pdfSettings.quality,
            pageSize: pdfSettings.pageSize,
          })

          if (pdfResult.success) {
            batchCompletedCount += imageFiles.length
            const savedBytes = Math.max(0, pdfResult.originalTotalSize - pdfResult.newSize)
            batchSavedBytes += savedBytes

            setFiles((prev) =>
              prev.map((f) => {
                if (imageFiles.some((img) => img.id === f.id)) {
                  return {
                    ...f,
                    status: 'completed',
                    progress: 100,
                    result: {
                      outputPath: pdfResult.outputPath,
                      newSize: pdfResult.newSize,
                      savedBytes,
                      savingsPercent: 0,
                      durationMs: pdfResult.durationMs,
                    },
                  }
                }
                return f
              })
            )

            newHistoryItems.push({
              id: `hist_${Date.now()}`,
              name: `PDF Compilado (${pdfResult.pageCount} páginas)`,
              originalSize: pdfResult.originalTotalSize,
              newSize: pdfResult.newSize,
              savingsPercent: 0,
              outputPath: pdfResult.outputPath,
              type: 'pdf',
              timestamp: Date.now(),
            })
          }
        }
      } else {
        const pdfFiles = pending.filter((f) => f.isPdf || f.ext.toLowerCase() === '.pdf')
        for (const item of pdfFiles) {
          setFiles((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, status: 'processing', progress: 10 } : f))
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
              : 'Páginas do PDF extraídas com sucesso!'
          )
        }
      }
      return
    }

    for (const item of pending) {
      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'processing', progress: 0 } : f))
      )

      try {
        if (item.isImage) {
          const targetFormat = (item.customSettings?.format || imageSettings.format) as any
          const targetQuality = item.customSettings?.quality || imageSettings.quality
          const ext = targetFormat === 'jpeg' ? 'jpg' : targetFormat
          const customOut = buildCustomOutputPath(item.path, ext)

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
          })

          setFiles((prev) =>
            prev.map((f) => {
              if (f.id === item.id) {
                if (result.success) {
                  batchSavedBytes += result.savedBytes || 0
                  batchCompletedCount += 1
                  newHistoryItems.push({
                    id: `hist_${Date.now()}_${Math.random()}`,
                    name: f.name,
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
                  return { ...f, status: 'error', error: result.error || 'Falha ao processar' }
                }
              }
              return f
            })
          )
        } else if (item.isVideo) {
          const targetFormat = (item.customSettings?.format || videoSettings.format) as any
          const ext = targetFormat === 'mp3' ? 'mp3' : targetFormat
          const customOut = buildCustomOutputPath(item.path, ext)

          const result = await (window as any).electronAPI.processVideo({
            jobId: item.id,
            inputPath: item.path,
            outputPath: customOut,
            format: targetFormat,
            preset: videoSettings.preset,
            crf: videoSettings.crf,
            targetSizeMB: videoSettings.targetSizeMB,
            resolution: videoSettings.resolution,
            muteAudio: videoSettings.muteAudio,
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
                    name: f.name,
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
          const customOut = buildCustomOutputPath(item.path, ext)

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
                    name: f.name,
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
        } else if (item.isPdf) {
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
        }
      } catch (err: any) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: 'error', error: err.message || 'Erro' } : f
          )
        )
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
          `Processamento concluído para ${batchCompletedCount} item(ns)!`
        )
      }
    }
  }

  const filteredFiles = files.filter((f) => {
    if (activeTab === 'images') return f.isImage || f.isPdf
    if (activeTab === 'videos') return f.isVideo
    if (activeTab === 'audio') return f.isAudio
    if (activeTab === 'pdf') return f.isImage || f.isPdf
    return true
  })

  return (
    <div className="min-h-screen bg-background text-gray-900 dark:text-gray-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalCount={filteredFiles.length}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 space-y-6 pb-28">
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
          </div>
        </div>
      </main>

      {filteredFiles.length > 0 && (
        <footer className="fixed bottom-6 left-0 right-0 max-w-[1700px] mx-auto px-5 sm:px-6 pointer-events-none z-30">
          <div className="pointer-events-auto">
            <QueueSummary
              files={filteredFiles}
              activeTab={activeTab}
              pdfMode={pdfSettings.mode}
              isProcessing={isProcessing}
              onStartProcess={handleStartProcess}
              onClearCompleted={handleClearCompleted}
              onClearAll={handleClearAll}
            />
          </div>
        </footer>
      )}

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
          onSave={handleSaveIndividualSettings}
        />
      )}

      {trimmingFile && (
        <VideoTrimmerModal
          filePath={trimmingFile.path}
          fileName={trimmingFile.name}
          initialTrimStart={videoSettings.trimStart}
          initialTrimEnd={videoSettings.trimEnd}
          onClose={() => setTrimmingFile(null)}
          onSave={handleSaveTrim}
        />
      )}

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
      />
    </div>
  )
}
