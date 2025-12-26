
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import Transaction from "@/models/Transaction"
import { verifyPayPalSubscription } from "@/lib/paypal"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { subscriptionID, planName } = await req.json()
        
        if (!subscriptionID || !planName) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 })
        }

        // Verify with PayPal
        const subscription = await verifyPayPalSubscription(subscriptionID)
        
        // Check status (ACTIVE, APPROVAL_PENDING? Usually ACTIVE after approval)
        if (subscription.status !== 'ACTIVE') {
             return NextResponse.json({ error: "Subscription not active" }, { status: 400 })
        }

        await dbConnect()
        const user = await User.findById(session.user.id)
        
        // Update User
        user.plan = planName
        user.subscriptionId = subscriptionID // Store sub ID for future reference/cancellation
        
        // Set expiry based on next_billing_time or standard duration
        const nextBilling = new Date(subscription.billing_info?.next_billing_time || Date.now())
        // Fallback: If PayPal lacks billing info instantly, add 30 days buffer
        if (!subscription.billing_info?.next_billing_time) {
            nextBilling.setDate(nextBilling.getDate() + 32)
        }
        
        user.planExpiresAt = nextBilling

        // Init branding if new pro user
        if (planName === 'pro' && !user.branding) {
            user.branding = { enabled: true }
        }
        
        await user.save()

        // Log Transaction (First payment)
        // Note: Amount might vary or be in last_payment info
        await Transaction.create({
            userId: user._id,
            paypalOrderId: subscriptionID, // using sub ID as order ref
            plan: planName,
            amount: 0, // Hard to get exact amount from generic sub verify without transaction search. 
            currency: 'USD',
            status: 'subscription_active',
            duration: 'recurring'
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Subscription Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
