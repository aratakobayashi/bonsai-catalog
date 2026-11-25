'use client'

import { useEffect, useState } from 'react'
import { friendlyError, ownerSupabase, uploadGardenImage } from '@/lib/owner-supabase'
import { PageTitle, ownerButton, ownerInput, ownerSubButton, useOwner } from '@/components/owner/OwnerShell'

// 園の情報の編集。空の項目は、いま公開している情報のまま
type Field = 'description' | 'business_hours' | 'closed_days' | 'visit_info' | 'taiken_info' | 'access_info' | 'parking_info' | 'phone' | 'website_url' | 'shop_url' | 'instagram_url'
type Form = Record<Field, string> & { photos: string[] }

const EMPTY: Form = { description: '', business_hours: '', closed_days: '', visit_info: '', taiken_info: '', access_info: '', parking_info: '', phone: '', website_url: '', shop_url: '', instagram_url: '', photos: [] }

const FIELDS: { key: Field; label: string; hint?: string; rows?: number; max: number; type?: string }[] = [
  { key: 'description', label: '園の紹介', hint: '園の歴史や得意な樹種、見どころなど。園のページのいちばん上に載ります', rows: 6, max: 1200 },
  { key: 'business_hours', label: '営業時間', hint: '例：9:00〜17:00（冬季は16:00まで）', rows: 2, max: 200 },
  { key: 'closed_days', label: '定休日', hint: '例：木曜日、年末年始', max: 100 },
  { key: 'visit_info', label: '見学', hint: '例：見学は自由（無料）。団体は事前にご連絡ください', rows: 2, max: 300 },
  { key: 'taiken_info', label: '体験・教室', hint: '内容・料金・所要時間・日程・予約の方法など', rows: 5, max: 800 },
  { key: 'access_info', label: 'アクセス', hint: '例：JR〇〇駅から徒歩10分', rows: 2, max: 300 },
  { key: 'parking_info', label: '駐車場', hint: '例：無料駐車場あり（5台）', max: 200 },
  { key: 'phone', label: '電話番号', max: 30, type: 'tel' },
  { key: 'website_url', label: '公式サイトのURL', max: 300, type: 'url' },
  { key: 'shop_url', label: '通販サイトのURL', hint: '自社の通販・BASE・楽天市場など', max: 300, type: 'url' },
  { key: 'instagram_url', label: 'InstagramのURL', max: 300, type: 'url' },
]

// いま公開している情報（運営者が公開情報からまとめたもの）
const PUBLIC_COLUMNS = 'description, business_hours, closed_days, access_info, parking_info, phone, website_url, social_instagram, image_url'

