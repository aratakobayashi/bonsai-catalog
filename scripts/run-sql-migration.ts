import { promises as fs } from 'fs'
import path from 'path'
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// 環境変数を読み込み
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function runSQLMigration() {
  console.log('🔧 SQLマイグレーション開始...')

  try {
    const sqlContent = await fs.readFile(
      path.join(process.cwd(), 'supabase/migrations/create_articles_tables.sql'),
      'utf8'
    )

    // SQLを実行可能な小さなチャンクに分割
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`実行中: ${statement.substring(0, 100)}...`)

        const { data, error } = await supabase.rpc('exec_sql', { sql: statement })

        if (error) {
          console.error('❌ SQL実行エラー:', error)
          console.error('❌ 実行したSQL:', statement)
        } else {
          console.log('✅ SQL実行成功')
        }
      }
    }

    console.log('✅ SQLマイグレーション完了')
  } catch (error) {
    console.error('❌ マイグレーションエラー:', error)
  }
}

runSQLMigration().catch(console.error)