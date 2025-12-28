import { motion } from "framer-motion"

interface UploadProgressProps {
    status: 'zipping' | 'uploading'
    progress: number
}

export default function UploadProgress({ status, progress }: UploadProgressProps) {
    return (
        <div className="space-y-2 mt-6">
            <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>{status === 'zipping' ? 'Comprimiendo archivos...' : 'Subiendo...'}</span>
                <span>{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear" }}
                />
            </div>
        </div>
    )
}
