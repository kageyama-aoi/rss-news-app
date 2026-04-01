import OpenAI from "openai";

const MODEL_NAME = process.env.OPENAI_SUMMARY_MODEL || "gpt-5-nano";

export async function POST(request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          message: "OPENAI_API_KEY が設定されていません。"
        },
        {
          status: 500
        }
      );
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

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

    const response = await client.responses.create({
      model: MODEL_NAME,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "あなたはニュースタイトル要約アシスタントです。入力された日本語または英語のニュースタイトルを、日本語で50文字以内に短く要約してください。余計な前置きは不要です。"
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: title
            }
          ]
        }
      ]
    });

    return Response.json({
      summary: response.output_text.trim()
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
