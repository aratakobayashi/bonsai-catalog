'use client'

import { useEffect } from 'react'

const AD_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8441554925079357'

// 広告のスクリプトは表示を重くするため、スクロールなどの操作があったとき、または読み込みから5秒後に読み込む
export function AdSenseLoader() {
  useEffect(() => {
    let loaded = false
    const load = () => {
      if (loaded) return
      loaded = true
      events.forEach(e => window.removeEventListener(e, load))
      const script = document.createElement('script')
      script.src = AD_SRC
      script.async = true
      script.crossOrigin = 'anonymous'
      document.head.appendChild(script)
    }
    const events = ['scroll', 'pointerdown', 'keydown', 'touchstart']
    events.forEach(e => window.addEventListener(e, load, { once: true, passive: true }))
    const timer = window.setTimeout(load, 5000)
    return () => {
      window.clearTimeout(timer)
      events.forEach(e => window.removeEventListener(e, load))
    }
  }, [])
  return null
}
