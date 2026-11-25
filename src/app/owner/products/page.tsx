'use client'

import { useCallback, useEffect, useState } from 'react'
import { friendlyError, ownerSupabase, uploadGardenImage } from '@/lib/owner-supabase'
import { PageTitle, ownerButton, ownerInput, ownerSubButton, useOwner } from '@/components/owner/OwnerShell'

// 商品の登録。購入は貴園の通販サイト・電話・店頭へご案内する（当サイトでは販売しない）
interface Product {
  id?: string
  name: string
  price: number | null
  price_note: string
  description: string
  image_url: string | null
  buy_method: 'url' | 'phone' | 'visit'
  buy_url: string
  in_stock: boolean
  published: boolean
  sort: number
}

const BLANK: Product = { name: '', price: null, price_note: '', description: '', image_url: null, buy_method: 'url', buy_url: '', in_stock: true, published: true, sort: 0 }
const BUY_LABEL = { url: '購入ページのURLへ', phone: '電話で注文・問い合わせ', visit: '園の店頭で販売' }
const COLUMNS = 'id, name, price, price_note, description, image_url, buy_method, buy_url, in_stock, published, sort'

export default function OwnerProductsPage() {
  const { garden } = useOwner()
  const [items, setItems] = useState<Product[] | null>(null)
  const [editing, setEditing] = useState<Product | null>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const load = useCallback(async () => {
    const { data, error } = await ownerSupabase().from('garden_products').select(COLUMNS).eq('garden_id', garden.id).order('sort').order('created_at', { ascending: false })
    if (error) { setMessage({ ok: false, text: friendlyError(error.message) }); setItems([]); return }
    setItems(((data ?? []) as Product[]).map(p => ({ ...p, price_note: p.price_note ?? '', description: p.description ?? '', buy_url: p.buy_url ?? '' })))
  }, [garden.id])

  useEffect(() => { setItems(null); setEditing(null); load() }, [load])

  const togglePublished = async (p: Product) => {
    const { error } = await ownerSupabase().from('garden_products').update({ published: !p.published, updated_at: new Date().toISOString() }).eq('id', p.id!)
    if (error) setMessage({ ok: false, text: friendlyError(error.message) })
    else { setMessage({ ok: true, text: p.published ? '非公開にしました。サイトからは翌朝までに外れます' : '公開にしました。サイトには翌朝までに載ります' }); load() }
  }

  const remove = async (p: Product) => {
    if (!window.confirm(`「${p.name}」を削除しますか？元に戻せません。`)) return
    const { error } = await ownerSupabase().from('garden_products').delete().eq('id', p.id!)
    if (error) setMessage({ ok: false, text: friendlyError(error.message) })
    else { setMessage({ ok: true, text: '削除しました' }); load() }
  }

  if (editing) return <ProductEditor product={editing} gardenId={garden.id} onDone={(text) => { setEditing(null); if (text) setMessage({ ok: true, text }); load() }} />

  return (
    <div>
      <PageTitle
        title="商品"
        lead="載せた商品は、貴園のページに並びます。購入は、貴園の通販サイト・電話・店頭へご案内します。"
        action={<button type="button" onClick={() => { setMessage(null); setEditing({ ...BLANK }) }} className={ownerButton}>＋ 商品を追加</button>}
      />
      {message && <p role="status" className={`mt-5 text-[13.5px] ${message.ok ? 'text-[#2f7d4f]' : 'text-[#a3412c]'}`}>{message.text}</p>}
      {items === null ? <p className="py-20 text-center text-[14px] text-ink-muted">読み込んでいます…</p> : items.length === 0 ? (
        <div className="mt-8 border border-dashed border-ink-muted/50 bg-white p-8 text-center">
          <p className="font-mincho text-[18px] font-bold">まだ商品がありません</p>
          <p className="mt-2 text-[13.5px] leading-[1.9] text-ink-soft">盆栽・鉢・道具など、貴園で販売しているものを載せられます。<br />写真・名前・価格と、購入の方法（通販のURL・電話・店頭）を入れてください。</p>
          <button type="button" onClick={() => setEditing({ ...BLANK })} className={`${ownerButton} mt-5`}>＋ 最初の商品を追加</button>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line border-y border-line bg-white">
          {items.map(p => (
            <li key={p.id} className="flex items-center gap-3 p-3 lg:gap-5 lg:p-4">
              <div className="h-16 w-16 flex-none overflow-hidden bg-paper-deep lg:h-20 lg:w-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14.5px] font-bold">{p.name}</p>
                <p className="mt-0.5 text-[12.5px] text-ink-soft">
                  {p.price != null ? `${p.price.toLocaleString()}円` : '価格なし'}
                  <span className="mx-1.5 text-ink-muted">・</span>{BUY_LABEL[p.buy_method]}
                  {!p.in_stock && <span className="ml-1.5 text-[#a3412c]">売り切れ</span>}
                </p>
                <p className={`mt-1 inline-block px-1.5 text-[11px] ${p.published ? 'bg-[#2f7d4f]/10 text-[#2f7d4f]' : 'bg-paper-deep text-ink-muted'}`}>{p.published ? '公開' : '非公開'}</p>
              </div>
              <div className="flex flex-none flex-col gap-1.5 sm:flex-row">
                <button type="button" onClick={() => { setMessage(null); setEditing(p) }} className={`${ownerSubButton} !min-h-9 px-3 text-[13px]`}>編集</button>
                <button type="button" onClick={() => togglePublished(p)} className={`${ownerSubButton} !min-h-9 px-3 text-[13px]`}>{p.published ? '非公開に' : '公開に'}</button>
                <button type="button" onClick={() => remove(p)} className="min-h-9 px-3 text-[13px] text-[#a3412c] hover:underline">削除</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-[12px] leading-[1.8] text-ink-muted">商品は100件まで載せられます。並び順の数字が小さいものから順に並びます。追加・変更は、翌朝までにサイトに反映されます。生き物の取り扱いや、法律で表示が必要な事項は、購入先のページでご案内ください。</p>
    </div>
  )
}

function ProductEditor({ product, gardenId, onDone }: { product: Product; gardenId: string; onDone: (message?: string) => void }) {
  const [p, setP] = useState<Product>(product)
  const [priceText, setPriceText] = useState(product.price != null ? String(product.price) : '')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP(x => ({ ...x, [k]: v }))

  const upload = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    setError('')
    try { set('image_url', await uploadGardenImage(gardenId, file, 'product')) } catch (e) { setError(friendlyError((e as Error).message)) }
    setUploading(false)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const price = priceText.trim() ? Number(priceText.replace(/[,，円\s]/g, '')) : null
    if (price != null && (!Number.isInteger(price) || price < 0)) { setError('価格は数字で入れてください（例：5500）'); return }
    if (p.buy_method === 'url' && !/^https?:\/\//.test(p.buy_url.trim())) { setError('購入ページのURLを https:// から入れてください'); return }
    setBusy(true)
    setError('')
    const row = {
      garden_id: gardenId,
      name: p.name.trim(),
      price,
      price_note: p.price_note.trim() || null,
      description: p.description.trim() || null,
      image_url: p.image_url,
      buy_method: p.buy_method,
      buy_url: p.buy_method === 'url' ? p.buy_url.trim() : null,
      in_stock: p.in_stock,
      published: p.published,
      sort: Number.isFinite(p.sort) ? p.sort : 0,
      updated_at: new Date().toISOString(),
    }
    const sb = ownerSupabase()
    const { error: err } = p.id ? await sb.from('garden_products').update(row).eq('id', p.id) : await sb.from('garden_products').insert(row)
    setBusy(false)
    if (err) { setError(friendlyError(err.message)); return }
    onDone(p.published ? '保存しました。サイトには翌朝までに反映されます' : '保存しました（非公開）')
  }

  return (
    <form onSubmit={save} className="max-w-[760px]">
      <button type="button" onClick={() => onDone()} className="mb-4 inline-flex min-h-10 items-center text-[13.5px] text-ink-soft hover:text-ink">‹ 商品の一覧へ</button>
      <PageTitle title={p.id ? '商品を編集' : '商品を追加'} />
      <div className="mt-7 grid gap-6 md:grid-cols-[220px_1fr]">
        <div>
          <p className="text-[14px] font-bold">写真</p>
          <label className={`mt-1.5 flex aspect-square cursor-pointer items-center justify-center overflow-hidden border border-dashed border-ink-muted/60 bg-white text-[13px] text-ink-soft hover:border-ink ${uploading ? 'opacity-50' : ''}`}>
            {p.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image_url} alt="" className="h-full w-full object-cover" />
            ) : (uploading ? '送っています…' : '＋ 写真を選ぶ')}
            <input type="file" accept="image/*" disabled={uploading} onChange={e => { upload(e.target.files?.[0]); e.target.value = '' }} className="sr-only" />
          </label>
          {p.image_url && <button type="button" onClick={() => set('image_url', null)} className="mt-1.5 text-[12.5px] text-[#a3412c]">写真を外す</button>}
        </div>
        <div className="space-y-5">
          <label className="block"><span className="text-[14px] font-bold">商品名 <span className="text-[11px] text-gold-dark">必須</span></span><input required maxLength={80} value={p.name} onChange={e => set('name', e.target.value)} placeholder="例：五葉松 小品盆栽（樹高15cm）" className={`${ownerInput} mt-1.5`} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="text-[14px] font-bold">価格（円・税込）</span><input inputMode="numeric" value={priceText} onChange={e => setPriceText(e.target.value)} placeholder="例：5500" className={`${ownerInput} mt-1.5`} /></label>
            <label className="block"><span className="text-[14px] font-bold">価格の補足</span><input maxLength={60} value={p.price_note} onChange={e => set('price_note', e.target.value)} placeholder="例：送料別" className={`${ownerInput} mt-1.5`} /></label>
          </div>
          <label className="block"><span className="text-[14px] font-bold">説明</span><textarea rows={4} maxLength={800} value={p.description} onChange={e => set('description', e.target.value)} placeholder="樹齢・大きさ・鉢・手入れのポイントなど" className={`${ownerInput} mt-1.5 leading-[1.8]`} /></label>
          <fieldset>
            <legend className="text-[14px] font-bold">購入の方法</legend>
            <div className="mt-1.5 space-y-1.5">
              {(Object.keys(BUY_LABEL) as Product['buy_method'][]).map(m => (
                <label key={m} className="flex min-h-10 items-center gap-2.5 text-[14px]"><input type="radio" name="buy" checked={p.buy_method === m} onChange={() => set('buy_method', m)} className="h-4 w-4" />{BUY_LABEL[m]}</label>
              ))}
            </div>
            {p.buy_method === 'url' && <input type="url" maxLength={500} value={p.buy_url} onChange={e => set('buy_url', e.target.value)} placeholder="https://（この商品の購入ページ）" className={`${ownerInput} mt-2`} />}
            {p.buy_method === 'phone' && <p className="mt-1 text-[12px] text-ink-muted">「園の情報」の電話番号へご案内します。</p>}
          </fieldset>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <label className="flex min-h-10 items-center gap-2.5 text-[14px]"><input type="checkbox" checked={p.in_stock} onChange={e => set('in_stock', e.target.checked)} className="h-4 w-4" />在庫あり</label>
            <label className="flex min-h-10 items-center gap-2.5 text-[14px]"><input type="checkbox" checked={p.published} onChange={e => set('published', e.target.checked)} className="h-4 w-4" />サイトに公開する</label>
            <label className="flex min-h-10 items-center gap-2.5 text-[14px]">並び順<input type="number" value={p.sort} onChange={e => set('sort', Number(e.target.value))} className={`${ownerInput} !w-20 !py-1.5`} /></label>
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 mt-8 flex flex-wrap items-center gap-4 border-t border-line bg-paper/95 py-4 backdrop-blur">
        <button type="submit" disabled={busy || uploading} className={ownerButton}>{busy ? '保存しています…' : '保存する'}</button>
        <button type="button" onClick={() => onDone()} className={ownerSubButton}>やめる</button>
        {error && <p role="alert" className="text-[13.5px] text-[#a3412c]">{error}</p>}
      </div>
    </form>
  )
}
