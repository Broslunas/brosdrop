# Integración del Componente CloudIntegration

## 📍 Dónde integrar

### 1. Página de Subida (app/page.tsx)

**Ubicación:** Dentro del `DropZone` component, después de la dropzone principal.

```tsx
"use client"

import DropZone from "@/components/DropZone"
import CloudIntegration from "@/components/CloudIntegration"
import { useSession } from "next-auth/react"

export default function Home() {
  const { data: session } = useSession()
  const planName = session?.user?.planName || 'guest'

  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto p-8">
        {/* Existing DropZone */}
        <DropZone 
          maxBytes={10 * 1024 * 1024} 
          maxSizeLabel="10MB" 
          planName={planName} 
        />

        {/* Cloud Integration - Import Mode */}
        {session && (
          <div className="mt-8">
            <CloudIntegration
              planName={planName}
              mode="import"
              onImportFiles={(files) => {
                // Handle imported files
                console.log('Archivos importados desde la nube:', files)
                // TODO: Pass files to DropZone for upload
              }}
            />
          </div>
        )}
      </div>
    </main>
  )
}
```

### 2. Dashboard de Usuario (app/dashboard/page.tsx)

**Ubicación:** Nueva sección en el dashboard

```tsx
import CloudIntegration from "@/components/CloudIntegration"

export default function Dashboard() {
  const session = await getServerSession(authOptions)
  const planName = session?.user?.planName || 'free'

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Existing dashboard content */}

      {/* Cloud Integration Section */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">
          Importar desde la Nube
        </h2>
        <CloudIntegration
          planName={planName}
          mode="import"
          onImportFiles={(files) => {
            // Redirect to upload page with imported files
            // OR handle upload directly here
          }}
        />
      </section>
    </div>
  )
}
```

### 3. Página de Éxito de Subida (components/upload/UploadSuccess.tsx)

**Ubicación:** Después de mostrar el enlace de descarga

Primero, necesitas modificar `UploadSuccess.tsx` para aceptar los IDs de archivos subidos:

```tsx
import CloudIntegration from "@/components/CloudIntegration"

interface UploadSuccessProps {
  downloadUrl: string
  uploadedFileIds: string[] // Add this prop
  planName: string // Add this prop
}

export default function UploadSuccess({ 
  downloadUrl, 
  uploadedFileIds,
  planName 
}: UploadSuccessProps) {
  return (
    <div className="space-y-8">
      {/* Existing success UI */}
      <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
        <h3 className="text-xl font-bold text-green-400 mb-2">
          ¡Archivos subidos!
        </h3>
        <p className="text-gray-400">
          Enlace: {downloadUrl}
        </p>
      </div>

      {/* Cloud Export Integration */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-white mb-4">
          Exportar a la Nube
        </h3>
        <CloudIntegration
          planName={planName}
          mode="export"
          uploadedFileIds={uploadedFileIds}
          onExportComplete={() => {
            console.log('Archivos exportados exitosamente')
          }}
        />
      </div>
    </div>
  )
}
```

### 4. Integración Completa en DropZone

Para una integración más profunda, modifica `components/DropZone.tsx`:

```tsx
// En el componente DropZone, añade:
import CloudIntegration from './CloudIntegration'
import { useSession } from 'next-auth/react'

export default function DropZone({ maxBytes, maxSizeLabel, planName }: DropZoneProps) {
  const { data: session } = useSession()
  const [files, setFiles] = useState<File[]>([])

  // Handler for cloud imports
  const handleCloudImport = (importedFiles: File[]) => {
    setFiles(prev => [...prev, ...importedFiles])
  }

  return (
    <div className="space-y-6">
      {/* Existing dropzone UI */}
      <div className="border-2 border-dashed...">
        {/* ... */}
      </div>

      {/* Cloud Integration - Only for authenticated users with Plus/Pro */}
      {session && (planName === 'plus' || planName === 'pro') && (
        <CloudIntegration
          planName={planName}
          mode="import"
          onImportFiles={handleCloudImport}
        />
      )}

      {/* Show imported files */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div key={i} className="p-3 bg-white/5 rounded-lg">
              {file.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

## 🎨 Personalización de Estilos

### Tema Oscuro (por defecto)
El componente usa el tema oscuro de Brosdrop por defecto. Los colores principales son:

```css
Background: bg-gray-900 / bg-zinc-900
Borders: border-white/10
Text: text-white / text-gray-400
Gradients: from-blue-500 to-purple-500
```

### Adaptación al Hero de la Página Principal

Para que coincida con el estilo glassmórfico del hero:

```tsx
<div className="relative group mx-auto">
  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition duration-1000" />
  <div className="relative p-2 bg-zinc-950/80 backdrop-blur-3xl rounded-[2rem] shadow-2xl ring-1 ring-white/10">
    <CloudIntegration
      planName={planName}
      mode="import"
      onImportFiles={handleImport}
    />
  </div>
