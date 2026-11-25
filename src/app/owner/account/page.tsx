'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { friendlyError, ownerSupabase } from '@/lib/owner-supabase'
import { PageTitle, ownerButton, ownerInput, ownerSubButton, useOwner } from '@/components/owner/OwnerShell'

export default function OwnerAccountPage() {
  const { session, gardens } = useOwner()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const change = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { setMessage('パスワードは8文字以上にしてください'); return }
    if (password !== confirm) { setMessage('確認のパスワードが一致しません'); return }
    setBusy(true)
    const { error } = await ownerSupabase().auth.updateUser({ password })
    setBusy(false)
    setMessage(error ? friendlyError(error.message) : 'パスワードを変更しました')
    if (!error) { setPassword(''); setConfirm('') }
  }

  const logout = async () => {
    await ownerSupabase().auth.signOut()
    router.replace('/owner/login')
  }

  return (
    <div className="max-w-[560px]">
      <PageTitle title="アカウント" />
      <dl className="mt-6 border-t border-line text-[14px]">
        <div className="grid grid-cols-[120px_1fr] border-b border-line py-3"><dt className="text-ink-muted">メールアドレス</dt><dd>{session.user.email}</dd></div>
        <div className="grid grid-cols-[120px_1fr] border-b border-line py-3"><dt className="text-ink-muted">管理できる園</dt><dd>{gardens.map(g => g.name).join('、')}</dd></div>
      </dl>

      <h2 className="mt-10 font-mincho text-[19px] font-bold">パスワードの変更</h2>
      <p className="mt-1 text-[13px] text-ink-soft">運営者からお知らせしたパスワードは、最初のログインのあとに変えてください。</p>
      <form onSubmit={change} className="mt-4 space-y-4">
        <label className="block"><span className="mb-1.5 block text-[13px] font-bold">新しいパスワード（8文字以上）</span><input type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className={ownerInput} /></label>
        <label className="block"><span className="mb-1.5 block text-[13px] font-bold">もう一度</span><input type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} className={ownerInput} /></label>
        {message && <p role="status" className="text-[13.5px] text-ink">{message}</p>}
        <button type="submit" disabled={busy} className={ownerButton}>変更する</button>
      </form>

      <div className="mt-12 border-t border-line pt-6">
        <button type="button" onClick={logout} className={ownerSubButton}>ログアウト</button>
      </div>
    </div>
  )
}
