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
  // 選ぶ・育てるの機能（site-tools.ts）
  const tool = pathname.match(/^\/(shindan|okurimono|kumiawase|soroeru|teire|shojo|hajimete|zukan|note|favorites)(\/|$)/)
  if (tool) return `tool_${tool[1]}`
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
        // どこのボタンか（一覧の「さっと見る」・商品ページ・スマホの購入バー）
        click_place: anchor.closest<HTMLElement>('[data-place]')?.dataset.place ?? 'other',
        ...((productMatch || anchor.closest<HTMLElement>('[data-product]')) && { product_id: productMatch?.[1] ?? anchor.closest<HTMLElement>('[data-product]')?.dataset.product }),
      })
    }
    // 商品カードのクリック（どの一覧の何番目か。一覧は「もっと見る」で前のページの分も並ぶので、並び順がそのまま通しの順位）
    const onCardClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest('a')
      const card = anchor?.closest<HTMLElement>('[data-card]')
      if (!anchor || !card || /\bsponsored\b/.test(anchor.rel)) return
      const listEl = card.closest<HTMLElement>('[data-list]')
      const cards = Array.from((listEl ?? card.parentElement ?? document).querySelectorAll<HTMLElement>('[data-card]'))
      const index = cards.indexOf(card) + 1
      gtag('event', 'product_card_click', {
        list_name: listEl?.dataset.list ?? pageTypeOf(window.location.pathname),
        position: index,
        product_id: card.dataset.card,
        content_group: pageTypeOf(window.location.pathname),
      })
    }
    document.addEventListener('click', onClick, { capture: true })
    document.addEventListener('click', onCardClick, { capture: true })
    return () => {
      document.removeEventListener('click', onClick, { capture: true })
      document.removeEventListener('click', onCardClick, { capture: true })
    }
  }, [])

  return null
}

export function GoogleAnalytics() {
  if (!GA_ID) return null
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
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
