
"use client"

import Link from "next/link"
import { ArrowLeft, Terminal, Copy, Check, FileText, Upload, Trash2, Key } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import { PLAN_LIMITS, formatBytes } from "@/lib/plans"
import ApiPlayground from "@/components/ApiPlayground"

export default function ApiDocsPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
            {/* Header */}
            <div className="relative border-b border-white/10 bg-zinc-900/30 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="h-6 w-px bg-white/10" />
                        <h1 className="font-bold text-lg bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            Brosdrop API <span className="text-zinc-500 text-xs font-mono ml-2">v1.0</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                         <Link href="/dashboard/settings" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                            Obtener API Key &rarr;
                         </Link>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex-shrink-0 space-y-8 sticky top-24 self-start hidden md:block">
                    <div>
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Introducción</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#auth" className="block text-zinc-300 hover:text-white transition-colors">Autenticación</a></li>
                            <li><a href="#ratelimits" className="block text-zinc-300 hover:text-white transition-colors">Límites & Cuotas</a></li>
                            <li><a href="#playground" className="block text-zinc-300 hover:text-white transition-colors font-bold text-emerald-400">Playground</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Endpoints</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#upload" className="block text-zinc-300 hover:text-white transition-colors">Subir Archivo</a></li>
                            <li><a href="#list" className="block text-zinc-300 hover:text-white transition-colors">Listar Archivos</a></li>
                            <li><a href="#get" className="block text-zinc-300 hover:text-white transition-colors">Obtener Detalles</a></li>
                            <li><a href="#delete" className="block text-zinc-300 hover:text-white transition-colors">Eliminar Archivo</a></li>
                        </ul>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-16">
                    
                    {/* Introduction */}
                    <section className="space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-bold tracking-tight">Documentación API</h2>
                            <p className="text-xl text-zinc-400 leading-relaxed">
                                Integra la potencia de Brosdrop en tus aplicaciones. Automatiza subidas, gestiona transferencias y crea flujos de trabajo personalizados.
                            </p>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-medium">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Disponible para planes Plus y Pro
                            </div>
                        </div>
                    </section>
                    
                    {/* Playground */}
                    <section id="playground" className="scroll-mt-24 space-y-6">
                         <div className="p-1 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                             <div className="bg-zinc-950/80 backdrop-blur-xl rounded-[1.4rem] p-6 md:p-8">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <Terminal className="w-6 h-6 text-emerald-400" />
                                    Interactive Playground
                                </h2>
                                <ApiPlayground />
                             </div>
                         </div>
                    </section>

                    {/* Authentication */}
                    <section id="auth" className="scroll-mt-24 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-800 rounded-lg"><Key className="w-5 h-5 text-zinc-400" /></div>
                            <h2 className="text-2xl font-bold">Autenticación</h2>
                        </div>
                        <p className="text-zinc-400">
                            Todas las peticiones a la API deben incluir tu clave secreta en el header <code className="text-emerald-300 bg-emerald-900/20 px-1.5 py-0.5 rounded text-sm">x-api-key</code>.
                        </p>
                        <CodeBlock 
                            language="bash"
                            code={`curl -H "x-api-key: bdp_7a8f9c..." https://brosdrop.com/api/v1/files`}
                        />
                    </section>

                     {/* Rate Limits */}
                     <section id="ratelimits" className="scroll-mt-24 space-y-6">
                        <div className="flex items-center gap-3">
                             <h2 className="text-2xl font-bold">Límites y Cuotas</h2>
                        </div>
                        <p className="text-zinc-400">
                            Los límites de la API dependen de tu plan de suscripción.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5">
                                <h3 className="font-bold text-blue-400 mb-2">Plan Plus</h3>
                                <ul className="space-y-2 text-sm text-zinc-400">
                                    <li className="flex justify-between"><span>Peticiones / hora</span> <span className="text-white">{PLAN_LIMITS.plus.apiRequestsPerHour}</span></li>
                                    <li className="flex justify-between"><span>Subidas / día</span> <span className="text-white">{PLAN_LIMITS.plus.apiUploadsPerDay}</span></li>
                                    <li className="flex justify-between"><span>Tamaño Máx.</span> <span className="text-white">{formatBytes(PLAN_LIMITS.plus.maxBytes)}</span></li>
                                </ul>
                            </div>
                            <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5">
                                <h3 className="font-bold text-pink-400 mb-2">Plan Pro</h3>
                                <ul className="space-y-2 text-sm text-zinc-400">
                                    <li className="flex justify-between"><span>Peticiones / hora</span> <span className="text-white">{PLAN_LIMITS.pro.apiRequestsPerHour}</span></li>
                                    <li className="flex justify-between"><span>Subidas / día</span> <span className="text-white">{PLAN_LIMITS.pro.apiUploadsPerDay}</span></li>
                                    <li className="flex justify-between"><span>Tamaño Máx.</span> <span className="text-white">{formatBytes(PLAN_LIMITS.pro.maxBytes)}</span></li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <hr className="border-white/10" />

                    {/* Endpoints - Upload */}
                    <section id="upload" className="scroll-mt-24 space-y-6">
                        <div className="flex items-center gap-3">
                            <MethodBadge method="POST" />
                            <h2 className="text-2xl font-bold">Subir Archivo</h2>
                        </div>
                        <p className="text-zinc-400">
                            Inicia una nueva transferencia. Este endpoint devuelve una URL firmada (<code className="text-xs">uploadUrl</code>) donde debes hacer un PUT con el binario del archivo.
                        </p>
                        <div className="space-y-4">
                            <EndpointUrl url="/api/v1/upload" />
                            
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Body Params</h4>
                             <Table 
                                headers={['Campo', 'Tipo', 'Descripción']}
                                rows={[
                                    ['name', 'string', 'Nombre del archivo (ej. "vacaciones.zip")'],
                                    ['size', 'number', 'Tamaño en bytes'],
                                    ['type', 'string', 'MIME type (ej. "application/zip")'],
                                    ['expiresInHours', 'number', '(Opcional) Horas hasta caducar'],
                                    ['customLink', 'string', '(Opcional) Slug personalizado'],
                                ]}
                             />

                            <h4 className="text-sm font-bold text-white uppercase tracking-wider mt-6">Ejemplo</h4>
                            <CodeBlock 
                                language="bash" 
                                code={`# 1. Solicitar Subida
curl -X POST https://brosdrop.com/api/v1/upload \\
  -H "x-api-key: YOUR_KEY" \\
  -d '{"name": "test.txt", "size": 1024, "type": "text/plain"}'

# Response
{
  "id": "658c...",
  "uploadUrl": "https://r2....",
  "fileUrl": "https://brosdrop.com/d/custom-link",
  "expiresAt": "2024-..."
}

# 2. Subir Archivo a la uploadUrl
curl -X PUT "https://r2...." -d @test.txt`}
                            />
                        </div>
                    </section>
                    
                    {/* Endpoints - List */}
                    <section id="list" className="scroll-mt-24 space-y-6">
                        <div className="flex items-center gap-3">
                            <MethodBadge method="GET" />
                            <h2 className="text-2xl font-bold">Listar Archivos</h2>
                        </div>
                         <div className="space-y-4">
                            <EndpointUrl url="/api/v1/files" />
                            <p className="text-zinc-400">Obtén una lista paginada de tus transferencias activas.</p>
                            
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Query Params</h4>
                            <Table 
                                headers={['Param', 'Default', 'Descripción']}
                                rows={[
                                    ['page', '1', 'Número de página'],
                                    ['limit', '10', 'Resultados por página'],
                                ]}
                             />

                            <CodeBlock 
                                language="json"
                                code={`{
  "data": [
    {
      "originalName": "foto.png",
      "size": 204857,
      "views": 4,
      "downloads": 1,
      "expiresAt": "2023-..."
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "totalPages": 5
  }
}`}
                            />
                        </div>
                    </section>

                    {/* Endpoints - Delete */}
                    <section id="delete" className="scroll-mt-24 space-y-6">
                        <div className="flex items-center gap-3">
                            <MethodBadge method="DELETE" />
                            <h2 className="text-2xl font-bold">Eliminar Archivo</h2>
                        </div>
                         <div className="space-y-4">
                            <EndpointUrl url="/api/v1/files/:id" />
                            <p className="text-zinc-400">Elimina permanentemente un archivo y sus datos.</p>
                            <CodeBlock 
                                language="json"
                                code={`{ "message": "File deleted successfully" }`}
                            />
                        </div>
                    </section>


                </div>
            </main>
        </div>
    )
}

