import Link from 'next/link'
import { LangSwitch } from './LangSwitch'

// 訪日客向けの英語のページ（/en）のヘッダーとフッター。日本語のページへは「日本語」から戻れる
const NAV = [
  { href: '/en/omiya-bonsai-village', label: 'Omiya Bonsai Village' },
  { href: '/en/exhibitions', label: 'Exhibitions' },
  { href: '/en#before-you-go', label: 'Before you go' },
]

export function EnglishHeader() {
  return (
    <header className="sticky top-0 z-40 bg-sumi text-white">
      <div className="mx-auto flex h-14 max-w-[1184px] items-center gap-4 px-4 lg:h-[60px] lg:px-12">
        <Link href="/en" className="flex items-center gap-2.5 text-white hover:text-white">
          <span className="flex h-7 w-7 items-center justify-center bg-gold font-mincho text-[14px] font-bold text-sumi" aria-hidden="true">盆</span>
          <span className="font-mincho text-[15px] font-bold tracking-[0.06em] lg:text-[16px]">Bonsai Collection</span>
        </Link>
        <nav aria-label="Main" className="ml-auto hidden items-center gap-6 text-[13px] lg:flex">
          {NAV.map(n => (
            <Link key={n.href} href={n.href} className="text-white/85 hover:text-white">{n.label}</Link>
          ))}
        </nav>
        <LangSwitch to="ja" className="ml-auto h-9 px-3 lg:ml-2" />
      </div>
      <nav aria-label="Main" className="flex gap-5 overflow-x-auto border-t border-white/10 px-4 py-2 text-[12.5px] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
        {NAV.map(n => (
          <Link key={n.href} href={n.href} className="flex-none whitespace-nowrap text-white/85 hover:text-white">{n.label}</Link>
        ))}
      </nav>
    </header>
  )
}

export function EnglishFooter() {
  return (
    <footer className="mt-auto bg-sumi text-white/75">
      <div className="mx-auto max-w-[1184px] px-4 py-10 text-[12.5px] leading-[1.9] lg:px-12">
        <p className="font-mincho text-[15px] font-bold text-white">Bonsai Collection</p>
        <p className="mt-2 max-w-[640px]">A Japanese guide to bonsai: where to see bonsai in Japan, exhibitions and gardens. Opening hours and fees can change — please check each official website before you visit.</p>
        <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
          {NAV.map(n => <Link key={n.href} href={n.href} className="text-white/85 hover:text-white">{n.label}</Link>)}
          <Link href="/" lang="ja" className="text-white/85 hover:text-white">日本語のサイト</Link>
          <Link href="/privacy" lang="ja" className="text-white/85 hover:text-white">Privacy（日本語）</Link>
        </p>
        <p className="mt-4 text-[11px] text-white/45">© Bonsai Collection</p>
      </div>
    </footer>
  )
}
