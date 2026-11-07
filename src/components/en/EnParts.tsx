import Link from 'next/link'
import type { ReactNode } from 'react'

// 英語のページ（/en）の部品。本文は lang="en" で包む
export function EnSection({ id, title, children, lead }: { id: string; title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="pt-12 lg:pt-16">
      <h2 id={id} className="border-b border-ink pb-2 font-mincho text-[21px] font-bold tracking-[0.02em] text-ink lg:text-[26px]">{title}</h2>
      {lead && <p className="mt-3 max-w-[760px] text-[14.5px] leading-[1.85] text-ink-soft lg:text-[15.5px]">{lead}</p>}
      {children}
    </section>
  )
}

export function EnFacts({ rows }: { rows: { k: string; v: ReactNode }[] }) {
  return (
    <dl className="mt-4 border-t border-line">
      {rows.map(r => (
        <div key={r.k} className="grid grid-cols-[minmax(0,1fr)] gap-1 border-b border-line py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
          <dt className="text-[13px] font-bold text-ink">{r.k}</dt>
          <dd className="text-[14px] leading-[1.8] text-ink-soft">{r.v}</dd>
        </div>
      ))}
    </dl>
  )
}

export function EnNote({ children }: { children: ReactNode }) {
  return <p className="mt-4 border-l-2 border-gold bg-gold-light px-4 py-3 text-[13.5px] leading-[1.8] text-ink">{children}</p>
}

export function EnExternal({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="border-b border-ink text-ink hover:border-gold-dark hover:text-gold-dark">
      {children}<span aria-hidden="true"> ↗</span>
    </a>
  )
}

export function EnNextLinks({ links }: { links: { href: string; label: string; note: string }[] }) {
  return (
    <ul className="mt-4 grid grid-cols-[minmax(0,1fr)] border-t border-line sm:grid-cols-2 sm:gap-x-8">
      {links.map(l => (
        <li key={l.href} className="border-b border-line">
          <Link href={l.href} className="group flex min-h-[56px] items-center gap-3 py-3">
            <span className="min-w-0 flex-1">
              <span className="block font-mincho text-[16px] font-bold text-ink group-hover:text-gold-dark">{l.label}</span>
              <span className="block text-[12.5px] text-ink-muted">{l.note}</span>
            </span>
            <span className="text-ink-muted" aria-hidden="true">›</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export const EN_CHECKED = 'Information checked in November 2026. Hours, fees and dates can change — please check each official website before you go.'
