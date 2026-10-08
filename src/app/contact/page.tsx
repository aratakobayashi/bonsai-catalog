'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CONTAINER, PageHeading } from '@/components/ui/design'

// お問い合わせの種類。盆栽園・イベント詳細の「修正を依頼」からは ?type=correction&page=<対象ページ> で開く
const INQUIRY_TYPES = [
  { value: 'site', label: 'サイトについて' },
  { value: 'correction', label: '掲載情報の修正（盆栽園・イベント）' },
  { value: 'photo', label: '写真の提供' },
  { value: 'ad', label: '広告・取材' },
  { value: 'other', label: 'その他' },
] as const

type InquiryType = (typeof INQUIRY_TYPES)[number]['value']

const MESSAGE_PLACEHOLDERS: Record<InquiryType, string> = {
  site: 'お問い合わせ内容をお書きください',
  correction: '修正が必要な箇所と、正しい情報をお書きください',
  photo: '提供いただける写真の内容と、掲載の条件があればお書きください',
  ad: 'ご依頼の内容をお書きください',
  other: 'お問い合わせ内容をお書きください',
}

const inputClass =
  'w-full rounded-lg border border-line bg-white px-3.5 py-3 text-[14px] text-ink placeholder:text-ink-muted outline-none focus:border-navy'

