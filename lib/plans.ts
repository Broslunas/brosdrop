export const PLAN_LIMITS = {
    free: { 
        name: "Gratis",
        maxBytes: 200 * 1000 * 1000, // 200MB
        maxFiles: 5, 
        maxPwd: 1,
        maxCustomLinks: 0, 
        maxDays: 7,
        maxTotalStorage: 500 * 1000 * 1000, // 500MB
        hasApiAccess: false,
        apiUploadsPerDay: 0,
        apiRequestsPerHour: 0,
        maxFolders: 3,
        maxTagsPerFile: 5
    },
    plus: { 
        name: "Plus",
        maxBytes: 500 * 1000 * 1000, // 500MB
        maxFiles: 50, 
        maxPwd: 5,
        maxCustomLinks: 5, 
        maxDays: 30,
        maxTotalStorage: 20 * 1000 * 1000 * 1000, // 20GB
        canCustomizeColors: true,
        canCustomizeLogo: false,
        hasApiAccess: true,
        apiUploadsPerDay: 15,
        apiRequestsPerHour: 100,
        maxFolders: 20,
        maxTagsPerFile: 15
    },
    pro: { 
        name: "Pro",
        maxBytes: 5 * 1000 * 1000 * 1000, // 5GB
        maxFiles: 250, 
        maxPwd: 50,
        maxCustomLinks: 25, 
        maxDays: 365,
        maxTotalStorage: 200 * 1000 * 1000 * 1000, // 200GB
        canCustomizeColors: true,
        canCustomizeLogo: true,
        hasApiAccess: true,
        apiUploadsPerDay: 50,
        apiRequestsPerHour: 500,
        maxFolders: 999999,
        maxTagsPerFile: 999999
    },
    guest: { 
        name: "Invitado",
        maxBytes: 10 * 1000 * 1000, // 10MB
        maxFiles: 0, 
        maxPwd: 0, 
        maxCustomLinks: 0,
        maxDays: 0.02, // 30 mins
        maxTotalStorage: 100 * 1000 * 1000, // 100MB
        hasApiAccess: false,
        apiUploadsPerDay: 0,
        apiRequestsPerHour: 0,
        maxFolders: 0,
        maxTagsPerFile: 0
    }
}

export type PlanType = keyof typeof PLAN_LIMITS

export const PRICING = {
    plus: { monthly: 4.99, annual: 47.90 },
    pro: { monthly: 14.99, annual: 143.90 }
}

export const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes'
    const k = 1000 // Base 1000 for standard SI prefixes
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
