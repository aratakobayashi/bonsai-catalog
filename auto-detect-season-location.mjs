import { createClient } from '@supabase/supabase-js';

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
 * 全商品のseason・location自動判定
 */
async function analyzeAllProductsSeasonLocation() {
  console.log('🤖 全商品のseason・location自動判定分析');
  console.log('='.repeat(60));
  
  try {
    // 全商品を取得
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.log('❌ 商品データ取得エラー:', fetchError.message);
      return;
    }

    console.log(`📦 分析対象商品数: ${products?.length}件\n`);

    const analysisResults = [];
    
    if (products) {
      for (const product of products) {
        const result = detectSeasonAndLocation(product);
        
        analysisResults.push({
          id: product.id,
          name: product.name,
          category: product.category,
          tags: product.tags,
          ...result
        });
        
        console.log(`🌸 ${product.name}`);
        console.log(`   季節: ${result.season} (信頼度: ${result.seasonConfidence})`);
        console.log(`   置き場所: ${result.location} (信頼度: ${result.locationConfidence})`);
        console.log(`   カテゴリ: ${product.category}`);
        console.log(`   タグ: ${product.tags?.join(', ') || 'なし'}`);
        console.log('');
      }

      // 統計情報
      console.log('\n📊 【分析結果統計】');
      console.log('='.repeat(40));
      
      const seasonStats = {};
      const locationStats = {};
      
      analysisResults.forEach(result => {
        seasonStats[result.season] = (seasonStats[result.season] || 0) + 1;
        locationStats[result.location] = (locationStats[result.location] || 0) + 1;
      });
      
      console.log('🌸 季節分布:');
      Object.entries(seasonStats).forEach(([season, count]) => {
        const percentage = ((count / products.length) * 100).toFixed(1);
        console.log(`   ${season}: ${count}件 (${percentage}%)`);
      });
      
      console.log('\n🏠 置き場所分布:');
      Object.entries(locationStats).forEach(([location, count]) => {
        const percentage = ((count / products.length) * 100).toFixed(1);
        console.log(`   ${location}: ${count}件 (${percentage}%)`);
      });

      // 結果をJSONファイルに保存
      console.log('\n💾 分析結果をファイルに保存...');
      const fs = await import('fs');
      fs.writeFileSync(
        'season-location-analysis.json', 
        JSON.stringify(analysisResults, null, 2)
      );
      console.log('✅ 保存完了: season-location-analysis.json');
    }

    console.log('\n🎯 【次のステップ】');
    console.log('1. Supabaseダッシュボードでseason・locationカラムを追加');
    console.log('2. この分析結果を使って既存商品データを更新');
    console.log('3. 新商品登録時の自動判定機能を実装');

  } catch (err) {
    console.error('❌ エラー:', err.message);
  }
}

// 実行
analyzeAllProductsSeasonLocation().catch(console.error);