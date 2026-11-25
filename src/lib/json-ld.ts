// 検索エンジン向けのデータ（JSON-LD）を <script> の中に安全に入れる。
// JSON.stringify だけでは「</script>」などがそのまま入り、文中に仕込まれた文字でスクリプトが動いてしまうため、
// < > & と、JavaScript で改行として扱われる文字を \uXXXX に置き換える（JSON としての意味は変わらない）
export function jsonLd(value: unknown, _replacer?: null, space?: number): string {
  return JSON.stringify(value, null, space)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}
