import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function checkFutureEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('start_date')
    .gte('start_date', '2025-09-23')
    .order('start_date');

  if (error) {
    console.error('Error:', error);
    return;
  }

  // Count by month
  const monthCounts: { [key: string]: number } = {};
  data.forEach(event => {
    const month = event.start_date.substring(0, 7); // YYYY-MM
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });

  console.log('今日(2025-09-23)以降のイベント数:');
  Object.entries(monthCounts).sort().forEach(([month, count]) => {
    console.log(`${month}: ${count}件`);
  });
}

checkFutureEvents();