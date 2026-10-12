// ページ冒頭の墨色の帯に敷く写真（無料で使える実物の盆栽写真）と、その出典の表示
import photoCredits from '@/data/photo-credits.json'

export interface HeroPhoto {
  src: string
  alt: string
  credit?: string
}

type Credit = { creator?: string; license?: string }
const CREDITS = photoCredits as Record<string, Credit>

export function heroPhoto(src: string, alt = ''): HeroPhoto {
  const c = CREDITS[src]
  return { src, alt, credit: c?.creator ? `${c.creator}${c.license ? ` / ${c.license}` : ''}` : undefined }
}

// 季節ごとの写真（冬：枝ぶり、春：花、夏：深い緑、秋：紅葉）。今月の手入れの帯などで使う
const SEASON_SRC: Record<number, string> = {
  12: '/images/articles/photos/article-7-2.jpg', 1: '/images/articles/photos/article-7-2.jpg', 2: '/images/articles/photos/article-7-2.jpg',
  3: '/images/articles/photos/article-46-1.jpg', 4: '/images/articles/photos/article-46-1.jpg', 5: '/images/articles/photos/article-46-1.jpg',
  6: '/images/articles/photos/bonsai-diplomacy-gift-etiquette-2.jpg', 7: '/images/articles/photos/bonsai-diplomacy-gift-etiquette-2.jpg', 8: '/images/articles/photos/bonsai-diplomacy-gift-etiquette-2.jpg',
  9: '/images/articles/photos/bonsai-exhibition-viewing-guide-1.jpg', 10: '/images/articles/photos/bonsai-exhibition-viewing-guide-1.jpg', 11: '/images/articles/photos/bonsai-exhibition-viewing-guide-1.jpg',
}
export function seasonPhotoSrc(month: number): string {
  return SEASON_SRC[month] ?? SEASON_SRC[10]
}
