# Integración con la Nube - Brosdrop

## 📋 Descripción

Esta funcionalidad permite a los usuarios de Brosdrop importar archivos desde y exportar archivos a servicios de almacenamiento en la nube populares:

- **Google Drive** 📁
- **Dropbox** 📦
- **OneDrive** ☁️

## 🎯 Características

### Importación de Archivos
- Importa archivos directamente desde tu cuenta de Google Drive, Dropbox o OneDrive
- Selector de archivos visual e intuitivo
- Selección múltiple de archivos
- Vista previa de información del archivo (nombre, tamaño)
- Límites basados en el plan del usuario

### Exportación de Archivos
- Exporta tus archivos subidos a Brosdrop directamente a servicios de nube
- Exportación en un solo clic
- Soporte para múltiples archivos
- Renombrado automático si el archivo ya existe

### Gestión de Conexiones
- Conecta múltiples servicios de nube
- Tokens OAuth seguros almacenados en la base de datos
- Renovación automática de tokens
- Desconexión de servicios cuando ya no sean necesarios

## 🔐 Límites por Plan

| Plan | Importar | Exportar | Tamaño Máximo de Importación |
|------|----------|----------|------------------------------|
| Free | ❌ | ❌ | - |
| Plus | ✅ | ✅ | 500 MB |
| Pro | ✅ | ✅ | 5 GB |
| Guest | ❌ | ❌ | - |

## 🚀 Configuración

### 1. Google Drive

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Drive
4. Ve a "Credenciales" > "Crear credenciales" > "ID de cliente de OAuth 2.0"
5. Configura la pantalla de consentimiento de OAuth
6. Añade las URIs de redirección autorizadas:
   - `http://localhost:3000/api/cloud/google-drive/callback` (desarrollo)
   - `https://tudominio.com/api/cloud/google-drive/callback` (producción)
7. Copia el Client ID y Client Secret a tu `.env`:
   ```env
   GOOGLE_DRIVE_CLIENT_ID=tu_client_id
   GOOGLE_DRIVE_CLIENT_SECRET=tu_client_secret
   ```

**Scopes necesarios:**
- `https://www.googleapis.com/auth/drive.readonly` (leer archivos)
- `https://www.googleapis.com/auth/drive.file` (escribir archivos)

### 2. Dropbox

