"use client"

import { Mail, Bell, LayoutGrid, List } from "lucide-react"

interface PreferencesSectionProps {
    newsletter: boolean
    notifications: boolean
    defaultView: string
    onChange: (key: string, value: any) => void
}

export default function PreferencesSection({ newsletter, notifications, defaultView, onChange }: PreferencesSectionProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5" /> Preferencias
            </h3>

            <label className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 border border-zinc-800 cursor-pointer hover:bg-zinc-800 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                        <Mail className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-medium text-zinc-200">Newsletter</p>
                        <p className="text-xs text-zinc-500">Recibe noticias y actualizaciones.</p>
                    </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors relative ${newsletter ? 'bg-primary' : 'bg-zinc-700'}`}>
                    <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={newsletter}
                        onChange={e => onChange('newsletterSubscribed', e.target.checked)}
                    />
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${newsletter ? 'translate-x-6' : ''}`} />
                </div>
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 border border-zinc-800 cursor-pointer hover:bg-zinc-800 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
                        <Bell className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-medium text-zinc-200">Notificaciones</p>
                        <p className="text-xs text-zinc-500">Recibe alertas sobre tus archivos.</p>
                    </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-primary' : 'bg-zinc-700'}`}>
                    <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={notifications}
                        onChange={e => onChange('emailNotifications', e.target.checked)}
                    />
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications ? 'translate-x-6' : ''}`} />
                </div>
            </label>

            <div className="pt-2">
                    <label className="block text-sm font-medium text-zinc-400 mb-3">Vista por defecto</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div 
                            onClick={() => onChange('defaultView', 'grid')}
                            className={`cursor-pointer p-4 rounded-xl border flex items-center gap-3 transition-all ${defaultView === 'grid' ? 'bg-primary/10 border-primary text-primary' : 'bg-zinc-800/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                        >
                            <LayoutGrid className="w-5 h-5" />
                            <span className="font-medium">Cuadrícula</span>
                        </div>
                        <div 
                            onClick={() => onChange('defaultView', 'list')}
                            className={`cursor-pointer p-4 rounded-xl border flex items-center gap-3 transition-all ${defaultView === 'list' ? 'bg-primary/10 border-primary text-primary' : 'bg-zinc-800/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                        >
                            <List className="w-5 h-5" />
                            <span className="font-medium">Lista</span>
                        </div>
                    </div>
            </div>
        </div>
    )
}
