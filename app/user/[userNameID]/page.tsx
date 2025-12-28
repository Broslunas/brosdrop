
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { FileIcon, Download, Calendar, HardDrive } from "lucide-react"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import Transfer from "@/models/Transfer"
import { Metadata } from "next"

// Force dynamic to ensure we get fresh data
export const dynamic = 'force-dynamic'

interface Props {
    params: Promise<{
        userNameID: string
    }>
}

async function getUserAndFiles(userNameID: string) {
    await dbConnect()
    
    // Find user - we look for the user primarily by ID and that they are not blocked.
    // We check isPublicProfile later.
    const user = await User.findOne({ 
        userNameID: userNameID,
        blocked: false 
    }).select('name image email branding _id isPublicProfile')

    if (!user) return null

    // If private profile, return user without files
    if (!user.isPublicProfile) {
        return { user, files: null }
    }

    // Find public files (transfers)
    const now = new Date().toISOString()
    const files = await Transfer.find({
        senderId: user._id.toString(), // Ensure string
        blocked: false,
        isPublic: true,
        expiresAt: { $gt: now }
    }).sort({ createdAt: -1 })

    return { user, files }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { userNameID } = await params
    const data = await getUserAndFiles(userNameID)
    if (!data) return { title: 'Perfil no encontrado' }
    
    return {
        title: `Archivos de ${data.user.name} | BrosDrop`,
        description: `Explora y descarga los archivos compartidos por ${data.user.name}.`
    }
}

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export default async function PublicProfilePage({ params }: Props) {
    const { userNameID } = await params
    const data = await getUserAndFiles(userNameID)

    if (!data) {
        notFound()
    }

    const { user, files } = data
    const branding = user.branding?.enabled ? user.branding : null

    return (
        <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-zinc-900 dark:text-white transition-colors duration-300">
            {/* Background branding if exists */}
            {branding?.background && (
                <div className="absolute inset-0 z-0">
                    <Image 
                        src={branding.background} 
                        alt="Background" 
                        fill 
                        className="object-cover opacity-20 blur-sm"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white dark:from-[#0A0A0A]/50 dark:to-[#0A0A0A]" />
                </div>
            )}

            <main className="relative z-10 container mx-auto px-4 pt-28 pb-12 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-16 space-y-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-100 dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-900">
                        {user.image ? (
                            <Image 
                                src={user.image} 
                                alt={user.name} 
                                width={128} 
                                height={128} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                                <span className="text-4xl font-bold uppercase">{user.name?.[0]}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">{user.name}</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                            Compartiendo archivos a través de BrosDrop.
                        </p>
                    </div>
                </div>

                {/* Files Grid */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2 text-zinc-900 dark:text-white">
                            <HardDrive className="w-5 h-5 text-primary" />
                            Archivos Públicos {files ? `(${files.length})` : ''}
                        </h2>
                    </div>

                    {!files ? (
                        // Private Profile View
                         <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-zinc-200 dark:border-zinc-800/50">
                             <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HardDrive className="w-8 h-8 text-zinc-400 dark:text-zinc-600" />
                             </div>
                            <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-300">Este perfil es privado</h3>
                            <p className="text-zinc-500 mt-2">El usuario ha configurado su perfil como privado. <br/> No puedes ver sus archivos.</p>
                        </div>
                    ) : files.length === 0 ? (
                        // Public but empty
                        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-zinc-200 dark:border-zinc-800/50">
                            <FileIcon className="w-16 h-16 text-zinc-400 dark:text-zinc-700 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-300">Sin archivos públicos</h3>
                            <p className="text-zinc-500 mt-2">Este usuario no tiene archivos activos en este momento.</p>
                        </div>
                    ) : (
                        // Files Grid
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {files.map((file: any) => (
                                <Link 
                                    href={file.customLink ? `/d/${file.customLink}` : `/d/${file.id}`}
                                    key={file._id}
                                    className="group relative bg-white dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-primary text-white p-2 rounded-full shadow-lg">
                                            <Download className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800/80 transition-colors">
                                            <FileIcon className="w-8 h-8 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-lg leading-snug truncate pr-6 text-zinc-900 dark:text-zinc-100" title={file.originalName}>
                                                {file.originalName}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                                                <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 dark:text-zinc-400">{file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                                                <span>•</span>
                                                <span>{formatBytes(file.size)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 group-hover:border-primary/20 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(file.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Download className="w-3.5 h-3.5" />
                                            {file.downloads} descargas
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
