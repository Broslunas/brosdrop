
"use client"

import { signIn } from "next-auth/react"
import { Github, Mail } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-zinc-400">Sign in to your account</p>
      </div>
      <div className="flex flex-col gap-4">
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          <Mail className="h-4 w-4" />
          Sign in with Google
        </button>
        <button
          onClick={() => signIn("github", { callbackUrl: "/" })}
          className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          <Github className="h-4 w-4" />
          Sign in with GitHub
        </button>
      </div>
    </div>
  )
}
