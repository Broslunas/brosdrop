"use client"

import { useState } from "react"
import { ZoomIn, ZoomOut, RotateCw, Maximize2 } from "lucide-react"
import { motion } from "framer-motion"

interface ImagePreviewProps {
  fileUrl: string
  fileName: string
}

export default function ImagePreview({ fileUrl, fileName }: ImagePreviewProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)
  const handleReset = () => {
    setZoom(1)
    setRotation(0)
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-zinc-950">
      {/* Image Controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10">
        <button
          onClick={handleZoomOut}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Alejar"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        
        <span className="text-white/80 text-sm font-medium min-w-[4rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        
        <button
          onClick={handleZoomIn}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Acercar"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-white/10 mx-1" />
        
        <button
          onClick={handleRotate}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Rotar"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleReset}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
          title="Resetear"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Image Container */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <motion.img
          src={fileUrl}
          alt={fileName}
          className="max-w-full max-h-full object-contain select-none"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.2s ease-out'
          }}
          drag
          dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
          dragElastic={0.1}
        />
      </div>
    </div>
  )
}
