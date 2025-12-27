
import { NextResponse } from "next/server"
import User from "@/models/User"
import { PLAN_LIMITS } from "@/lib/plans"

export async function validateApiKey(req: Request, isUpload = false) {
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

    // Rate Limiting Logic (Persistent)
    const now = Date.now()
    let usage = user.apiUsage || { 
        requestsCount: 0, 
        windowStart: now, 
        uploadsCount: 0, 
        uploadsWindowStart: now 
    }
    
    // Ensure all fields exist (migration for existing users/records)
    if (!usage.uploadsCount) usage.uploadsCount = 0
    if (!usage.uploadsWindowStart) usage.uploadsWindowStart = now
    if (!usage.requestsCount) usage.requestsCount = 0
    if (!usage.windowStart) usage.windowStart = now

    if (isUpload) {
        // Daily Upload Limit
        const dailyWindow = 24 * 3600 * 1000 // 24 hours
        
        if (now - new Date(usage.uploadsWindowStart).getTime() > dailyWindow) {
            usage.uploadsCount = 0
            usage.uploadsWindowStart = new Date(now)
        }

        if (usage.uploadsCount >= (limits.apiUploadsPerDay || 0)) {
            return { error: "Daily upload limit exceeded", status: 429, user: null, plan: null }
        }

        usage.uploadsCount++
    } else {
        // Hourly Request Limit
        const hourlyWindow = 3600 * 1000 // 1 hour
        
        if (now - new Date(usage.windowStart).getTime() > hourlyWindow) {
            usage.requestsCount = 0
            usage.windowStart = new Date(now)
        }

        if (usage.requestsCount >= (limits.apiRequestsPerHour || 0)) {
            return { error: "Rate limit exceeded", status: 429, user: null, plan: null }
        }
    
        usage.requestsCount++
    }
    
    await User.updateOne(
        { _id: user._id },
        { $set: { apiUsage: usage } }
    )

    return { error: null, user, plan: limits }
}
