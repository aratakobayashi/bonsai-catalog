import { createClient } from '@supabase/supabase-js';

// Supabase設定
const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * データベースにseason（季節）とlocation（置き場所）カラムを追加
 */
async function addSeasonLocationColumns() {
  console.log('🔧 データベースマイグレーション: season・locationカラムを追加');
  console.log('='.repeat(60));
  
  try {
    // まず現在のテーブル構造を確認
    console.log('📋 現在のテーブル構造確認...');
    const { data: currentColumns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'products')
      .order('ordinal_position');

    if (columnError) {
      console.log('❌ カラム情報取得エラー:', columnError.message);
    } else {
      console.log('現在のカラム一覧:');
      currentColumns?.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL可' : 'NOT NULL'}`);
      });
    }

    // seasonカラムの存在確認
    const hasSeasonColumn = currentColumns?.some(col => col.column_name === 'season');
    const hasLocationColumn = currentColumns?.some(col => col.column_name === 'location');

    console.log(`\n🔍 season カラム: ${hasSeasonColumn ? '存在' : '未存在'}`);
    console.log(`🔍 location カラム: ${hasLocationColumn ? '存在' : '未存在'}`);

    // SQLクエリを実行（RPC経由）
    if (!hasSeasonColumn) {
      console.log('\n➕ season カラムを追加中...');
      const { error: seasonError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE products ADD COLUMN season VARCHAR(20) DEFAULT NULL;'
      });
      
      if (seasonError) {
        console.log('❌ season カラム追加エラー:', seasonError.message);
      } else {
        console.log('✅ season カラム追加完了');
      }
    }

    if (!hasLocationColumn) {
      console.log('\n➕ location カラムを追加中...');
      const { error: locationError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE products ADD COLUMN location VARCHAR(20) DEFAULT NULL;'
      });
      
      if (locationError) {
        console.log('❌ location カラム追加エラー:', locationError.message);
      } else {
        console.log('✅ location カラム追加完了');
      }
    }

    // インデックス作成
    console.log('\n🔍 インデックス作成中...');
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_products_season ON products(season);',
      'CREATE INDEX IF NOT EXISTS idx_products_location ON products(location);'
    ];

    for (const query of indexQueries) {
      const { error: indexError } = await supabase.rpc('exec_sql', { sql: query });
      if (indexError) {
        console.log('❌ インデックス作成エラー:', indexError.message, 'Query:', query);
      } else {
        console.log('✅ インデックス作成完了:', query);
      }
    }

    // 最終確認
    console.log('\n🎯 最終確認...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, season, location')
      .limit(3);

    if (productsError) {
      console.log('❌ 商品データ確認エラー:', productsError.message);
    } else {
      console.log('✅ 商品テーブル確認完了');
      console.log('サンプルデータ:');
      products?.forEach(p => {
        console.log(`  - ${p.name}: season=${p.season || 'NULL'}, location=${p.location || 'NULL'}`);
      });
    }

    console.log('\n🎉 データベースマイグレーション完了！');

  } catch (err) {
    console.error('❌ エラー:', err.message);
  }
}

// 実行
addSeasonLocationColumns().catch(console.error);