// リポジトリに置いた書き直し版の記事（src/content/articles/<slug>.md）で、DB の記事を上書きする
// 書式は先頭の簡単な YAML（文字列の項目と summary: のリスト）＋本文の Markdown。
// ファイルがない記事は DB の記事のまま表示する。サーバー側（ビルド時・ISR の再生成時）だけで読む
import fs from 'fs'
import path from 'path'
import type { Article } from '@/types'
import photoCredits from '@/data/photo-credits.json'

// 作ってあるサムネイル（public/images/articles/thumbs/<slug>.jpg）のパス。なければ undefined
function thumbnailPath(slug: string): string | undefined {
  const file = path.join(process.cwd(), 'public/images/articles/thumbs', `${slug}.jpg`)
  try {
    return fs.existsSync(file) ? `/images/articles/thumbs/${slug}.jpg` : undefined
  } catch {
    return undefined
  }
}

export interface ArticleOverride {
  title?: string
  description?: string
  updatedAt?: string
  summary?: string[]
  species?: string
  selection?: string
  image?: string
  // サムネイルの元の写真（public 以下のパス）。サムネイルは public/images/articles/thumbs/<slug>.jpg（scripts/thumbs/render.mjs で作る）
  photo?: string
  content?: string
}

// 写真の出典（src/data/photo-credits.json。CC BY などは撮影者名とライセンスを表示する）
export interface PhotoCredit {
  title?: string
  creator?: string
  license?: string
  source?: string
}

// ページ側で使う、上書き後の記事（「この記事で分かること」・樹種・特集の指定つき）
export type ResolvedArticle = Article & {
  summary: string[]
  speciesSlug?: string
  selectionSlug?: string
  // 記事の上の画像（サムネイル）に使った写真の出典
  photoCredit?: PhotoCredit
  // 記事ページの上に出す写真（文字なし）。一覧と SNS ではタイトル入りのサムネイル（featuredImage）を使う
  heroPhoto?: string
  overridden: boolean
}

const SLUG_RE = /^[a-z0-9][a-z0-9_-]*$/i

const cache = new Map<string, ArticleOverride | null>()
const useCache = process.env.NODE_ENV === 'production'

function unquote(value: string): string {
  const v = value.trim()
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.length >= 2 ? v.slice(1, -1).replace(/\\"/g, '"') : v
  }
  return v
}

// 行末のコメント（空白のあとの #）を除く。引用符で囲んだ値はそのまま
function stripComment(value: string): string {
  const v = value.trim()
  if (v.startsWith('"') || v.startsWith("'")) {
    const quote = v[0]
    const end = v.indexOf(quote, 1)
    return end > 0 ? v.slice(0, end + 1) : v
  }
  if (v.startsWith('#')) return ''
  return v.replace(/\s+#.*$/, '').trim()
}

// 先頭の「---」で囲んだ部分を読む（key: value と、key: の下の「- 項目」のリストだけ）
export function parseFrontMatter(source: string): { data: Record<string, string | string[]>; body: string } {
  const text = source.replace(/^﻿/, '')
  const match = text.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/)
  if (!match) return { data: {}, body: text }
  const data: Record<string, string | string[]> = {}
  let listKey: string | null = null
  for (const rawLine of match[1].split(/\r?\n/)) {
    if (!rawLine.trim() || /^\s*#/.test(rawLine)) continue
    const item = rawLine.match(/^\s+-\s+(.*)$|^-\s+(.*)$/)
    if (item && listKey) {
      const value = unquote(stripComment(item[1] ?? item[2] ?? ''))
      if (value) (data[listKey] as string[]).push(value)
      continue
    }
    const pair = rawLine.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/)
    if (!pair) continue
    const key = pair[1]
    const value = stripComment(pair[2])
    if (value === '' || value === '|' || value === '>') {
      data[key] = []
      listKey = key
    } else {
      data[key] = unquote(value)
      listKey = null
    }
  }
  return { data, body: text.slice(match[0].length) }
}

const str = (value: string | string[] | undefined): string | undefined => {
  if (typeof value !== 'string') return undefined
  const v = value.trim()
  return v ? v : undefined
}

