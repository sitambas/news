import { requireAdmin } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/apiResponse';

const PROMPTS = {
  category_description: (ctx) =>
    `आप CGFILE न्यूज़ वेबसाइट के लिए हिंदी में श्रेणी विवरण लिखें। श्रेणी का नाम: "${ctx.name || 'समाचार'}". स्लग: ${ctx.slug || 'news'}। केवल 1-2 वाक्य में संक्षिप्त, स्पष्ट हिंदी विवरण दें। कोई शीर्षक या बुलेट न दें।`,

  reporter_bio: (ctx) =>
    `CGFILE न्यूज़ के लिए रिपोर्टर का संक्षिप्त परिचय हिंदी में लिखें। नाम: "${ctx.name || 'रिपोर्टर'}". लोकेशन: ${ctx.locations?.length ? ctx.locations.join(', ') : 'भारत'}। 2-3 वाक्य, पेशेवर टोन। केवल विवरण टेक्स्ट दें।`,

  article_excerpt: (ctx) =>
    `CGFILE न्यूज़ लेख का संक्षिप्त सारांश (excerpt) हिंदी में लिखें। शीर्षक: "${ctx.title || ''}". श्रेणी: ${ctx.category || 'सामान्य'}। अधिकतम 2-3 वाक्य, 200 शब्द से कम। केवल सारांश टेक्स्ट दें।`,

  article_meta: (ctx) =>
    `SEO मेटा विवरण हिंदी में लिखें (अधिकतम 155 अक्षर)। लेख शीर्षक: "${ctx.title || ''}". सारांश: "${ctx.excerpt || ''}". केवल मेटा विवरण टेक्स्ट दें।`,

  article_content: (ctx) =>
    `CGFILE न्यूज़ के लिए पूरा समाचार लेख हिंदी में लिखें। शीर्षक: "${ctx.title || ''}". श्रेणी: ${ctx.category || 'सामान्य'}। लोकेशन: ${ctx.location || 'भारत'}। 4-6 पैराग्राफ, समाचार शैली। HTML टैग न दें — केवल सादा टेक्स्ट, पैराग्राफ खाली लाइन से अलग करें।`,
};

async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error('Gemini error:', err);
    return null;
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

async function callOpenAI(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'आप CGFILE न्यूज़ वेबसाइट के लिए हिंदी में पेशेवर समाचार सामग्री लिखते हैं। केवल अनुरोधित टेक्स्ट दें, कोई स्पष्टीकरण नहीं।' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('OpenAI error:', err);
    return null;
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function generateText(prompt) {
  let text = await callGemini(prompt);
  if (!text) text = await callOpenAI(prompt);
  return text;
}

function plainToHtml(text) {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

export async function POST(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return errorResponse(auth.error, auth.status);

    const { type, context = {} } = await request.json();
    const promptFn = PROMPTS[type];
    if (!promptFn) return errorResponse('अमान्य AI प्रकार', 400);

    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      return errorResponse(
        'AI कॉन्फ़िगर नहीं है — सर्वर पर GEMINI_API_KEY या OPENAI_API_KEY सेट करें',
        503
      );
    }

    const prompt = promptFn(context);
    const text = await generateText(prompt);
    if (!text) {
      return errorResponse('AI से टेक्स्ट नहीं मिला — कृपया पुनः प्रयास करें', 502);
    }

    const result = type === 'article_content'
      ? { text, html: plainToHtml(text) }
      : { text };

    return successResponse(result);
  } catch (error) {
    console.error('AI write error:', error);
    return errorResponse('AI लेखन विफल', 500);
  }
}
