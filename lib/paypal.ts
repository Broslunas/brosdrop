
const PAYPAL_API = process.env.NODE_ENV === 'production' 
    ? "https://api-m.paypal.com" 
    : "https://api-m.sandbox.paypal.com"

export async function getPayPalAccessToken() {
    const clientId = process.env.PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        throw new Error("Missing PayPal Credentials")
    }

    const auth = Buffer.from(clientId + ":" + clientSecret).toString("base64")

    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    })

    const data = await response.json()
    return data.access_token
}

export async function verifyPayPalOrder(orderId: string) {
    const accessToken = await getPayPalAccessToken()

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })

    if (!response.ok) {
        throw new Error("Failed to verify order")
    }

    return response.json()
}

export async function verifyPayPalSubscription(subscriptionId: string) {
    const accessToken = await getPayPalAccessToken()

    const response = await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })

    if (!response.ok) {
        throw new Error("Failed to verify subscription")
    }

    return response.json()
}
