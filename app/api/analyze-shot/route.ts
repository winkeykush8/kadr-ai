import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function extractJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI did not return JSON");
    return JSON.parse(match[0]);
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY غير موجود. أضفه داخل .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const imageDataUrl = body.imageDataUrl as string | undefined;
    const notes = (body.notes as string | undefined) || "";

    if (!imageDataUrl || !imageDataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "ارفع صورة صالحة بصيغة image data URL" },
        { status: 400 }
      );
    }

    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    const instructions = `
أنت KADR AI، مساعد مدير تصوير لصناعة الأفلام بالذكاء الاصطناعي.
حلل الصورة بدقة من ناحية سينمائية، وليس وصف عادي للصورة.

أرجع JSON فقط بدون markdown.
يجب أن يكون الشكل:
{
  "shotType": "...",
  "composition": "...",
  "lighting": "...",
  "cameraAngle": "...",
  "lensGuess": "...",
  "filmLook": "...",
  "mood": "...",
  "directorInspiration": "...",
  "weaknesses": ["...", "..."],
  "improvements": ["...", "..."],
  "prompt": "English cinematic prompt for AI image/video generation"
}

قواعد مهمة:
- العدسة مجرد تقدير، اذكر ذلك داخل lensGuess.
- Film Look مجرد تقدير بصري، وليس معلومة مؤكدة.
- لا تنسخ أسلوب مخرج حرفياً؛ استخدمه كإلهام بصري عام.
- prompt يجب أن يكون بالإنجليزية ومناسب لـ Veo / Runway / Midjourney / Wan.
- التحليل العربي، والـ prompt إنجليزي.
`;

    const response = await client.responses.create({
      model,
      instructions,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "حلل هذه اللقطة لصناعة أفلام AI. ملاحظات المستخدم: " +
                notes,
            },
            {
              type: "input_image",
              image_url: imageDataUrl,
            },
          ],
        },
      ],
    });

    const text = response.output_text || "";
    const analysis = extractJson(text);

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error?.message || "حدث خطأ في تحليل الصورة" },
      { status: 500 }
    );
  }
}
