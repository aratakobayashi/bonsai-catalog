'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { friendlyError, ownerSupabase } from '@/lib/owner-supabase'
import { ownerButton, ownerInput } from '@/components/owner/OwnerShell'

export default function OwnerLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('reason') === 'idle') setNotice('30分間操作がなかったため、安全のためにログアウトしました。もう一度ログインしてください。')
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error: err } = await ownerSupabase().auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (err) { setError(friendlyError(err.message)); return }
    router.replace('/owner')
  }

  return (
    <div className="mx-auto max-w-[420px] pt-6 lg:pt-12">
      <h1 className="font-mincho text-[26px] font-bold tracking-[0.05em]">ログイン</h1>
      <p className="mt-2 text-[13.5px] leading-[1.8] text-ink-soft">掲載園の管理画面です。運営者からお知らせしたメールアドレスとパスワードを入れてください。</p>
      {notice && <p role="status" className="mt-5 border border-line bg-white p-3 text-[13px] leading-[1.8] text-ink-soft">{notice}</p>}
      <form onSubmit={submit} className="mt-7 space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold">メールアドレス</span>
          <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={ownerInput} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold">パスワード</span>
          <input type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className={ownerInput} />
        </label>
        {error && <p role="alert" className="text-[13.5px] text-[#a3412c]">{error}</p>}
        <button type="submit" disabled={busy} className={`${ownerButton} w-full`}>{busy ? 'ログインしています…' : 'ログイン'}</button>
      </form>
      <div className="mt-8 space-y-2 border-t border-line pt-5 text-[13px] leading-[1.8] text-ink-soft">
        <p>ログインはこのタブの中だけで有効です。タブを閉じる、管理画面の外のページへ移る、30分操作しない、のいずれかでログアウトします。</p>
        <p>パスワードを忘れたときや、ログインできないときは、<Link href="/contact?type=garden" className="border-b border-ink text-ink">お問い合わせ</Link>からご連絡ください。</p>
        <p>まだ掲載のお申し込みをしていない園は、<Link href="/gardens/owners" className="border-b border-ink text-ink">掲載のご案内</Link>をご覧ください（無料）。</p>
      </div>
    </div>
  )
}
