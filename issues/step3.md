# Step3: ニュース保存

## 目的
Supabase にニュースを保存し、保存済み一覧を取得できる状態にする。

## 対応内容
- `POST /api/news/save` を追加
- `GET /api/news` を追加
- Supabase 管理クライアントを `lib/supabase.js` に追加
- ニュース一覧に `保存` ボタンを追加
- 保存済みニュース一覧を画面に追加

## 環境変数
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## テーブル
- `supabase/news.sql` に `news` テーブル作成 SQL を追加

## 確認ポイント
- ニュースを保存できる
- 同じ link のニュースを再保存しようとすると既存扱いになる
- `GET /api/news` で保存済み一覧を返せる
