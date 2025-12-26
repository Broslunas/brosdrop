
"use client"

import { Download, File, Music, Video, Image as ImageIcon, FileText, Archive, FileCode } from "lucide-react"
import { motion } from "framer-motion"

interface Props {
    id: string
    fileName: string
    fileSize: number
    downloadUrl: string
    branding?: any
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (!ext) return File

  if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'].includes(ext)) return Music
  if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'].includes(ext)) return Video
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) return ImageIcon
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) return Archive
  if (['js', 'ts', 'tsx', 'jsx', 'py', 'html', 'css', 'json', 'xml', 'java', 'cpp', 'c', 'php', 'rb', 'go'].includes(ext)) return FileCode
  if (['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'odt'].includes(ext)) return FileText
  
  return File
}

const getFileIconColor = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (!ext) return 'bg-zinc-800 text-zinc-400'

  if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'].includes(ext)) return 'bg-green-500/10 text-green-400'
  if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'].includes(ext)) return 'bg-purple-500/10 text-purple-400'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) return 'bg-pink-500/10 text-pink-400'
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) return 'bg-orange-500/10 text-orange-400'
  if (['js', 'ts', 'tsx', 'jsx', 'py', 'html', 'css', 'json', 'xml', 'java', 'cpp', 'c', 'php', 'rb', 'go'].includes(ext)) return 'bg-cyan-500/10 text-cyan-400'
  if (['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'odt'].includes(ext)) return 'bg-red-500/10 text-red-400'
  
  return 'bg-zinc-800 text-zinc-400'
}

export default function DownloadClient({ id, fileName, fileSize, downloadUrl, branding }: Props) {
    const handleDownload = () => {
        // Fire and forget tracking
        fetch(`/api/files/${id}/download`, { method: 'POST' }).catch(err => console.error(err))
    }

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-xl"
        >
            <div className="mb-8 text-center">
                {branding?.logo ? (
                     <div className="mx-auto mb-6 h-24 flex items-center justify-center">
                         <img src={branding.logo} alt="Logo" className="max-h-full max-w-full object-contain drop-shadow-lg" />
                     </div>
                ) : (
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Download className="h-10 w-10" />
                    </div>
                )}
                <h2 className="mb-2 text-2xl font-bold text-white">Ready to download</h2>
                <p className="text-zinc-400">Your file is ready.</p>
            </div>



            <div className="mb-8 rounded-2xl bg-black/20 p-4 border border-white/5">
                <div className="flex items-center gap-4">
                    <div className={`rounded-xl p-3 ${getFileIconColor(fileName)}`}>
                        {(() => {
                            const Icon = getFileIcon(fileName)
                            return <Icon className="h-6 w-6" />
                        })()}
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="truncate font-medium text-zinc-200">{fileName}</h3>
                        <p className="text-xs text-zinc-500">{(fileSize / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                </div>
            </div>

            <a 
                href={downloadUrl}
                onClick={handleDownload}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
                Download File
            </a>
        </motion.div>
    )
}
