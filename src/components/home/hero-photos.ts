// トップのヒーローに使う実物の写真（月 1〜12 → 商品 id）。
// 文字や広告表記のない、盆栽がはっきり見える写真（src/data/product-images.json で選び直したもの）を目で確かめてから登録する。
// 登録のない月・商品が見つからない月・画像のない商品は、public/images/selections の SVG イラストを使う
export const HERO_PHOTOS: Partial<Record<number, string>> = {
  10: 'd9a5096c-c012-47ac-90d3-1b5d8722da68', // 出猩々もみじ（手のひらにのせた写真）
  11: 'd9a5096c-c012-47ac-90d3-1b5d8722da68',
  12: '841fddc5-70e7-4f91-87f7-e598ec027d02', // 南天（紅葉）
  1: 'ba3705ce-e2e2-461c-a71b-8ba31cc0ab13', // 五葉松
}
