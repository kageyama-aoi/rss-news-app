import Anthropic from "@anthropic-ai/sdk";

const MODEL_NAME = "claude-haiku-4-5-20251001";

export async function POST(request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        {
          message: "ANTHROPIC_API_KEY が設定されていません。"
        },
        {
          status: 500
        }
      );
    }

    const body = await request.json();
    const title = body?.title?.trim();

    if (!title) {
      return Response.json(
        {
          message: "title は必須です。"
        },
        {
          status: 400
        }
      );
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const response = await client.messages.create({
      model: MODEL_NAME,
      max_tokens: 200,
      system:
        "あなたはニュースタイトル要約アシスタントです。入力された日本語または英語のニュースタイトルを、日本語で50文字以内に短く要約してください。余計な前置きは不要です。",
      messages: [
        {
          role: "user",
          content: title
        }
      ]
    });

    return Response.json({
      summary: response.content[0].text.trim()
    });
  } catch (error) {
    return Response.json(
      {
        message: "AI要約の生成に失敗しました。",
        detail: error?.message || "unknown error"
      },
      {
        status: 500
      }
    );
  }
}
