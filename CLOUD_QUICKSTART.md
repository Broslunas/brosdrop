# 🚀 Cloud Integration - Quick Start Checklist

## ✅ Paso 1: Verificar Archivos (Completado)

Todos los archivos han sido creados. Verifica que existan:

```bash
# Core files
lib/cloudProviders.ts
models/CloudToken.ts
components/CloudIntegration.tsx

# API routes (15 endpoints)
app/api/cloud/connections/route.ts
app/api/cloud/google-drive/[auth|callback|files|import|export]/route.ts
app/api/cloud/dropbox/[auth|callback|files|import|export]/route.ts
app/api/cloud/onedrive/[auth|callback|files|import|export]/route.ts

# Documentation
CLOUD_INTEGRATION.md
CLOUD_INTEGRATION_GUIDE.md
CLOUD_FEATURE_SUMMARY.md
```

## 📝 Paso 2: Configurar OAuth Credentials

### Google Drive (15-20 minutos)

1. [ ] Ir a https://console.cloud.google.com/
2. [ ] Crear nuevo proyecto "Brosdrop"
3. [ ] Habilitar "Google Drive API"
4. [ ] Ir a "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. [ ] Configurar OAuth consent screen:
   - User Type: External
   - App name: Brosdrop
   - User support email: tu@email.com
   - Scopes: Google Drive API (drive.readonly, drive.file)
6. [ ] Crear OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/cloud/google-drive/callback` (dev)
     - `https://tudominio.com/api/cloud/google-drive/callback` (prod)
7. [ ] Copiar Client ID y Client Secret
8. [ ] Añadir a `.env`:
   ```
   GOOGLE_DRIVE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
   GOOGLE_DRIVE_CLIENT_SECRET=tu_client_secret
   ```

### Dropbox (10-15 minutos)

1. [ ] Ir a https://www.dropbox.com/developers/apps
2. [ ] "Create App" → "Scoped access" → "Full Dropbox"
3. [ ] Nombre: "Brosdrop"
4. [ ] En Settings:
   - Redirect URIs:
     - `http://localhost:3000/api/cloud/dropbox/callback`
     - `https://tudominio.com/api/cloud/dropbox/callback`
5. [ ] En Permissions, habilitar:
   - [ ] `files.metadata.read`
   - [ ] `files.content.read`
   - [ ] `files.content.write`
6. [ ] Copiar App key y App secret
7. [ ] Añadir a `.env`:
   ```
   DROPBOX_CLIENT_ID=tu_app_key
   DROPBOX_CLIENT_SECRET=tu_app_secret
   ```

### OneDrive (20-25 minutos)

1. [ ] Ir a https://portal.azure.com/
2. [ ] Azure Active Directory → "App registrations" → "New registration"
3. [ ] Configurar:
   - Name: Brosdrop
   - Supported account types: "Personal Microsoft accounts only"
   - Redirect URI: Web → `https://tudominio.com/api/cloud/onedrive/callback`
4. [ ] Después de crear, ir a "Certificates & secrets"
5. [ ] "New client secret" → Copiar el VALUE (se muestra una sola vez)
6. [ ] Ir a "API permissions" → "Add a permission" → "Microsoft Graph"
7. [ ] Delegated permissions:
   - [ ] `Files.ReadWrite`
   - [ ] `offline_access`
8. [ ] Copiar Application (client) ID de la página Overview
9. [ ] Añadir a `.env`:
   ```
   ONEDRIVE_CLIENT_ID=tu_application_id
   ONEDRIVE_CLIENT_SECRET=tu_client_secret_value
   ```

## 🔧 Paso 3: Testing Local con ngrok (Opcional pero Recomendado)

OAuth requiere HTTPS en producción. Para testing local:

```bash
# Instalar ngrok si no lo tienes
# https://ngrok.com/download

# Ejecutar ngrok
ngrok http 3000

# Ejemplo de output:
# Forwarding https://abc123.ngrok.io -> http://localhost:3000
```

Actualiza las redirect URIs en todos los proveedores con tu URL de ngrok.

## 🎨 Paso 4: Integrar el Componente

### Opción A: Página Principal (Import Mode)

Edita `app/page.tsx`:

```tsx
import CloudIntegration from '@/components/CloudIntegration'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const planName = session?.user?.planName || 'guest'

  return (
    <main>
      {/* Tu DropZone existente */}
      
      {/* Añade esto después del DropZone */}
      {session && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            Importar desde la Nube
          </h2>
          <CloudIntegration
            planName={planName}
            mode="import"
            onImportFiles={(files) => {
              console.log('Archivos importados:', files)
              // TODO: Pasar archivos al DropZone
            }}
          />
        </section>
      )}
    </main>
  )
}
```

### Opción B: Dashboard (Ambos Modos)

Edita `app/dashboard/page.tsx`:

```tsx
import CloudIntegration from '@/components/CloudIntegration'

export default function Dashboard({ session, userFiles }) {
  const planName = session?.user?.planName || 'free'

  return (
    <div className="space-y-12">
      {/* Contenido existente del dashboard */}

      {/* Nueva sección de Cloud */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Cloud Storage</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Import */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Importar</h3>
            <CloudIntegration
              planName={planName}
              mode="import"
              onImportFiles={(files) => {
                // Handle import
              }}
            />
          </div>

          {/* Export */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Exportar</h3>
            <CloudIntegration
              planName={planName}
              mode="export"
              uploadedFileIds={userFiles.map(f => f._id)}
              onExportComplete={() => {
                console.log('Export completado')
              }}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
```

