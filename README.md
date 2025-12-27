# 🚀 Brosdrop

<div align="center">

![Brosdrop Banner](https://via.placeholder.com/1200x300/0a0a0a/ffffff?text=Brosdrop+-+Share+Files+Like+a+Pro)

**La forma más rápida, segura y elegante de compartir archivos grandes**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Cloudflare R2](https://img.shields.io/badge/Storage-Cloudflare%20R2-orange)](https://www.cloudflare.com/products/r2/)

[🌐 Demo en Vivo](https://brosdrop.com) · [📖 Documentación](https://github.com/Broslunas/brosdrop/wiki) · [🐛 Reportar Bug](https://github.com/Broslunas/brosdrop/issues) · [✨ Solicitar Feature](https://github.com/Broslunas/brosdrop/issues)

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Demo](#-demo)
- [Tecnologías](#️-tecnologías)
- [Inicio Rápido](#-inicio-rápido)
- [Configuración](#️-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Planes y Pricing](#-planes-y-pricing)
- [API Pública](#-api-pública)
- [Contribuir](#-contribuir)
- [Roadmap](#️-roadmap)
- [Licencia](#-licencia)
- [Contacto](#-contacto)

---

## ✨ Características

### 🎯 Funcionalidades Core

- **📤 Transferencias Rápidas**: Sube y comparte archivos hasta 5GB (Pro)
- **🔒 Seguridad Primero**: Encriptación, protección con contraseña, y enlaces de un solo uso
- **⏱️ Caducidad Flexible**: Desde 30 minutos hasta 1 año según tu plan
- **🎨 Personalización**: Enlaces personalizados, códigos QR con logo, y branding completo
- **📊 Gestión Inteligente**: Dashboard para ver, editar y gestionar todos tus archivos

### 🌟 Features Premium

- **☁️ Integración Cloud**: Importa/exporta archivos desde Google Drive y Dropbox
- **📦 Multi-archivo**: Gestión de múltiples archivos (ZIP o separados)
- **🎨 Branding Personal**: Tu logo y fondo personalizado (Plan Pro)
- **🔗 Enlaces Personalizados**: Crea URLs memorables para tus transferencias
- **📧 Envío por Email**: Notifica automáticamente a los destinatarios
- **🔢 API Pública**: Integra Brosdrop en tus aplicaciones

### 🛡️ Seguridad y Privacidad

- ✅ Protección con contraseña
- ✅ Enlaces de un solo uso
- ✅ Caducidad automática de archivos
- ✅ Sin registro de IPs ni tracking
- ✅ Almacenamiento en Cloudflare R2 (distribuido globalmente)


---

## 🛠️ Tecnologías

### Frontend
- **[Next.js 15](https://nextjs.org/)** - Framework React con App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[Tailwind CSS](https://tailwindcss.com/)** - Estilos utility-first
- **[Framer Motion](https://www.framer.com/motion/)** - Animaciones fluidas
- **[Lucide Icons](https://lucide.dev/)** - Iconos modernos

### Backend
- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - Endpoints serverless
- **[NextAuth.js](https://next-auth.js.org/)** - Autenticación (Google, GitHub)
- **[MongoDB](https://www.mongodb.com/)** - Base de datos NoSQL
- **[Mongoose](https://mongoosejs.com/)** - ODM para MongoDB

### Almacenamiento y Servicios
- **[Cloudflare R2](https://www.cloudflare.com/products/r2/)** - Almacenamiento de objetos S3-compatible
- **[Google Drive API](https://developers.google.com/drive)** - Integración con Drive
- **[Dropbox API](https://www.dropbox.com/developers)** - Integración con Dropbox
- **[n8n](https://n8n.io/)** - Automatización de workflows (emails, limpieza)

### Pagos
- **[PayPal](https://www.paypal.com/)** - Procesamiento de pagos y suscripciones
- **[Mailjet](https://www.mailjet.com/)** - Emails transaccionales

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm/yarn/pnpm
- MongoDB (local o Atlas)
- Cuenta de Cloudflare con R2 habilitado

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/Broslunas/brosdrop.git
   cd brosdrop
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Edita `.env` con tus credenciales (ver [Configuración](#️-configuración))

4. **Ejecuta el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abre tu navegador**
   
   Navega a [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuración

### Variables de Entorno Esenciales

```env
# Database
MONGODB_URI=mongodb://localhost:27017/brosdrop

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secreto-super-secreto-aqui

# OAuth Providers
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-secret
GITHUB_CLIENT_ID=tu-github-client-id
GITHUB_CLIENT_SECRET=tu-github-secret

# Cloudflare R2
R2_ACCOUNT_ID=tu-account-id
R2_ACCESS_KEY_ID=tu-access-key
R2_SECRET_ACCESS_KEY=tu-secret-key
R2_BUCKET_NAME=brosdrop
R2_PUBLIC_URL=https://tu-bucket.r2.cloudflarestorage.com

# Stripe (opcional)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Cloud Integration (opcional)
GOOGLE_DRIVE_CLIENT_ID=tu-drive-client-id
GOOGLE_DRIVE_CLIENT_SECRET=tu-drive-secret
DROPBOX_CLIENT_ID=tu-dropbox-app-key
DROPBOX_CLIENT_SECRET=tu-dropbox-secret
```

### 🔑 Configuración Paso a Paso

<details>
<summary><b>1. MongoDB</b></summary>

#### Local
```bash
# Instala MongoDB
brew install mongodb-community  # macOS
# o descarga desde https://www.mongodb.com/try/download/community

# Inicia el servicio
brew services start mongodb-community
```

#### MongoDB Atlas (Recomendado para producción)
1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito
3. Obtén tu connection string
4. Añade tu IP a la whitelist

</details>

<details>
<summary><b>2. Cloudflare R2</b></summary>

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navega a **R2 Object Storage**
3. Crea un bucket llamado `brosdrop`
4. Genera API tokens en **R2 API Tokens**
5. Configura CORS en tu bucket:
   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000", "https://tudominio.com"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedHeaders": ["*"]
     }
   ]
   ```

</details>

<details>
<summary><b>3. OAuth (Google & GitHub)</b></summary>

#### Google OAuth
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita la API de Google+ 
4. Crea credenciales OAuth 2.0
5. Añade URIs autorizadas:
   - `http://localhost:3000/api/auth/callback/google`

#### GitHub OAuth
1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. Crea una nueva OAuth App
3. Callback URL: `http://localhost:3000/api/auth/callback/github`

</details>

<details>
<summary><b>4. Cloud Integration (Opcional)</b></summary>

Para habilitar importación/exportación de Google Drive y Dropbox, sigue las guías en:
- [Google Drive API Setup](https://developers.google.com/drive/api/guides/enable-drive-api)
- [Dropbox API Setup](https://www.dropbox.com/developers/apps)

</details>

---

## 📁 Estructura del Proyecto

```
brosdrop/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # NextAuth endpoints
│   │   ├── cloud/        # Cloud integration
│   │   ├── upload/       # Upload handling
│   │   └── user/         # User management
│   ├── dashboard/        # Dashboard pages
│   ├── pricing/          # Pricing page
│   └── page.tsx          # Homepage
├── components/            # React components
│   ├── upload/           # Upload-related
│   ├── CloudIntegration.tsx
│   ├── DropZone.tsx
│   └── ...
├── lib/                   # Utility functions
│   ├── cloudProviders.ts # Cloud config
│   ├── plans.ts          # Plan limits
│   └── db.ts             # Database connection
├── models/                # Mongoose models
│   ├── User.ts
│   ├── File.ts
│   └── CloudToken.ts
├── public/                # Static assets
└── styles/                # Global styles
```

---

## 💎 Planes y Pricing

| Plan | Precio | Max File | Storage | Expiry | Cloud Integration |
|------|--------|----------|---------|--------|-------------------|
| **Free** | €0 | 200 MB | 500 MB | 7 días | ❌ |
| **Plus** | €4.99/mes | 500 MB | 20 GB | 30 días | ✅ 500 MB |
| **Pro** | €14.99/mes | 5 GB | 200 GB | 1 año | ✅ 5 GB |

### Características por Plan

<details>
<summary><b>Ver comparativa completa</b></summary>

| Feature | Free | Plus | Pro |
|---------|------|------|-----|
| Archivos activos | 5 | 50 | 250 |
| Archivos con contraseña | 1 | 5 | 50 |
| Enlaces personalizados | 1 | 5 | 25 |
| QR personalizado | ❌ | Colores | Colores + Logo |
| Branding | ❌ | ❌ | ✅ Logo y Fondo |
| API Access | ❌ | 50/día | 500/día |
| Soporte | ❌ | Email | Prioritario |

</details>

---

## 🔌 API Pública

Brosdrop ofrece una API REST para integrar la subida de archivos en tus aplicaciones.

### Autenticación

Obtén tu API key en tu dashboard: `/dashboard/limits`

```bash
Authorization: Bearer tu-api-key-aqui
```

### Endpoint de Upload

```bash
POST /api/upload
Content-Type: application/json

{
  "name": "document.pdf",
  "type": "application/pdf",
  "size": 1024000,
  "expiresInHours": 24,
  "password": "opcional"
}

# Respuesta
{
  "url": "https://r2.cloudflare.com/signed-url",
  "id": "abc123",
  "downloadUrl": "https://brosdrop.com/d/abc123"
}
```

### Rate Limits

- **Plus**: 50 uploads/día
- **Pro**: 500 uploads/día

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Lee nuestra [Guía de Contribución](CONTRIBUTING.md) para empezar.

### Proceso

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 🗺️ Roadmap

- [x] Upload básico con drag & drop
- [x] Dashboard de gestión de archivos
- [x] Integración con Google Drive y Dropbox
- [x] Sistema de planes y pagos
- [x] API pública
- [ ] App móvil (React Native)
- [ ] Compartir carpetas completas
- [ ] Colaboración en tiempo real
- [ ] Notificaciones cuando se descargue un archivo
- [ ] Soporte para más cloud providers (OneDrive, Box)

Ver el [Roadmap completo](https://github.com/Broslunas/brosdrop/projects/1)

---

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 📞 Contacto

**Broslunas Team**

- 🌐 Website: [https://broslunas.com](https://broslunas.com)
- 📧 Email: contacto@broslunas.com
- 🐦 Twitter: [@broslunas](https://twitter.com/broslunas)

---

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) por el increíble framework
- [Cloudflare](https://www.cloudflare.com/) por R2 Storage
- [Vercel](https://vercel.com/) por el hosting
- Todos nuestros [contribuidores](https://github.com/Broslunas/brosdrop/graphs/contributors)

---

<div align="center">

**⭐ Si te gusta Brosdrop, dale una estrella en GitHub! ⭐**

Made with ❤️ by [Broslunas](https://broslunas.com)

</div>
