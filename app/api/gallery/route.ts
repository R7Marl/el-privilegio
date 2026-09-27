import { readdir } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export async function GET() {
  try { const files = await readdir(path.join(process.cwd(), 'public', 'uploads')); return NextResponse.json({ images: files.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file)).map(file => ({ src: `/uploads/${file}`, title: 'Evento realizado', category: 'Celebraciones' })) }); } catch { return NextResponse.json({ images: [] }); }
}
