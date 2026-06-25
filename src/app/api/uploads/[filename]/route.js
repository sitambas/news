import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

const MIME_TYPES = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
};

export async function GET(request, { params }) {
  try {
    const { filename } = await params;

    if (!filename || filename.includes('..') || filename.includes('/')) {
      return new NextResponse('Not found', { status: 404 });
    }

    const filepath = path.join(UPLOAD_DIR, filename);
    if (!existsSync(filepath)) {
      return new NextResponse('Not found', { status: 404 });
    }

    const buffer = await readFile(filepath);
    const ext = path.extname(filename).toLowerCase();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Upload serve error:', error);
    return new NextResponse('Not found', { status: 404 });
  }
}
