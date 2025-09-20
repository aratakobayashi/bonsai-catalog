# アイキャッチ画像更新ワークフロー

## 実行した対応手順

### 1. 現在のデータベース状況確認
```bash
# 記事のfeatured_image_url状況をチェック
node -e "require('dotenv').config({path: '.env.local'}); const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); async function check() { const { data, error } = await supabase.from('articles').select('slug, title, featured_image_url').in('slug', ['記事slug1', '記事slug2', '記事slug3']); console.log(JSON.stringify(data, null, 2)); } check();"
```

### 2. 既存画像ファイルの確認
```bash
# public/images/articles/配下の画像ファイル確認
ls public/images/articles/ | grep "記事slug-img-1.png"
```

### 3. データベースのfeatured_image_url更新
```bash
# Supabaseデータベースを更新
node -e "
require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function updateFeaturedImages() {
  const updates = [
    {
      slug: '記事slug',
      featured_image_url: '/images/articles/記事slug-img-1.png'
    }
  ];

  for (const update of updates) {
    const { data, error } = await supabase
      .from('articles')
      .update({ featured_image_url: update.featured_image_url })
      .eq('slug', update.slug)
      .select('slug, title, featured_image_url');

    if (error) {
      console.log('❌ ' + update.slug + ': エラー - ' + error.message);
    } else if (data && data.length > 0) {
      console.log('✅ ' + update.slug + ': 更新完了');
      console.log('   ' + update.featured_image_url);
    }
  }
}

updateFeaturedImages().catch(console.error);
"
```

### 4. Gitコミット & デプロイ
```bash
# 画像ファイルをGitに追加
git add public/images/articles/記事slug-img-1.png

# コミット
git commit -m "Update featured images for [記事名]

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# プッシュしてVercelデプロイをトリガー
git push
```

## 今回対応した3記事

### 成功事例
- **persimmon-bonsai-complete-guide** → `/images/articles/persimmon-bonsai-complete-guide-img-1.png`
- **japanese-pepper-bonsai-guide** → `/images/articles/japanese-pepper-bonsai-guide-img-1.png`
- **mulberry-bonsai-complete-guide** → `/images/articles/mulberry-bonsai-complete-guide-img-1.png`

## 重要な発見

### 画像ファイル命名規則
- ファイル名: `{記事slug}-img-1.png`
- 配置場所: `public/images/articles/`
- データベース保存パス: `/images/articles/{記事slug}-img-1.png`

### なぜデプロイが必要だったか
1. **データベース更新**: 即座に反映（Supabase）
2. **画像ファイル**: Vercelデプロイが必要（静的ファイル）

データベースのfeatured_image_urlは更新されても、実際の画像ファイルがVercelにデプロイされるまでは404エラーで表示されない。

## 今後のアイキャッチ更新手順

### ユーザーから「記事URLのアイキャッチ更新して」と依頼された場合

1. **記事slug抽出**: URLから記事slugを特定
2. **画像ファイル確認**: `public/images/articles/{slug}-img-1.png`の存在確認
3. **データベース更新**: featured_image_urlを適切なパスに設定
4. **Git操作**: 画像ファイルをadd → commit → push
5. **確認**: デプロイ完了後（数分後）にサイトで確認

### 必須チェックポイント
- [ ] 画像ファイルが`public/images/articles/`に存在
- [ ] ファイル名が`{slug}-img-1.png`形式
- [ ] データベースのfeatured_image_urlが正しいパス
- [ ] Gitにコミット・プッシュ済み
- [ ] Vercelデプロイ完了待ち

## トラブルシューティング

### 画像が表示されない場合
1. データベースのfeatured_image_urlを確認
2. ファイルパスの正確性を確認
3. Vercelデプロイ状況を確認
4. ブラウザキャッシュクリア

### よくあるミス
- ファイル名の命名規則違反
- デプロイ忘れ
- パスの記述ミス（先頭の`/`忘れなど）