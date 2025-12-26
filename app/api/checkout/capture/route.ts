
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import Transaction from "@/models/Transaction"
import { verifyPayPalOrder } from "@/lib/paypal"
import { PRICING } from "@/lib/plans"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { orderID, planName, isAnnual, months = 1 } = await req.json()
        
        if (!orderID || !planName) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 })
        }

        // Verify with PayPal
        const order = await verifyPayPalOrder(orderID)
        
        // Check status
        if (order.status !== 'COMPLETED' && order.status !== 'APPROVED') {
             return NextResponse.json({ error: "Order not completed" }, { status: 400 })
        }

        // Verify Amount (Security)
        const pricing = PRICING[planName as keyof typeof PRICING]
        if (!pricing) return NextResponse.json({ error: "Invalid plan" }, { status: 400 })

        let expectedPrice = 0
        
        // Calculate Expected Price based on months
        if (isAnnual || months === 12) {
            expectedPrice = pricing.annual
        } else {
            expectedPrice = parseFloat((pricing.monthly * months).toFixed(2))
        }
            
        if (!expectedPrice) {
            return NextResponse.json({ error: "Invalid calculation" }, { status: 400 })
        }

        const paidAmount = parseFloat(order.purchase_units[0].amount.value)
        
        // Allow small float margin error
        if (Math.abs(paidAmount - expectedPrice) > 0.5) { 
             console.error(`Price Mismatch: Expected ${expectedPrice}, got ${paidAmount}`)
             // return NextResponse.json({ error: "Price mismatch" }, { status: 400 })
        }

        await dbConnect()

        // Calculate Expiration
        const user = await User.findById(session.user.id)
        
        const now = new Date()
        const currentExpiry = user.planExpiresAt ? new Date(user.planExpiresAt) : now
        
        
        let startDate = now
        if (user.plan === planName && currentExpiry > now) {
            startDate = currentExpiry
        }

        const durationDays = (isAnnual || months === 12) ? 365 : (months * 30)
        const newExpiry = new Date(startDate)
        newExpiry.setDate(newExpiry.getDate() + durationDays)

        // Update User
        user.plan = planName
        user.planExpiresAt = newExpiry
        
        // Init branding if new pro user? 
        if (planName === 'pro' && !user.branding) {
            user.branding = { enabled: true }
        }
        
        await user.save()

        // Log Transaction
        await Transaction.create({
            userId: user._id,
            paypalOrderId: orderID,
            plan: planName,
            amount: paidAmount,
            currency: order.purchase_units[0].amount.currency_code,
            status: order.status,
            duration: isAnnual ? 'annual' : 'monthly'
        })

        return NextResponse.json({ success: true, newPlan: planName, expiresAt: newExpiry })

    } catch (error) {
        console.error("Checkout Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
