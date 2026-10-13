import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/auth'
import { syncRakutenProducts } from '@/lib/rakuten-sync'
import { PRODUCTS_CACHE_TAG } from '@/lib/catalog'

// 楽天APIを1秒間隔で呼ぶため、Vercel の上限（Hobby は60秒）まで実行時間を延ばす。処理自体は40秒で区切る
export const maxDuration = 60
export const dynamic = 'force-dynamic'

// Vercel Cron（vercel.json）が CRON_SECRET 付きで呼ぶ。管理画面からはログイン中のみ実行できる
async function isAuthorized(request: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get('authorization') === `Bearer ${secret}`) return true
  return verifySessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)
}

export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const summary = await syncRakutenProducts()
  if (summary.upserted > 0) {
    revalidateTag(PRODUCTS_CACHE_TAG)
    revalidatePath('/products')
    revalidatePath('/')
  }
  return NextResponse.json(summary, { status: summary.upserted > 0 || summary.ok ? 200 : 500 })
}
