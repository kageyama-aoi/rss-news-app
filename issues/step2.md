# Step2: AI要約追加

## 目的
ニュースタイトルを OpenAI API で日本語 50 文字以内に要約し、一覧上に表示できる状態にする。

## 対応内容
- `POST /api/summarize` を追加
- OpenAI Responses API を利用してタイトル要約を生成
- ニュース一覧に `AI要約` ボタンと要約表示領域を追加
- 既定モデルを `gpt-5-nano` に設定

## 環境変数
- `OPENAI_API_KEY`
- `OPENAI_SUMMARY_MODEL` 任意。未指定時は `gpt-5-nano`

## 確認ポイント
- API キー未設定時にエラーメッセージが返る
- タイトル送信で要約が返る
- 一覧上で要約文が表示される
