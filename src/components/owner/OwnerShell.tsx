'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { OWNER_AUTH_KEY, OWNER_IDLE_MS, friendlyError, ownerSupabase } from '@/lib/owner-supabase'
import { MfaGate } from './MfaGate'

// 管理画面の共通部分：ログインの確認、管理できる園の読み込み、園の切り替え、ヘッダー
export interface OwnerGarden { id: string; name: string; area: string }

interface OwnerContextValue {
  session: Session
  gardens: OwnerGarden[]
  garden: OwnerGarden
  selectGarden: (id: string) => void
}

const OwnerContext = createContext<OwnerContextValue | null>(null)

export function useOwner(): OwnerContextValue {
  const v = useContext(OwnerContext)
  if (!v) throw new Error('useOwner は OwnerShell の中で使う')
  return v
}

const NAV = [
  { href: '/owner', label: '効果' },
  { href: '/owner/garden', label: '園の情報' },
  { href: '/owner/products', label: '商品' },
  { href: '/owner/account', label: 'アカウント' },
]

const GARDEN_KEY = 'bc-owner-garden'

export function OwnerShell({ children }: { children: ReactNode }) {
  const pathname = (usePathname() || '/owner').replace(/\/$/, '') || '/owner'
  const router = useRouter()
  const isLogin = pathname === '/owner/login'
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [gardens, setGardens] = useState<OwnerGarden[] | null>(null)
  const [gardenId, setGardenId] = useState<string | null>(null)
  const [error, setError] = useState('')
  // 2段階認証が済んでいるか（aal2）。済むまで園のデータは読まない
  const [mfaOk, setMfaOk] = useState<boolean | null>(null)

  useEffect(() => {
    const sb = ownerSupabase()
    sb.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  // 管理画面の外へ移ったら、ログインの情報を消す（外のページでは広告などのスクリプトが動くため）
  useEffect(() => () => {
    try { sessionStorage.removeItem(OWNER_AUTH_KEY); localStorage.removeItem(OWNER_AUTH_KEY) } catch {}
  }, [])

  // 操作がないまま30分たったら、自動でログアウトする
  useEffect(() => {
    if (!session) return
    let last = Date.now()
    const touch = () => { last = Date.now() }
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const
    events.forEach(e => window.addEventListener(e, touch, { passive: true }))
    const timer = window.setInterval(async () => {
      if (Date.now() - last < OWNER_IDLE_MS) return
      window.clearInterval(timer)
      await ownerSupabase().auth.signOut({ scope: 'local' })
      router.replace('/owner/login?reason=idle')
    }, 30 * 1000)
    return () => { window.clearInterval(timer); events.forEach(e => window.removeEventListener(e, touch)) }
  }, [session, router])

  // ログインしていなければログインの画面へ
  useEffect(() => {
    if (session === null && !isLogin) router.replace('/owner/login')
  }, [session, isLogin, router])

  // 2段階認証の状態を確かめる
  useEffect(() => {
    if (!session) { setMfaOk(null); return }
    ownerSupabase().auth.mfa.getAuthenticatorAssuranceLevel().then(({ data }) => setMfaOk(data?.currentLevel === 'aal2'))
  }, [session])

  // 管理できる園
  useEffect(() => {
    if (!session || !mfaOk) return
    ownerSupabase()
      .from('garden_members')
      .select('garden_id, gardens(id, name, prefecture, city)')
      .then(({ data, error: e }) => {
        if (e) { setError(friendlyError(e.message)); setGardens([]); return }
        const list = ((data ?? []) as unknown as { garden_id: string; gardens: { id: string; name: string; prefecture: string | null; city: string | null } | null }[])
          .filter(r => r.gardens)
          .map(r => ({ id: r.garden_id, name: r.gardens!.name, area: `${r.gardens!.prefecture ?? ''}${r.gardens!.city ?? ''}` }))
        setGardens(list)
        let saved: string | null = null
        try { saved = localStorage.getItem(GARDEN_KEY) } catch {}
        setGardenId(list.find(g => g.id === saved)?.id ?? list[0]?.id ?? null)
      })
  }, [session, mfaOk])

  const selectGarden = useCallback((id: string) => {
    setGardenId(id)
    try { localStorage.setItem(GARDEN_KEY, id) } catch {}
  }, [])

  const garden = gardens?.find(g => g.id === gardenId) ?? null
  const value = useMemo(() => (session && gardens && garden ? { session, gardens, garden, selectGarden } : null), [session, gardens, garden, selectGarden])

  if (isLogin) return <OwnerFrame>{children}</OwnerFrame>

  let body: ReactNode
  if (session === undefined || (session && mfaOk === null)) body = <p className="py-24 text-center text-[14px] text-ink-muted">読み込んでいます…</p>
  else if (!session) body = null
  else if (!mfaOk) body = <MfaGate onDone={() => ownerSupabase().auth.getSession().then(({ data }) => { setSession(data.session); setMfaOk(true) })} />
  else if (gardens === null) body = <p className="py-24 text-center text-[14px] text-ink-muted">読み込んでいます…</p>
  else if (error) body = <Notice title="読み込めませんでした">{error}</Notice>
  else if (!gardens?.length) body = <Notice title="管理できる園がまだありません">このアカウントは、まだ園と結びついていません。運営者にご連絡ください。<br /><Link href="/contact?type=garden" className="mt-3 inline-block border-b border-ink">お問い合わせ</Link></Notice>
  else body = <OwnerContext.Provider value={value}>{children}</OwnerContext.Provider>

  return (
    <OwnerFrame
      header={session && mfaOk && gardens && gardens.length > 0 && garden ? (
        <>
          {gardens.length > 1 ? (
            <label className="flex min-w-0 items-center gap-2 text-[13px]">
              <span className="sr-only">管理する園</span>
              <select value={garden.id} onChange={e => selectGarden(e.target.value)} className="h-9 max-w-[220px] truncate border border-line bg-white px-2 font-bold text-ink">
                {gardens.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </label>
          ) : (
            <p className="min-w-0 truncate text-[13.5px] font-bold text-ink">{garden.name}</p>
          )}
        </>
      ) : null}
      nav={session && mfaOk && gardens?.length ? (
        <nav className="border-b border-line bg-white" aria-label="管理画面のメニュー">
          <ul className="mx-auto flex max-w-[1184px] overflow-x-auto px-2 lg:px-10">
            {NAV.map(n => {
              const active = n.href === '/owner' ? pathname === '/owner' : pathname.startsWith(n.href)
              return (
                <li key={n.href}>
                  <Link href={n.href} aria-current={active ? 'page' : undefined} className={`flex h-12 items-center whitespace-nowrap border-b-2 px-4 text-[14px] ${active ? 'border-ink font-bold text-ink' : 'border-transparent text-ink-soft hover:text-ink'}`}>{n.label}</Link>
                </li>
              )
            })}
          </ul>
        </nav>
      ) : null}
    >
      {body}
    </OwnerFrame>
  )
}

function OwnerFrame({ children, header, nav }: { children: ReactNode; header?: ReactNode; nav?: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex h-[60px] max-w-[1184px] items-center gap-3 px-4 lg:px-10">
          <Link href="/owner" className="flex flex-none items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center bg-sumi font-mincho text-[15px] font-bold text-gold">盆</span>
            <span className="hidden font-mincho text-[15px] font-bold tracking-[0.08em] sm:inline">盆栽コレクション</span>
          </Link>
          <span className="hidden flex-none border-l border-line pl-3 text-[12px] text-ink-soft md:inline">掲載園の管理画面</span>
          <div className="ml-auto flex min-w-0 items-center gap-3">{header}</div>
        </div>
      </header>
      {nav}
      <main className="mx-auto max-w-[1184px] px-4 pb-24 pt-6 lg:px-10 lg:pt-10">{children}</main>
    </div>
  )
}

export function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto mt-10 max-w-[560px] border border-line bg-white p-6 text-center">
      <p className="font-mincho text-[18px] font-bold">{title}</p>
      <p className="mt-2 text-[14px] leading-[1.9] text-ink-soft">{children}</p>
    </div>
  )
}

// 管理画面で使う見た目の部品
export const ownerInput = 'w-full border border-line bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:border-ink'
export const ownerButton = 'inline-flex min-h-11 items-center justify-center bg-ink px-5 text-[14px] font-bold text-white hover:bg-ink/85 disabled:opacity-50'
export const ownerSubButton = 'inline-flex min-h-11 items-center justify-center border border-ink bg-white px-4 text-[14px] text-ink hover:bg-paper-deep disabled:opacity-50'

export function PageTitle({ title, lead, action }: { title: string; lead?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-mincho text-[24px] font-bold tracking-[0.05em] lg:text-[30px]">{title}</h1>
        {lead && <p className="mt-1.5 text-[13.5px] leading-[1.8] text-ink-soft">{lead}</p>}
      </div>
      {action}
    </div>
  )
}
