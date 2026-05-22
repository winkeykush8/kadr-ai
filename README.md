# KADR AI MVP

هذه نسخة أولى من تطبيق KADR AI مع Backend بسيط لتحليل الصور بالذكاء الاصطناعي.

## ماذا يفعل؟
- ترفع صورة أو frame.
- يرسلها الـ Backend إلى OpenAI Vision.
- يرجع تحليل منظم:
  - نوع اللقطة
  - الكادر
  - الإضاءة
  - زاوية الكاميرا
  - العدسة المتوقعة
  - Film Look
  - أقرب مخرج/ستايل
  - Prompt احترافي
  - أخطاء وتحسينات

## التشغيل
1. افتح المشروع في VS Code.
2. شغّل:
   npm install
3. أنشئ ملف:
   .env.local
4. انسخ محتوى .env.example وضع مفتاح OpenAI API.
5. شغّل:
   npm run dev
6. افتح:
   http://localhost:3000

## النشر
يمكن رفع المشروع على Vercel. ضع OPENAI_API_KEY في Environment Variables داخل Vercel.

## ملاحظة مهمة
هذه نسخة MVP وليست منتج نهائي. لكنها تحتوي على Frontend + Backend + اتصال AI.
