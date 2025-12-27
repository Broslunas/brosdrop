# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a Brosdrop! Este documento proporciona directrices para contribuir al proyecto.

## 📋 Tabla de Contenidos

- [Código de Conducta](#-código-de-conducta)
- [¿Cómo Puedo Contribuir?](#-cómo-puedo-contribuir)
- [Guía de Estilo](#-guía-de-estilo)
- [Proceso de Desarrollo](#-proceso-de-desarrollo)
- [Pull Requests](#-pull-requests)
- [Reportar Bugs](#-reportar-bugs)
- [Sugerir Features](#-sugerir-features)

---

## 📜 Código de Conducta

Este proyecto y todos los participantes están regidos por el [Código de Conducta de Brosdrop](CODE_OF_CONDUCT.md). Al participar, se espera que respetes este código. Por favor reporta comportamiento inaceptable a [conduct@broslunas.com](mailto:conduct@broslunas.com).

### Nuestros Valores

- 🤗 **Inclusividad**: Todos son bienvenidos
- 💬 **Respeto**: Trata a los demás con dignidad
- 🎓 **Aprendizaje**: Todos estamos aprendiendo
- 🌟 **Excelencia**: Nos esforzamos por hacer lo mejor
- 🚀 **Innovación**: Las nuevas ideas son bienvenidas

---

## 🎯 ¿Cómo Puedo Contribuir?

### 1. 🐛 Reportar Bugs

¿Encontraste un bug? ¡Ayúdanos a solucionarlo!

**Antes de crear un reporte:**
- Verifica que no exista ya un issue similar
- Asegúrate de que el bug no sea conocido (revisa issues cerrados también)

**Para reportar un bug:**
1. Ve a [Issues](https://github.com/Broslunas/brosdrop/issues/new)
2. Usa la plantilla de "Bug Report"
3. Incluye:
   - **Descripción clara** del problema
   - **Pasos para reproducir** el bug
   - **Comportamiento esperado** vs **comportamiento actual**
   - **Screenshots** si es aplicable
   - **Entorno**: SO, navegador, versión de Node.js
   - **Logs de error** relevantes

**Ejemplo de buen reporte:**
```markdown
## Descripción
Los archivos >1GB no se suben correctamente en Safari

## Pasos para Reproducir
1. Abre Brosdrop en Safari 17
2. Intenta subir un archivo de 1.5GB
3. El progreso se detiene en 45%

## Comportamiento Esperado
El archivo debería subirse completamente

## Comportamiento Actual
La subida se congela y eventualmente falla

## Entorno
- SO: macOS Sonoma 14.2
- Navegador: Safari 17.2
- Plan: Pro

## Logs
```
Error: Request timeout after 5 minutes
at uploadFile (DropZone.tsx:245)
```
```

### 2. ✨ Sugerir Features

¿Tienes una idea para mejorar Brosdrop?

**Para sugerir una feature:**
1. Ve a [Discussions](https://github.com/Broslunas/brosdrop/discussions)
2. Crea una nueva discusión en "Ideas"
3. Incluye:
   - **Problema que resuelve** tu sugerencia
   - **Solución propuesta** con detalles
   - **Alternativas consideradas**
   - **Mockups o ejemplos** si es aplicable

### 3. 💻 Contribuir Código

Acepto contribuciones de código que:
- Solucionen bugs existentes
- Implementen features aprobadas
- Mejoren la documentación
- Añadan tests
- Optimicen performance

**NO se aceptan:**
- Cambios grandes sin discusión previa
- Features no alineadas con la visión del proyecto
- Cambios que rompan funcionalidad existente

---

## 🎨 Guía de Estilo

### Estilo de Código

#### TypeScript/JavaScript

```typescript
// ✅ BIEN: Nombres descriptivos, tipos claros
interface UploadOptions {
  fileName: string;
  maxSize: number;
  expiresInHours?: number;
}

async function uploadFile(file: File, options: UploadOptions): Promise<UploadResult> {
  // Validación primero
  if (!file || file.size === 0) {
    throw new Error('File is required');
  }

  // Lógica clara y comentada cuando es necesario
  const signedUrl = await generatePresignedUrl(file.name);
  
  // Return descriptivo
  return {
    downloadUrl: `${BASE_URL}/d/${id}`,
    expiresAt: new Date(Date.now() + options.expiresInHours * 3600000)
  };
}

// ❌ MAL: Nombres vagos, sin tipos, código confuso
function upload(f: any, opts: any) {
  const x = generateUrl(f.n);
  return {url: BASE + "/d/" + id, exp: new Date(Date.now() + opts.h * 3600000)};
}
```

#### React Components

```tsx
// ✅ BIEN: Componente tipado, props claras, estructura limpia
interface FileCardProps {
  file: UploadedFile;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export default function FileCard({ file, onDelete, loading = false }: FileCardProps) {
  const handleDelete = () => {
    if (confirm('¿Eliminar este archivo?')) {
      onDelete(file.id);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-zinc-900 border border-white/10">
      <h3 className="font-bold">{file.name}</h3>
      <button onClick={handleDelete} disabled={loading}>
        Eliminar
      </button>
    </div>
  );
}
```

#### CSS/Tailwind

- Usa **Tailwind CSS** preferentemente
- Agrupa clases lógicamente: `layout spacing colors typography states`
- Usa variables CSS para temas: `var(--primary)`

```tsx
// ✅ BIEN: Clases organizadas
<div className="
  flex items-center gap-4           // layout
  p-6 rounded-2xl                   // spacing & borders
  bg-zinc-900 border border-white/10  // colors
  text-white font-medium            // typography
  hover:bg-zinc-800 transition-all  // states
">
```

### Convenciones de Nombres

- **Archivos**: `camelCase.ts` para utils, `PascalCase.tsx` para componentes
- **Componentes**: `PascalCase`
- **Funciones**: `camelCase`
- **Constantes**: `UPPER_SNAKE_CASE`
- **Tipos/Interfaces**: `PascalCase`

```typescript
// ✅ Ejemplos correctos
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // constante
interface FileUploadOptions {}                  // tipo
function handleUpload() {}                      // función
export default function UploadButton() {}       // componente
```

### Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato
<tipo>(<scope>): <descripción corta>

[cuerpo opcional]

[footer opcional]
```

**Tipos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato, no afecta lógica
- `refactor`: Refactorización de código
- `perf`: Mejoras de performance
- `test`: Añadir o corregir tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**
```bash
feat(upload): add drag and drop support
fix(dashboard): resolve file deletion bug
docs(readme): update installation steps
refactor(api): simplify upload endpoint logic
perf(dropzone): optimize file validation
```

---

## 🔄 Proceso de Desarrollo

### 1. Fork y Clone

```bash
# Fork en GitHub primero, luego:
git clone https://github.com/TU-USUARIO/brosdrop.git
cd brosdrop
git remote add upstream https://github.com/Broslunas/brosdrop.git
```

### 2. Crea una Rama

```bash
# Sincroniza con upstream
git fetch upstream
git checkout main
git merge upstream/main

# Crea tu rama
git checkout -b feature/nombre-descriptivo
# o
git checkout -b fix/descripcion-del-bug
```

### 3. Desarrolla

```bash
# Instala dependencias
npm install

# Configura .env
cp .env.example .env
# Edita .env con tus credenciales

# Inicia el servidor de desarrollo
npm run dev
```

### 4. Testing

```bash
# Ejecuta los tests
npm test

# Linting
npm run lint

# Type checking
npm run type-check

# Build para verificar que compila
npm run build
```

### 5. Commit

```bash
# Añade tus cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat(upload): add chunked upload for large files"

# Push a tu fork
git push origin feature/nombre-descriptivo
```

### 6. Pull Request

1. Ve a tu fork en GitHub
2. Click en "Compare & pull request"
3. Rellena la plantilla de PR
4. Espera la revisión

---

## 📝 Pull Requests

### Checklist Pre-PR

Antes de abrir un PR, asegúrate de:

- [ ] El código compila sin errores (`npm run build`)
- [ ] Los tests pasan (`npm test`)
- [ ] No hay errores de linting (`npm run lint`)
- [ ] Has actualizado la documentación si es necesario
- [ ] Has añadido tests para nuevas funcionalidades
- [ ] El commit sigue Conventional Commits
- [ ] Has probado los cambios localmente
- [ ] Tu rama está actualizada con `main`

### Descripción del PR

Incluye en tu PR:

```markdown
## Descripción
Breve resumen de los cambios

## Motivación
¿Por qué es necesario este cambio?

## Cambios Realizados
- Lista de cambios principales
- Componentes afectados

## Screenshots (si aplica)
![Before](url)
![After](url)

## Testing
Cómo has probado los cambios

## Checklist
- [ ] Tests pasan
- [ ] Documentación actualizada
- [ ] Sin breaking changes
```

### Revisión de Código

- Se requiere **al menos 1 aprobación** de un maintainer
- Las sugerencias deben ser abordadas
- CI/CD debe pasar (tests, linting, build)
- PRs grandes pueden ser rechazadas; prefiere PRs pequeñas y enfocadas

---

## 🐛 Reportar Bugs

### Severidad de Bugs

- **🔴 Crítico**: La app no funciona, pérdida de datos
- **🟠 Alto**: Feature principal rota, workaround complicado
- **🟡 Medio**: Feature secundaria rota, workaround disponible
- **🟢 Bajo**: Problema cosmético, no afecta funcionalidad

### Información a Incluir

```markdown
## Descripción del Bug
[Descripción clara y concisa]

## Severidad
[Crítico/Alto/Medio/Bajo]

## Pasos para Reproducir
1. Paso 1
2. Paso 2
3. ...

## Comportamiento Esperado
[Qué debería pasar]

## Comportamiento Actual
[Qué pasa realmente]

## Screenshots
[Si aplica]

## Entorno
- OS: [macOS 14.2]
- Navegador: [Chrome 120]
- Versión: [1.2.3]

## Información Adicional
[Contexto relevante]
```

---

## ✨ Sugerir Features

### Plantilla de Feature Request

```markdown
## Problema
[¿Qué problema resuelve esta feature?]

## Solución Propuesta
[Descripción detallada de la solución]

## Alternativas Consideradas
[Otras opciones que consideraste]

## Casos de Uso
[Ejemplos de cómo se usaría]

## Mockups/Ejemplos
[Screenshots, wireframes, etc.]

## Impacto
[¿Quién se beneficiaría? ¿Cuántos usuarios?]
```

---

## 🎓 Recursos para Contribuidores

### Documentación Técnica
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)

### Herramientas Recomendadas
- **Editor**: VS Code con extensiones:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
- **Git Client**: GitKraken, Sourcetree, o CLI
- **API Testing**: Postman, Insomnia

---

## 🙋 ¿Preguntas?

Si tienes preguntas sobre cómo contribuir:

1. **Revisa la documentación** en el [Wiki](https://github.com/Broslunas/brosdrop/wiki)
2. **Busca en Discussions** por preguntas similares
3. **Pregunta en Discord** en #contributors
4. **Abre una Discussion** en GitHub

---

## 🎉 Reconocimientos

Todos los contribuidores son reconocidos en:
- El archivo [CONTRIBUTORS.md](CONTRIBUTORS.md)
- La página "About" del sitio web
- Releases notes cuando sus cambios se despliegan

---

## 📄 Licencia

Al contribuir a Brosdrop, aceptas que tus contribuciones se licenciarán bajo la [Licencia MIT](LICENSE).

---

<div align="center">

**¡Gracias por contribuir a Brosdrop! 🚀**

Made with ❤️ by the Brosdrop community

</div>