function Label({ htmlFor, children, required = false }: { htmlFor?: string; children: React.ReactNode; required?: boolean }) {
  const content = (
    <>
      {children}
      {required && <span className="ml-1.5 text-[11px] font-bold text-rakuten">必須</span>}
    </>
  )
  return htmlFor ? (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-bold text-ink">{content}</label>
  ) : (
    <span className="mb-1.5 block text-[13px] font-bold text-ink">{content}</span>
  )
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    type: '' as InquiryType | '',
    page: '',
    name: '',
    email: '',
    message: '',
  })
  const [agreed, setAgreed] = useState(false)
  const [step, setStep] = useState<'input' | 'confirm'>('input')
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // 「修正を依頼」リンクなどから、種類と対象ページを選んだ状態で開く
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const type = params.get('type')
    const page = params.get('page')
    setFormData(prev => ({
      ...prev,
      type: INQUIRY_TYPES.some(t => t.value === type) ? (type as InquiryType) : prev.type,
      page: page ? page.slice(0, 200) : prev.page,
    }))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // 送信先メールアドレス（未設定ならフォームは受付停止）
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || ''
  const typeLabel = INQUIRY_TYPES.find(t => t.value === formData.type)?.label ?? ''

  // 入力 → 確認画面へ
  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitStatus('idle')
    setStep('confirm')
    window.scrollTo({ top: 0 })
  }

  // サーバー送信の仕組みが無いため、入力内容を差し込んだメールソフトを開く
  const handleSubmit = () => {
    if (!contactEmail) {
      setSubmitStatus('error')
      return
    }
    const lines = [
      `お問い合わせの種類: ${typeLabel}`,
      formData.page ? `対象のページ: ${formData.page}` : null,
      `お名前: ${formData.name}`,
      `メールアドレス: ${formData.email}`,
      '',
      formData.message,
    ].filter((line): line is string => line !== null)
    window.location.href =
      `mailto:${contactEmail}?subject=${encodeURIComponent(`[盆栽コレクション] ${typeLabel}`)}&body=${encodeURIComponent(lines.join('\n'))}`
    setSubmitStatus('success')
  }

  return (
    <div className={`${CONTAINER} pb-12`}>
      <div className="mx-auto max-w-[720px]">
        <PageHeading
          title="お問い合わせ"
          crumbs={[{ label: 'ホーム', href: '/' }, { label: 'お問い合わせ' }]}
          lead={
            <>
              回答までに数日いただく場合があります。
              <span className="hidden lg:inline">
                先に<Link href="/faq" className="text-navy underline underline-offset-2 hover:text-gold-dark">よくある質問</Link>もご確認ください。
              </span>
            </>
          }
        />

        {/* 販売はしていないことを先に案内する */}
        <div className="mt-5 rounded-xl border border-line bg-[#fdfaf4] px-4 py-4 lg:px-5">
          <p className="text-[13px] font-bold text-ink">商品の注文・配送・返品について</p>
          <p className="mt-1 text-[13px] leading-[1.8] text-ink-soft">
            当サイトでは販売を行っていないため、購入したショップ（楽天市場の各店舗・Amazon）へ直接お問い合わせください。
          </p>
        </div>

        {step === 'input' ? (
          <form onSubmit={handleConfirm} className="mt-6 space-y-5">
            <fieldset>
              <legend className="contents"><Label required>お問い合わせの種類</Label></legend>
              <div className="space-y-2">
                {INQUIRY_TYPES.map(t => {
                  const checked = formData.type === t.value
                  return (
                    <label
                      key={t.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border bg-white px-3.5 py-2.5 text-[14px] text-ink ${checked ? 'border-navy' : 'border-line hover:border-gold'}`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={t.value}
                        checked={checked}
                        onChange={handleChange}
                        required
                        className="h-4 w-4 accent-navy"
                      />
                      {t.label}
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <div>
              <Label htmlFor="page">対象のページ</Label>
              <input
                type="text"
                id="page"
                name="page"
                value={formData.page}
                onChange={handleChange}
                maxLength={200}
                className={inputClass}
                placeholder="例：清香園のページ"
              />
            </div>

            <div>
              <Label htmlFor="name" required>お名前</Label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
                className={inputClass}
              />
            </div>

            <div>
              <Label htmlFor="email" required>メールアドレス</Label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className={inputClass}
                placeholder="example@mail.com"
              />
            </div>

            <div>
              <Label htmlFor="message" required>内容</Label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className={`${inputClass} resize-y`}
                placeholder={MESSAGE_PLACEHOLDERS[formData.type || 'site']}
              />
            </div>

            <label className="flex items-center gap-2.5 text-[13.5px] text-ink">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                required
                className="h-[18px] w-[18px] accent-navy"
              />
              <span>
                <Link href="/privacy" target="_blank" className="text-navy underline underline-offset-2 hover:text-gold-dark">プライバシーポリシー</Link>
                に同意する
              </span>
            </label>

            <button
              type="submit"
              className="w-full rounded-lg bg-navy py-3.5 text-[15px] font-bold text-white hover:bg-navy-light"
            >
              確認画面へ
            </button>
          </form>
        ) : (
          <div className="mt-6">
            <h2 className="font-mincho text-lg font-bold text-navy">入力内容の確認</h2>
            <dl className="mt-3 divide-y divide-line rounded-xl border border-line bg-white">
              {[
                { label: 'お問い合わせの種類', value: typeLabel },
                { label: '対象のページ', value: formData.page || '—' },
                { label: 'お名前', value: formData.name },
                { label: 'メールアドレス', value: formData.email },
                { label: '内容', value: formData.message },
              ].map(row => (
                <div key={row.label} className="px-4 py-3.5 lg:flex lg:gap-6 lg:px-5">
                  <dt className="text-[13px] font-bold text-ink lg:w-40 lg:shrink-0">{row.label}</dt>
                  <dd className="mt-1 whitespace-pre-wrap break-words text-[14px] leading-[1.8] text-ink-soft lg:mt-0">{row.value}</dd>
                </div>
              ))}
            </dl>

            {submitStatus === 'success' && (
              <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-[13px] leading-relaxed text-green-800">
                メールソフトが起動します。内容を確認のうえ送信してください。起動しない場合は {contactEmail} 宛てに直接お送りください。
              </p>
            )}
            {submitStatus === 'error' && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] leading-relaxed text-red-800">
                現在、お問い合わせの受付を準備中です。恐れ入りますが、しばらくしてから再度お試しください。
              </p>
            )}

            <p className="mt-4 text-[12.5px] leading-relaxed text-ink-muted">
              「メールソフトで送信」を押すと、入力内容が入ったメールが開きます。そのまま送信してください。
            </p>
            <div className="mt-4 flex flex-col-reverse gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="rounded-lg border border-navy bg-white px-6 py-3.5 text-[14px] font-bold text-navy hover:border-gold hover:text-gold-dark sm:w-40"
              >
                修正する
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 rounded-lg bg-navy py-3.5 text-[15px] font-bold text-white hover:bg-navy-light"
              >
                メールソフトで送信
              </button>
            </div>
          </div>
        )}

        {contactEmail && (
          <p className="mt-6 text-[12.5px] text-ink-muted">
            メールで直接送る場合：<a href={`mailto:${contactEmail}`} className="text-navy underline underline-offset-2">{contactEmail}</a>
          </p>
        )}
      </div>
    </div>
  )
}
