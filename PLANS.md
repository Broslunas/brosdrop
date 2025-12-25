# Estructura de Planes de Precios

Aquí tienes una estructura ampliada con 4 niveles para cubrir desde usuarios casuales hasta empresas.

| Característica | 👤 Free (Verificado) | 💎 Plus | 🚀 Pro | 🏢 Business |
| :--- | :---: | :---: | :---: | :---: |
| **Precio** | **Gratis** | **$4.99 / mes** | **$14.99 / mes** | **$49.99 / mes** |
| **Enfoque** | Uso Personal | Freelancers | Creadores/Video | Agencias/Equipos |
| **Subida Máxima** | 200 MB | 5 GB | 50 GB | 500 GB |
| **Almacenamiento** | Temporal | 100 GB | 1 TB | 5 TB |
| **Caducidad** | 7 días | 30 días | 1 Año | Ilimitado |
| **Personalización** | ❌ | Sin Anuncios | Logo y Fondo | **Dominio Propio (CNAME)** |
| **Seguridad** | Contraseña | Contraseña | + Encriptación E2E | + Auditoría de Accesos |
| **Analíticas** | Básicas | Básicas | Avanzadas | Reportes Exportables |

## Detalles de los Nuevos Planes

### 💎 Plus ($4.99/mes)
Para quienes necesitan enviar archivos más grandes ocasionalmente sin complicaciones.
*   **Mejora clave**: Sube archivos de hasta **5 GB**.
*   Tus enlaces duran **1 mes** en lugar de 1 semana.
*   Experiencia limpia sin "promociones" de la plataforma.

### 🚀 Pro ($14.99/mes) - *Recomendado*
El estándar para profesionales creativos (fotógrafos, editores de video).
*   **Bestialidad de 50 GB** por transferencia. Ideal para enviar brutos de cámara 4K/8K.
*   **Personalización Total**: La página de descarga muestra *tu* logo y *tu* imagen de fondo. El cliente siente que está en tu sitio.
*   **1 TB de almacenamiento**: Puedes usarlo como tu nube personal de entregas.
*   **Caducidad Larga**: Tus clientes tienen 1 año para descargar.

### 🏢 Business ($49.99/mes)
Para pequeñas agencias o equipos de trabajo.
*   **Dominio Personalizado**: `archivos.tuexito.com` en lugar de `brosdrop.com`.
*   **5 Usuarios incluidos**: Gestiona permisos de tu equipo.
*   **Audit Logs**: Rastrea quién descargó qué y cuándo con precisión de IP y geolocalización.
*   **Soporte Prioritario**: Chat directo con el equipo técnico.

## Próximos Pasos Técnicos

1.  **UI de Pricing**: Crear `/pricing` con un diseño de tarjetas comparativas (suscripción Mensual/Anual con descuento).
2.  **Stripe Products**: Configurar estos 3 productos (Plus, Pro, Business) en el dashboard de Stripe.
3.  **Portal de Cliente**: Integrar el Portal de Cliente de Stripe para que los usuarios gestionen sus suscripciones (cancelar, actualizar tarjeta) sin que programes esa lógica.
