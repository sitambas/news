import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { requireAdmin } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/apiResponse';

export const maxDuration = 90;

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

const GEMINI_IMAGE_MODELS = [
  process.env.GEMINI_IMAGE_MODEL,
  'gemini-2.5-flash-image',
  'gemini-3.1-flash-image',
  'gemini-3.1-flash-lite-image',
].filter(Boolean);

const POLLINATIONS_MODELS = ['flux', 'turbo'];

const SCENE_NEGATIVE =
  'Do NOT generate: portrait, close-up face, selfie, passport photo, random person posing, fashion model, stock headshot, logo, watermark, text, caption, UI.';

function styleHint(style) {
  if (style === 'photo') {
    return 'photorealistic documentary photo, natural daylight, wide establishing shot';
  }
  if (style === 'illustration') {
    return 'clean editorial illustration, wide scene composition, not a portrait';
  }
  return 'realistic Indian news agency photo, wide establishing shot of the scene, journalistic coverage';
}

/**
 * Build a scene-first prompt. Custom scenario always dominates.
 * Image models (esp. Pollinations enhance) otherwise default to human portraits.
 */
function buildPrompt({ title, excerpt, location, category, style, customPrompt }) {
  const userScene = (customPrompt || '').trim();
  const look = styleHint(style);

  if (userScene) {
    return [
      `STRICT SCENE REQUEST (must match exactly): ${userScene}`,
      `Show this exact scenario as a wide 16:9 news cover photo.`,
      `Focus on place, objects, environment and situation — not a person portrait.`,
      location ? `Setting/location: ${location}.` : '',
      title ? `Related news topic (background only): ${title}.` : '',
      `Visual style: ${look}.`,
      `Composition: landscape 16:9, medium-wide or wide shot of the scene.`,
      `If people appear, they must be small/secondary and part of the scene action only.`,
      SCENE_NEGATIVE,
      `No Hindi or English text in the image.`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  // Title-only: force a place/event scene, not a person
  return [
    `Create a 16:9 Indian news cover photo about: "${title || 'समाचार'}"`,
    location ? `Location: ${location}.` : '',
    category ? `Category: ${category}.` : '',
    excerpt ? `Context: ${String(excerpt).replace(/\s+/g, ' ').slice(0, 180)}.` : '',
    `Show a wide real-world scene of the event/place (street, building, nature, crowd from distance, vehicles, weather).`,
    `Visual style: ${look}.`,
    `Do NOT make a portrait of one person.`,
    SCENE_NEGATIVE,
    `No text in the image.`,
  ]
    .filter(Boolean)
    .join('\n');
}

/** Shorter prompt for providers with URL length limits (Pollinations). */
function buildShortScenePrompt({ title, location, style, customPrompt }) {
  const userScene = (customPrompt || '').trim();
  const look = styleHint(style);
  if (userScene) {
    return `${userScene}. Wide 16:9 news photo of this exact scene in India${location ? `, ${location}` : ''}. ${look}. Establishing shot of place and situation. Not a portrait, not close-up face, no text, no logo.`;
  }
  return `Wide 16:9 Indian news photo scene about "${title || 'news'}"${location ? ` in ${location}` : ''}. ${look}. Place/event establishing shot. Not a portrait, not close-up face, no text.`;
}

function extractInlineImage(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    const inline = part.inlineData || part.inline_data;
    if (inline?.data) {
      return {
        buffer: Buffer.from(inline.data, 'base64'),
        provider: 'gemini',
      };
    }
  }
  return null;
}

async function generateWithGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { result: null, error: null };

  let lastError = null;

  for (const model of GEMINI_IMAGE_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              responseModalities: ['TEXT', 'IMAGE'],
              imageConfig: { aspectRatio: '16:9' },
            },
          }),
          signal: AbortSignal.timeout(45000),
        }
      );

      const bodyText = await res.text();
      if (!res.ok) {
        console.error(`Gemini image error (${model}):`, bodyText.slice(0, 300));
        try {
          const parsed = JSON.parse(bodyText);
          const msg = parsed?.error?.message || '';
          if (res.status === 429 || /quota|rate limit/i.test(msg)) {
            lastError = 'Gemini कोटा समाप्त';
          } else {
            lastError = msg || `Gemini failed (${res.status})`;
          }
        } catch {
          lastError = `Gemini failed (HTTP ${res.status})`;
        }
        continue;
      }

      const data = JSON.parse(bodyText);
      const image = extractInlineImage(data);
      if (image) return { result: image, error: null };
      lastError = 'Gemini ने छवि नहीं बनाई';
    } catch (err) {
      lastError = err.message || 'Gemini timeout';
    }
  }

  return { result: null, error: lastError };
}

