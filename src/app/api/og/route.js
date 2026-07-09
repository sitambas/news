import { NextResponse } from 'next/server';
import { readFile, access } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

function resolveLocalUpload(src) {
  if (!src || typeof src !== 'string') return null;

  let pathname = src.trim();
  try {
    if (pathname.startsWith('http://') || pathname.startsWith('https://')) {
      const url = new URL(pathname);
      pathname = url.pathname;
    }
  } catch {
    return null;
  }

  const match = pathname.match(/^\/uploads\/([a-zA-Z0-9._-]+)$/);
  if (!match) return null;
  return path.join(UPLOAD_DIR, match[1]);
}

async function loadRemoteImage(src) {
  const res = await fetch(src, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error('Remote image fetch failed');
  return Buffer.from(await res.arrayBuffer());
}

function escapeXml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapTitle(title, maxChars = 28, maxLines = 4) {
  const words = String(title || 'CGFILE').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
      if (lines.length >= maxLines) break;
    } else {
      current = next;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);
  if (words.join(' ').length > lines.join(' ').length) {
    const last = lines[lines.length - 1] || '';
    lines[lines.length - 1] = `${last.slice(0, Math.max(0, maxChars - 1))}…`;
  }
  return lines.slice(0, maxLines);
}

async function createFallbackCard(title) {
  const lines = wrapTitle(title);
  const lineSvg = lines
    .map((line, i) => {
      const y = 250 + i * 58;
      return `<text x="80" y="${y}" fill="#ffffff" font-size="44" font-weight="700" font-family="Arial, Helvetica, sans-serif">${escapeXml(line)}</text>`;
    })
    .join('');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7f1d1d"/>
      <stop offset="55%" stop-color="#b91c1c"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
  </defs>
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#bg)"/>
  <rect x="0" y="0" width="18" height="${OG_HEIGHT}" fill="#ef4444"/>
  <rect x="80" y="70" width="72" height="72" rx="16" fill="#ef4444"/>
  <text x="98" y="116" fill="#ffffff" font-size="28" font-weight="900" font-family="Arial, Helvetica, sans-serif">CG</text>
  <text x="170" y="118" fill="#ffffff" font-size="40" font-weight="900" font-family="Arial, Helvetica, sans-serif">CGFILE</text>
  ${lineSvg}
  <text x="80" y="560" fill="#fecaca" font-size="26" font-family="Arial, Helvetica, sans-serif">cgfile.in</text>
</svg>`;

  return sharp(Buffer.from(svg)).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const src = searchParams.get('src') || '';
    const title = searchParams.get('title') || 'CGFILE';

    let buffer = null;
    const localPath = resolveLocalUpload(src);

    if (localPath) {
      try {
        await access(localPath);
        buffer = await readFile(localPath);
      } catch {
        buffer = null;
      }
    } else if (src.startsWith('https://') || src.startsWith('http://')) {
      try {
        buffer = await loadRemoteImage(src);
      } catch {
        buffer = null;
      }
    }

    if (!buffer) {
      buffer = await createFallbackCard(title);
    } else {
      buffer = await sharp(buffer)
        .rotate()
        .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'centre' })
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('OG image error:', error);
    return NextResponse.json({ success: false, message: 'OG image failed' }, { status: 500 });
  }
}
