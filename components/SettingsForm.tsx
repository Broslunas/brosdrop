"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Loader2 } from "lucide-react"
import { useModal } from "@/components/ModalProvider"

import ProfileSection from "./settings/ProfileSection"
import SubscriptionSection from "./settings/SubscriptionSection"
import PreferencesSection from "./settings/PreferencesSection"
import BrandingSection from "./settings/BrandingSection"
import DeveloperSection from "./settings/DeveloperSection"
import DangerZoneSection from "./settings/DangerZoneSection"

export default function SettingsForm() {
  const { data: session } = useSession()
  const { showModal } = useModal()
  
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
     fetch('/api/user')
        .then(res => res.json())
        .then(data => {
            if (data && !data.error) {
                setUserData({
                    name: data.name || session?.user?.name || "",
                    image: data.image || session?.user?.image || "",
                    newsletterSubscribed: data.newsletterSubscribed || false,
                    emailNotifications: data.emailNotifications ?? true,
                    defaultView: data.defaultView || 'grid',
                    branding: data.branding || { logo: '', background: '', enabled: true },
                    plan: data.plan || 'free',
                    planExpiresAt: data.planExpiresAt || null,
                    userNameID: data.userNameID || "",
                    isPublicProfile: data.isPublicProfile || false
                })
            }
        })
        .finally(() => setLoading(false))
  }, [session?.user?.email])

  const handleDeleteAccount = () => {
    showModal({
        title: "¿Eliminar cuenta?",
        message: "Estás a punto de eliminar tu cuenta permanentemente. Todos tus archivos y datos se perderán. Esta acción no se puede deshacer.",
        type: "confirm",
        confirmText: "Sí, eliminar cuenta",
        cancelText: "Cancelar",
        onConfirm: async () => {
            try {
                const res = await fetch('/api/user', { method: 'DELETE' })
                if (res.ok) {
                    signOut({ callbackUrl: '/' })
                }
            } catch (error) {
                console.error(error)
            }
        }
    })
  }

  if (loading || !userData) {
      return (
          <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
        <ProfileSection 
            initialName={userData.name}
            initialImage={userData.image}
            initialUserNameID={userData.userNameID}
            initialIsPublicProfile={userData.isPublicProfile}
        />

        <SubscriptionSection 
            plan={userData.plan}
            planExpiresAt={userData.planExpiresAt}
        />

        <PreferencesSection 
            initialData={{
                newsletterSubscribed: userData.newsletterSubscribed,
                emailNotifications: userData.emailNotifications,
                defaultView: userData.defaultView
            }}
        />

        <BrandingSection 
            plan={userData.plan}
            initialBranding={userData.branding}
        />

        <DeveloperSection plan={userData.plan} />

        <DangerZoneSection onDelete={handleDeleteAccount} />
    </div>
  )
}
