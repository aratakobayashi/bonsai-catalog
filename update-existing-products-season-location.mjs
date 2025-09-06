import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Supabase設定
const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 商品の説明・タグ・名前からseasonとlocationを自動判定
 */
function detectSeasonAndLocation(product) {
  const text = `${product.name} ${product.description || ''} ${(product.tags || []).join(' ')}`.toLowerCase();
  
  // 季節判定のキーワード
  const seasonKeywords = {
    'spring': ['春', '桜', 'さくら', '新緑', '芽吹', '花', '開花'],
    'summer': ['夏', '青葉', '緑', '涼', '避暑'],
    'autumn': ['秋', '紅葉', '黄葉', '実', 'もみじ', '楓'],
    'winter': ['冬', '常緑', '雪', '寒', '耐寒'],
    'all-season': ['四季', '通年', '年間', '一年中']
  };
  
  // 置き場所判定のキーワード
  const locationKeywords = {
    'indoor': ['室内', '屋内', 'インドア', '部屋', '内'],
    'outdoor': ['屋外', '庭', 'アウトドア', '日向', '日当たり', '外', '野外'],
    'semi-shade': ['半日陰', '日陰', '明るい日陰', '半陰', '陰']
  };
  
  // 季節を判定
  let detectedSeason = null;
  let maxSeasonMatches = 0;
  
  for (const [season, keywords] of Object.entries(seasonKeywords)) {
    const matches = keywords.filter(keyword => text.includes(keyword)).length;
    if (matches > maxSeasonMatches) {
      maxSeasonMatches = matches;
      detectedSeason = season;
    }
  }
  
  // 置き場所を判定
  let detectedLocation = null;
  let maxLocationMatches = 0;
  
  for (const [location, keywords] of Object.entries(locationKeywords)) {
    const matches = keywords.filter(keyword => text.includes(keyword)).length;
    if (matches > maxLocationMatches) {
      maxLocationMatches = matches;
      detectedLocation = location;
    }
  }
  
  // デフォルト値を設定
  if (!detectedSeason) {
    // カテゴリ別のデフォルト季節
    if (product.category === '松類' || product.category === '常緑樹') {
      detectedSeason = 'all-season';
    } else if (product.category === '落葉樹') {
      detectedSeason = 'autumn';
    } else if (product.category === '花木') {
      detectedSeason = 'spring';
    } else {
      detectedSeason = 'all-season';
    }
  }
  
  if (!detectedLocation) {
    // 一般的に盆栽は屋外が基本
    detectedLocation = 'outdoor';
  }
  
  return {
    season: detectedSeason,
    location: detectedLocation,
    seasonConfidence: maxSeasonMatches,
    locationConfidence: maxLocationMatches
  };
}

/**
 * 既存商品データにseason・locationを更新
 */
async function updateExistingProductsSeasonLocation() {
  console.log('🔄 既存商品のseason・location一括更新');
  console.log('='.repeat(60));
  
  try {
    // まず新しいカラムが追加されているか確認
    console.log('🔍 season・locationカラム確認中...');
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('id, name, season, location')
      .limit(1);

    if (testError) {
      console.log('❌ カラム確認エラー:', testError.message);
      console.log('💡 Supabaseダッシュボードでカラムが正しく追加されているか確認してください');
      return;
    }

    console.log('✅ season・locationカラム確認完了');

    // 全商品を取得
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.log('❌ 商品データ取得エラー:', fetchError.message);
      return;
    }

    console.log(`📦 更新対象商品数: ${products?.length}件\n`);

    const updateResults = [];
    let successCount = 0;
    let errorCount = 0;
    
    if (products) {
      for (const product of products) {
        const result = detectSeasonAndLocation(product);
        
        console.log(`🔄 [${product.id.substring(0, 8)}] ${product.name}`);
        console.log(`   season: ${result.season} (信頼度: ${result.seasonConfidence})`);
        console.log(`   location: ${result.location} (信頼度: ${result.locationConfidence})`);
        
        // データベースを更新
        const { data: updateData, error: updateError } = await supabase
          .from('products')
          .update({
            season: result.season,
            location: result.location,
            updated_at: new Date().toISOString()
          })
          .eq('id', product.id)
          .select();

        if (updateError) {
          console.log(`   ❌ 更新エラー: ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ 更新完了`);
          successCount++;
        }

        updateResults.push({
          id: product.id,
          name: product.name,
          season: result.season,
          location: result.location,
          success: !updateError,
          error: updateError?.message
        });
        
        console.log('');
        
        // APIレート制限を考慮して少し待機
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 統計情報
      console.log('\n📊 【更新結果統計】');
      console.log('='.repeat(40));
      console.log(`✅ 成功: ${successCount}件`);
      console.log(`❌ エラー: ${errorCount}件`);
      console.log(`📈 成功率: ${((successCount / products.length) * 100).toFixed(1)}%`);

      // 更新後のデータ分布確認
      const { data: updatedProducts, error: checkError } = await supabase
        .from('products')
        .select('season, location');

      if (!checkError && updatedProducts) {
        const seasonStats = {};
        const locationStats = {};
        
        updatedProducts.forEach(p => {
          seasonStats[p.season] = (seasonStats[p.season] || 0) + 1;
          locationStats[p.location] = (locationStats[p.location] || 0) + 1;
        });
        
        console.log('\n🌸 更新後の季節分布:');
        Object.entries(seasonStats).forEach(([season, count]) => {
          const percentage = ((count / updatedProducts.length) * 100).toFixed(1);
          console.log(`   ${season}: ${count}件 (${percentage}%)`);
        });
        
        console.log('\n🏠 更新後の置き場所分布:');
        Object.entries(locationStats).forEach(([location, count]) => {
          const percentage = ((count / updatedProducts.length) * 100).toFixed(1);
          console.log(`   ${location}: ${count}件 (${percentage}%)`);
        });
      }

      // 結果をJSONファイルに保存
      console.log('\n💾 更新結果をファイルに保存...');
      fs.writeFileSync(
        'season-location-update-results.json', 
        JSON.stringify(updateResults, null, 2)
      );
      console.log('✅ 保存完了: season-location-update-results.json');
    }

    console.log('\n🎉 既存商品データの更新が完了しました！');
    console.log('🌐 フロントエンドで新しいフィルター機能をテストしてください！');

  } catch (err) {
    console.error('❌ エラー:', err.message);
  }
}

// 実行
updateExistingProductsSeasonLocation().catch(console.error);