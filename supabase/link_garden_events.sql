-- 盆栽園とイベントの紐づけ更新
-- 清香園で開催されるイベントにgarden_idを設定

-- 清香園のIDを取得してイベントに紐づけ
UPDATE events
SET garden_id = (
    SELECT id FROM gardens WHERE name = '清香園' LIMIT 1
)
WHERE venue_name = '清香園' AND garden_id IS NULL;

-- 確認用クエリ（実行後に確認）
-- SELECT
--     e.title,
--     e.venue_name,
--     g.name as garden_name,
--     e.start_date
-- FROM events e
-- LEFT JOIN gardens g ON e.garden_id = g.id
-- WHERE e.venue_name = '清香園';