function MethodBadge({ method }: { method: string }) {
    const colors: Record<string, string> = {
        GET: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        POST: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
        PUT: "bg-orange-500/20 text-orange-400 border-orange-500/30"
    }
    return (
        <span className={`px-2.5 py-1 rounded-md text-sm font-bold border ${colors[method] || colors.GET}`}>
            {method}
        </span>
    )
}

function EndpointUrl({ url }: { url: string }) {
    return (
        <div className="p-3 bg-white/5 rounded-lg border border-white/10 font-mono text-sm text-zinc-300">
            {url}
        </div>
    )
}

function CodeBlock({ code, language }: { code: string, language: string }) {
    const [copied, setCopied] = useState(false)
    const onCopy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-[#0d1117]">
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={onCopy}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-zinc-400 hover:text-white transition-colors"
                >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>
            <div className="px-4 py-2 border-b border-white/5 bg-white/5 text-xs text-zinc-500 font-mono flex items-center gap-2">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                </div>
                <span className="ml-2 uppercase">{language}</span>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono text-zinc-300 leading-relaxed">
                <code>{code}</code>
            </pre>
        </div>
    )
}

function Table({ headers, rows }: { headers: string[], rows: any[][] }) {
    return (
        <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-zinc-400">
                    <tr>
                        {headers.map((h, i) => (
                            <th key={i} className="p-4 font-medium">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {rows.map((row, i) => (
                        <tr key={i} className="group hover:bg-white/[0.02]">
                            {row.map((cell, j) => (
                                <td key={j} className="p-4 text-zinc-300 group-hover:text-white transition-colors">
                                    {j === 0 ? <code className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-xs">{cell}</code> : cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
