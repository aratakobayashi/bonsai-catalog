// リニューアルのデザイン部品（v2：生成り背景・墨の文字・明朝の見出し・線で区切る）。各画面で共通して使う
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

// ページの見出し（パンくず＋明朝の大見出し＋説明文）
export function PageHeading({
  title,
  lead,
  crumbs,
  aside,
}: {
  title: ReactNode
  lead?: ReactNode
  crumbs?: Crumb[]
  aside?: ReactNode
}) {
  return (
    <div className="pt-6 lg:pt-12">
      {crumbs && <Breadcrumbs items={crumbs} className="hidden lg:block" />}
      <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
        <div className="min-w-0">
          <h1 className="font-mincho text-[26px] font-bold leading-snug tracking-[0.06em] text-ink lg:text-[34px]">{title}</h1>
          {lead && <p className="mt-3 text-sm leading-[1.9] text-ink-soft lg:text-[15px]">{lead}</p>}
        </div>
        {aside && <div className="lg:ml-auto lg:w-[360px]">{aside}</div>}
      </div>
    </div>
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
  const cls = `block bg-navy px-5 py-4 text-white hover:text-white ${className}`
  return href ? <Link href={href} className={`${cls} hover:bg-navy-light`}>{inner}</Link> : <div className={cls}>{inner}</div>
}
