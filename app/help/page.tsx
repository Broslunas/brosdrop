"use client"

import Link from 'next/link';
import { HelpCircle, FileText, Settings, ShieldQuestion, Mail, UploadCloud, Download, Share2, Key, AlertTriangle, CreditCard, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function HelpPage() {
    const [activeTab, setActiveTab] = useState('general');

    const categories = [
        { id: 'general', name: 'General', icon: HelpCircle },
        { id: 'uploads', name: 'Subidas y Descargas', icon: UploadCloud },
        { id: 'billing', name: 'Facturación', icon: CreditCard },
        { id: 'security', name: 'Seguridad', icon: ShieldQuestion },
        { id: 'troubleshooting', name: 'Solución de Problemas', icon: AlertTriangle },
    ];

    const content = {
        general: [
            {
                q: "¿Qué es BrosDrop?",
                a: "BrosDrop es una plataforma segura para compartir archivos grandes. Puedes subir archivos, obtener un enlace y compartirlo con quien quieras. Los archivos se eliminan automáticamente después de un tiempo para proteger tu privacidad."
            },
            {
                q: "¿Necesito una cuenta para usar BrosDrop?",
                a: "No, puedes usar BrosDrop como invitado para enviar archivos de hasta 200MB. Sin embargo, crear una cuenta gratuita te permite gestionar tus archivos, ver estadísticas y aumentar el límite de tiempo de expiración a 7 días."
            },
            {
                q: "¿Cuáles son los límites de tamaño?",
                a: "Invitados y usuarios gratuitos pueden subir archivos de hasta 200MB. Los usuarios del plan Plus tienen un límite de 500MB, y los usuarios Pro pueden subir archivos de hasta 5GB."
            },
        ],
        uploads: [
            {
                q: "Mi subida se detiene o falla. ¿Qué hago?",
                a: "Asegúrate de tener una conexión a internet estable. Si estás subiendo un archivo muy grande, evita cerrar la pestaña del navegador. Si el problema persiste, intenta usar un navegador diferente (recomendamos Chrome o Firefox) o desactivar temporalmente tu VPN/Adblocker."
            },
            {
                q: "¿Cuánto tiempo permanecen disponibles mis archivos?",
                a: "Invitados: 30 minutos. Usuarios Registrados (Free): 7 días. Plan Plus: 30 días. Plan Pro: Hasta 1 año (configurable)."
            },
            {
                q: "¿Puedo eliminar un archivo después de subirlo?",
                a: "Sí. Si tienes una cuenta, puedes ir a tu Panel de Control, buscar el archivo en tu lista y hacer clic en el cono de basura para eliminarlo permanentemente de inmediato."
            },
            {
                q: "¿Qué pasa si se pierde la conexión durante una descarga?",
                a: "Nuestros servidores soportan la reanudación de descargas. La mayoría de los navegadores modernos intentarán reanudarla automáticamente. Si falla, simplemente vuelve a hacer clic en el enlace de descarga."
            },
        ],
        billing: [
            {
                q: "¿Cómo puedo actualizar mi plan?",
                a: "Ve a la sección 'Precios' o a tu 'Panel > Configuración > Plan'. Selecciona el plan que deseas (Plus o Pro) y completa el proceso de pago seguro a través de Stripe."
            },
            {
                q: "¿Aceptan reembolsos?",
                a: "Sí. Si no estás satisfecho con el servicio, puedes solicitar un reembolso completo dentro de los 14 días posteriores a tu compra inicial contactando a soporte."
            },
            {
                q: "¿Cómo cancelo mi suscripción?",
                a: "Puedes cancelar en cualquier momento desde tu Panel de usuario. Tu cuenta mantendrá los beneficios Premium hasta el final del ciclo de facturación actual. No se te volverá a cobrar."
            },
            {
                q: "¿Puedo obtener una factura?",
                a: "Sí, enviamos automáticamente un recibo a tu correo electrónico después de cada pago. También puedes descargar tus facturas históricas desde el portal de facturación en tu configuración."
            }
        ],
        security: [
            {
                q: "¿Quién puede ver mis archivos?",
                a: "Solo las personas que tengan el enlace de descarga. Si proteges el archivo con contraseña, solo quienes tengan el enlace Y la contraseña podrán acceder. Nosotros no indexamos tus archivos en buscadores."
            },
            {
                q: "¿Cómo funciona la protección con contraseña?",
                a: "Cuando activas esta opción, el archivo se encripta de tal manera que se requiere la clave para descifrarlo. Nosotros guardamos un 'hash' de la contraseña, no la contraseña real, por lo que ni siquiera nuestros empleados pueden acceder al contenido."
            },
            {
                q: "¿Mis datos se venden a terceros?",
                a: "Absolutamente NO. Nuestro modelo de negocio se basa en suscripciones Premium, no en la venta de datos de usuarios. Puedes leer más en nuestra Política de Privacidad."
            }
        ],
        troubleshooting: [
            {
                q: "El enlace dice '404 No encontrado' o 'Expirado'",
                a: "Esto significa que el archivo ha alcanzado su límite de tiempo o ha sido eliminado por el propietario. Por razones de privacidad y seguridad, una vez eliminado, un archivo no se puede recuperar. Deberás pedirle al remitente que lo suba de nuevo."
            },
            {
                q: "No recibí el correo de verificación",
                a: "Revisa tu carpeta de SPAM o 'Promociones'. El correo suele llegar en menos de 2 minutos. Si no llega, intenta iniciar sesión y solicitar un reenvío desde el panel."
            },
            {
                q: "La velocidad de descarga es lenta",
                a: "Nuestra infraestructura utiliza la red global de Cloudflare para máxima velocidad. Si experimentas lentitud, verifica tu conexión local. Las redes corporativas o VPNs a veces limitan la velocidad de descarga de servicios de almacenamiento."
            }
        ]
    };

    return (
      <div className="bg-zinc-950 min-h-screen py-24 sm:py-32 relative overflow-hidden">
         {/* Background Effects */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
             <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03]" />
             <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[128px] animate-pulse" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-indigo-400">Centro de Ayuda</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              ¿En qué podemos ayudarte hoy?
            </p>
            <p className="mt-6 text-lg leading-8 text-zinc-400">
              Explora nuestra base de conocimientos para encontrar respuestas rápidas.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {/* Sidebar Categories */}
                <div className="space-y-2 lg:col-span-1">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                activeTab === cat.id 
                                ? 'bg-white text-black shadow-lg shadow-white/10' 
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <cat.icon className="w-5 h-5" />
                            {cat.name}
                        </button>
                    ))}
                    
                    <div className="mt-8 pt-8 border-t border-white/5">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                            <h4 className="text-white font-bold mb-2 text-sm">¿Eres desarrollador?</h4>
                            <p className="text-xs text-zinc-400 mb-4">Revisa nuestra documentación completa de API.</p>
                            <Link href="/docs/api" className="block w-full text-center py-2 rounded-lg bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition-colors">
                                Ver Docs API
                            </Link>
                        </div>
                    </div>
                </div>

                {/* FAQ Content */}
                <div className="lg:col-span-3">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                    >
                        {content[activeTab as keyof typeof content].map((item, i) => (
                            <div key={i} className="group rounded-2xl bg-zinc-900/40 border border-white/5 p-6 hover:bg-zinc-900/60 hover:border-white/10 transition-all duration-300">
                                <h3 className="flex items-start gap-3 font-bold text-white text-lg mb-3">
                                    <HelpCircle className="w-6 h-6 text-zinc-600 group-hover:text-indigo-400 transition-colors mt-0.5 shrink-0" />
                                    {item.q}
                                </h3>
                                <p className="text-zinc-400 text-sm ml-9 leading-relaxed">
                                    {item.a}
                                </p>
                            </div>
                        ))}
                    </motion.div>
                </div>
          </div>

          <div className="mt-24 text-center">
             <h3 className="text-white font-bold mb-4 text-xl">¿No encuentras lo que buscas?</h3>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="https://uptime.broslunas.com/" className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 border border-white/10">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    Estado del Servicio
                </Link>
                <Link href="https://broslunas.com/contact" target="_blank" className="inline-flex items-center gap-2 rounded-xl bg-white text-black px-6 py-3 text-sm font-bold transition-transform hover:scale-105 shadow-lg shadow-white/10">
                    <Mail className="w-4 h-4" />
                    Abrir Ticket de Soporte
                </Link>
             </div>
          </div>
        </div>
      </div>
    )
}
