
import SettingsForm from "@/components/SettingsForm"

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  return (
    <div className="w-full space-y-8 py-8 px-4">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Configuración</h1>
        <p className="text-muted-foreground mt-1">Gestiona tu perfil y preferencias de cuenta.</p>
      </header>

      <div className="w-full">
         <SettingsForm />
      </div>
    </div>
  )
}
