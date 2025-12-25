
"use client"

import { useState } from "react"
import DownloadClient from "@/app/d/[id]/DownloadCard"
import PasswordGuard from "@/components/PasswordGuard"

interface Props {
    id: string
    fileName: string
    fileSize: number
    isProtected: boolean
    initialDownloadUrl?: string
    branding?: any
}

export default function DownloadManager({ id, fileName, fileSize, isProtected, initialDownloadUrl, branding }: Props) {
    const [unlockedUrl, setUnlockedUrl] = useState<string | null>(initialDownloadUrl || null)

    if (isProtected && !unlockedUrl) {
        return (
            <PasswordGuard 
                id={id} 
                onUnlock={(url) => setUnlockedUrl(url)} 
                branding={branding}
            />
        )
    }

    if (!unlockedUrl) return null

    return (
        <DownloadClient 
            id={id}
            fileName={fileName}
            fileSize={fileSize}
            downloadUrl={unlockedUrl}
            branding={branding}
        />
    )
}
