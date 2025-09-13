// 過去のスクリプトや履歴から正しい画像URLを探す
import { readFileSync, readdirSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findBackupData() {
  try {
    console.log('🔍 バックアップデータ検索中...\\n');
    
    // 1. プロジェクト内のJSファイルから画像URLを検索
    console.log('📁 プロジェクトファイル内検索:');
    console.log('===========================');
    
    const files = readdirSync('.').filter(file => file.endsWith('.mjs') || file.endsWith('.js'));
    const foundUrls = {};
    
    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf8');
        
        // Amazon画像URLのパターンを検索
        const amazonUrlMatches = content.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9+\-._]+/g);
        
        if (amazonUrlMatches && amazonUrlMatches.length > 0) {
          console.log(`\\n📄 ${file}:`);
          amazonUrlMatches.forEach((url, index) => {
            console.log(`   ${index + 1}. ${url}`);
            
            // 商品名も一緒に抽出できるか試す
            const lines = content.split('\\n');
            const urlLine = lines.find(line => line.includes(url));
            if (urlLine) {
              const nameMatch = lines[lines.indexOf(urlLine) - 1]?.match(/'([^']+)'/);
              if (nameMatch) {
                foundUrls[nameMatch[1]] = url;
              }
            }
          });
        }
      } catch (error) {
        console.log(`   ⚠️  ${file}: 読み込みエラー`);
      }
    }
    
    // 2. 最初の5商品のスクリプトをチェック
    console.log('\\n\\n🎯 最初の5商品データ確認:');
    console.log('========================');
    
    try {
      const add5Content = readFileSync('add-5-new-products.mjs', 'utf8');
      console.log('✅ add-5-new-products.mjs が見つかりました');
      
      // 商品データを抽出
      const productMatches = add5Content.match(/name: '[^']+',\\s*price: \\d+,\\s*[\\s\\S]*?image_url: '[^']+'/g);
      if (productMatches) {
        console.log(`📦 ${productMatches.length}商品のデータが見つかりました`);
        productMatches.forEach((match, index) => {
          const nameMatch = match.match(/name: '([^']+)'/);
          const imageMatch = match.match(/image_url: '([^']+)'/);
          if (nameMatch && imageMatch) {
            console.log(`${index + 1}. ${nameMatch[1]}`);
            console.log(`   画像: ${imageMatch[1]}`);
            foundUrls[nameMatch[1]] = imageMatch[1];
          }
        });
      }
    } catch (error) {
      console.log('❌ add-5-new-products.mjs が見つかりません');
    }
    
    // 3. 検証スクリプトをチェック
    try {
      const verifyContent = readFileSync('verify-products.mjs', 'utf8');
      console.log('\\n✅ verify-products.mjs が見つかりました');
      
      // 商品名リストを抽出
      const nameListMatch = verifyContent.match(/const newProductNames = \\[(.*?)\\]/s);
      if (nameListMatch) {
        console.log('📋 検証対象商品リストが見つかりました');
      }
    } catch (error) {
      console.log('❌ verify-products.mjs が見つかりません');
    }
    
    console.log('\\n\\n📊 発見された画像URLマッピング:');
    console.log('================================');
    Object.keys(foundUrls).forEach(name => {
      console.log(`✅ ${name}`);
      console.log(`   → ${foundUrls[name]}`);
      console.log('');
    });
    
    console.log(`\\n🎯 合計 ${Object.keys(foundUrls).length} 商品の画像URLが発見されました`);
    
    if (Object.keys(foundUrls).length > 0) {
      console.log('\\n💡 次のステップ:');
      console.log('これらの画像URLを使用してデータベースを復元できます');
    } else {
      console.log('\\n⚠️  バックアップデータが見つかりませんでした');
      console.log('手動で画像URLを再収集する必要があります');
    }

  } catch (error) {
    console.error('❌ システムエラー:', error.message);
  }
}

console.log('🗄️  バックアップデータ検索');
console.log('=======================');
findBackupData();