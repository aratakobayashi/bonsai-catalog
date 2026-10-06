// 管理画面のセッション管理
// Edge（middleware）と Node（Route Handler）の両方で動くよう Web Crypto を使う

export const ADMIN_SESSION_COOKIE = 'admin-session'
export const ADMIN_SESSION_MAX_AGE = 24 * 60 * 60 // 秒

const encoder = new TextEncoder()

// 署名用の秘密鍵。ADMIN_SESSION_SECRET が無ければ ADMIN_PASSWORD を流用する。
// どちらも未設定なら管理機能は無効（常に未認証）
function getSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || null
}

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = ''
  new Uint8Array(bytes).forEach(b => { binary += String.fromCharCode(b) })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  return toBase64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(value)))
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD)
}

export function verifyAdminPassword(password: unknown): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword || typeof password !== 'string') return false
  return safeEqual(password, adminPassword)
}

// トークン形式: "<有効期限(ms)>.<HMAC署名>"
export async function createSessionToken(): Promise<string> {
  const secret = getSecret()
  if (!secret) throw new Error('ADMIN_PASSWORD is not configured')
  const expiresAt = String(Date.now() + ADMIN_SESSION_MAX_AGE * 1000)
  return `${expiresAt}.${await sign(expiresAt, secret)}`
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  const secret = getSecret()
  if (!secret || !token) return false

  const [expiresAt, signature] = token.split('.')
  if (!expiresAt || !signature || !/^\d+$/.test(expiresAt)) return false
  if (Number(expiresAt) < Date.now()) return false

  return safeEqual(signature, await sign(expiresAt, secret))
}
