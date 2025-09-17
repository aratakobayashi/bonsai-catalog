# 盆栽カタログ パフォーマンス分析レポート

## 📊 ビルド分析結果

### バンドルサイズ
- **First Load JS (共通)**: 80.5 kB ✅ 良好
- **最大ページサイズ**: /products - 154 kB ⚠️ やや大きい
- **最小ページサイズ**: / - 87.5 kB ✅ 良好

### 主要ページのサイズ内訳
| ページ | サイズ | First Load JS | 評価 |
|--------|--------|---------------|------|
| / (ホーム) | 181 B | 87.5 kB | ✅ |
| /products | 12.3 kB | 154 kB | ⚠️ |
| /gardens | 6.24 kB | 142 kB | ⚠️ |
| /guides/[slug] | 12.2 kB | 113 kB | ⚠️ |
| /products/[id] | 3.81 kB | 104 kB | ✅ |

## 🚨 特定した問題点

### 1. 画像最適化の課題
- **問題**: Next.js Imageコンポーネントを使用しているが、設定に改善余地あり
- **影響**:
  - minimumCacheTTL: 0 によりキャッシュが無効化されている
  - 画像の遅延読み込みが一部で不適切
  - priority属性の使用が限定的

### 2. バンドルサイズの問題
- **大きなページ**:
  - /products (154 kB) - 商品一覧の全データ読み込み
  - /gardens (142 kB) - 盆栽園一覧の全データ読み込み
- **原因**: クライアントサイドでの過剰なデータ取得

### 3. メタデータ設定の警告
- **問題**: metadata.metadataBaseが未設定
- **影響**: OGP画像やTwitterカードが正しく表示されない可能性

### 4. Node.js バージョンの警告
- **問題**: Node.js 18以下は非推奨
- **推奨**: Node.js 20以降へのアップグレード

### 5. Critical Dependency警告
- **問題**: @supabase/realtime-jsの動的インポート
- **影響**: ビルド時の警告とパフォーマンスへの潜在的影響

## 🎯 Core Web Vitals改善提案

### 優先度: 高 🔴

#### 1. 画像最適化の改善
```javascript
// next.config.js の修正
images: {
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30日間のキャッシュ
  formats: ['image/avif', 'image/webp'], // AVIF優先
}
```

#### 2. 動的インポートとコード分割
```typescript
// 大きなコンポーネントの遅延読み込み
const ProductCard = dynamic(() => import('@/components/features/ProductCard'), {
  loading: () => <ProductCardSkeleton />,
  ssr: true
})
```

#### 3. データ取得の最適化
```typescript
// ページネーション実装
const ITEMS_PER_PAGE = 12
// 初期表示は12個に制限し、スクロールで追加読み込み
```

### 優先度: 中 🟡

#### 4. メタデータベースの設定
```typescript
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://bonsai-catalog.com'),
  // ...
}
```

#### 5. フォント最適化
```typescript
// next/font/localを使用した日本語フォントの最適化
import { Noto_Sans_JP } from 'next/font/google'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})
```

### 優先度: 低 🟢

#### 6. リソースヒントの追加
```html
<!-- DNS Prefetch -->
<link rel="dns-prefetch" href="https://m.media-amazon.com" />
<link rel="preconnect" href="https://res.cloudinary.com" />
```

## 📈 期待される改善効果

### パフォーマンススコア改善
- **現在推定**: 70-80点
- **改善後目標**: 90-95点

### Core Web Vitals目標
| 指標 | 現在（推定） | 目標 |
|------|------------|------|
| LCP | 2.5-3.5秒 | < 2.5秒 |
| FID | < 100ms | < 100ms |
| CLS | 0.1-0.25 | < 0.1 |
| FCP | 1.5-2.5秒 | < 1.8秒 |

### バンドルサイズ削減目標
- /products: 154 kB → 100 kB以下（-35%）
- /gardens: 142 kB → 100 kB以下（-30%）

## 🛠 実装優先順位

1. **即座に実装すべき項目**
   - minimumCacheTTLの修正
   - metadataBaseの設定
   - 画像のpriority属性の適切な設定

2. **今週中に実装すべき項目**
   - ページネーションの実装
   - 動的インポートの活用
   - フォント最適化

3. **今月中に実装すべき項目**
   - Infinite Scrollの実装
   - Service Workerによるキャッシュ戦略
   - リソースヒントの追加

## 📊 計測方法

### Lighthouse CI設定
```bash
# 継続的なパフォーマンス監視
npm install -g @lhci/cli
lhci autorun
```

### Real User Monitoring (RUM)
- Vercel Analytics導入検討
- Google Analytics 4のCore Web Vitals計測

## まとめ

現在のサイトは基本的なパフォーマンスは良好ですが、以下の点で改善の余地があります：

1. **画像キャッシュの有効化**で大幅な改善が見込める
2. **データ取得の最適化**でInitial Load時間を短縮
3. **コード分割**でバンドルサイズを削減

これらの改善により、ユーザー体験の向上とSEOランキングの改善が期待できます。