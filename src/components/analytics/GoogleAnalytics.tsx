'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

// 測定IDはページに埋め込まれる公開情報。環境変数があればそちらを優先する
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-J9QM571RMN'

type Gtag = (...args: unknown[]) => void
const gtag: Gtag = (...args) => {
  const w = window as unknown as { gtag?: Gtag }
  w.gtag?.(...args)
}

// ページの種類（GA4 の「コンテンツグループ」として記録し、種類別の流入を集計する）
export function pageTypeOf(pathname: string): string {
  if (pathname === '/') return 'top'
  if (pathname === '/products') return 'product_list'
  if (pathname.startsWith('/products/category/')) return 'category'
  if (pathname.startsWith('/products/')) return 'product_detail'
  if (pathname.startsWith('/selection/')) return 'selection'
  if (pathname === '/guides') return 'article_list'
  if (pathname.startsWith('/guides/')) return 'article'
  if (pathname.startsWith('/gardens')) return 'garden'
  if (pathname.startsWith('/events')) return 'event'
  return 'other'
}

function shopOf(href: string): string {
  if (/rakuten\.co\.jp/.test(href)) return 'rakuten'
  if (/amazon\.co\.jp|amzn\.to|amzn\.asia/.test(href)) return 'amazon'
  if (/a8\.net/.test(href)) return 'a8'
  return 'other'
}

// ページ表示を送る（画面遷移のたびに、ページの種類つきで1回だけ送る）
function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    gtag('event', 'page_view', {
      page_location: window.location.href,
      page_title: document.title,
      content_group: pageTypeOf(pathname),
    })
  }, [pathname, searchParams])

  // 広告リンク（rel="sponsored"）のクリックをまとめて記録する
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest('a')
      if (!anchor || !/\bsponsored\b/.test(anchor.rel)) return
      const productMatch = window.location.pathname.match(/^\/products\/([0-9a-f-]{36})$/)
      gtag('event', 'affiliate_click', {
        shop: shopOf(anchor.href),
        content_group: pageTypeOf(window.location.pathname),
        link_url: anchor.href.slice(0, 200),
        ...(productMatch && { product_id: productMatch[1] }),
      })
    }
    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [])

  return null
}

export function GoogleAnalytics() {
  if (!GA_ID) return null
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_ID}', { send_page_view: false });`}
      </Script>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  )
}
