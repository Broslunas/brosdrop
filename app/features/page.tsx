
import { UploadCloud, Shield, Clock, Zap, Globe, FileType } from "lucide-react"

export const metadata = {
  title: "Características",
  description: "Explora las potentes características de BrosDrop - intercambio de archivos simple, seguro y rápido.",
}

const features = [
  {
    name: 'Almacenamiento Seguro',
    description: 'Tus archivos son encriptados y almacenados de forma segura utilizando la tecnología Cloudflare R2, asegurando máxima seguridad y redundancia.',
    icon: Shield,
  },
  {
    name: 'Auto-Expiración',
    description: 'Los archivos expiran automáticamente después de un tiempo (7 días para usuarios, 30 min para invitados) para mantener tu privacidad y reducir el desorden.',
    icon: Clock,
  },
  {
    name: 'Velocidad Relámpago',
    description: 'Impulsado por una CDN global, tus subidas y descargas se sirven desde el borde, asegurando la menor latencia posible.',
    icon: Zap,
  },
  {
    name: 'Acceso Global',
    description: 'Comparte tus archivos con cualquier persona, en cualquier lugar del mundo. Sin bloqueos regionales, sin límites de velocidad.',
    icon: Globe,
  },
  {
    name: 'Cualquier Tipo de Archivo',
    description: 'Comparte documentos, imágenes, videos, audio y más. BrosDrop soporta todos los tipos de archivos principales.',
    icon: FileType,
  },
  {
    name: 'Interfaz Simple',
    description: 'Arrastra, suelta y listo. Nuestra interfaz está diseñada para ser lo más intuitiva y sin fricción posible.',
    icon: UploadCloud,
  },
]

export default function FeaturesPage() {
  return (
    <div className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Todo lo que necesitas</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            El intercambio de archivos evolucionado.
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            BrosDrop elimina la fricción del intercambio de archivos. Sin formularios masivos, sin esperas, solo alojamiento de archivos simple, seguro y efímero.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-400">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
