import { getSupabaseAdmin } from "../../../../lib/supabase";

export async function POST(request) {
  try {
    const body = await request.json();
    const title = body?.title?.trim();
    const link = body?.link?.trim();
    const source = body?.source?.trim();
    const summary = body?.summary?.trim() || "";

    if (!title || !link || !source) {
      return Response.json(
        {
          message: "title, link, source は必須です。"
        },
        {
          status: 400
        }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: existing, error: existingError } = await supabase
      .from("news")
      .select("id, title, link, summary, source, created_at")
      .eq("link", link)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing) {
      return Response.json(
        {
          message: "このニュースはすでに保存されています。",
          news: existing
        },
        {
          status: 200
        }
      );
    }

    const { data, error } = await supabase
      .from("news")
      .insert({
        title,
        link,
        summary,
        source
      })
      .select("id, title, link, summary, source, created_at")
      .single();

    if (error) {
      throw error;
    }

    return Response.json(
      {
        message: "ニュースを保存しました。",
        news: data
      },
      {
        status: 201
      }
    );
  } catch (error) {
    return Response.json(
      {
        message: "ニュース保存に失敗しました。",
        detail: error?.message || "unknown error"
      },
      {
        status: 500
      }
    );
  }
}
