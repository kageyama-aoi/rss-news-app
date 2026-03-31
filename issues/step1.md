# Step1: 複数RSS取得アプリ

## 目的
Yahoo News と NHK News の RSS をまとめて取得し、一覧表示して記事リンクを開ける状態にする。

## 対応内容
- Next.js App Router 構成へ移行
- `GET /api/rss` を追加
- RSS 取得処理を `lib/rss.js` に分離
- 一覧表示 UI を `app/page.js` に実装

## 対象ファイル
- `app/page.js`
- `app/layout.js`
- `app/api/rss/route.js`
- `lib/rss.js`
- `package.json`

## 確認結果
- `npm install` 実施済み
- `npm run build` 成功

## 保留
- GitHub issue 起票は `gh` 認証と proxy 設定の問題で未実施
- `next@15.2.4` に脆弱性警告あり。Step2 に進む前に更新要否を確認する
