import { getAllNews } from "../../../lib/rss";

export async function GET() {
  try {
    const news = await getAllNews();

    return Response.json(news, {
      status: 200
    });
  } catch (error) {
    console.error(`[api/rss] ERROR message="${error.message}" stack="${error.stack}"`);
    return Response.json(
      {
        message: "RSS の取得に失敗しました。",
        detail: error.message
      },
      {
        status: 500
      }
    );
  }
}
