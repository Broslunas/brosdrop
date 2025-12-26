
import Link from 'next/link';

export const metadata = {
  title: "Centro de Ayuda",
  description: "Obtén ayuda con el uso de BrosDrop.",
}

const faqs = [
  {
    question: "¿Cuánto tiempo duran mis archivos?",
    answer: "Para usuarios registrados, los archivos duran 7 días. Para usuarios invitados, los archivos expiran después de 30 minutos para garantizar privacidad y seguridad.",
  },
  {
    question: "¿Hay un límite de tamaño de archivo?",
    answer: "Sí, actualmente soportamos archivos de hasta 1GB para un rendimiento óptimo. El soporte para archivos más grandes llegará pronto.",
  },
  {
    question: "¿Puedo eliminar mis archivos antes de tiempo?",
    answer: "Absolutamente. Puedes administrar tus subidas desde tu panel y eliminarlas en cualquier momento.",
  },
  {
    question: "¿Mis datos están seguros?",
    answer: "Sí. Todas las transferencias están encriptadas y los archivos se almacenan de forma segura en Cloudflare R2 con estrictos controles de acceso. No vendemos tus datos.",
  },
]

export default function HelpPage() {
    return (
      <div className="bg-background py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">Soporte</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Preguntas frecuentes
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              ¿No encuentras la respuesta que buscas? Contacta con nuestro equipo de soporte.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {faqs.map((faq) => (
                <div key={faq.question} className="pt-8 sm:inline-block sm:w-full sm:px-4">
                  <dt className="text-base font-semibold leading-7 text-white">
                    {faq.question}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-400">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mt-16 text-center">
             <Link href="mailto:support@broslunas.com" className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 border border-zinc-700">
                Contactar Soporte
             </Link>
          </div>
        </div>
      </div>
    )
  }