// 日付だけ（2026-10-10）のときは日本時間の正午にする（サーバーが UTC でも日付がずれないように）
function normalizeDate(value?: string): string | undefined {
  if (!value) return undefined
  const v = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00+09:00` : value
  return Number.isNaN(new Date(v).getTime()) ? undefined : v
}

function readOverrideFile(slug: string): ArticleOverride | null {
  let source: string
  try {
    // path.join(process.cwd(), 'src/content/articles', …) をこの形のまま書くと、ビルド時のファイル追跡で
    // このフォルダの .md が Vercel のサーバー関数に含まれる（変数に分けると追跡されないことがある）
    source = fs.readFileSync(path.join(process.cwd(), 'src/content/articles', `${slug}.md`), 'utf8')
  } catch {
    return null
  }
  const { data, body } = parseFrontMatter(source)
  const summary = Array.isArray(data.summary) ? data.summary.filter(Boolean) : undefined
  const content = body.trim()
  return {
    title: str(data.title),
    description: str(data.description),
    updatedAt: normalizeDate(str(data.updatedAt)),
    summary: summary && summary.length > 0 ? summary : undefined,
    species: str(data.species),
    selection: str(data.selection),
    image: str(data.image),
    photo: str(data.photo),
    content: content || undefined,
  }
}

export function getArticleOverride(slug: string): ArticleOverride | null {
  if (!slug || !SLUG_RE.test(slug)) return null
  if (useCache && cache.has(slug)) return cache.get(slug) ?? null
  const override = readOverrideFile(slug)
  if (useCache) cache.set(slug, override)
  return override
}

// 本文の文字数から読む時間（分）の目安を出す（日本語でおよそ 1 分 500 字）
export function estimateReadingTime(markdown: string): number {
  const plain = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|\-\s]/g, '')
  return Math.max(1, Math.round(plain.length / 500))
}

// DB の記事に上書きを重ねる（ファイルがなければそのまま）
export function applyArticleOverride<T extends Article>(article: T): T & ResolvedArticle {
  const override = getArticleOverride(article.slug)
  if (!override) return { ...article, summary: [], overridden: false }

  const title = override.title ?? article.title
  const updatedAt = override.updatedAt ?? article.updatedAt
  return {
    ...article,
    title,
    seoTitle: override.title ?? article.seoTitle,
    excerpt: override.description ?? article.excerpt,
    seoDescription: override.description ?? article.seoDescription,
    // 公開日より前の更新日にはしない
    updatedAt: new Date(updatedAt).getTime() >= new Date(article.publishedAt).getTime() ? updatedAt : article.updatedAt,
    featuredImage: (() => {
      const url = thumbnailPath(article.slug) ?? override.image
      return url ? { url, alt: title, width: 1200, height: 630 } : article.featuredImage
    })(),
    heroPhoto: override.photo,
    photoCredit: override.photo ? (photoCredits as Record<string, PhotoCredit>)[override.photo] : undefined,
    content: override.content ?? article.content,
    readingTime: override.content ? estimateReadingTime(override.content) : article.readingTime,
    summary: override.summary ?? [],
    speciesSlug: override.species,
    selectionSlug: override.selection,
    overridden: true,
  }
}

// next.config.js の images.remotePatterns に入っているホスト（それ以外の外部画像は最適化せずにそのまま表示する）
const OPTIMIZABLE_IMAGE_HOSTS = [
  /^m\.media-amazon\.com$/,
  /^images-na\.ssl-images-amazon\.com$/,
  /\.amazonaws\.com$/,
  /^via\.placeholder\.com$/,
  /^images\.unsplash\.com$/,
  /^res\.cloudinary\.com$/,
]

export function canOptimizeImage(src: string): boolean {
  // SVG は画像の最適化の対象外（そのまま表示する）
  if (/\.svg(\?|$)/i.test(src)) return false
  if (src.startsWith('/')) return true
  try {
    const url = new URL(src)
    if (url.protocol !== 'https:') return false
    if (url.hostname === 'bonsai-guidebook.net') return url.pathname.startsWith('/wp-content/uploads/')
    return OPTIMIZABLE_IMAGE_HOSTS.some(pattern => pattern.test(url.hostname))
  } catch {
    return false
  }
}
