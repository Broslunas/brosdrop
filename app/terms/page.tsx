
export const metadata = {
  title: "Términos de Servicio | BrosDrop",
  description: "Lea nuestros términos de servicio y condiciones de uso.",
  openGraph: {
    title: "Términos de Servicio - BrosDrop",
    description: "Términos de uso de la plataforma BrosDrop.",
  }
}

export default function TermsPage() {
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
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl mb-10 text-center">Términos de Servicio</h1>
            
            <div className="space-y-8">
              <section>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">1. Acuerdo de Términos</h2>
                  <p>
                      Estos Términos de Uso constituyen un acuerdo legalmente vinculante entre tú, ya sea personalmente o en nombre de una entidad ("tú") y BrosDrop ("nosotros", "nos" o "nuestro"), con respecto a tu acceso y uso del sitio web [brosdrop.com], así como cualquier otro medio, canal de medios, sitio web móvil o aplicación móvil relacionada, vinculada o conectada de otra manera al mismo (colectivamente, el "Sitio").
                  </p>
              </section>
  
              <section>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">2. Derechos de Propiedad Intelectual</h2>
                  <p>
                      A menos que se indique lo contrario, el Sitio es nuestra propiedad exclusiva y todo el código fuente, bases de datos, funcionalidad, software, diseños de sitios web, audio, video, texto, fotografías y gráficos en el Sitio (colectivamente, el "Contenido") y las marcas comerciales, marcas de servicio y logotipos contenidos en ellos (las "Marcas") son propiedad o están controlados por nosotros o licenciados a nosotros, y están protegidos por leyes de derechos de autor y marcas comerciales.
                  </p>
              </section>
  
              <section>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">3. Representaciones del Usuario</h2>
                  <p>
                      Al usar el Sitio, representas y garantizas que: (1) toda la información de registro que envíes será verdadera, precisa, actual y completa; (2) mantendrás la precisión de dicha información y actualizarás dicha información de registro según sea necesario; (3) tienes la capacidad legal y aceptas cumplir con estos Términos de Uso; (4) no eres menor de edad en la jurisdicción en la que resides.
                  </p>
              </section>
              
               <section>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">4. Actividades Prohibidas</h2>
                  <p>
                     No puedes acceder o usar el Sitio para ningún otro propósito que no sea aquel para el cual hacemos que el Sitio esté disponible. El Sitio no puede ser utilizado en relación con ningún esfuerzo comercial, excepto aquellos que sean específicamente respaldados o aprobados por nosotros.
                  </p>
              </section>
               <section>
                   <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">5. Limitación de Responsabilidad</h2>
                  <p>
                      En ningún caso seremos responsables ante ti o cualquier tercero por daños directos, indirectos, consecuentes, ejemplares, incidentales, especiales o punitivos, incluyendo lucro cesante, pérdida de ingresos, pérdida de datos u otros daños que surjan de tu uso del sitio, incluso si hemos sido advertidos de la posibilidad de tales daños.
                  </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    )
  }
