
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb"

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id
        // We can safely use user.image from DB here, as it's not stored in cookie
        session.user.image = user.image 
        session.user.name = user.name
        // @ts-ignore
        session.user.emailVerified = user.emailVerified
        // @ts-ignore
        session.user.defaultPublicFiles = user.defaultPublicFiles !== undefined ? user.defaultPublicFiles : true
        // @ts-ignore
        session.user.createdAt = user.createdAt
        // @ts-ignore
        session.user.plan = user.plan
        // @ts-ignore
        session.user.role = user.role || 'user'

        // Check Expiration
        // @ts-ignore
        if (user.planExpiresAt && new Date(user.planExpiresAt) < new Date()) {
             // @ts-ignore
             session.user.plan = 'free'
             
             // Lazy update DB
             // @ts-ignore
             if (user.plan !== 'free') {
                 (async () => {
                     try {
                        const User = (await import("@/models/User")).default
                        const dbConnect = (await import("@/lib/db")).default
                        await dbConnect()
                        await User.findByIdAndUpdate(user.id, { 
                            plan: 'free', 
                            planExpiresAt: null 
                        })
                     } catch(e) {
                         console.error("Auto-downgrade error", e)
                     }
                 })()
             }
        }

        // Pass blocked status to session for client-side handling
        // @ts-ignore
        session.user.blocked = user.blocked
        // @ts-ignore
        session.user.blockedMessage = user.blockedMessage
      }
      return session
    },
    async signIn({ user }) {
        // @ts-ignore
        if (user.blocked) {
             // Return false to deny sign in, or a URL to redirect to
             // We can redirect to a specific error page
             return `/auth/blocked?message=${encodeURIComponent((user as any).blockedMessage || "Tu cuenta ha sido bloqueada.")}`
        }
        return true
    }
  },
  events: {
    async createUser({ user }) {
      try {
        const crypto = require('crypto')
        const token = crypto.randomBytes(32).toString('hex')
        
        // We need to import these dynamically or ensure they are imported at top 
        // But `authOptions` is imported in route handlers, so static import is fine usually.
        // However, to avoid 'Module not found' if I mess up imports now, I'll use dynamic import for User/db if possible or just standard import.
        // Let's assume standard import is fine. I will add it with next tool call.
        // For now, I will write the logic assuming imports exist.
        
        // Actually, I can't modify imports in this same block if they are at top. 
        // I will use `mongoose` directly via global connection if widely available or just import `User` in the next steps.
        // Let's add the block and then add imports.
        
        // Wait, I can't rely on side-effects. I should ensure DB connection.
        // The adapter handles connection for the event, but for `User.findByIdAndUpdate` I need the model.
        
        // Let's do the webhook call first which is the critical part requested.
        // And update the user.
        
        const User = (await import("@/models/User")).default
        const dbConnect = (await import("@/lib/db")).default
        await dbConnect()
        
        await User.findByIdAndUpdate(user.id, { verificationToken: token })

        await fetch('https://n8n.broslunas.com/webhook/brosdrop-welcome-email', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Referer': new URL(process.env.NEXTAUTH_URL || 'https://brosdrop.com').origin
            },
            body: JSON.stringify({
                userId: user.id,
                name: user.name,
                email: user.email,
                verificationToken: token
            })
        })
      } catch (error) {
        console.error("Error in createUser event:", error)
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
