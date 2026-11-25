'use client'
// 盆栽園向けの管理画面（/owner）だけで使う Supabase クライアント（ログインの状態をブラウザに保存する）
// 一般のページからは import しない（読み込む JS を増やさないため）
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function ownerSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'bc-owner-auth', detectSessionInUrl: true },
    })
  }
  return client
}

export const MEDIA_BUCKET = 'garden-media'

// 写真を長い辺1600pxまでに縮めて JPEG にする（置き場の容量と、公開ページの表示の速さのため）
export async function resizeImage(file: File, maxSize = 1600, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('画像を変換できませんでした'))), 'image/jpeg', quality))
}

export async function uploadGardenImage(gardenId: string, file: File, kind: 'garden' | 'product'): Promise<string> {
  if (!/^image\//.test(file.type)) throw new Error('画像のファイルを選んでください')
  const blob = await resizeImage(file)
  const path = `${gardenId}/${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
  const sb = ownerSupabase()
  const { error } = await sb.storage.from(MEDIA_BUCKET).upload(path, blob, { contentType: 'image/jpeg', upsert: false })
  if (error) throw new Error(`写真を保存できませんでした（${error.message}）`)
  return sb.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl
}

// エラーを園の方に分かる言葉にする
export function friendlyError(message: string): string {
  if (/Invalid login credentials/i.test(message)) return 'メールアドレスかパスワードが違います'
  if (/relation .* does not exist|schema cache|Could not find the table/i.test(message)) return '管理画面の準備がまだ終わっていません。運営者にご連絡ください'
  if (/row-level security|permission denied/i.test(message)) return 'この操作をする権限がありません。運営者にご連絡ください'
  if (/Password should be/i.test(message)) return 'パスワードは8文字以上にしてください'
  return message
}
