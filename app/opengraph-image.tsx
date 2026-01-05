
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'BrosDrop'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #09090b, #18181b)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            background: 'linear-gradient(to right, #6366f1, #a855f7, #ec4899)',
            backgroundClip: 'text',
            color: 'transparent',
            fontSize: 100,
            fontWeight: 800,
            padding: 20,
          }}
        >
          BrosDrop
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#a1a1aa',
            textAlign: 'center',
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Comparte archivos de forma simple, segura y con estilo.
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
