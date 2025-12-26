
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BrosDrop',
    short_name: 'BrosDrop',
    description: 'BrosDrop - Premium File Sharing',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: 'https://cdn.broslunas.com/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
