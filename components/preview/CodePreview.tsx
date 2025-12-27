"use client"

import { useState, useEffect } from "react"
import { FileCode, Copy, Check } from "lucide-react"

interface CodePreviewProps {
  fileUrl: string
  fileName: string
}

// Simple syntax highlighting for common languages
const highlightCode = (code: string, extension: string): string => {
  // This is a basic implementation. For production, consider using a library like Prism.js or Highlight.js
  const keywords = [
    'function', 'const', 'let', 'var', 'if', 'else', 'return', 'class', 'import', 'export',
    'from', 'as', 'async', 'await', 'try', 'catch', 'for', 'while', 'do', 'break', 'continue',
    'switch', 'case', 'default', 'new', 'this', 'super', 'extends', 'static', 'public', 'private',
    'protected', 'interface', 'type', 'enum', 'namespace', 'module', 'def', 'class', 'lambda'
  ]

  let highlighted = code
    // Comments
    .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm, '<span class="text-zinc-500">$1</span>')
    // Strings
    .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="text-green-400">$1</span>')
    // Numbers
    .replace(/\b(\d+)\b/g, '<span class="text-orange-400">$1</span>')
    // Keywords
    .replace(new RegExp(`\\b(${keywords.join('|')})\\b`, 'g'), '<span class="text-purple-400">$1</span>')
    // Functions
    .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="text-blue-400">$1</span>(')

  return highlighted
}

const getLanguageName = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase()
  const languageMap: Record<string, string> = {
    js: 'JavaScript',
    ts: 'TypeScript',
    tsx: 'TypeScript React',
    jsx: 'JavaScript React',
    py: 'Python',
    html: 'HTML',
    css: 'CSS',
    json: 'JSON',
    xml: 'XML',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
    php: 'PHP',
    rb: 'Ruby',
    go: 'Go',
    rs: 'Rust',
    swift: 'Swift',
    kt: 'Kotlin',
    sh: 'Shell',
    bash: 'Bash',
    yml: 'YAML',
    yaml: 'YAML',
    md: 'Markdown',
    txt: 'Plain Text',
    sql: 'SQL'
  }
  return languageMap[ext || ''] || 'Code'
}

export default function CodePreview({ fileUrl, fileName }: CodePreviewProps) {
  const [code, setCode] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const extension = fileName.split('.').pop()?.toLowerCase() || ''

  useEffect(() => {
    fetch(fileUrl)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch file')
        return res.text()
      })
      .then(text => {
        setCode(text)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [fileUrl])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-zinc-400">Cargando código...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <FileCode className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-zinc-400 mb-2">Error al cargar el archivo</p>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-zinc-950">
      {/* Code Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-zinc-300">{getLanguageName(fileName)}</span>
        </div>
        
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto">
        <pre className="p-6 text-sm leading-relaxed">
          <code
            className="block text-zinc-300 font-mono"
            dangerouslySetInnerHTML={{ __html: highlightCode(code, extension) }}
          />
        </pre>
      </div>

      {/* Line numbers could be added here */}
      <style jsx>{`
        pre {
          tab-size: 2;
          -moz-tab-size: 2;
        }
      `}</style>
    </div>
  )
}
