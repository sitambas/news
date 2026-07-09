import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getServerUser } from '@/lib/auth';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

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
      // Always produce a large cover so WhatsApp/Facebook can show big previews
      await sharp(buffer)
        .rotate()
        .resize(1200, 675, { fit: 'cover' })
        .webp({ quality: 85 })
        .toFile(filepath);
    }

    const url = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url, message: 'छवि अपलोड सफल' });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, message: 'अपलोड विफल हुआ' }, { status: 500 });
  }
}
