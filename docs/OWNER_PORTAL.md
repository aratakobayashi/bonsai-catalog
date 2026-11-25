# 掲載園の管理画面（/owner）の準備と運用

盆栽園の方が、自分の園の情報・写真・商品を載せ、掲載の効果（表示回数・送客の数）を見るための画面です。
購入は園の通販サイト・電話・店頭へ案内します。当サイトは代金を預かりません。

- 管理画面：https://www.bonsai-collection.com/owner/login
- 掲載のご案内（園向けのLP）：https://www.bonsai-collection.com/gardens/owners

## 最初に1回だけ行うこと（運営者）

### 1. データベースに接続する情報を GitHub に登録する（運営者・1回だけ）

1. Supabase のダッシュボードでこのサイトのプロジェクトを開き、上の「Connect」を押す
2. 「Session pooler」の接続文字列（`postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`）をコピーし、`[YOUR-PASSWORD]` をデータベースのパスワードに置き換える
   - パスワードが分からないときは「Project Settings」→「Database」→「Reset database password」で作り直せます（このサイトの表示には影響しません）
3. GitHub のリポジトリの「Settings」→「Secrets and variables」→「Actions」→「New repository secret」
   - Name：`SUPABASE_DB_URL`
   - Secret：2 の接続文字列

### 1-2. 表を作る（Claude が実行）

GitHub の Actions の「db-admin」を、作業の種類「migrate」で実行します。何度実行しても壊れません。
これで、サイトでの数字の記録（園のページの表示・公式サイトへの移動など）が始まります。

### 2. だれでも登録できる状態を止める

園の方のアカウントは運営者が作るので、外からの新規登録は止めておきます。

- 「Authentication」→「Sign In / Providers」（または「Settings」）→「Allow new users to sign up」をオフ
- 「Email」のログインはオンのまま
- 「Authentication」→「Multi-Factor」（または「MFA」）で「TOTP（認証アプリ）」が有効になっていることを確かめる（標準で有効。無料）

## 園の方を管理画面に招待する

1. **アカウントを作る**：「Authentication」→「Users」→「Add user」→「Create new user」
   - メールアドレス：園のご担当者のもの
   - パスワード：仮のパスワード（8文字以上）
   - 「Auto Confirm User」にチェックを入れる
2. **園と結びつける**：GitHub の Actions の「db-admin」を、作業の種類「add-member」で、メールアドレスと園のID（その園のページのURLの `/gardens/` のあとの文字列）を入れて実行します（Claude に頼んでも構いません）。1人で複数の園を管理する場合は、園ごとに実行します。

3. **園の方に伝える**（メールなどで）
   - ログインのページ：https://www.bonsai-collection.com/owner/login
   - メールアドレスと仮のパスワード
   - 最初のログインで、スマートフォンの認証アプリ（Google Authenticator など）の登録を求められること
   - 最初のログインのあと、「アカウント」でパスワードを変えてもらう

> 最初は、あなた自身のメールアドレスでアカウントを作り、どこかの園と結びつけて、画面を一通り試すのがおすすめです。試したあとは「db-admin」の「remove-member」で結びつきを外せます。

## 2段階認証

- ログインには、パスワードに加えて、認証アプリの6桁のコードが要ります。最初のログインで認証アプリを登録し、2回目からはログインのたびにコードを入れます。
- 画面だけでなく、データベースの側でも「コードで確かめたログイン」でなければ園のデータを読めない・書けないようにしています（パスワードが漏れても、コードがなければ何もできません）。
- 機種変更などで認証アプリが使えなくなった園の方がいたら、「db-admin」の「reset-mfa」でメールアドレスを入れて実行します。次のログインで登録し直してもらいます。

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