## 🧪 Paso 5: Testing

### Checklist de Testing

#### Google Drive
- [ ] Click "Conectar" → Abre popup de Google
- [ ] Autorizar aplicación → Popup se cierra
- [ ] Estado cambia a "Conectado" con check verde
- [ ] Click en proveedor conectado → Abre modal de archivos
- [ ] Seleccionar 1-3 archivos → Checkboxes funcionan
- [ ] Click "Importar" → Archivos se descargan
- [ ] Callback recibe File objects correctos
- [ ] Exportar archivos → Aparecen en Google Drive

#### Dropbox
- [ ] Mismo flujo que Google Drive
- [ ] Verificar que archivos se listan correctamente
- [ ] Import funciona con diferentes tipos de archivo
- [ ] Export funciona con archivos grandes

#### OneDrive
- [ ] Mismo flujo que Google Drive
- [ ] Verificar chunked upload para archivos >4MB
- [ ] Import respeta límites de plan

#### Error Handling
- [ ] Usuario Free ve mensaje de upgrade
- [ ] Archivo muy grande se omite silenciosamente
- [ ] Token expirado se renueva automáticamente
- [ ] Error de red muestra toast de error
- [ ] Desconexión de proveedor funciona

#### UI/UX
- [ ] Animaciones suaves
- [ ] Loading states apropiados
- [ ] Responsive en mobile/tablet/desktop
- [ ] Colores coinciden con tema de Brosdrop
- [ ] Toasts informativos

## 📊 Paso 6: Monitoreo (Opcional)

Añade logs para debugging:

```typescript
// En cada endpoint de API
console.log('[CLOUD] Operation:', {
  userId: session.user.id,
  provider,
  operation: 'import|export|list',
  timestamp: new Date().toISOString(),
})
```

## 🔒 Paso 7: Seguridad Checklist

- [ ] Tokens nunca se envían al frontend
- [ ] Solo el usuario propietario puede acceder a sus tokens
- [ ] Límites de plan se verifican en backend
- [ ] Redirect URIs coinciden exactamente
- [ ] HTTPS en producción
- [ ] Scopes mínimos necesarios configurados
- [ ] Validación de session en cada request

## 🚀 Paso 8: Deploy a Producción

### Pre-deploy
- [ ] Variables de entorno configuradas en Vercel/servidor
- [ ] Redirect URIs actualizadas con dominio de producción
- [ ] Testing completo en staging
- [ ] MongoDB index creado para CloudToken

### Deploy
```bash
# Build production
npm run build

# Verificar que no hay errores de tipo
npm run lint

# Deploy
vercel --prod
# O tu método de deploy preferido
```

### Post-deploy
- [ ] Probar OAuth flow en producción
- [ ] Verificar HTTPS funciona correctamente
- [ ] Probar import/export con archivos reales
- [ ] Monitorear logs por 24h

## 📈 Paso 9: Actualizar Pricing Page (Opcional)

Destaca la feature de cloud en la página de pricing:

```tsx
// En app/pricing/page.tsx

<div className="feature-list">
  <Feature icon={Cloud}>
    ☁️ Integración con Google Drive, Dropbox, OneDrive
  </Feature>
  {/* ... */}
</div>
```

## 📣 Paso 10: Anunciar la Feature

### En tu app
- [ ] Banner/toast para usuarios existentes
- [ ] Email a usuarios Plus/Pro
- [ ] Update en changelog/blog

### Marketing
- [ ] Tweet/post en redes
- [ ] Update en ProductHunt (si aplica)
- [ ] Demo video/GIF

## ⏱️ Tiempo Estimado Total

- Configuración OAuth: ~45-60 minutos
- Integración del componente: ~15-30 minutos
- Testing: ~30-45 minutos
- Deploy y verificación: ~15-20 minutos

**Total: 2-3 horas** para tener la feature completamente funcional en producción.

## 🎉 ¡Listo!

Una vez completados estos pasos, tus usuarios Plus y Pro podrán:
- ✅ Importar archivos desde Google Drive, Dropbox y OneDrive
- ✅ Exportar sus archivos subidos a servicios de nube
- ✅ Gestionar múltiples conexiones de cloud
- ✅ Experimentar sincronización fluida entre Brosdrop y sus clouds favoritos

---

## 🆘 Si algo no funciona:

1. Revisar `CLOUD_INTEGRATION.md` → Sección Troubleshooting
2. Verificar logs del servidor en la consola
3. Verificar redirect URIs coinciden exactamente
4. Probar en modo incógnito (evitar caché OAuth)
5. Verificar que todos los permisos/scopes estén habilitados

## 📚 Referencias Rápidas

- **Documentación técnica:** `CLOUD_INTEGRATION.md`
- **Guía de integración:** `CLOUD_INTEGRATION_GUIDE.md`
- **Resumen completo:** `CLOUD_FEATURE_SUMMARY.md`
- **Architecture diagram:** Artifact generado

**¡Mucha suerte con el deploy! 🚀**
