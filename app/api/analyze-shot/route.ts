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
        { error: "OPENAI_API_KEY غير موجود داخل Vercel Environment Variables" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const imageDataUrl = body.imageDataUrl as string | undefined;
    const notes = (body.notes as string | undefined) || "";

    if (!imageDataUrl || !imageDataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "ارفع صورة صالحة" },
        { status: 400 }
      );
    }

    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    const prompt = `
أنت KADR AI، مساعد مدير تصوير لصناعة الأفلام بالذكاء الاصطناعي.

حلل الصورة من ناحية:
- نوع اللقطة
- الكادر والتكوين
- الإضاءة
- زاوية الكاميرا
- العدسة المتوقعة
- Film Look
- المزاج
- إلهام إخراجي عام
- نقاط الضعف
- التحسينات
- Prompt إنجليزي جاهز

أرجع JSON فقط بهذا الشكل:
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
  "prompt": "..."
}

ملاحظات المستخدم:
${notes}
`;

    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl,
              },
            },
          ],
        },
      ],
      temperature: 0.4,
    });

    const text = response.choices[0]?.message?.content || "";
    const analysis = extractJson(text);

    return NextResponse.json({ analysis });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ في تحليل الصورة" },
      { status: 500 }
    );
  }
}
