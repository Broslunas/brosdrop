"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, AlertTriangle, Info, CheckCircle } from "lucide-react"

type ModalType = "info" | "success" | "warning" | "error" | "confirm"

interface ModalOptions {
  title: string
  message: ReactNode
  type?: ModalType
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

interface ModalContextType {
  showModal: (options: ModalOptions) => void
  hideModal: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider")
  }
  return context
}

export default function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [modalConfig, setModalConfig] = useState<ModalOptions | null>(null)

  const showModal = (options: ModalOptions) => {
    setModalConfig(options)
    setIsOpen(true)
  }

  const hideModal = () => {
    setIsOpen(false)
    setTimeout(() => setModalConfig(null), 300) // Clear after animation
  }

  const handleConfirm = () => {
    if (modalConfig?.onConfirm) {
      modalConfig.onConfirm()
    }
    hideModal()
  }

  const handleCancel = () => {
    if (modalConfig?.onCancel) {
      modalConfig.onCancel()
    }
    hideModal()
  }

  const getIcon = (type?: ModalType) => {
    switch (type) {
      case "error":
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-red-500" />
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "confirm":
        return <AlertTriangle className="h-6 w-6 text-primary" />
      default:
        return <Info className="h-6 w-6 text-blue-500" />
    }
  }

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <AnimatePresence>
        {isOpen && modalConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={hideModal}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 p-6 shadow-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-full bg-white/5 p-2">
                    {getIcon(modalConfig.type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {modalConfig.title}
                  </h3>
                  <div className="mt-2 text-sm text-zinc-400">
                    {modalConfig.message}
                  </div>
                </div>
                <button
                  onClick={hideModal}
                  className="absolute top-4 right-4 rounded-lg p-1 text-zinc-500 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                {(modalConfig.type === "confirm" || modalConfig.cancelText) && (
                  <button
                    onClick={handleCancel}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {modalConfig.cancelText || "Cancelar"}
                  </button>
                )}
                <button
                  onClick={handleConfirm}
                  className={`
                    rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors
                    ${modalConfig.type === 'error' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}
                  `}
                >
                  {modalConfig.confirmText || "Aceptar"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  )
}
