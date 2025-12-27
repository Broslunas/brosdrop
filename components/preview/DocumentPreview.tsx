"use client"

import { FileText, ExternalLink } from "lucide-react"

interface DocumentPreviewProps {
  fileUrl: string
  fileName: string
}

export default function DocumentPreview({ fileUrl, fileName }: DocumentPreviewProps) {
  // Google Docs Viewer URL
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`
  
  // Office Online Viewer (alternative)
  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`

  const extension = fileName.split('.').pop()?.toLowerCase()
  const isOfficeDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension || '')

  return (
    <div className="relative w-full h-full flex flex-col bg-zinc-950">
      {/* Info banner */}
      <div className="bg-blue-500/10 border-b border-blue-500/20 px-6 py-3">
        <div className="flex items-center gap-2 text-sm text-blue-400">
          <FileText className="w-4 h-4" />
          <span>
            Vista previa proporcionada por {isOfficeDoc ? 'Office Online' : 'Google Docs Viewer'}
          </span>
        </div>
      </div>

      {/* Document Viewer */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <iframe
          src={isOfficeDoc ? officeViewerUrl : googleViewerUrl}
          className="w-full h-full border-0 rounded-lg bg-white"
          title={fileName}
          allowFullScreen
        />
      </div>

      {/* Fallback/Alternative link */}
      <div className="border-t border-zinc-800 bg-zinc-900/50 px-6 py-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-400">
            ¿No puedes ver el documento?
          </p>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir en nueva pestaña
          </a>
        </div>
      </div>
    </div>
  )
}
