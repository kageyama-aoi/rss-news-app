# 2026-04-20 改修まとめ

## 1. Next.js セキュリティアップデート

**対応内容**
- Next.js を `15.2.8` → `15.5.15` にアップデート

**背景**
起動時に以下の警告が表示されたため対応。

```
Error: Vulnerable version of Next.js detected, please update immediately.
CVE-2025-66478
```

**修正されたCVE（7件）**
| CVE | 内容 |
|-----|------|
| CVE-2025-66478 | 脆弱なバージョン検出の警告 |
| GHSA-g5qg-72qw-gw5v | Image最適化APIのキャッシュキー混乱 |
| GHSA-xv57-4mr9-wg8v | Image最適化のコンテンツインジェクション |
| GHSA-4342-x723-ch2f | Middlewareリダイレクト不正処理によるSSRF |
| GHSA-9g9p-9gw9-jx7f | remotePatterns設定によるDoS |
| GHSA-ggv3-7p47-pfv8 | rewritesによるHTTPリクエストスマグリング |
| GHSA-3x4c-7xq6-9pq8 | next/imageディスクキャッシュの無制限増大 |
| GHSA-q4gf-8mx6-v5v3 | Server ComponentsによるDoS |

---

## 2. RSSフィード取得エラーの修正（Issue #5）

**症状**
Vercelで「ニュースの取得に失敗しました。」と表示される。

**原因**
Next.js 15.3以降でサーバーサイドの `fetch` が `http://` URLをブロックするようになり、BBC NewsのフィードURL（`http://`）が失敗。さらに `Promise.all()` を使っていたため、1件の失敗が全体のエラーになっていた。

**修正内容**

### `lib/rss-feeds.js`
- BBC News の URL を `http://` → `https://` に変更
- YouTubeフィードの重複エントリ（`youtube-ucpuqnk6may4o3ndgjmv10cw`）を削除

### `lib/rss.js`
- `Promise.all()` → `Promise.allSettled()` に変更
- 一部のフィードが失敗しても、取得できたフィードは表示されるようになった

---

## 3. エラーログの追加

**目的**
次回同様の問題が起きたとき、Vercelのログから原因をすぐ特定できるようにする。

**追加したログ**

| ファイル | ログ内容 |
|---------|---------|
| `lib/rss.js` | 失敗したフィードのsource・url・エラー理由 |
| `app/api/rss/route.js` | APIルートで発生した例外のmessage・stack |
| `app/api/news/route.js` | APIルートで発生した例外のmessage・stack |

**ログ出力例**
```
[rss] FAILED source="BBC News" url="http://..." reason="HTTP 301 Moved Permanently"
[api/rss] ERROR message="..." stack="..."
```

**Vercelでのログ確認方法**
1. Vercel ダッシュボード → プロジェクトを開く
2. **Logs** タブを選択
3. `[rss]` または `[api/rss]` または `[api/news]` で検索

---

## コミット履歴

| ハッシュ | 内容 |
|---------|------|
| `483c098` | fix(rss): BBC URLをhttps化・Promise.allSettledで部分失敗を許容 #5 |
| `f06f1f5` | feat(logging): RSSフィード・APIルートにエラーログを追加 |
