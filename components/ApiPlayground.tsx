"use client"

import { createPortal } from "react-dom"
import { useState, useEffect } from "react"
import { Play, Loader2, Copy, Check, Terminal, Globe, Trash2, FileText, Maximize2, Minimize2, Upload } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const ENDPOINTS = [
    {
        method: "POST",
        path: "/api/v1/upload",
        name: "Subir Archivo",
        description: "Inicia una transferencia de archivo.",
        bodyParams: [
            { name: "name", type: "text", default: "archivo-prueba.txt" },
            { name: "size", type: "number", default: "1024" },
            { name: "type", type: "text", default: "text/plain" },
            { name: "expiresInHours", type: "number", default: "24", optional: true }
        ]
    },
    {
        method: "GET",
        path: "/api/v1/files",
        name: "Listar Archivos",
        description: "Obtiene una lista paginada de archivos.",
        queryParams: [
            { name: "page", type: "number", default: "1" },
            { name: "limit", type: "number", default: "10" }
        ]
    },
    {
        method: "GET",
        path: "/api/v1/files/[id]",
        name: "Detalles de Archivo",
        description: "Obtiene metadatos de un archivo específico.",
        pathParams: [
            { name: "id", type: "text", placeholder: "ID del archivo" }
        ]
    },
    {
        method: "DELETE",
        path: "/api/v1/files/[id]",
        name: "Eliminar Archivo",
        description: "Elimina permanentemente un archivo.",
        pathParams: [
            { name: "id", type: "text", placeholder: "ID del archivo" }
        ]
    }
]

