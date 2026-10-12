import type { MetadataRoute } from 'next'

// ホーム画面に追加したときの名前・色・アイコン（墨色に金の「盆」）
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '盆栽コレクション',
    short_name: '盆栽コレクション',
    start_url: '/',
    display: 'browser',
    background_color: '#faf9f6',
    theme_color: '#22201c',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
