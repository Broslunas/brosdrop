
import DropZone from "@/components/DropZone"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-4xl text-center mb-12 space-y-4">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4">
           Share files, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">super fast.</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Simple, secure, and premium file sharing. Drag, drop, and you're done. 
          Powered by Brosdrop using high-speed global storage.
        </p>
      </div>
      
      <DropZone />
    </div>
  )
}
