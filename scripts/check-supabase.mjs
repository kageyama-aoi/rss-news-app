import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// .env.local を手動で読み込む
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");

for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const [key, ...rest] = trimmed.split("=");
  process.env[key.trim()] = rest.join("=").trim();
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("--- 環境変数の確認 ---");
console.log("SUPABASE_URL     :", url ?? "❌ 未設定");
console.log("SERVICE_ROLE_KEY :", key ? `✅ 設定済み（${key.length}文字）` : "❌ 未設定");

if (!url || !key) {
  console.log("\n❌ 環境変数が不足しています。.env.local を確認してください。");
  process.exit(1);
}

console.log("\n--- Supabase 接続テスト ---");
const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const { data, error } = await supabase
  .from("news")
  .select("count", { count: "exact", head: true });

if (error) {
  console.log("❌ 接続エラー:", error.message);
  console.log("   コード:", error.code);
} else {
  console.log("✅ 接続成功！ news テーブルの件数:", data ?? 0, "件");
}
