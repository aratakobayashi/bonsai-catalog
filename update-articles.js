const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase設定
const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';
const supabase = createClient(supabaseUrl, supabaseKey);

// 更新する8記事（国際・海外）
const articlesToUpdate = [
  'bonsai-international-import-export-guide.md',
  'american-bonsai-west-coast-style.md',
  'european-bonsai-climate-adaptation.md',
  'chinese-penjing-vs-japanese-bonsai.md',
  'southeast-asia-tropical-bonsai.md',
  'bonsai-english-terminology-guide.md',
  'world-bonsai-contest-participation-guide.md',
  'bonsai-diplomacy-gift-etiquette.md'
];

function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    throw new Error('フロントマターが見つかりません');
  }

  const frontmatterLines = match[1].split('\n');
  const frontmatter = {};

  frontmatterLines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      frontmatter[key] = value;
    }
  });

  return {
    frontmatter,
    content: match[2]
  };
}

async function updateArticles() {
  try {
    console.log('🚀 8記事の更新を開始...');
    console.log('📊 ビジュアル要素の追加により内容を強化');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < articlesToUpdate.length; i++) {
      const fileName = articlesToUpdate[i];
      const filePath = path.join(__dirname, 'public/content/guides', fileName);

      try {
        if (!fs.existsSync(filePath)) {
          console.log(`❌ ファイルが見つかりません: ${fileName}`);
          errorCount++;
          continue;
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { frontmatter, content } = parseFrontmatter(fileContent);

        // slugで既存記事を検索
        const { data: existingArticle, error: selectError } = await supabase
          .from('articles')
          .select('id')
          .eq('slug', frontmatter.slug)
          .single();

        if (selectError || !existingArticle) {
          console.log(`⚠️ ${i+1}/8 記事が見つかりません: ${frontmatter.slug}`);
          errorCount++;
          continue;
        }

        // 記事を更新
        const updateData = {
          content: content.trim(),
          updated_at: new Date().toISOString()
        };

        const { data, error: updateError } = await supabase
          .from('articles')
          .update(updateData)
          .eq('id', existingArticle.id)
          .select();

        if (updateError) {
          console.log(`❌ ${i+1}/8 更新エラー: ${fileName} - ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`✅ ${i+1}/8 更新成功: ${frontmatter.title}`);
          successCount++;
        }

        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (err) {
        console.log(`❌ ${i+1}/8 処理エラー: ${fileName} - ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n🎉 処理完了!`);
    console.log(`✅ 成功: ${successCount}記事更新`);
    console.log(`❌ エラー: ${errorCount}記事`);
    console.log(`📊 合計: ${successCount + errorCount}/8記事処理`);

    if (successCount > 0) {
      console.log(`\n🌐 ビジュアル強化版が本番サイトで確認可能になりました！`);
      console.log(`📈 改善内容：表、チャート、フローチャート、アイコン追加`);
    }

  } catch (error) {
    console.error('❌ 処理中にエラー:', error.message);
  }
}

updateArticles();