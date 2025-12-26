"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Save, QrCode as QrCodeIcon, Download } from "lucide-react"
import { useSession } from "next-auth/react"
import QRCode from "react-qr-code"
import { PLAN_LIMITS } from "@/lib/plans"

interface QRModalProps {
  isOpen: boolean
  onClose: () => void
  file: any
  onSave: (id: string, qrOptions: { fgColor: string, bgColor: string, logoUrl?: string }) => Promise<void>
}

export default function QRModal({ isOpen, onClose, file, onSave }: QRModalProps) {
  const { data: session } = useSession()
  // Cast user to any to access plan
  const userPlan = (session?.user as any)?.plan || 'free'
  const limits = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free
  
  const canColor = (limits as any).canCustomizeColors
  const canLogo = (limits as any).canCustomizeLogo

  const [qrFg, setQrFg] = useState("#000000")
  const [qrBg, setQrBg] = useState("#ffffff")
  const [qrLogo, setQrLogo] = useState("")

  const [isSaving, setIsSaving] = useState(false)

  // Reset state when file changes or modal opens
  useEffect(() => {
      if (file) {
          if (file.qrOptions) {
              setQrFg(file.qrOptions.fgColor || "#000000")
              setQrBg(file.qrOptions.bgColor || "#ffffff")
              // Only load logo if user has permission
              setQrLogo(canLogo ? (file.qrOptions.logoUrl || "") : "")
          } else {
              setQrFg("#000000")
              setQrBg("#ffffff")
              setQrLogo("")
          }
      }
  }, [file, isOpen, userPlan]) // Use userPlan instead of canLogo to keep array size stable

  const handleSave = async () => {
      if (!canColor && !canLogo) return 
      
      setIsSaving(true)
      try {
          // If cannot logo, ensure logo is empty or don't send it?
          // If we send empty string, it clears it.
          // If we don't send key, API updates partial? No, I decided API puts full object.
          // So if !canLogo, I should probably send empty string or existing?
          // If Plus user tries to hack in a logo, UI stops them, API should too.
          
          await onSave(file._id, {
              fgColor: qrFg,
              bgColor: qrBg,
              logoUrl: canLogo ? qrLogo : "" // Force empty if not allowed
          })
          onClose()
      } catch (e) {
          console.error(e)
      } finally {
          setIsSaving(false)
      }
  }

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg")
    if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        
        // Base dimensions
        const size = 1000 // High res
        const padding = 100
        const textHeight = 80
        
        canvas.width = size
        canvas.height = size + textHeight

        if (ctx) {
            // Fill Background
            ctx.fillStyle = qrBg
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            const img = new Image()
            img.onload = () => {
                // Draw QR
                ctx.drawImage(img, 0, 0, size, size)
                
                // Draw Text
                ctx.font = "bold 40px Maven Pro, sans-serif" // Approximating font
                ctx.fillStyle = qrFg
                ctx.textAlign = "center"
                ctx.fillText("Creado con BrosDrop.com", size / 2, size + 50)

                // Validate and Draw Logo Overlay if exists
                if (qrLogo) {
                    const logoImg = new Image()
                    logoImg.crossOrigin = "Anonymous"
                    logoImg.onload = () => {
                        const logoSize = size * 0.2
                        const logoX = (size - logoSize) / 2
                        const logoY = (size - logoSize) / 2
                        
                        // Circle clip for logo
                        ctx.save()
                        ctx.beginPath()
                        ctx.arc(size/2, size/2, logoSize/2 + 5, 0, 2 * Math.PI)
                        ctx.fillStyle = qrBg
                        ctx.fill()
                        ctx.clip()
                        
                        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
                        ctx.restore()
                        
                        triggerDownload(canvas)
                    }
                    logoImg.onerror = () => triggerDownload(canvas) // Fail gracefully
                    logoImg.src = qrLogo
                } else {
                    triggerDownload(canvas)
                }
            }
            img.src = "data:image/svg+xml;base64," + btoa(svgData)
        }
    }
  }

  const triggerDownload = (canvas: HTMLCanvasElement) => {
        const pngFile = canvas.toDataURL("image/png")
        const downloadLink = document.createElement("a")
        downloadLink.download = `qr-${file.originalName}.png`
        downloadLink.href = pngFile
        downloadLink.click()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#0A0A0A] z-10 rounded-t-3xl">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                        <QrCodeIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Código QR</h3>
                        <p className="text-xs text-zinc-400">Descarga y personaliza</p>
                    </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                
                {/* QR Display */}
                <div className="flex flex-col items-center justify-center">
                    <div className="relative p-6 rounded-2xl bg-white shadow-xl flex flex-col items-center" style={{ backgroundColor: qrBg }}>
                        <div className="relative">
                            <QRCode 
                                id="qr-code-svg"
                                value={`${window.location.origin}/d/${file?.customLink || file?._id}`} 
                                size={200} 
                                bgColor={qrBg}
                                fgColor={qrFg}
                                level="H" 
                            />
                             {qrLogo && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full p-1 shadow-md overflow-hidden flex items-center justify-center">
                                    <img src={qrLogo} alt="Logo" className="w-full h-full object-cover rounded-full" />
                                </div>
                            )}
                        </div>
                        <p style={{ color: qrFg }} className="text-[10px] font-bold opacity-80 mt-2 font-mono">Creado con BrosDrop.com</p>
                    </div>
                    <p className="text-xs text-zinc-500 mt-4 text-center max-w-[200px]">
                        Escanea este código para acceder directamente al archivo.
                    </p>
                </div>

                 {/* Controls */}
                 <div className="p-4 rounded-2xl border border-white/5 bg-zinc-900/40 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="text-sm font-bold text-zinc-200">Personalizar <span className="text-xs font-normal text-yellow-500 ml-2 border border-yellow-500/30 bg-yellow-500/10 px-1.5 py-0.5 rounded-full">Plus / Pro</span></h4>
                        </div>
                    </div>

                    {/* Colors */}
                     <div>
                         <label className="text-xs text-zinc-400 mb-2 block flex justify-between">
                            <span>Colores</span>
                            {!canColor && <span className="text-primary cursor-pointer hover:underline text-[10px] ml-auto">Mejora a Plus</span>}
                         </label>
                         <div className={`grid grid-cols-2 gap-3 ${!canColor ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                                <div>
                                    <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/10">
                                        <input type="color" value={qrFg} onChange={(e) => setQrFg(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-none" />
                                        <span className="text-xs text-zinc-300 font-mono">{qrFg}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/10">
                                        <input type="color" value={qrBg} onChange={(e) => setQrBg(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-none" />
                                        <span className="text-xs text-zinc-300 font-mono">{qrBg}</span>
                                    </div>
                                </div>
                         </div>
                    </div>

                    {/* Logo */}
                    <div>
                         <label className="text-xs text-zinc-400 mb-2 block flex justify-between">
                            <span>Logo URL</span>
                            {!canLogo && <span className="text-primary cursor-pointer hover:underline text-[10px] ml-auto">Mejora a Pro</span>}
                         </label>
                         <div className={!canLogo ? 'opacity-50 pointer-events-none' : ''}>
                            <input 
                                type="text" 
                                value={qrLogo}
                                onChange={(e) => setQrLogo(e.target.value)}
                                placeholder={canLogo ? "https://mi-empresa.com/logo.png" : "Solo disponible en plan Pro"}
                                disabled={!canLogo}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:ring-1 focus:ring-primary/50 outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed"
                            />
                         </div>
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-white/5 bg-[#0A0A0A] rounded-b-3xl">
                <div className="flex justify-between gap-3">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                        Cerrar
                    </button>

                    <div className="flex gap-2">
                        <button 
                            onClick={downloadQR}
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">PNG</span>
                        </button>

                         {(canColor || canLogo) && (
                             <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
                            >
                                {isSaving ? "Guardando..." : "Guardar Diseño"}
                            </button>
                         )}
                    </div>
                </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
