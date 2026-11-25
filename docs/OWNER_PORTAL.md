# 掲載園の管理画面（/owner）の準備と運用

盆栽園の方が、自分の園の情報・写真・商品を載せ、掲載の効果（表示回数・送客の数）を見るための画面です。
購入は園の通販サイト・電話・店頭へ案内します。当サイトは代金を預かりません。

- 管理画面：https://www.bonsai-collection.com/owner/login
- 掲載のご案内（園向けのLP）：https://www.bonsai-collection.com/gardens/owners

## 最初に1回だけ行うこと（運営者）

### 1. データベースの表を作る

1. Supabase のダッシュボードで、このサイトのプロジェクトを開く
2. 左のメニューの「SQL Editor」を開き、「New query」を押す
3. `supabase/migrations/20261125000000_owner_portal.sql` の中身をすべて貼り付けて「Run」を押す
4. 「Success. No rows returned」と出れば完了（何度実行しても壊れない）

これで、サイトでの数字の記録（園のページの表示・公式サイトへの移動など）が始まります。

### 2. だれでも登録できる状態を止める

園の方のアカウントは運営者が作るので、外からの新規登録は止めておきます。

- 「Authentication」→「Sign In / Providers」（または「Settings」）→「Allow new users to sign up」をオフ
- 「Email」のログインはオンのまま

## 園の方を管理画面に招待する

1. **アカウントを作る**：「Authentication」→「Users」→「Add user」→「Create new user」
   - メールアドレス：園のご担当者のもの
   - パスワード：仮のパスワード（8文字以上）
   - 「Auto Confirm User」にチェックを入れる
2. **園と結びつける**：「SQL Editor」で次を実行する（園のIDは、その園のページのURLの `/gardens/` のあとの文字列）

   ```sql
   select public.add_garden_member('ご担当者のメールアドレス', '園のID');
   ```

   「OK：…」と出れば完了です。1人で複数の園を管理する場合は、園ごとに実行します。

3. **園の方に伝える**（メールなどで）
   - ログインのページ：https://www.bonsai-collection.com/owner/login
   - メールアドレスと仮のパスワード
   - 最初のログインのあと、「アカウント」でパスワードを変えてもらう

> 最初は、あなた自身のメールアドレスでアカウントを作り、どこかの園と結びつけて、画面を一通り試すのがおすすめです。試したあとは、次で結びつきを外せます。
>
> ```sql
> delete from public.garden_members where garden_id = '園のID' and user_id = (select id from auth.users where email = 'あなたのメールアドレス');
> ```

## パスワードを忘れた園の方がいたとき

Supabase の標準のメール送信は、運営チームの外のアドレスにはほとんど届きません。そのため、パスワードの再発行は運営者が行います。

- 「Authentication」→「Users」→ その人の行の「…」→ パスワードを変える（または「Send password recovery」は使わない）
- 新しい仮のパスワードを園の方に伝え、ログイン後に変えてもらう

## 反映のしくみ

- 園の方が保存した内容は、データベースにすぐ保存されます。
- サイトへの反映は、毎日 0:05（日本時間）の確認で、前回の公開のあとに変更があれば作り直します（`.github/workflows/switch-rebuild.yml`）。
- 急いで反映したいときは、GitHub の Actions で `daily-sync` を `rebuild` で実行します。

## 数字について

- 園のページの表示、公式サイト・通販・体験の案内・Instagram・商品の購入先へ進んだ回数、電話・地図のボタンを、園ごと・日ごとの合計だけ記録します（個人は記録しません）。
- 「盆栽体験・盆栽教室を探す」「盆栽園・専門店から直接買う」のページから園のサイトへ進んだ回数も、その園の数字に入ります。
- 数字は Supabase の `garden_stats_daily` に入ります。運営者は SQL Editor で全園の数字を見られます。

  ```sql
  select g.name, s.metric, sum(s.count) as total
  from public.garden_stats_daily s join public.gardens g on g.id = s.garden_id
  where s.day >= current_date - 30
  group by g.name, s.metric order by total desc limit 50;
  ```

## 費用

Supabase の無料の範囲で動きます（データベース500MB、写真の置き場1GB）。写真は保存のときに長い辺1600pxに縮めるので、1枚およそ200〜400KBです。商品は1園100件まで、園の写真は6枚までに制限しています。
