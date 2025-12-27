
import { NextResponse } from "next/server"
import User from "@/models/User"
import { PLAN_LIMITS } from "@/lib/plans"

// Simple in-memory rate limiting (Note: In production with multiple instances, use Redis)
const requestCounts: Record<string, { count: number, resetTime: number }> = {}

export async function validateApiKey(req: Request) {
    const apiKey = req.headers.get("x-api-key")

    if (!apiKey) {
        return { error: "Missing API Key", status: 401, user: null, plan: null }
    }

    const user = await User.findOne({ apiKey })

    if (!user) {
        return { error: "Invalid API Key", status: 401, user: null, plan: null }
    }

    // Check Plan Access
    const userPlan = user.plan || 'free'
    const limits = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free

    if (!limits.hasApiAccess) {
        return { error: "Tu plan actual no incluye acceso a la API. Actualiza a Plus o Pro.", status: 403, user: null, plan: null }
    }

    // Rate Limiting Logic
    const now = Date.now()
    const rateLimitKey = user._id.toString()
    
    if (!requestCounts[rateLimitKey] || now > requestCounts[rateLimitKey].resetTime) {
        requestCounts[rateLimitKey] = {
            count: 0,
            resetTime: now + 3600 * 1000 // 1 hour
        }
    }

    if (requestCounts[rateLimitKey].count >= (limits.apiRequestsPerHour || 0)) {
        return { error: "Rate limit exceeded", status: 429, user: null, plan: null }
    }

    requestCounts[rateLimitKey].count++

    return { error: null, user, plan: limits }
}
