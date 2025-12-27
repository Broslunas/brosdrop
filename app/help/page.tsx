import Link from 'next/link';
import { HelpCircle, FileText, Settings, ShieldQuestion, Mail } from 'lucide-react';

export const metadata = {
  title: "Centro de Ayuda",
  description: "Obtén ayuda con el uso de BrosDrop.",
}

export default function HelpPage() {
    return (
      <div className="bg-zinc-950 min-h-screen py-24 sm:py-32 relative overflow-hidden">
         {/* Background Effects */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
             <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03]" />
             <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[128px] animate-pulse" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-indigo-400">Soporte</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              ¿Cómo podemos ayudarte?
            </p>
            <p className="mt-6 text-lg leading-8 text-zinc-400">
              Encuentra respuestas rápidas o ponte en contacto con nuestro equipo experto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
             {/* General FAQ */}
             <div className="p-8 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-colors">
                 <div className="flex items-center gap-3 mb-6">
                     <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><FileText className="w-5 h-5"/></div>
                     <h3 className="text-xl font-bold text-white">General & Archivos</h3>
                 </div>
                 <ul className="space-y-6">
                     <li>
                         <h4 className="font-medium text-white mb-1 text-sm">¿Cuánto tiempo duran mis archivos?</h4>
                         <p className="text-sm text-zinc-400">7 días para usuarios registrados, 30 min para invitados. Planes Pro hasta 1 año.</p>
                     </li>
                     <li>
                         <h4 className="font-medium text-white mb-1 text-sm">¿Límite de tamaño?</h4>
                         <p className="text-sm text-zinc-400">Hasta 5GB por archivo en planes Pro. 200MB en plan gratuito.</p>
                     </li>
                 </ul>
             </div>

             {/* Account FAQ */}
             <div className="p-8 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-colors">
                 <div className="flex items-center gap-3 mb-6">
                     <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Settings className="w-5 h-5"/></div>
                     <h3 className="text-xl font-bold text-white">Cuenta & Facturación</h3>
                 </div>
                 <ul className="space-y-6">
                     <li>
                         <h4 className="font-medium text-white mb-1 text-sm">¿Cómo cancelo mi suscripción?</h4>
                         <p className="text-sm text-zinc-400">Desde tu panel de control &gt; Facturación. Puedes cancelar en cualquier momento.</p>
                     </li>
                     <li>
                         <h4 className="font-medium text-white mb-1 text-sm">¿Hay reembolso?</h4>
                         <p className="text-sm text-zinc-400">Sí, ofrecemos reembolso completo si no estás satisfecho en los primeros 14 días.</p>
                     </li>
                 </ul>
             </div>
             
             {/* Privacy FAQ */}
             <div className="p-8 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-colors md:col-span-2">
                 <div className="flex items-center gap-3 mb-6">
                     <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><ShieldQuestion className="w-5 h-5"/></div>
                     <h3 className="text-xl font-bold text-white">Seguridad</h3>
                 </div>
                 <div className="grid md:grid-cols-2 gap-6">
                     <div>
                         <h4 className="font-medium text-white mb-1 text-sm">¿Mis datos están encriptados?</h4>
                         <p className="text-sm text-zinc-400">Sí, encriptación en tránsito (TLS) y en reposo (AES-256). Nadie sin el enlace (y contraseña si aplica) puede verlos.</p>
                     </div>
                     <div>
                         <h4 className="font-medium text-white mb-1 text-sm">¿Puedo eliminar archivos manualmente?</h4>
                         <p className="text-sm text-zinc-400">Absolutamente. Tienes control total para eliminar tus subidas instantáneamente desde el dashboard.</p>
                     </div>
                 </div>
             </div>
          </div>

          <div className="mt-20 text-center bg-zinc-900/40 border border-white/5 rounded-2xl p-8 max-w-2xl mx-auto">
             <h3 className="text-white font-bold mb-2">¿Aún tienes dudas?</h3>
             <p className="text-zinc-400 mb-6 text-sm">Estamos aquí para ayudarte a resolver cualquier problema de subida o facturación.</p>
             <Link href="mailto:support@broslunas.com" className="inline-flex items-center gap-2 rounded-lg bg-white text-black px-6 py-3 text-sm font-bold transition-transform hover:scale-105">
                <Mail className="w-4 h-4" />
                Contactar Soporte
             </Link>
          </div>
        </div>
      </div>
    )
  }
