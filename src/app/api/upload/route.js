import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getServerUser } from '@/lib/auth';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_SIZE = 8 * 1024 * 1024; // 8MB (greeting banners can be large)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const purpose = String(formData.get('purpose') || 'cover').toLowerCase();

    if (!file) {
      return NextResponse.json({ success: false, message: 'कोई फ़ाइल नहीं मिली' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, message: 'केवल JPG, PNG, WebP, GIF फ़ाइलें अनुमत हैं' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, message: 'फ़ाइल 5MB से बड़ी नहीं होनी चाहिए' }, { status: 400 });
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = file.type === 'image/gif' ? 'gif' : 'webp';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    if (file.type === 'image/gif') {
      await writeFile(filepath, buffer);
    } else {
      // Never crop or stretch on upload — keep full image, only downscale large files.
      // Cards/gallery use CSS object-cover to fill frames without distortion.
      const maxEdge = purpose === 'ad' ? 1200 : 1600;
      await sharp(buffer)
        .rotate()
        .resize(maxEdge, maxEdge, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: purpose === 'ad' ? 88 : 86 })
        .toFile(filepath);
    }

    const url = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url, message: 'छवि अपलोड सफल' });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, message: 'अपलोड विफल हुआ' }, { status: 500 });
  }
}
