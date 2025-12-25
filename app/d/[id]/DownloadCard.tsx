
"use client"

import { Download, File } from "lucide-react"
import { motion } from "framer-motion"

interface Props {
    id: string
    fileName: string
    fileSize: number
    downloadUrl: string
}

export default function DownloadClient({ id, fileName, fileSize, downloadUrl }: Props) {
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
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Download className="h-10 w-10" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-white">Ready to download</h2>
                <p className="text-zinc-400">Your file is ready.</p>
            </div>

            <div className="mb-8 rounded-2xl bg-black/20 p-4 border border-white/5">
                <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-zinc-800 p-3 text-zinc-400">
                        <File className="h-6 w-6" />
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
