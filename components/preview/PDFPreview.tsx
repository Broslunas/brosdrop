"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2, AlertCircle, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react"

interface PDFPreviewProps {
  fileUrl: string
  fileName: string
}

export default function PDFPreview({ fileUrl, fileName }: PDFPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pdf, setPdf] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.5)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfLib, setPdfLib] = useState<any>(null)

  // Load PDF.js library dynamically (client-side only)
  useEffect(() => {
    const loadPdfJs = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
        
        // Configure worker
        // Using unpkg as it's more reliable for specific npm versions
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
        
        setPdfLib(pdfjsLib)
      } catch (err) {
        console.error('Error loading PDF.js:', err)
        setError('Error al cargar el visor de PDF')
        setLoading(false)
      }
    }

    loadPdfJs()
  }, [])

  // Load PDF document
  useEffect(() => {
    if (!pdfLib) return

    const loadPDF = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const loadingTask = pdfLib.getDocument(fileUrl)
        const pdfDoc = await loadingTask.promise
        
        setPdf(pdfDoc)
        setTotalPages(pdfDoc.numPages)
        setLoading(false)
      } catch (err) {
        console.error('Error loading PDF:', err)
        setError('Error al cargar el PDF')
        setLoading(false)
      }
    }

    loadPDF()
  }, [fileUrl, pdfLib])

  // Render current page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdf || !canvasRef.current) return

      try {
        const page = await pdf.getPage(currentPage)
        const viewport = page.getViewport({ scale })
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        if (!context) return

        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        }

        await page.render(renderContext).promise
      } catch (err) {
        console.error('Error rendering page:', err)
      }
    }

    renderPage()
  }, [pdf, currentPage, scale])

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5))
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Cargando PDF...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-950">
        <div className="text-center p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-zinc-400 mb-2">{error}</p>
          <p className="text-sm text-zinc-500">Intenta descargarlo para verlo</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-zinc-950">
      {/* PDF Controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/80 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10">
        {/* Zoom Controls */}
        <button
          onClick={handleZoomOut}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Alejar"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        
        <span className="text-white/80 text-sm font-medium min-w-[4rem] text-center">
          {Math.round(scale * 100)}%
        </span>
        
        <button
          onClick={handleZoomIn}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Acercar"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-white/10 mx-2" />

        {/* Page Navigation */}
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-white/80 text-sm font-medium min-w-[5rem] text-center">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* PDF Canvas */}
      <div className="flex-1 flex items-start justify-center overflow-auto p-8">
        <canvas
          ref={canvasRef}
          className="shadow-2xl rounded-lg"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    </div>
  )
}
