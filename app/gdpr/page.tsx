
export const metadata = {
  title: "Cumplimiento con RGPD",
  description: "Cumplimiento con RGPD de BrosDrop.",
}

export default function GDPRPage() {
    return (
      <div className="bg-background py-24 sm:py-32 px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-base leading-7 text-gray-300">
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl mb-10">Cumplimiento con RGPD</h1>
          
          <div className="space-y-8">
            <section>
                 <h2 className="text-xl font-bold text-white mb-4">Compromiso con el RGPD</h2>
                <p>
                    BrosDrop se compromete a garantizar la seguridad y protección de la información personal que procesamos, y a proporcionar un enfoque conforme y consistente para la protección de datos. Siempre hemos tenido un programa de protección de datos sólido y efectivo que cumple con la ley vigente y se rige por los principios de protección de datos. Sin embargo, hemos actualizado y ampliado este programa para cumplir con las demandas del RGPD y la Ley de Protección de Datos de España.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-4">Tus Derechos bajo el RGPD</h2>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Derecho de acceso:</strong> Tienes derecho a solicitar copias de tus datos personales.</li>
                    <li><strong>Derecho de rectificación:</strong> Tienes derecho a solicitar que corrijamos cualquier información que creas que es inexacta.</li>
                    <li><strong>Derecho de supresión:</strong> Tienes derecho a solicitar que borremos tus datos personales, bajo ciertas condiciones.</li>
                    <li><strong>Derecho a restringir el procesamiento:</strong> Tienes derecho a solicitar que restrinjamos el procesamiento de tus datos personales, bajo ciertas condiciones.</li>
                     <li><strong>Derecho a oponerte al procesamiento:</strong> Tienes derecho a oponerte a nuestro procesamiento de tus datos personales, bajo ciertas condiciones.</li>
                    <li><strong>Derecho a la portabilidad de datos:</strong> Tienes derecho a solicitar que transfiramos los datos que hemos recopilado a otra organización, o directamente a ti, bajo ciertas condiciones.</li>
                </ul>
            </section>

             <section>
                 <h2 className="text-xl font-bold text-white mb-4">Contacto</h2>
                <p>
                    Si deseas ejercer cualquiera de los derechos establecidos anteriormente, o tienes alguna pregunta sobre esta política de RGPD, por favor contáctanos en help@broslunas.com.
                </p>
            </section>
          </div>
        </div>
      </div>
    )
  }
