import DropZone from "@/components/DropZone"
import { Shield, Zap, Globe, Lock, Share2, Smartphone } from "lucide-react"

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 w-full max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col w-full text-center space-y-24 pb-24">
      
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[85vh] w-full px-4 -mt-16 pt-16">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
              <div className="absolute top-[-20%] left-[20%] w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-[128px]" />
              <div className="absolute bottom-[-20%] right-[20%] w-[30rem] h-[30rem] bg-purple-500/20 rounded-full blur-[128px]" />
          </div>

          <div className="space-y-8 max-w-4xl z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 p-1.5 px-4 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-zinc-300 backdrop-blur-md mb-4 hover:bg-white/10 transition-colors cursor-pointer">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
               <span>Nuevo: Almacenamiento R2 de Cloudflare</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 drop-shadow-sm leading-[1.1]">
               Comparte archivos<br />sin límites.
            </h1>
            
            <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
               La forma más rápida y segura de enviar tus archivos grandes.<br className="hidden md:block"/>Encriptado de extremo a extremo y sin registros.
            </p>
            
             {/* Main Action - Glass Card */}
            <div className="w-full max-w-4xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                <div className="relative group mx-auto">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                    <div className="relative p-8 md:p-12 bg-zinc-950/60 border border-white/10 backdrop-blur-3xl rounded-[2rem] shadow-2xl ring-1 ring-white/5">
                        <DropZone />
                    </div>
                </div>
            </div>
          </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-zinc-900/20 border border-white/5 backdrop-blur-sm hover:bg-zinc-900/40 transition-colors group">
                  <div className="mb-6 inline-block p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                      <Zap className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">Velocidad Relámpago</h3>
                  <p className="text-zinc-400 leading-relaxed">
                      Utilizamos la red global de Cloudflare para entregar tus archivos desde el servidor más cercano a tu ubicación.
                  </p>
              </div>
              <div className="p-8 rounded-3xl bg-zinc-900/20 border border-white/5 backdrop-blur-sm hover:bg-zinc-900/40 transition-colors group">
                  <div className="mb-6 inline-block p-4 rounded-2xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                      <Shield className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">Seguridad Total</h3>
                  <p className="text-zinc-400 leading-relaxed">
                      Tus archivos se encriptan en tránsito y en reposo. Eliminación automática después de la descarga o expiración.
                  </p>
              </div>
              <div className="p-8 rounded-3xl bg-zinc-900/20 border border-white/5 backdrop-blur-sm hover:bg-zinc-900/40 transition-colors group">
                  <div className="mb-6 inline-block p-4 rounded-2xl bg-pink-500/10 text-pink-400 group-hover:bg-pink-500/20 transition-colors">
                      <Globe className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">Acceso Global</h3>
                  <p className="text-zinc-400 leading-relaxed">
                      Comparte con cualquier persona, en cualquier lugar. Sin necesidad de que el receptor se registre.
                  </p>
              </div>
          </div>
      </section>

      {/* Info Section */}
      <section className="max-w-7xl mx-auto px-4 w-full py-24">
          <div className="relative rounded-[3rem] overflow-hidden bg-zinc-900 border border-white/10">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none" />
              <div className="absolute top-[-50%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[128px]" />
              
              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center p-8 md:p-16">
                  <div className="text-left space-y-8">
                      <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                          Diseñado para la <br/>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">simplicidad moderna.</span>
                      </h2>
                      <div className="space-y-6">
                          <div className="flex gap-4">
                              <div className="mt-1 p-2 rounded-lg bg-white/5 h-fit text-indigo-400"><Share2 className="w-5 h-5"/></div>
                              <div>
                                  <h4 className="text-lg font-bold text-white mb-1">Compartir es vivir</h4>
                                  <p className="text-zinc-400">Genera enlaces únicos al instante. Copia y pega en WhatsApp, Slack o Email.</p>
                              </div>
                          </div>
                          <div className="flex gap-4">
                              <div className="mt-1 p-2 rounded-lg bg-white/5 h-fit text-purple-400"><Lock className="w-5 h-5"/></div>
                              <div>
                                  <h4 className="text-lg font-bold text-white mb-1">Privacidad primero</h4>
                                  <p className="text-zinc-400">Los archivos se eliminan automáticamente. Tú tienes el control total.</p>
                              </div>
                          </div>
                          <div className="flex gap-4">
                              <div className="mt-1 p-2 rounded-lg bg-white/5 h-fit text-pink-400"><Smartphone className="w-5 h-5"/></div>
                              <div>
                                  <h4 className="text-lg font-bold text-white mb-1">Responsive Design</h4>
                                  <p className="text-zinc-400">Funciona perfectamente en móvil, tablet y escritorio. Sube desde donde quieras.</p>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="relative aspect-square md:aspect-auto md:h-full min-h-[400px] rounded-2xl bg-zinc-950/50 border border-white/5 p-8 flex flex-col items-center justify-center">
                       {/* Abstract UI representation */}
                       <div className="w-64 h-80 bg-zinc-900 rounded-2xl border border-white/10 shadow-2xl relative rotate-[-6deg] hover:rotate-0 transition-transform duration-500">
                          <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl p-4 flex flex-col">
                             <div className="w-12 h-12 rounded-full bg-zinc-700 mb-4 animate-pulse" />
                             <div className="w-3/4 h-4 rounded bg-zinc-700 mb-2" />
                             <div className="w-1/2 h-4 rounded bg-zinc-800" />
                             <div className="mt-auto w-full h-8 rounded-lg bg-indigo-500/20" />
                          </div>
                       </div>
                       <div className="absolute w-64 h-80 bg-zinc-900 rounded-2xl border border-white/10 shadow-2xl rotate-[6deg] translate-x-12 translate-y-8 hover:rotate-0 hover:translate-x-0 hover:translate-y-0 transition-all duration-500 z-0 opacity-50">
                          <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl p-4" />
                       </div>
                  </div>
              </div>
          </div>
      </section>

      <footer className="w-full border-t border-white/5 py-12">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-zinc-500 text-sm">
             <p>© 2024 Brosdrop. Todos los derechos reservados.</p>
             <div className="flex gap-6 mt-4 md:mt-0">
                 <a href="#" className="hover:text-white transition-colors">Términos</a>
                 <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                 <a href="#" className="hover:text-white transition-colors">Contacto</a>
             </div>
          </div>
      </footer>

    </div>
    </main>
  )
}