export default function OwnerGardenPage() {
  const { garden, session } = useOwner()
  const [form, setForm] = useState<Form>(EMPTY)
  const [current, setCurrent] = useState<Record<string, string>>({})
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    const sb = ownerSupabase()
    setLoaded(false)
    Promise.all([
      sb.from('garden_owner_info').select('garden_id, description, business_hours, closed_days, visit_info, access_info, parking_info, phone, website_url, shop_url, instagram_url, taiken_info, photos, updated_at').eq('garden_id', garden.id).maybeSingle(),
      sb.from('gardens').select(PUBLIC_COLUMNS).eq('id', garden.id).maybeSingle(),
    ]).then(([own, pub]) => {
      if (own.error) setMessage({ ok: false, text: friendlyError(own.error.message) })
      const o = (own.data ?? {}) as Partial<Form>
      setForm({ ...EMPTY, ...Object.fromEntries(Object.entries(o).filter(([k, v]) => k in EMPTY && v != null)), photos: Array.isArray(o.photos) ? o.photos : [] })
      const p = (pub.data ?? {}) as Record<string, unknown>
      setCurrent({
        description: String(p.description ?? ''),
        business_hours: String(p.business_hours ?? ''),
        closed_days: Array.isArray(p.closed_days) ? (p.closed_days as string[]).join('、') : '',
        access_info: String(p.access_info ?? ''),
        parking_info: String(p.parking_info ?? ''),
        phone: String(p.phone ?? ''),
        website_url: String(p.website_url ?? ''),
        instagram_url: String(p.social_instagram ?? ''),
      })
      setLoaded(true)
    })
  }, [garden.id])

  const set = (key: Field, value: string) => setForm(f => ({ ...f, [key]: value }))

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    setMessage(null)
    try {
      const room = 6 - form.photos.length
      const urls: string[] = []
      for (const file of Array.from(files).slice(0, room)) urls.push(await uploadGardenImage(garden.id, file, 'garden'))
      setForm(f => ({ ...f, photos: [...f.photos, ...urls].slice(0, 6) }))
      setMessage({ ok: true, text: '写真を追加しました。「保存する」を押すと掲載されます' })
    } catch (e) {
      setMessage({ ok: false, text: friendlyError((e as Error).message) })
    }
    setUploading(false)
  }

  const movePhoto = (i: number, dir: -1 | 1) => setForm(f => {
    const photos = [...f.photos]
    const j = i + dir
    if (j < 0 || j >= photos.length) return f
    ;[photos[i], photos[j]] = [photos[j], photos[i]]
    return { ...f, photos }
  })

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    for (const k of ['website_url', 'shop_url', 'instagram_url'] as const) {
      if (form[k].trim() && !/^https?:\/\//.test(form[k].trim())) { setMessage({ ok: false, text: `${FIELDS.find(f => f.key === k)!.label}は https:// から始めてください` }); return }
    }
    setBusy(true)
    setMessage(null)
    const row: Record<string, unknown> = { garden_id: garden.id, photos: form.photos, updated_by: session.user.id }
    for (const f of FIELDS) row[f.key] = form[f.key].trim() || null
    const { error } = await ownerSupabase().from('garden_owner_info').upsert(row)
    setBusy(false)
    setMessage(error ? { ok: false, text: friendlyError(error.message) } : { ok: true, text: '保存しました。サイトには翌朝までに反映されます' })
  }

  if (!loaded) return <p className="py-20 text-center text-[14px] text-ink-muted">読み込んでいます…</p>

  return (
    <form onSubmit={save} className="max-w-[860px]">
      <PageTitle
        title="園の情報"
        lead="書いた項目は、公開している情報より優先して載ります。空にした項目は、いまの公開情報のままです。"
        action={<a href={`/gardens/${garden.id}`} target="_blank" rel="noopener noreferrer" className={ownerSubButton}>公開中のページを見る ↗</a>}
      />

      <section className="mt-8">
        <h2 className="font-mincho text-[18px] font-bold">写真（6枚まで）</h2>
        <p className="mt-1 text-[12.5px] text-ink-muted">1枚目が園のページの一番上に大きく載ります。貴園で撮影した、または掲載の許可を得た写真をお使いください。</p>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {form.photos.map((src, i) => (
            <li key={src} className="border border-line bg-white">
              <div className="relative aspect-[4/3] bg-paper-deep">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`写真${i + 1}`} className="h-full w-full object-cover" />
                {i === 0 && <span className="absolute left-2 top-2 bg-ink px-1.5 py-0.5 text-[11px] text-white">1枚目</span>}
              </div>
              <div className="flex text-[12.5px]">
                <button type="button" onClick={() => movePhoto(i, -1)} disabled={i === 0} className="h-10 flex-1 border-r border-line disabled:opacity-30">← 前へ</button>
                <button type="button" onClick={() => movePhoto(i, 1)} disabled={i === form.photos.length - 1} className="h-10 flex-1 border-r border-line disabled:opacity-30">後へ →</button>
                <button type="button" onClick={() => setForm(f => ({ ...f, photos: f.photos.filter(p => p !== src) }))} className="h-10 flex-1 text-[#a3412c]">外す</button>
              </div>
            </li>
          ))}
          {form.photos.length < 6 && (
            <li>
              <label className={`flex aspect-[4/3] cursor-pointer flex-col items-center justify-center border border-dashed border-ink-muted/60 bg-white text-[13px] text-ink-soft hover:border-ink ${uploading ? 'opacity-50' : ''}`}>
                <span className="text-[24px]" aria-hidden="true">＋</span>
                {uploading ? '送っています…' : '写真を追加'}
                <input type="file" accept="image/*" multiple disabled={uploading} onChange={e => { addPhotos(e.target.files); e.target.value = '' }} className="sr-only" />
              </label>
            </li>
          )}
        </ul>
      </section>

      <section className="mt-10 space-y-6">
        {FIELDS.map(f => (
          <label key={f.key} className="block">
            <span className="flex items-baseline justify-between gap-3">
              <span className="text-[14px] font-bold">{f.label}</span>
              <span className="text-[11.5px] text-ink-muted">{form[f.key].length}/{f.max}</span>
            </span>
            {f.hint && <span className="mt-0.5 block text-[12px] text-ink-muted">{f.hint}</span>}
            {f.rows ? (
              <textarea rows={f.rows} maxLength={f.max} value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={current[f.key] || ''} className={`${ownerInput} mt-1.5 leading-[1.8]`} />
            ) : (
              <input type={f.type ?? 'text'} maxLength={f.max} value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={current[f.key] || ''} className={`${ownerInput} mt-1.5`} />
            )}
            {current[f.key] && !form[f.key] && <span className="mt-1 block text-[11.5px] text-ink-muted">空のときは、薄い文字のいまの公開情報が載ります</span>}
          </label>
        ))}
      </section>

      <div className="sticky bottom-0 mt-10 flex flex-wrap items-center gap-4 border-t border-line bg-paper/95 py-4 backdrop-blur">
        <button type="submit" disabled={busy || uploading} className={ownerButton}>{busy ? '保存しています…' : '保存する'}</button>
        {message && <p role="status" className={`text-[13.5px] ${message.ok ? 'text-[#2f7d4f]' : 'text-[#a3412c]'}`}>{message.text}</p>}
      </div>
    </form>
  )
}
