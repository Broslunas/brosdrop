"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, Upload, Download, X, Check, Loader2, AlertCircle, ExternalLink, HardDrive, Box } from 'lucide-react'
import { CLOUD_PROVIDERS, CloudProvider, CloudFile, canUseCloudFeature } from '@/lib/cloudProviders'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

// Helper to get icon component from string name
const getIconComponent = (iconName: string) => {
  const icons: Record<string, any> = {
    'HardDrive': HardDrive,
    'Box': Box,
    'Cloud': Cloud,
  }
  return icons[iconName] || Cloud
}

interface CloudIntegrationProps {
  planName: string
  mode: 'import' | 'export'
  onImportFiles?: (files: File[]) => void
  onExportComplete?: () => void
  uploadedFileIds?: string[] // For export mode
}

export default function CloudIntegration({ 
  planName, 
  mode, 
  onImportFiles,
  onExportComplete,
  uploadedFileIds 
}: CloudIntegrationProps) {
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedProviders, setConnectedProviders] = useState<Set<CloudProvider>>(new Set())
  const [cloudFiles, setCloudFiles] = useState<CloudFile[]>([])
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  const canUse = canUseCloudFeature(planName, mode)

  // Check connected providers on mount
  useEffect(() => {
    checkConnectedProviders()
  }, [])

  const checkConnectedProviders = async () => {
    try {
      const res = await fetch('/api/cloud/connections')
      if (res.ok) {
        const data = await res.json()
        setConnectedProviders(new Set(data.providers))
      }
    } catch (error) {
      console.error('Failed to check cloud connections:', error)
    }
  }

  const handleConnectProvider = async (provider: CloudProvider) => {
    if (!canUse) {
      toast.error('Actualiza tu plan para usar la integración con la nube')
      return
    }

    setIsConnecting(true)
    setSelectedProvider(provider)

    try {
      // Get auth URL
      const res = await fetch(`/api/cloud/${provider}/auth`)
      const data = await res.json()

      if (data.authUrl) {
        // Open OAuth popup
        const width = 600
        const height = 700
        const left = window.screen.width / 2 - width / 2
        const top = window.screen.height / 2 - height / 2

        const popup = window.open(
          data.authUrl,
          'Cloud Authentication',
          `width=${width},height=${height},left=${left},top=${top}`
        )

        // Listen for auth callback
        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'cloud-auth-success') {
            setConnectedProviders(prev => new Set(prev).add(provider))
            popup?.close()
            toast.success(`Conectado a ${CLOUD_PROVIDERS[provider].name}`)
            window.removeEventListener('message', handleMessage)
            setIsConnecting(false)
            
            // If import mode, show file picker
            if (mode === 'import') {
              loadCloudFiles(provider)
            }
          } else if (event.data.type === 'cloud-auth-error') {
            popup?.close()
            toast.error('Error al conectar con el servicio')
            window.removeEventListener('message', handleMessage)
            setIsConnecting(false)
          }
        }

        window.addEventListener('message', handleMessage)

        // Check if popup was closed
        const checkPopup = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkPopup)
            window.removeEventListener('message', handleMessage)
            setIsConnecting(false)
          }
        }, 500)
      }
    } catch (error) {
      console.error('Auth error:', error)
      toast.error('Error al iniciar la autenticación')
      setIsConnecting(false)
    }
  }

  const loadCloudFiles = async (provider: CloudProvider) => {
    setIsLoading(true)
    setShowPicker(true)
    setSelectedProvider(provider)

    try {
      const res = await fetch(`/api/cloud/${provider}/files`)
      if (res.ok) {
        const data = await res.json()
        setCloudFiles(data.files || [])
      } else {
        toast.error('Error al cargar archivos')
      }
    } catch (error) {
      console.error('Failed to load files:', error)
      toast.error('Error al cargar archivos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportFiles = async () => {
    if (!selectedProvider || selectedFiles.size === 0) return

    setIsLoading(true)

    try {
      const fileIds = Array.from(selectedFiles)
      console.log('📤 Solicitando importación de archivos:', fileIds)
      
      const res = await fetch(`/api/cloud/${selectedProvider}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds }),
      })

      console.log('📥 Respuesta del servidor:', res.status, res.statusText)

      if (res.ok) {
        const data = await res.json()
        console.log('📦 Datos recibidos:', data)
        console.log('📊 Número de archivos:', data.files?.length || 0)
        
        if (!data.files || data.files.length === 0) {
          toast.warning('No se pudieron importar los archivos seleccionados')
          setIsLoading(false)
          return
        }

        // Convert blob URLs to File objects
        const files: File[] = []
        for (const fileData of data.files) {
          console.log('🔄 Procesando archivo:', fileData.name, fileData.mimeType)
          const response = await fetch(fileData.url)
          const blob = await response.blob()
          const file = new File([blob], fileData.name, { type: fileData.mimeType })
          files.push(file)
          console.log('✅ Archivo convertido:', file.name, file.size, 'bytes')
        }

        console.log('🎉 Total de archivos convertidos:', files.length)
        onImportFiles?.(files)
        toast.success(`${files.length} archivo(s) importado(s)`)
        setShowPicker(false)
        setSelectedFiles(new Set())
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error('❌ Error del servidor:', errorData)
        toast.error(errorData.error || 'Error al importar archivos')
      }
    } catch (error) {
      console.error('💥 Error de importación:', error)
      toast.error('Error al importar archivos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportFiles = async (provider: CloudProvider) => {
    if (!uploadedFileIds || uploadedFileIds.length === 0) {
      toast.error('No hay archivos para exportar')
      return
    }

    setIsLoading(true)
    setSelectedProvider(provider)

    try {
      const res = await fetch(`/api/cloud/${provider}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds: uploadedFileIds }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(`${data.count} archivo(s) exportado(s) a ${CLOUD_PROVIDERS[provider].name}`)
        onExportComplete?.()
      } else {
        const error = await res.json()
        toast.error(error.message || 'Error al exportar archivos')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Error al exportar archivos')
    } finally {
      setIsLoading(false)
      setSelectedProvider(null)
    }
  }

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fileId)) {
        newSet.delete(fileId)
      } else {
        newSet.add(fileId)
      }
      return newSet
    })
  }

  if (!canUse) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur opacity-50" />
        <div className="relative p-6 rounded-3xl bg-white dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
              <Cloud className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-zinc-900 dark:text-white text-lg mb-1">Integración con la Nube</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                {mode === 'import' 
                  ? 'Importa archivos directamente desde Google Drive o Dropbox' 
                  : 'Exporta tus archivos a servicios de nube'}
              </p>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                  Actualiza a <strong>Plus</strong> o <strong>Pro</strong> para usar esta función
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
        <div className="relative p-6 rounded-3xl bg-white dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-all duration-300">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
              <Cloud className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-zinc-900 dark:text-white text-lg">Integración con la Nube</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {mode === 'import' 
                  ? 'Importa archivos desde tus servicios de nube' 
                  : 'Exporta tus archivos a tus servicios de nube'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(CLOUD_PROVIDERS)
              .filter(([_, config]) => config.enabled)
              .map(([key, config]) => {
              const provider = key as CloudProvider
              const isConnected = connectedProviders.has(provider)
              const isWorking = isConnecting && selectedProvider === provider
              const isExporting = isLoading && selectedProvider === provider && mode === 'export'

              return (
                <motion.button
                  key={provider}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (mode === 'import') {
                      if (isConnected) {
                        loadCloudFiles(provider)
                      } else {
                        handleConnectProvider(provider)
                      }
                    } else {
                      if (isConnected) {
                        handleExportFiles(provider)
                      } else {
                        handleConnectProvider(provider)
                      }
                    }
                  }}
                  disabled={isWorking || isExporting}
                  className={`
                    relative p-5 rounded-2xl transition-all duration-300
                    disabled:opacity-50 disabled:cursor-not-allowed
                    border-2 group/card
                    ${isConnected 
                      ? 'bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800/80 dark:to-zinc-900/80 border-zinc-200 dark:border-white/20 hover:border-zinc-300 dark:hover:border-white/30' 
                      : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800/70'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      p-3 rounded-xl transition-all duration-300
                      ${isConnected 
                        ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20' 
                        : 'bg-zinc-200 dark:bg-zinc-700/50 group-hover/card:bg-zinc-300 dark:group-hover/card:bg-zinc-700'
                      }
                    `}>
                      {(() => {
                        const IconComponent = getIconComponent(config.icon)
                        return <IconComponent className="w-8 h-8" style={{ color: config.color }} />
                      })()}
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-zinc-900 dark:text-white mb-1">{config.name}</div>
                      
                      {isWorking || isExporting ? (
                        <div className="flex items-center gap-2 text-xs text-blue-500 dark:text-blue-400">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>{mode === 'export' ? 'Exportando...' : 'Conectando...'}</span>
                        </div>
                      ) : isConnected ? (
                        <div className="flex items-center gap-1.5 text-xs text-green-500 dark:text-green-400">
                          <Check className="w-3.5 h-3.5" />
                          <span>Conectado</span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500">Click para conectar</span>
                      )}
                    </div>

                    {mode === 'import' && isConnected && (
                      <Upload className="w-4 h-4 text-blue-500 dark:text-blue-400 opacity-50 group-hover/card:opacity-100 transition-opacity" />
                    )}
                    {mode === 'export' && isConnected && (
                      <Download className="w-4 h-4 text-purple-500 dark:text-purple-400 opacity-50 group-hover/card:opacity-100 transition-opacity" />
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* File Picker Modal */}
      <AnimatePresence>
        {showPicker && mode === 'import' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/90 backdrop-blur-md"
            onClick={() => setShowPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[85vh] relative group"
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-3xl blur-xl opacity-50" />
              
              {/* Main modal */}
              <div className="relative bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/10 overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-zinc-200 dark:border-white/10 bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-800/50 dark:to-zinc-900/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                        {selectedProvider && (() => {
                          const IconComponent = getIconComponent(CLOUD_PROVIDERS[selectedProvider].icon)
                          return <IconComponent className="w-6 h-6" style={{ color: CLOUD_PROVIDERS[selectedProvider].color }} />
                        })()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                          Seleccionar Archivos
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {selectedProvider && CLOUD_PROVIDERS[selectedProvider].name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPicker(false)}
                      className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group/close"
                    >
                      <X className="w-5 h-5 text-zinc-400 group-hover/close:text-zinc-900 dark:group-hover/close:text-white transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Files List */}
                <div className="flex-1 overflow-y-auto p-6 min-h-[300px] max-h-[50vh]">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Loader2 className="w-10 h-10 text-blue-500 dark:text-blue-400 animate-spin mb-4" />
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Cargando archivos...</p>
                    </div>
                  ) : cloudFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 mb-4">
                        <Cloud className="w-12 h-12 text-zinc-400 dark:text-zinc-600" />
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">No se encontraron archivos</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cloudFiles.map((file) => {
                        const isSelected = selectedFiles.has(file.id)
                        return (
                          <motion.button
                            key={file.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => toggleFileSelection(file.id)}
                            className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left group/file
                              ${isSelected 
                                ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/50 shadow-lg shadow-blue-500/10' 
                                : 'bg-zinc-50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-600'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                                ${isSelected 
                                  ? 'bg-blue-500 border-blue-500 shadow-lg shadow-blue-500/50' 
                                  : 'border-zinc-300 dark:border-zinc-600 group-hover/file:border-zinc-400 dark:group-hover/file:border-zinc-500'
                                }`}
                              >
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-zinc-900 dark:text-white truncate">{file.name}</p>
                                {file.size && (
                                  <p className="text-xs text-zinc-500 mt-0.5">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                )}
                              </div>
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors" />
                                </a>
                              )}
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-200 dark:border-white/10 bg-gradient-to-t from-zinc-50 to-zinc-100 dark:from-zinc-800/50 dark:to-zinc-900/50">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      <span className="font-semibold text-zinc-900 dark:text-white">{selectedFiles.size}</span> archivo(s) seleccionado(s)
                    </p>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => setShowPicker(false)}
                        className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-medium
                                 transition-all duration-200 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 text-center"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleImportFiles}
                        disabled={selectedFiles.size === 0 || isLoading}
                        className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 
                                 hover:from-blue-600 hover:to-purple-600 text-white font-medium
                                 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                                 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 disabled:shadow-none"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Importando...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Importar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