export default function ApiPlayground() {
    const [apiKey, setApiKey] = useState("")
    const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0])
    const [params, setParams] = useState<Record<string, string>>({})
    const [response, setResponse] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<number | null>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [mounted, setMounted] = useState(false)
    
    // Upload specific state
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploadStep, setUploadStep] = useState<"idle" | "requesting" | "uploading" | "done" | "error">("idle")

    useEffect(() => {
        setMounted(true)
    }, [])

    // Pre-fill params with defaults
    useEffect(() => {
        const defaults: Record<string, string> = {}
        selectedEndpoint.bodyParams?.forEach(p => defaults[p.name] = p.default || "")
        selectedEndpoint.queryParams?.forEach(p => defaults[p.name] = p.default || "")
        selectedEndpoint.pathParams?.forEach(p => defaults[p.name] = "")
        setParams(defaults)
        setResponse(null)
        setStatus(null)
        setSelectedFile(null)
        setUploadStep("idle")
    }, [selectedEndpoint])

    const handleParamChange = (key: string, value: string) => {
        setParams(prev => ({ ...prev, [key]: value }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setSelectedFile(file)
            // Auto-fill params
            setParams(prev => ({
                ...prev,
                name: file.name,
                size: file.size.toString(),
                type: file.type || "application/octet-stream"
            }))
        }
    }

    const generateCurl = () => {
        let url = `${process.env.NEXT_PUBLIC_APP_URL}${selectedEndpoint.path}`
        
        // Replace Path Params
        selectedEndpoint.pathParams?.forEach(p => {
            url = url.replace(`[${p.name}]`, params[p.name] || `:${p.name}`)
        })

        // Add Query Params
        const queryParts: string[] = []
        selectedEndpoint.queryParams?.forEach(p => {
             if (params[p.name]) queryParts.push(`${p.name}=${params[p.name]}`)
        })
        if (queryParts.length > 0) url += `?${queryParts.join("&")}`

        let curl = `curl -X ${selectedEndpoint.method} "${url}" \\\n  -H "x-api-key: ${apiKey || 'YOUR_KEY'}"`

        if (selectedEndpoint.bodyParams) {
             const body: Record<string, any> = {}
             selectedEndpoint.bodyParams.forEach(p => {
                 if (params[p.name]) {
                     if (p.type === 'number') body[p.name] = Number(params[p.name])
                     else body[p.name] = params[p.name]
                 }
             })
             curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(body)}'`
        }

        return curl
    }

    const executeRequest = async () => {
        if (!apiKey) {
            setResponse({ error: "Por favor ingresa tu API Key primero." })
            return
        }

        setLoading(true)
        setUploadStep("requesting")
        setResponse(null)
        setStatus(null)

        try {
            let url = selectedEndpoint.path
             // Replace Path Params
            selectedEndpoint.pathParams?.forEach(p => {
                url = url.replace(`[${p.name}]`, params[p.name] || "")
            })

            // Add Query Params
            const queryParts: string[] = []
            selectedEndpoint.queryParams?.forEach(p => {
                 if (params[p.name]) queryParts.push(`${p.name}=${params[p.name]}`)
            })
            if (queryParts.length > 0) url += `?${queryParts.join("&")}`

            const options: RequestInit = {
                method: selectedEndpoint.method,
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json"
                }
            }

            if (selectedEndpoint.bodyParams) {
                const body: Record<string, any> = {}
                selectedEndpoint.bodyParams.forEach(p => {
                    if (params[p.name]) {
                        if (p.type === 'number') body[p.name] = Number(params[p.name])
                        else body[p.name] = params[p.name]
                    }
                })
                options.body = JSON.stringify(body)
            }

            // Step 1: Request
            const res = await fetch(url, options)
            setStatus(res.status)
            const data = await res.json()
            setResponse(data)

            // Step 2: Automated Upload (if file selected and URL present)
            if (res.ok && selectedFile && data.uploadUrl) {
                setUploadStep("uploading")
                try {
                    const uploadRes = await fetch(data.uploadUrl, {
                        method: "PUT",
                        body: selectedFile,
                        headers: {
                            "Content-Type": selectedFile.type
                        }
                    })

                    if (uploadRes.ok) {
                        setUploadStep("done")
                        setResponse((prev: any) => ({
                            ...prev,
                            _automation: {
                                status: "success",
                                message: "¡Archivo subido exitosamente a R2!",
                                file: selectedFile.name
                            }
                        }))
                    } else {
                         setUploadStep("error")
                         setResponse((prev: any) => ({
                            ...prev,
                            _automation: {
                                status: "error",
                                message: "Falló la subida a R2",
                            }
                        }))
                    }
                } catch (err) {
                    setUploadStep("error")
                    console.error(err)
                }
            } else {
                setUploadStep("idle")
            }

        } catch (error: any) {
            setResponse({ error: "Error de red o conexión fallida." })
            setUploadStep("idle")
        } finally {
            setLoading(false)
        }
    }

    const content = (
        <div className={`rounded-2xl border border-white/10 bg-[#0d1117] overflow-hidden flex flex-col lg:flex-row transition-all duration-500 ease-in-out ${
            isFullscreen 
                ? "fixed inset-0 z-[9999] h-screen w-screen rounded-none m-0 bg-[#0d1117]" 
                : "h-[800px] lg:h-[600px] relative w-full"
        }`}>
            {/* Absolute toggle button */}
            <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg border border-white/5 transition-colors backdrop-blur-md"
                title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Left: Configuration */}
            <div className="lg:w-1/3 bg-zinc-900/.5 border-r border-white/5 flex flex-col">
                <div className="p-4 border-b border-white/5 flex justify-between items-center pr-16 bg-[#0d1117]">
                    <div className="w-full">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">API Key</label>
                        <input 
                            type="password" 
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="bdp_..."
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2">
                    {ENDPOINTS.map((endpoint, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedEndpoint(endpoint)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm mb-1 transition-colors ${
                                selectedEndpoint === endpoint 
                                    ? "bg-white/10 text-white" 
                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                    endpoint.method === 'GET' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                                    endpoint.method === 'POST' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                                    endpoint.method === 'DELETE' ? 'border-red-500/30 text-red-400 bg-red-500/10' : 
                                    'text-zinc-400'
                                }`}>
                                    {endpoint.method}
                                </span>
                                <span className="font-medium truncate">{endpoint.name}</span>
                            </div>
                            <div className="text-[10px] text-zinc-600 font-mono truncate pl-0.5 opacity-60">
                                {endpoint.path}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Middle: Params */}
            <div className="lg:w-1/3 bg-zinc-900/.3 border-r border-white/5 flex flex-col">
                 <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/50 h-[73px]">
                    <h3 className="text-sm font-medium text-white">{selectedEndpoint.name}</h3>
                    <button 
                        onClick={executeRequest}
                        disabled={loading}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                        {loading ? (uploadStep === 'uploading' ? 'Subiendo...' : 'Solicitando...') : 'Send'}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Special File Input for Upload Endpoint */}
                    {selectedEndpoint.path === '/api/v1/upload' && (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 mb-6">
                            <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Upload className="w-3 h-3" />
                                Seleccionar Archivo (Prueba Real)
                            </label>
                            <input 
                                type="file" 
                                onChange={handleFileChange}
                                className="block w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 cursor-pointer"
                            />
                            <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
                                Seleccionar un archivo autocompletará los parámetros y ejecutará la subida real (PUT) automáticamente tras obtener la URL firmada.
                            </p>
                        </div>
                    )}

                    {/* Path Params */}
                    {selectedEndpoint.pathParams && (
                        <div className="space-y-3">
                             <h4 className="text-xs font-bold text-zinc-500 uppercase">Path Params</h4>
                             {selectedEndpoint.pathParams.map(param => (
                                 <div key={param.name}>
                                     <label className="text-xs text-zinc-400 mb-1 block font-mono">{param.name}</label>
                                     <input 
                                         type="text"
                                         value={params[param.name] || ""}
                                         onChange={(e) => handleParamChange(param.name, e.target.value)}
                                         placeholder={param.placeholder}
                                         className="w-full bg-black/30 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:border-blue-500/50 focus:outline-none"
                                     />
                                 </div>
                             ))}
                        </div>
                    )}

                    {/* Query Params */}
                    {selectedEndpoint.queryParams && (
                        <div className="space-y-3">
                             <h4 className="text-xs font-bold text-zinc-500 uppercase">Query Params</h4>
                             {selectedEndpoint.queryParams.map(param => (
                                 <div key={param.name}>
                                     <label className="text-xs text-zinc-400 mb-1 block font-mono">
                                         {param.name}
                                         <span className="text-zinc-600 ml-2 text-[10px]">{param.type}</span>
                                     </label>
                                     <input 
                                         type="text"
                                         value={params[param.name] || ""}
                                         onChange={(e) => handleParamChange(param.name, e.target.value)}
                                         className="w-full bg-black/30 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:border-blue-500/50 focus:outline-none"
                                     />
                                 </div>
                             ))}
                        </div>
                    )}

                    {/* Body Params */}
                    {selectedEndpoint.bodyParams && (
                        <div className="space-y-3">
                             <h4 className="text-xs font-bold text-zinc-500 uppercase">Body Params</h4>
                             {selectedEndpoint.bodyParams.map(param => (
                                 <div key={param.name}>
                                     <label className="text-xs text-zinc-400 mb-1 block font-mono items-center flex justify-between">
                                         <span>{param.name}</span>
                                         {param.optional && <span className="text-zinc-600 text-[10px] lowercase italic">opcional</span>}
                                     </label>
                                     <input 
                                         type={param.type === 'number' ? 'number' : 'text'}
                                         value={params[param.name] || ""}
                                         onChange={(e) => handleParamChange(param.name, e.target.value)}
                                         // Disable manual input if file is selected and it matches auto-filled fields
                                         disabled={!!selectedFile && ['name', 'size', 'type'].includes(param.name)}
                                         className={`w-full bg-black/30 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:border-blue-500/50 focus:outline-none ${selectedFile && ['name', 'size', 'type'].includes(param.name) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                     />
                                 </div>
                             ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Output */}
            <div className="lg:w-1/3 flex flex-col bg-[#0d1117]">
                 {/* Tabs-like header */}
                 <div className="flex border-b border-white/5 h-[73px] items-center">
                    <div className="px-4 text-xs font-bold text-zinc-400 border-b-2 border-transparent hover:text-white cursor-pointer">Preview</div>
                </div>

                <div className="flex-1 overflow-y-auto p-0 flex flex-col">
                    <div className="p-4 border-b border-white/5 space-y-2">
                        <div className="flex justify-between items-center text-xs text-zinc-500 uppercase font-bold tracking-wider">
                            <span>Request (Curl)</span>
                        </div>
                        <pre className="text-[10px] leading-relaxed text-zinc-400 font-mono bg-black/30 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap break-all">
                            {generateCurl()}
                        </pre>
                    </div>

                    <div className="p-4 flex-1 flex flex-col min-h-[200px]">
                        <div className="flex justify-between items-center mb-2">
                             <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Response</span>
                             <div className="flex gap-2">
                                {uploadStep === 'uploading' && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 animate-pulse">
                                        Subiendo a R2...
                                    </span>
                                )}
                                {status && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                        status >= 200 && status < 300 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                        {status}
                                    </span>
                                )}
                             </div>
                        </div>
                        <div className="flex-1 bg-black/30 rounded-lg p-3 relative group overflow-hidden mb-4">
                            {response ? (
                                <pre className="text-xs text-emerald-300 font-mono overflow-auto h-full absolute inset-3">
                                    {JSON.stringify(response, null, 2)}
                                </pre>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-700 text-xs italic">
                                    Esperando solicitud...
                                </div>
                            )}
                        </div>

                        {/* Step 2 Helper for Uploads - Only show if NO file was selected (manual mode) */}
                        {response && response.uploadUrl && !selectedFile && (
                            <div className="mt-2 text-left animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-2 mb-2">
                                     <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-500/30">PASO 2</span>
                                     <span className="text-xs text-zinc-400 font-medium">Subir el archivo binario</span>
                                </div>
                                <div className="bg-zinc-900 border border-white/10 rounded-lg p-3">
                                    <p className="text-[10px] text-zinc-500 mb-2">
                                        Ahora debes hacer un PUT a la URL firmada con el contenido del archivo.
                                    </p>
                                    <div className="relative group/step2">
                                        <pre className="text-[10px] text-blue-300 font-mono overflow-x-auto whitespace-pre-wrap break-all bg-black/30 p-2 rounded">
                                            curl -X PUT "{response.uploadUrl}" \<br/>
                                            &nbsp;&nbsp;--upload-file "{params.name || 'archivo.ext'}"
                                        </pre>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(`curl -X PUT "${response.uploadUrl}" --upload-file "${params.name || 'archivo.ext'}"`)}
                                            className="absolute top-1 right-1 p-1 hover:bg-white/20 rounded text-zinc-500 hover:text-white transition-colors"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Automated Success Message */}
                        {uploadStep === 'done' && (
                             <div className="mt-2 text-left animate-in fade-in slide-in-from-top-2">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-start gap-3">
                                     <div className="bg-emerald-500 rounded-full p-1 mt-0.5">
                                         <Check className="w-3 h-3 text-black" />
                                     </div>
                                     <div>
                                         <p className="text-xs text-emerald-300 font-bold mb-1">¡Subida Completada!</p>
                                         <p className="text-[10px] text-emerald-400/70">
                                             El archivo <strong>{selectedFile?.name}</strong> se ha subido correctamente a BrosDrop usando la API.
                                         </p>
                                     </div>
                                </div>
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )

    if (isFullscreen && mounted && typeof document !== "undefined") {
        return createPortal(content, document.body)
    }

    return content
}