</div>
```

## 🔗 Flujo Completo de Usuario

### Escenario 1: Importar y Subir
1. Usuario visita la página principal
2. Ve la sección "Importar desde la Nube"
3. Hace clic en "Conectar" Google Drive
4. Autoriza la aplicación
5. Selecciona archivos de su Drive
6. Los archivos se añaden al DropZone
7. Usuario sube normalmente a Brosdrop

### Escenario 2: Subir y Exportar
1. Usuario sube archivos a Brosdrop
2. Obtiene enlace de descarga
3. Ve la opción "Exportar a la Nube"
4. Conecta OneDrive si no lo ha hecho
5. Hace clic en "Exportar a OneDrive"
6. Los archivos se copian a su OneDrive

### Escenario 3: Dashboard
1. Usuario autenticado en el dashboard
2. Ve sus archivos subidos
3. Puede exportar archivos existentes a la nube
4. Puede importar nuevos archivos desde la nube
5. Gestionar conexiones de cloud providers

## 📱 Responsive Design

El componente es completamente responsive:

- **Mobile:** Grid de 1 columna, modales de pantalla completa
- **Tablet:** Grid de 2 columnas
- **Desktop:** Grid de 3 columnas

```tsx
// Grid responsive automático en el componente
<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
  {/* Provider cards */}
</div>
```

## 🚨 Mensajes de Error

El componente muestra mensajes apropiados para:

- **Sin plan premium:** "Actualiza tu plan para usar esta función"
- **Sin conexión:** "Conecta tu cuenta de [provider]"
- **Archivo muy grande:** Omitido silenciosamente
- **Error de red:** "Error al importar/exportar archivos"
- **Sin archivos:** "No se encontraron archivos"

## 🎯 Best Practices

### 1. Cargar el componente solo cuando sea necesario

```tsx
import dynamic from 'next/dynamic'

const CloudIntegration = dynamic(() => import('@/components/CloudIntegration'), {
  loading: () => <div>Cargando...</div>,
  ssr: false // Client-side only
})
```

### 2. Verificar autenticación antes de mostrar

```tsx
{session && planName !== 'free' && (
  <CloudIntegration ... />
)}
```

### 3. Manejar callbacks apropiadamente

```tsx
const handleImportFiles = async (files: File[]) => {
  try {
    // Validate files
    const validFiles = files.filter(f => f.size <= maxBytes)
    
    // Add to upload queue
    setFilesToUpload(prev => [...prev, ...validFiles])
    
    // Show toast
    toast.success(`${validFiles.length} archivos añadidos`)
  } catch (error) {
    toast.error('Error al procesar archivos')
  }
}
```

### 4. Tracking y Analytics

```tsx
const handleExportComplete = () => {
  // Track export event
  analytics.track('cloud_export_completed', {
    provider: 'google-drive',
    fileCount: uploadedFileIds.length,
    plan: planName
  })
}
```

## 💡 Ejemplo Completo: Página de Upload Mejorada

```tsx
"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import DropZone from '@/components/DropZone'
import { motion } from 'framer-motion'

const CloudIntegration = dynamic(() => import('@/components/CloudIntegration'), {
  ssr: false
})

export default function UploadPage() {
  const { data: session } = useSession()
  const [importedFiles, setImportedFiles] = useState<File[]>([])
  
  const planName = session?.user?.planName || 'guest'
  const canUseCloud = planName === 'plus' || planName === 'pro'

  const handleCloudImport = (files: File[]) => {
    setImportedFiles(prev => [...prev, ...files])
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-white">
          Sube tus archivos
        </h1>
        <p className="text-gray-400 text-lg">
          Arrastra archivos o importa desde la nube
        </p>
      </motion.div>

      {/* Cloud Import Section */}
      {session && canUseCloud && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CloudIntegration
            planName={planName}
            mode="import"
            onImportFiles={handleCloudImport}
          />
        </motion.div>
      )}

      {/* Main Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <DropZone 
          maxBytes={planName === 'pro' ? 5e9 : 500e6}
          maxSizeLabel={planName === 'pro' ? '5GB' : '500MB'}
          planName={planName}
          initialFiles={importedFiles}
        />
      </motion.div>
    </div>
  )
}
```

## 🔄 Sincronización Futura

Para implementar sincronización bidireccional en el futuro:

```tsx
// Futuro: CloudSync.tsx
import { useEffect } from 'react'

export function useCloudSync(provider: CloudProvider) {
  useEffect(() => {
    // Subscribe to webhooks
    const ws = new WebSocket(`/api/cloud/${provider}/sync`)
    
    ws.onmessage = (event) => {
      const { type, file } = JSON.parse(event.data)
      
      if (type === 'file_added') {
        // Handle new file from cloud
      } else if (type === 'file_deleted') {
        // Handle deleted file
      }
    }
    
    return () => ws.close()
  }, [provider])
}
```

Esta integración transforma Brosdrop en una verdadera plataforma de gestión de archivos con capacidades de nube! 🚀
