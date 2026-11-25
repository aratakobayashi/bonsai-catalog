'use client'

import { useEffect, useState } from 'react'
import { friendlyError, ownerSupabase } from '@/lib/owner-supabase'

// 2段階認証（認証アプリの6桁のコード）。
// 初めてのログインでは認証アプリの登録、2回目からはログインのたびにコードの入力を求める。
// データベースの側でも、コードで確かめたログイン（aal2）でなければ園のデータを読めない・書けない
type Step = { kind: 'loading' } | { kind: 'enroll'; factorId: string; qr: string; secret: string } | { kind: 'challenge'; factorId: string } | { kind: 'error'; message: string }

// Supabase の QR コードは「data:image/svg+xml;utf-8,<svg…>」の形で、そのままでは表示できないブラウザがあるため、作り直す
function qrSrc(raw: string): string {
  const i = raw.indexOf(',')
  if (!raw.startsWith('data:image/svg+xml') || i < 0) return raw
  let svg = raw.slice(i + 1)
  if (!svg.trimStart().startsWith('<')) { try { svg = decodeURIComponent(svg) } catch { return raw } }
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const codeInput = 'w-full border border-line bg-white px-3 py-3 text-center font-mono text-[24px] tracking-[0.4em] text-ink outline-none focus:border-ink'
const button = 'inline-flex min-h-12 w-full items-center justify-center bg-ink px-5 text-[15px] font-bold text-white hover:bg-ink/85 disabled:opacity-50'

export function MfaGate({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<Step>({ kind: 'loading' })
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [showSecret, setShowSecret] = useState(false)

  useEffect(() => {
    const sb = ownerSupabase()
    ;(async () => {
      const { data, error: e } = await sb.auth.mfa.listFactors()
      if (e) { setStep({ kind: 'error', message: friendlyError(e.message) }); return }
      const verified = data.totp.find(f => f.status === 'verified')
      if (verified) { setStep({ kind: 'challenge', factorId: verified.id }); return }
      // 途中でやめた登録は消してから、新しく登録する
      for (const f of data.all.filter(f => f.status !== 'verified')) await sb.auth.mfa.unenroll({ factorId: f.id })
      const { data: en, error: ee } = await sb.auth.mfa.enroll({ factorType: 'totp', friendlyName: `盆栽コレクション ${new Date().toISOString().slice(0, 10)}` })
      if (ee || !en) { setStep({ kind: 'error', message: friendlyError(ee?.message ?? '2段階認証の準備ができませんでした') }); return }
      setStep({ kind: 'enroll', factorId: en.id, qr: en.totp.qr_code, secret: en.totp.secret })
    })()
  }, [])

  const verify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step.kind !== 'enroll' && step.kind !== 'challenge') return
    const clean = code.replace(/\D/g, '')
    if (clean.length !== 6) { setError('6桁の数字を入れてください'); return }
    setBusy(true)
    setError('')
    const { error: err } = await ownerSupabase().auth.mfa.challengeAndVerify({ factorId: step.factorId, code: clean })
    setBusy(false)
    if (err) { setError(/invalid|expired/i.test(err.message) ? 'コードが違うか、時間が過ぎています。認証アプリの新しいコードを入れてください' : friendlyError(err.message)); setCode(''); return }
    onDone()
  }

  const logout = async () => { await ownerSupabase().auth.signOut() }

  if (step.kind === 'loading') return <p className="py-24 text-center text-[14px] text-ink-muted">確認しています…</p>
  if (step.kind === 'error') return <p className="mx-auto mt-10 max-w-[480px] border border-line bg-white p-6 text-[14px] text-[#a3412c]">{step.message}</p>

  const codeForm = (
    <form onSubmit={verify} className="mt-6 space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-bold">認証アプリに出ている6桁のコード</span>
        <input inputMode="numeric" autoComplete="one-time-code" autoFocus maxLength={7} value={code} onChange={e => setCode(e.target.value)} className={codeInput} aria-describedby="mfa-error" />
      </label>
      {error && <p id="mfa-error" role="alert" className="text-[13.5px] text-[#a3412c]">{error}</p>}
      <button type="submit" disabled={busy} className={button}>{busy ? '確かめています…' : step.kind === 'enroll' ? '登録して進む' : '確認する'}</button>
    </form>
  )

  return (
    <div className="mx-auto max-w-[460px] pt-4 lg:pt-10">
      <p className="text-[12px] tracking-[0.15em] text-gold-dark">2段階認証</p>
      {step.kind === 'enroll' ? (
        <>
          <h1 className="mt-1 font-mincho text-[24px] font-bold">認証アプリを登録してください</h1>
          <p className="mt-2 text-[13.5px] leading-[1.9] text-ink-soft">管理画面を安全に使うため、パスワードに加えて、スマートフォンの認証アプリのコードでも確かめます。最初の1回だけ、次の手順で登録してください。</p>
          <ol className="mt-5 space-y-4 text-[14px] leading-[1.8]">
            <li><b>1.</b> スマートフォンに認証アプリを入れます（「Google Authenticator」「Microsoft Authenticator」など。無料）。</li>
            <li>
              <b>2.</b> アプリで「QRコードをスキャン」を選び、下のQRコードを読み取ります。
              <div className="mt-3 flex justify-center border border-line bg-white p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrSrc(step.qr)} alt="認証アプリに登録するQRコード" width={200} height={200} className="h-[200px] w-[200px]" />
              </div>
              <button type="button" onClick={() => setShowSecret(v => !v)} className="mt-2 text-[12.5px] text-ink-soft underline underline-offset-4">QRコードを読み取れないとき</button>
              {showSecret && <p className="mt-1.5 break-all border border-line bg-paper-deep p-3 font-mono text-[13px]">アプリで「セットアップキーを入力」を選び、次の文字を入れてください：<br />{step.secret}</p>}
            </li>
            <li><b>3.</b> アプリに出た6桁のコードを入れます。</li>
          </ol>
          {codeForm}
          <p className="mt-5 text-[12px] leading-[1.8] text-ink-muted">機種変更などで認証アプリが使えなくなったときは、運営者にご連絡ください。登録を外したうえで、もう一度登録していただきます。</p>
        </>
      ) : (
        <>
          <h1 className="mt-1 font-mincho text-[24px] font-bold">コードを入れてください</h1>
          <p className="mt-2 text-[13.5px] leading-[1.9] text-ink-soft">スマートフォンの認証アプリを開き、「盆栽コレクション」の6桁のコードを入れてください。</p>
          {codeForm}
          <p className="mt-5 text-[12px] leading-[1.8] text-ink-muted">認証アプリが使えないときは、運営者にご連絡ください。</p>
        </>
      )}
      <button type="button" onClick={logout} className="mt-6 text-[13px] text-ink-soft underline underline-offset-4">ログアウト</button>
    </div>
  )
}
