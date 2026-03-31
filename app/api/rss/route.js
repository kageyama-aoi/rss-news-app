import { getAllNews } from "../../../lib/rss";

export async function GET() {
  try {
    const news = await getAllNews();

    return Response.json(news, {
      status: 200
    });
  } catch (error) {
    return Response.json(
      {
        message: "RSSの取得に失敗しました。",
        detail: error.message
      },
      {
        status: 500
      }
    );
  }
}
