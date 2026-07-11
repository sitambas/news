import { requireAdmin } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/apiResponse';

const PROMPTS = {
  category_description: (ctx) =>
    `आप CGFILE न्यूज़ वेबसाइट के लिए हिंदी में श्रेणी विवरण लिखें। श्रेणी का नाम: "${ctx.name || 'समाचार'}". स्लग: ${ctx.slug || 'news'}। अधिकतम 250 अक्षर, 2 वाक्य। केवल विवरण टेक्स्ट दें।`,

  reporter_bio: (ctx) =>
    `CGFILE न्यूज़ के लिए रिपोर्टर का संक्षिप्त परिचय हिंदी में लिखें। नाम: "${ctx.name || 'रिपोर्टर'}". लोकेशन: ${ctx.locations?.length ? ctx.locations.join(', ') : 'भारत'}। 2-3 वाक्य, पेशेवर टोन। केवल विवरण टेक्स्ट दें।`,

  article_excerpt: (ctx) => {
    const words = Math.min(120, Math.max(40, Number(ctx.wordCount) || 60));
    return `CGFILE न्यूज़ लेख का बहुत छोटा सारांश (excerpt) हिंदी में लिखें। शीर्षक: "${ctx.title || ''}". श्रेणी: ${ctx.category || 'सामान्य'}। लगभग ${words} शब्द, अधिकतम 2 वाक्य। Markdown/HTML न दें। केवल सादा सारांश टेक्स्ट दें।`;
  },

  article_meta: (ctx) =>
    `SEO मेटा विवरण हिंदी में लिखें (अधिकतम 155 अक्षर)। लेख शीर्षक: "${ctx.title || ''}". सारांश: "${ctx.excerpt || ''}". केवल मेटा विवरण टेक्स्ट दें।`,

  article_content: (ctx) => {
    const words = Math.min(2000, Math.max(100, Number(ctx.wordCount) || 800));
    const paragraphs = Math.max(3, Math.round(words / 100));
    return `CGFILE न्यूज़ के लिए पूरा समाचार लेख हिंदी में लिखें।
शीर्षक: "${ctx.title || ''}"
श्रेणी: ${ctx.category || 'सामान्य'}
लोकेशन: ${ctx.location || 'भारत'}
${ctx.excerpt ? `सारांश संदर्भ: "${ctx.excerpt}"` : ''}

आवश्यकताएँ:
- लगभग ${words} शब्द लिखें (लगभग ${paragraphs} पैराग्राफ)
- शब्द संख्या ${Math.round(words * 0.9)} से ${Math.round(words * 1.1)} के बीच रखें
- समाचार शैली: क्या हुआ, कहाँ, कब, क्यों, प्रभाव
- शुरुआत में मुख्य खबर, फिर पृष्ठभूमि, आधिकारिक बयान/प्रतिक्रिया, और अंत में आगे की स्थिति
- HTML टैग न दें — केवल सादा टेक्स्ट, पैराग्राफ खाली लाइन से अलग करें
- केवल लेख टेक्स्ट दें, कोई शीर्षक/नोट/स्पष्टीकरण नहीं`;
  },
};

function getOutputLimit(type, wordCount) {
  if (type === 'article_content') {
    const words = Math.min(2000, Math.max(100, Number(wordCount) || 800));
    // Hindi needs more tokens per word; keep headroom
    return Math.min(8192, Math.max(1024, Math.round(words * 3.5)));
  }
  if (type === 'article_excerpt') return 512;
  if (type === 'article_meta') return 256;
  return 512;
}

const GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
].filter(Boolean);

function geminiErrorMessage(status, body) {
  try {
    const parsed = JSON.parse(body);
    const code = parsed?.error?.code;
    const msg = parsed?.error?.message || '';
    if (status === 429 || code === 429) {
      return 'Gemini API कोटा समाप्त — कुछ मिनट बाद पुनः प्रयास करें या Google AI Studio में बिलिंग चालू करें';
    }
    if (status === 403 || code === 403) {
      return 'Gemini API key अमान्य है — नई key बनाकर GEMINI_API_KEY अपडेट करें';
    }
    if (status === 503 || code === 503) {
      return 'Gemini व्यस्त है — कुछ सेकंड बाद पुनः प्रयास करें';
    }
    if (msg) return `Gemini त्रुटि: ${msg.slice(0, 120)}`;
  } catch {
    /* ignore */
  }
  return `Gemini API विफल (HTTP ${status})`;
}

async function callGemini(prompt, maxOutputTokens = 1024) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { text: null, error: null };

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      lastError = geminiErrorMessage(res.status, err);
      console.error(`Gemini error (${model}):`, err);
      if (res.status === 429 || res.status === 503) continue;
      return { text: null, error: lastError };
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    if (text) return { text, error: null };
    lastError = 'Gemini ने खाली जवाब दिया';
  }

  return { text: null, error: lastError };
}

async function callOpenAI(prompt, maxTokens = 1024) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { text: null, error: null };

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
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('OpenAI error:', err);
    return { text: null, error: 'OpenAI API विफल' };
  }

  const data = await res.json();
  return { text: data.choices?.[0]?.message?.content?.trim() || null, error: null };
}

async function generateText(prompt, maxOutputTokens = 1024) {
  const gemini = await callGemini(prompt, maxOutputTokens);
  if (gemini.text) return { text: gemini.text, error: null };

  const openai = await callOpenAI(prompt, maxOutputTokens);
  if (openai.text) return { text: openai.text, error: null };

  return { text: null, error: gemini.error || openai.error || 'AI से टेक्स्ट नहीं मिला' };
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
    const maxOutputTokens = getOutputLimit(type, context.wordCount);
    const { text, error } = await generateText(prompt, maxOutputTokens);
    if (!text) {
      return errorResponse(error || 'AI से टेक्स्ट नहीं मिला — कृपया पुनः प्रयास करें', 502);
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
