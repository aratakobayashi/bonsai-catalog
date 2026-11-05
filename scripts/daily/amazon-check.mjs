// Amazon の Creators API が使えるかを確かめる（GitHub Actions の amazon-check から手動で実行する）
// 認証情報は GitHub の Secrets から環境変数で受け取り、ログには出さない。結果は「使える／使えない」と件数・商品名だけを出す
const id = process.env.AMAZON_CREATORS_CREDENTIAL_ID
const secret = process.env.AMAZON_CREATORS_CREDENTIAL_SECRET
const version = (process.env.AMAZON_CREATORS_CREDENTIAL_VERSION || '').trim()
const PARTNER_TAG = 'bonsaicollect-22'
const MARKETPLACE = 'www.amazon.co.jp'

if (!id || !secret || !version) {
  console.log('::error::AMAZON_CREATORS_CREDENTIAL_ID / _SECRET / _VERSION のどれかが未登録です')
  process.exit(1)
}

// 認証情報の Version ごとのトークンの発行先（公式ドキュメントの表。日本は 3.3＝api.amazon.co.jp）
const TOKEN_HOSTS = { '3.1': 'api.amazon.com', '3.2': 'api.amazon.co.uk', '3.3': 'api.amazon.co.jp' }
const hosts = [TOKEN_HOSTS[version], 'api.amazon.co.jp', 'api.amazon.com'].filter((h, i, a) => h && a.indexOf(h) === i)

// エラーの本文から、キーやトークンらしき長い文字列を伏せて短く出す
const safe = text => String(text).replace(/[A-Za-z0-9._~+/=-]{24,}/g, '***').slice(0, 400)

async function getToken() {
  for (const host of hosts) {
    const res = await fetch(`https://${host}/auth/o2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant_type: 'client_credentials', client_id: id, client_secret: secret, scope: 'creatorsapi::default' }),
    })
    const body = await res.text()
    if (res.ok) {
      console.log(`トークンを取得しました（${host}）`)
      return JSON.parse(body).access_token
    }
    console.log(`トークンを取得できませんでした（${host}・${res.status}）：${safe(body)}`)
  }
  return null
}

const token = await getToken()
if (!token) {
  console.log('::error::トークンを取得できませんでした。認証情報の値（ID・Secret・Version）を確かめてください')
  process.exit(1)
}

const res = await fetch('https://creatorsapi.amazon/catalog/v1/searchItems', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'x-marketplace': MARKETPLACE },
  body: JSON.stringify({
    keywords: '盆栽',
    marketplace: MARKETPLACE,
    partnerTag: PARTNER_TAG,
    itemCount: 5,
    languagesOfPreference: ['ja_JP'],
    resources: ['itemInfo.title', 'images.primary.medium', 'offersV2.listings.price'],
  }),
})
const body = await res.text()
if (!res.ok) {
  console.log(`::error::商品の検索に失敗しました（${res.status}）：${safe(body)}`)
  console.log('「対象外（not eligible）」のエラーなら、過去30日の売上が10件に届いていないか、資格の確認中（最大48時間）です')
  process.exit(1)
}
const data = JSON.parse(body)
const items = data.searchResult?.items ?? []
console.log(`使えます。「盆栽」の検索結果：全${data.searchResult?.totalResultCount ?? '?'}件（先頭${items.length}件を表示）`)
for (const item of items) {
  const price = item.offersV2?.listings?.[0]?.price?.money?.displayAmount ?? '価格なし'
  console.log(`- ${item.itemInfo?.title?.displayValue ?? item.asin}（${price}・画像${item.images?.primary?.medium?.url ? 'あり' : 'なし'}）`)
}
