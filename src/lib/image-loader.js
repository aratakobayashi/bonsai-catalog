// next/image の読み込み先（静的な書き出しでは画像の最適化サーバーがないため、ビルド時に作った小さい版を使う）
// public/images の jpg・png は、scripts/build/make-image-variants.mjs が 640px と 1280px の WebP（<名前>.w640.webp など）を作る
// それ以外（SVG・外部の画像）はそのまま表示する
const WIDTHS = [640, 1280]

export default function imageLoader({ src, width }) {
  if (!src.startsWith('/images/') || !/\.(jpe?g|png)$/i.test(src)) return src
  const w = WIDTHS.find(size => width <= size)
  return w ? src.replace(/\.(jpe?g|png)$/i, `.w${w}.webp`) : src
}
