
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin text-primary">
            <Loader2 className="h-full w-full" />
        </div>
        <p className="text-sm font-medium text-zinc-400 animate-pulse">
            Buscando tu archivo...
        </p>
      </div>
    </div>
  )
}
