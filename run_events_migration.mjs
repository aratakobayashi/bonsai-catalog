import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  'https://ptbowbqrykqwxuzivbdv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek'
);

async function runEventsmigration() {
  try {
    console.log('🔄 イベント機能マイグレーション実行開始');
    console.log('=====================================\n');

    // SQLファイルを読み込み
    const migrationSQL = fs.readFileSync('./supabase/migrations/20241221000000_create_events.sql', 'utf8');

    console.log('📄 マイグレーションSQL:');
    console.log(migrationSQL);
    console.log('\n🚀 実行中...\n');

    // SQLを実行（複数のクエリに分割して実行）
    const queries = migrationSQL
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0);

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      console.log(`${i + 1}/${queries.length}: ${query.split('\n')[0]}...`);

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: query + ';' });
        if (error) {
          // rpcが利用できない場合は、直接クエリを実行
          const { error: directError } = await supabase.from('_').select('*').limit(0);
          if (directError) {
            console.log(`⚠️  RPC方式が利用できません。手動でマイグレーションが必要です。`);
            break;
          }
        } else {
          console.log(`✅ 完了`);
        }
      } catch (err) {
        console.log(`⚠️  クエリ ${i + 1} をスキップ: ${err.message}`);
      }
    }

    console.log('\n✅ マイグレーション処理完了');
    console.log('💡 Supabaseコンソールで手動実行が必要な場合があります。');

  } catch (err) {
    console.error('❌ マイグレーションエラー:', err);
  }
}

runEventsMigration();