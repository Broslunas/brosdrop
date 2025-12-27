"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export default function PageTransition() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsLoading(false)
  }, [pathname])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent">
      <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-[loading_1s_ease-in-out_infinite]" 
           style={{
             width: '100%',
             transformOrigin: 'left',
           }}
      />
      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}
