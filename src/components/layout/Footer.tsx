import Link from 'next/link'
import { AMAZON_ENABLED } from '@/lib/affiliate'
import { SITE_TOOLS } from './site-tools'

const LINKS = [
  { href: '/selection', label: '特集一覧' },
  { href: '/about', label: 'このサイトについて' },
  { href: '/faq', label: 'よくある質問' },
  { href: '/contact', label: 'お問い合わせ' },
  { href: '/privacy', label: 'プライバシーポリシー' },
  { href: '/terms', label: '利用規約' },
]

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-[1184px] flex-col gap-5 px-4 py-8 lg:flex-row lg:items-start lg:gap-16 lg:px-12 lg:py-10">
        <Link href="/" className="shrink-0 font-mincho text-sm font-bold tracking-[0.12em] text-ink">盆栽コレクション</Link>
        <p className="max-w-[420px] text-xs leading-[1.9] text-ink-muted">
          当サイトはプロモーション（広告）を含みます。{AMAZON_ENABLED && 'Amazonのアソシエイトとして、盆栽コレクションは適格販売により収入を得ています。'}
          価格は取得時点の情報です。楽天市場の商品情報は Supported by Rakuten Developers。
        </p>
        {/* 選ぶ・育てる道具 */}
        <nav className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-ink-soft lg:ml-auto lg:grid-cols-[auto_auto]" aria-label="盆栽を選ぶ・育てる">
          {(['choose', 'grow'] as const).map(group => (
            <div key={group} className="flex flex-col gap-2">
              <span className="text-[11px] tracking-[0.1em] text-ink-muted">{group === 'choose' ? '選ぶ' : '育てる'}</span>
              {SITE_TOOLS.filter(t => t.group === group).map(t => (
                <Link key={t.href} href={t.href} className="hover:text-gold-dark">{t.label}</Link>
              ))}
            </div>
          ))}
        </nav>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink-soft lg:max-w-[220px] lg:flex-col" aria-label="フッターメニュー">
          {LINKS.map(link => (
            <Link key={link.href} href={link.href} className="hover:text-gold-dark">{link.label}</Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
