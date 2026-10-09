// トップのヒーローに使う実物の写真（月 1〜12 → 商品 id）。
// 文字や広告表記のない、盆栽がはっきり見える写真（src/data/product-images.json で選び直したもの）を目で確かめてから登録する。
// 登録のない月・商品が見つからない月・画像のない商品は、public/images/selections の SVG イラストを使う
export const HERO_PHOTOS: Partial<Record<number, string>> = {
  2: '1b65c802-f210-4bc4-ac17-ebdeca72545b', // 長寿梅（花）
  3: 'c26c5946-436f-454c-806b-3585fd097e02', // 桜
  4: 'dc467d09-a920-4ce7-afa5-49fa1581f8fd', // 桜（八重）
  5: '083d1583-c2f4-41ca-9f67-b9e9f37bf5b9', // さつき（花）
  6: '7442a826-ef6d-462e-b4d5-5dd9dd3dcb9c', // さつき
  7: '345a4eaf-c09b-41ed-a09f-a087d9eb2100', // 苔玉（手のひら）
  8: '833d2b11-3e4d-49b7-b929-99fa7b158f98', // 苔玉（もみじ）
  9: 'a1245ca6-b317-40e8-b8c2-bcac37ad49e3', // 姫りんご（実）
  10: 'd9a5096c-c012-47ac-90d3-1b5d8722da68', // 出猩々もみじ（手のひらにのせた写真）
  11: 'd9a5096c-c012-47ac-90d3-1b5d8722da68',
  12: '841fddc5-70e7-4f91-87f7-e598ec027d02', // 南天（紅葉）
  1: 'ba3705ce-e2e2-461c-a71b-8ba31cc0ab13', // 五葉松
}
