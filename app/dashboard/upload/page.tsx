import DropZone from "@/components/DropZone"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import User from "@/models/User"
import dbConnect from "@/lib/db"
import { PLAN_LIMITS, formatBytes } from "@/lib/plans"

export default async function UploadPage() {
  const session = await getServerSession(authOptions)
  
  let planName = 'free'
  if (session?.user?.id) {
    await dbConnect()
    const user = await User.findById(session.user.id).lean() as any
    if (user) planName = user.plan || 'free'
  }

  const limits = PLAN_LIMITS[planName as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free
  const sizeLabel = formatBytes(limits.maxBytes)

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Subir Archivo</h1>
        <p className="text-zinc-400">Comparte archivos de forma segura. Tu límite actual es de {sizeLabel} por archivo.</p>
      </div>
      <DropZone maxBytes={limits.maxBytes} maxSizeLabel={sizeLabel} planName={planName} maxDays={limits.maxDays} />
    </div>
  )
}
