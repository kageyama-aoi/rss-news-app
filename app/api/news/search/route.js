import { getSupabaseAdmin } from "../../../../lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("q")?.trim() || "";

    if (!keyword) {
      return Response.json(
        {
          message: "q は必須です。"
        },
        {
          status: 400
        }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("news")
      .select("id, title, link, summary, source, created_at")
      .ilike("title", `%${keyword}%`)
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
        message: "ニュース検索に失敗しました。",
        detail: error?.message || "unknown error"
      },
      {
        status: 500
      }
    );
  }
}
