import { getSupabaseAdmin } from "../../../lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("news")
      .select("id, title, link, summary, source, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return Response.json(data, {
      status: 200
    });
  } catch (error) {
    return Response.json(
      {
        message: "保存済みニュースの取得に失敗しました。",
        detail: error?.message || "unknown error"
      },
      {
        status: 500
      }
    );
  }
}
