
export const metadata = {
  title: "Política de Privacidad | BrosDrop",
  description: "Política de Privacidad de BrosDrop. Conoce qué datos recopilamos y cómo los protegemos.",
  openGraph: {
    title: "Política de Privacidad - BrosDrop",
    description: "Política de Privacidad de BrosDrop.",
  }
}

export default function PrivacyPage() {
    return (
      <div className="bg-white dark:bg-zinc-950 min-h-screen py-24 sm:py-32 relative overflow-hidden transition-colors duration-300">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
             <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03]" />
            <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[128px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="mx-auto max-w-3xl px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-3xl text-base leading-7 text-zinc-600 dark:text-gray-300 bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-xl shadow-lg">
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl mb-10 text-center">Política de Privacidad</h1>
          
          <div className="space-y-8">
            <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">1. Introducción</h2>
                <p>
                    Bienvenido a BrosDrop ("nosotros", "nuestro" o "nos"). Estamos comprometidos a proteger tu privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y salvaguardamos tu información cuando visitas nuestro sitio web [brosdrop.com], incluyendo cualquier otro medio, canal de medios, sitio web móvil o aplicación móvil relacionada o conectada al mismo (colectivamente, el "Sitio"). Por favor, lee esta política de privacidad cuidadosamente. Si no estás de acuerdo con los términos de esta política de privacidad, por favor no accedas al sitio.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">2. Recopilación de tu Información</h2>
                <p className="mb-2">Podemos recopilar información sobre ti de varias maneras. La información que podemos recopilar en el Sitio incluye:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Datos Personales:</strong> Información de identificación personal, como tu nombre, dirección de envío, dirección de correo electrónico y número de teléfono, e información demográfica, como tu edad, género, ciudad natal e intereses, que nos proporcionas voluntariamente cuando te registras en el Sitio o cuando eliges participar en diversas actividades relacionadas con el Sitio, como chat en línea y foros de mensajes.</li>
                    <li><strong>Datos Derivados:</strong> Información que nuestros servidores recopilan automáticamente cuando accedes al Sitio, como tu dirección IP, tu tipo de navegador, tu sistema operativo, tus tiempos de acceso y las páginas que has visto directamente antes y después de acceder al Sitio.</li>
                </ul>
            </section>

             <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">3. Uso de tu Información</h2>
                 <p className="mb-2">Tener información precisa sobre ti nos permite proporcionarte una experiencia fluida, eficiente y personalizada. Específicamente, podemos utilizar la información recopilada sobre ti a través del Sitio para:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Crear y administrar tu cuenta.</li>
                    <li>Compilar datos estadísticos anónimos y análisis para uso interno o con terceros.</li>
                    <li>Enviarte correos electrónicos sobre tu cuenta o pedido.</li>
                    <li>Habilitar comunicaciones de usuario a usuario.</li>
                    <li>Aumentar la eficiencia y el funcionamiento del Sitio.</li>
                </ul>
            </section>
             <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">4. Divulgación de tu Información</h2>
                <p>
                    Podemos compartir la información que hemos recopilado sobre ti en ciertas situaciones. Tu información puede ser divulgada de la siguiente manera: 
                </p>
                <p className="mt-2">
                    <strong>Por Ley o para Proteger Derechos:</strong> Si creemos que la divulgación de información sobre ti es necesaria para responder a un proceso legal, para investigar o remediar posibles violaciones de nuestras políticas, o para proteger los derechos, la propiedad y la seguridad de otros, podemos compartir tu información según lo permita o requiera cualquier ley, regla o regulación aplicable.
                </p>
            </section>
             <section>
                 <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">5. Seguridad de tu Información</h2>
                <p>
                   Utilizamos medidas de seguridad administrativas, técnicas y físicas para ayudar a proteger tu información personal. Si bien hemos tomado medidas razonables para asegurar la información personal que nos proporcionas, ten en cuenta que a pesar de nuestros esfuerzos, ninguna medida de seguridad es perfecta o impenetrable, y ningún método de transmisión de datos puede garantizarse contra cualquier intercepción u otro tipo de uso indebido.
                </p>
            </section>
          </div>
        </div>
        </div>
      </div>
    )
  }
