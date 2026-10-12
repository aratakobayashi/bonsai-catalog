// デザイン部品（v3：墨と金がテーマカラー。ページの見出しは墨色の帯、中身は生成りの背景に墨の文字・明朝の見出し・線で区切る）。各画面で共通して使う
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

export const CONTAINER = 'mx-auto w-full max-w-[1184px] px-4 lg:px-12'

export interface Crumb {
  label: string
  href?: string
}

export function Breadcrumbs({ items, className = '' }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="パンくずリスト" className={`text-xs text-ink-muted ${className}`}>
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`}>
          {i > 0 && <span className="mx-1">›</span>}
          {item.href ? <Link href={item.href} className="hover:text-gold-dark">{item.label}</Link> : <span>{item.label}</span>}
        </span>
      ))}
    </nav>
  )
}

// ページの見出し：墨色の帯（画面の端まで）にパンくず・金の小見出し・明朝の大見出し・説明文。
// photo を渡すと、帯の右側に写真を敷いて左を墨色でぼかす（トップ・特集ページの冒頭と同じ色使い）。
// aside（検索欄・表示の切り替えなど）は明るい背景向けの部品が多いため、帯のすぐ下に出す
export function PageHeading({
  title,
  lead,
  crumbs,
  aside,
  eyebrow,
  photo,
}: {
  title: ReactNode
  lead?: ReactNode
  crumbs?: Crumb[]
  aside?: ReactNode
  eyebrow?: ReactNode
  photo?: { src: string; alt: string; credit?: string }
}) {
  return (
    <>
      <div className="mx-[calc(50%-50vw)] bg-sumi text-white">
        <div className="relative mx-auto max-w-[1184px] overflow-hidden">
          {photo && (
            <div className="absolute inset-0 lg:left-[38%]">
              <Image src={photo.src} alt={photo.alt} fill priority sizes="(max-width: 1023px) 100vw, 740px" className="object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(34,32,28,.97)_0%,rgba(34,32,28,.8)_45%,rgba(34,32,28,.55)_100%)] lg:bg-[linear-gradient(90deg,rgba(34,32,28,1)_0%,rgba(34,32,28,.7)_35%,rgba(34,32,28,.1)_100%)]" />
            </div>
          )}
          <div className={`relative px-4 pb-7 pt-6 lg:px-12 lg:pt-8 ${photo ? 'min-h-[220px] lg:min-h-[300px] lg:pb-12' : 'lg:pb-11'}`}>
            {crumbs && <Breadcrumbs items={crumbs} className="hidden !text-white/55 lg:block" />}
            <div className={`${photo ? 'pt-16 sm:pt-20 lg:pt-14' : 'pt-1 lg:pt-8'} lg:max-w-[620px]`}>
              <p className="flex items-center gap-3 text-[11px] tracking-[0.22em] text-gold lg:text-xs">
                {eyebrow ?? '盆栽コレクション'}
                <span className="h-px w-10 bg-gold" aria-hidden="true" />
              </p>
              <h1 className="mt-2.5 font-mincho text-[26px] font-bold leading-snug tracking-[0.08em] text-white [text-wrap:balance] lg:mt-3.5 lg:text-[38px]">{title}</h1>
              {lead && <p className="mt-3 [&_a]:text-white [&_a]:underline [&_a]:decoration-white/40 text-[13.5px] leading-[1.9] text-white/75 lg:mt-4 lg:text-[15px] lg:leading-[2] lg:text-white/85">{lead}</p>}
            </div>
            {photo?.credit && <p className="mt-4 text-right text-[10.5px] text-white/45 lg:absolute lg:bottom-4 lg:right-6 lg:mt-0">写真：{photo.credit}</p>}
          </div>
        </div>
      </div>
      {aside && <div className="mt-5 lg:flex lg:justify-end"><div className="lg:w-[360px]">{aside}</div></div>}
    </>
  )
}

export function SectionTitle({ children, action, className = '' }: { children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={`flex items-baseline gap-3 ${className}`}>
      <h2 className="font-mincho text-xl font-bold tracking-[0.06em] text-ink lg:text-[26px]">{children}</h2>
      {action && <div className="ml-auto text-sm">{action}</div>}
    </div>
  )
}

// 四角いチップ（絞り込み・カテゴリ・タグ）
export function chipClass(active = false) {
  return active
    ? 'inline-flex items-center border border-sumi bg-sumi px-3.5 py-1.5 text-[13px] font-bold text-white hover:text-white'
    : 'inline-flex items-center border border-line bg-white px-3.5 py-1.5 text-[13px] text-ink hover:border-ink'
}

export function ChipLink({ href, active = false, children }: { href: string; active?: boolean; children: ReactNode }) {
  return (
    <Link href={href} className={chipClass(active)} aria-current={active ? 'page' : undefined}>
      {children}
    </Link>
  )
}

// 白い面（角は丸めない）
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`border border-line bg-white ${className}`}>{children}</div>
}

// 小さなラベル（記事カテゴリなど）
export function Tag({ children, tone = 'gold' }: { children: ReactNode; tone?: 'gold' | 'gray' | 'red' | 'orange' | 'green' }) {
  const tones = {
    gold: 'text-gold-dark',
    gray: 'text-ink-muted',
    red: 'bg-red-50 text-rakuten',
    orange: 'bg-orange-50 text-amazon',
    green: 'bg-green-50 text-green-700',
  }
  return <span className={`inline-block text-[11px] tracking-[0.04em] ${tones[tone]}`}>{children}</span>
}

// 画像がないときの斜線の下地
export function Placeholder({ label, className = '' }: { label?: string; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center text-[11px] text-ink-muted ${className}`}
      style={{ backgroundImage: 'repeating-linear-gradient(135deg, #efebe4 0 6px, #f5f2ec 6px 12px)' }}
      aria-hidden={label ? undefined : true}
    >
      {label}
    </div>
  )
}

// 紺の帯（「はじめての方へ」「出かける」などの案内）
export function NavyPanel({ eyebrow, title, children, href, className = '' }: { eyebrow?: string; title: ReactNode; children?: ReactNode; href?: string; className?: string }) {
  const inner = (
    <>
      {eyebrow && <div className="text-[11px] tracking-[0.1em] text-[#e9c793]">{eyebrow}</div>}
      <div className="mt-1 font-mincho text-[17px] font-bold leading-snug">{title}</div>
      {children}
    </>
  )
  const cls = `block bg-sumi px-5 py-4 text-white hover:text-white ${className}`
  return href ? <Link href={href} className={`${cls} hover:bg-sumi-light`}>{inner}</Link> : <div className={cls}>{inner}</div>
}