async function generateWithPollinations(shortPrompt, { enhance = false } = {}) {
  let lastError = null;
  const seed = Math.floor(Math.random() * 1_000_000);

  for (const model of POLLINATIONS_MODELS) {
    try {
      // Keep enhance OFF for custom scenes — enhance often rewrites into random portraits
      const encoded = encodeURIComponent(shortPrompt.slice(0, 700));
      const url =
        `https://image.pollinations.ai/prompt/${encoded}` +
        `?width=1200&height=675&model=${model}&nologo=true&private=true&enhance=${enhance ? 'true' : 'false'}&seed=${seed}`;

      const res = await fetch(url, {
        headers: { Accept: 'image/*' },
        signal: AbortSignal.timeout(60000),
      });

      if (!res.ok) {
        lastError = `Pollinations failed (${res.status})`;
        continue;
      }

      const contentType = res.headers.get('content-type') || '';
      const buffer = Buffer.from(await res.arrayBuffer());
      if (!buffer.length || buffer.length < 1000) {
        lastError = 'Pollinations ने खाली छवि दी';
        continue;
      }
      if (contentType.includes('json') || contentType.includes('text')) {
        lastError = 'Pollinations उपलब्ध नहीं';
        continue;
      }

      return {
        result: { buffer, provider: `pollinations:${model}` },
        error: null,
      };
    } catch (err) {
      lastError = err.message || 'Pollinations timeout';
    }
  }

  return { result: null, error: lastError };
}

async function generateWithHuggingFace(prompt) {
  const key = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
  if (!key) return { result: null, error: null };

  const models = [
    process.env.HF_IMAGE_MODEL,
    'black-forest-labs/FLUX.1-schnell',
    'stabilityai/stable-diffusion-xl-base-1.0',
  ].filter(Boolean);

  let lastError = null;
  const negativePrompt =
    'portrait, close-up face, selfie, headshot, fashion model, blurry, text, watermark, logo';

  for (const model of models) {
    try {
      const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Accept: 'image/*',
        },
        body: JSON.stringify({
          inputs: prompt.slice(0, 900),
          parameters: {
            width: 1216,
            height: 672,
            negative_prompt: negativePrompt,
            guidance_scale: 7.5,
          },
        }),
        signal: AbortSignal.timeout(60000),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`HF image error (${model}):`, errText.slice(0, 300));
        lastError = `Hugging Face failed (${res.status})`;
        continue;
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      if (!buffer.length || buffer.length < 1000) {
        lastError = 'Hugging Face ने खाली छवि दी';
        continue;
      }

      return {
        result: { buffer, provider: `huggingface:${model}` },
        error: null,
      };
    } catch (err) {
      lastError = err.message || 'Hugging Face timeout';
    }
  }

  return { result: null, error: lastError };
}

async function generateCoverImage({ fullPrompt, shortPrompt, preferSceneProviders }) {
  const errors = [];

  // Custom scenario: Pollinations first (follows scene text better without enhance)
  // Otherwise: Gemini first for quality
  const order = preferSceneProviders
    ? ['pollinations', 'gemini', 'hf']
    : ['gemini', 'pollinations', 'hf'];

  for (const provider of order) {
    if (provider === 'gemini') {
      const gemini = await generateWithGemini(fullPrompt);
      if (gemini.result) return { result: gemini.result, errors };
      if (gemini.error) errors.push(gemini.error);
    } else if (provider === 'pollinations') {
      const pollinations = await generateWithPollinations(shortPrompt, { enhance: false });
      if (pollinations.result) return { result: pollinations.result, errors };
      if (pollinations.error) errors.push(pollinations.error);
    } else if (provider === 'hf') {
      const hf = await generateWithHuggingFace(fullPrompt);
      if (hf.result) return { result: hf.result, errors };
      if (hf.error) errors.push(hf.error);
    }
  }

  return {
    result: null,
    errors: errors.length ? errors : ['कोई AI image provider उपलब्ध नहीं'],
  };
}

export async function POST(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return errorResponse(auth.error, auth.status);

    const body = await request.json();
    const title = (body.title || '').trim();
    const customPrompt = (body.prompt || '').trim();
    if (!title && !customPrompt) {
      return errorResponse('शीर्षक या AI प्रॉम्प्ट लिखें', 400);
    }

    const promptInput = {
      title,
      excerpt: body.excerpt || '',
      location: body.location || '',
      category: body.category || '',
      style: body.style || 'news',
      customPrompt,
    };

    const fullPrompt = buildPrompt(promptInput);
    const shortPrompt = buildShortScenePrompt(promptInput);
    const preferSceneProviders = Boolean(customPrompt);

    const { result, errors } = await generateCoverImage({
      fullPrompt,
      shortPrompt,
      preferSceneProviders,
    });
    if (!result?.buffer) {
      return errorResponse(
        errors.join(' → ') || 'AI कवर छवि बनाने में विफल',
        502
      );
    }

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
    const filepath = path.join(UPLOAD_DIR, filename);

    await sharp(result.buffer)
      .rotate()
      .resize(1200, 675, { fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(filepath);

    const url = `/uploads/${filename}`;
    return successResponse(
      {
        url,
        alt: (customPrompt || title).slice(0, 120),
        provider: result.provider,
      },
      `AI कवर छवि बन गई (${result.provider})`
    );
  } catch (error) {
    console.error('AI cover error:', error);
    return errorResponse('AI कवर छवि बनाने में विफल', 500);
  }
}