1. Ve a [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Crea una nueva aplicación
3. Selecciona "Scoped access"
4. Selecciona "Full Dropbox" o "App folder"
5. Dale un nombre a tu aplicación
6. En la configuración de la aplicación:
   - Añade las URIs de redirección:
     - `http://localhost:3000/api/cloud/dropbox/callback`
     - `https://tudominio.com/api/cloud/dropbox/callback`
   - En la pestaña "Permissions", habilita:
     - `files.metadata.read`
     - `files.content.read`
     - `files.content.write`
7. Copia el App key y App secret a tu `.env`:
   ```env
   DROPBOX_CLIENT_ID=tu_app_key
   DROPBOX_CLIENT_SECRET=tu_app_secret
   ```

### 3. OneDrive (Microsoft)

1. Ve a [Azure Portal](https://portal.azure.com/)
2. Ve a "Azure Active Directory" > "App registrations" > "New registration"
3. Configura tu aplicación:
   - Nombre: "Brosdrop"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: Web > `https://tudominio.com/api/cloud/onedrive/callback`
4. Después de crear:
   - Ve a "Certificates & secrets" > "New client secret"
   - Guarda el valor del secret (solo se muestra una vez)
   - Ve a "API permissions" > "Add a permission" > "Microsoft Graph"
   - Añade permisos delegados:
     - `Files.ReadWrite`
     - `offline_access`
5. Copia el Application (client) ID y el secret a tu `.env`:
   ```env
   ONEDRIVE_CLIENT_ID=tu_application_id
   ONEDRIVE_CLIENT_SECRET=tu_client_secret
   ```

## 📁 Estructura de Archivos

```
app/api/cloud/
├── connections/
│   └── route.ts              # GET/DELETE conexiones
├── google-drive/
│   ├── auth/route.ts         # Iniciar OAuth
│   ├── callback/route.ts     # Callback OAuth
│   ├── files/route.ts        # Listar archivos
│   ├── import/route.ts       # Importar archivos
│   └── export/route.ts       # Exportar archivos
├── dropbox/
│   ├── auth/route.ts
│   ├── callback/route.ts
│   ├── files/route.ts
│   ├── import/route.ts
│   └── export/route.ts
└── onedrive/
    ├── auth/route.ts
    ├── callback/route.ts
    ├── files/route.ts
    ├── import/route.ts
    └── export/route.ts

components/
└── CloudIntegration.tsx      # Componente principal UI

lib/
└── cloudProviders.ts         # Configuración y tipos

models/
└── CloudToken.ts             # Modelo de tokens OAuth
```

## 🔧 Uso del Componente

### Modo Importación (en página de subida)

```tsx
import CloudIntegration from '@/components/CloudIntegration'

function UploadPage() {
  const handleImportFiles = (files: File[]) => {
    // Añadir archivos importados a la cola de subida
    console.log('Archivos importados:', files)
  }

  return (
    <CloudIntegration
      planName="pro"
      mode="import"
      onImportFiles={handleImportFiles}
    />
  )
}
```

### Modo Exportación (después de subir archivos)

```tsx
import CloudIntegration from '@/components/CloudIntegration'

function UploadSuccessPage({ uploadedFileIds }: { uploadedFileIds: string[] }) {
  const handleExportComplete = () => {
    console.log('Exportación completada')
  }

  return (
    <CloudIntegration
      planName="pro"
      mode="export"
      uploadedFileIds={uploadedFileIds}
      onExportComplete={handleExportComplete}
    />
  )
}
```

## 💾 Modelo de Base de Datos

### CloudToken Schema

```typescript
{
  userId: ObjectId,           // Referencia al usuario
  provider: String,           // 'google-drive' | 'dropbox' | 'onedrive'
  accessToken: String,        // Token de acceso actual
  refreshToken: String,       // Token para renovar (opcional)
  expiresAt: Date,           // Fecha de expiración del token
  createdAt: Date,
  updatedAt: Date
}
```

**Índices:**
- `{ userId: 1, provider: 1 }` (único) - Un usuario puede tener un token por proveedor

## 🔄 Flujo de Autenticación

1. **Usuario hace clic en "Conectar"**
2. **Frontend solicita URL de autenticación** → `GET /api/cloud/{provider}/auth`
3. **Backend genera URL OAuth** con scopes y redirect URI
4. **Se abre popup** con la página de autenticación del proveedor
5. **Usuario autoriza la aplicación**
6. **Proveedor redirige** → `GET /api/cloud/{provider}/callback?code=...`
7. **Backend intercambia code por tokens**
8. **Tokens se guardan en MongoDB**
9. **Popup envía mensaje** al frontend y se cierra
10. **Frontend actualiza** el estado de conexión

## 🔄 Flujo de Importación

1. **Usuario selecciona proveedor conectado**
2. **Frontend solicita archivos** → `GET /api/cloud/{provider}/files`
3. **Backend lista archivos** usando la API del proveedor
4. **Usuario selecciona archivos** en el picker modal
5. **Frontend solicita importación** → `POST /api/cloud/{provider}/import`
6. **Backend descarga archivos** del proveedor
7. **Archivos se convierten** a objetos File con data URLs
8. **Frontend recibe archivos** y los pasa al callback
9. **Archivos se añaden** a la cola de subida normal

## 🔄 Flujo de Exportación

1. **Usuario hace clic en exportar** (proveedor conectado)
2. **Frontend envía IDs** → `POST /api/cloud/{provider}/export`
3. **Backend obtiene archivos** desde MongoDB
4. **Backend descarga archivos** desde Cloudflare R2
5. **Backend sube archivos** al proveedor de nube
6. **Frontend recibe confirmación** con resumen (X de Y archivos)

## 🛡️ Seguridad

### Tokens OAuth
- ✅ Almacenados encriptados en MongoDB
- ✅ Solo accesibles por el usuario propietario
- ✅ Renovación automática antes de expirar
- ✅ Scopes mínimos necesarios

### Validaciones
- ✅ Usuario debe estar autenticado
- ✅ Plan del usuario verificado antes de operaciones
- ✅ Límites de tamaño enforceados
- ✅ Solo archivos del usuario pueden ser exportados

### Rate Limiting
Considera implementar rate limiting en los endpoints de cloud para evitar:
- Abuso de la API de proveedores
- Costos excesivos de ancho de banda
- Problemas de rendimiento

## 🐛 Manejo de Errores

### Errores Comunes

**Token Expirado:**
- Se intenta renovar automáticamente
- Si falla, se solicita re-autenticación

**Archivo Demasiado Grande:**
- Se omite silenciosamente durante importación
- Se muestra mensaje al usuario

**Cuota de API Excedida:**
- Error 429 del proveedor
- Mensaje al usuario para reintentar más tarde

**Sin Conexión:**
- Error 401 No Autenticado
- Botón para conectar proveedor

## 📊 Monitoreo

### Métricas Recomendadas
- Número de conexiones por proveedor
- Volumen de datos importados/exportados
- Tasa de éxito de operaciones
- Tiempo promedio de importación/exportación
- Errores de API de proveedores

### Logs
Todos los endpoints registran:
- Operación realizada
- Usuario (ID)
- Proveedor
- Resultado (éxito/error)
- Tiempo de ejecución

## 🚦 Estados del Sistema

### CloudIntegration Component States

| Estado | Descripción | UI |
|--------|-------------|-----|
| `canUse: false` | Plan no permite cloud | Mostrar upgrade prompt |
| `isConnecting` | Conectando a proveedor | Loading spinner en botón |
| `connectedProviders` | Proveedores conectados | Check mark verde |
| `showPicker` | Mostrando selector | Modal con lista de archivos |
| `isLoading` | Cargando/procesando | Loading spinner en modal |
| `selectedFiles` | Archivos seleccionados | Checkbox marcados |

## 🎨 Personalización UI

El componente usa:
- **Framer Motion** para animaciones suaves
- **Lucide Icons** para iconografía
- **Gradientes** para el aspecto premium
- **Modales** para selectores de archivos
- **Toasts** (Sonner) para feedback

### Colores por Proveedor
- Google Drive: `#4285F4` (Azul)
- Dropbox: `#0061FF` (Azul oscuro)
- OneDrive: `#0078D4` (Azul Microsoft)

## 🔮 Mejoras Futuras

### Sincronización Bidireccional
- [ ] Auto-sync de cambios desde cloud
- [ ] Webhooks de proveedores
- [ ] Detección de conflictos
- [ ] Resolución de conflictos

### Funcionalidades Adicionales
- [ ] Más proveedores (Box, Amazon Drive, iCloud)
- [ ] Importación desde URLs públicas
- [ ] Importación masiva con barra de progreso
- [ ] Organización en carpetas del proveedor
- [ ] Compartir directamente desde cloud

### Optimizaciones
- [ ] Caché de listados de archivos
- [ ] Upload chunked para archivos grandes
- [ ] Compresión durante transferencia
- [ ] Paralelización de descargas

## 📝 Notas de Desarrollo

### Testing
Para probar localmente:
1. Configura ngrok para HTTPS: `ngrok http 3000`
2. Usa la URL de ngrok en las configuraciones de OAuth
3. Actualiza `NEXTAUTH_URL` en `.env`

### Debugging OAuth
- Verifica exactamente las URLs de redirección (trailing slash)
- Comprueba que los scopes coincidan
- Revisa la consola del navegador para errores de CORS
- Usa el modo incógnito para evitar caché de OAuth

### Limitaciones Conocidas
- Google Drive: Máximo 100 archivos por request
- Dropbox: Archivos >150MB requieren upload session
- OneDrive: Archivos >4MB requieren upload session
- Todos: Subject to provider rate limits

## 📞 Soporte

Para problemas relacionados con:
- **OAuth:** Verifica configuración de credenciales
- **Tokens:** Revisa logs de MongoDB
- **Límites:** Consulta documentación del proveedor
- **Performance:** Considera implementar caché
