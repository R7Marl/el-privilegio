import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export async function GET() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ images: [] });

  try {
    const { blobs } = await list({ prefix: 'gallery/' });
    const images = blobs
      .filter((blob) => /\.(jpg|jpeg|png|webp)$/i.test(blob.pathname))
      .map((blob) => ({ src: blob.url, title: 'Evento realizado', category: 'Celebraciones' }));
    return NextResponse.json({ images });
  } catch (error) {
    console.error('No se pudieron obtener las imágenes de Blob.', error);
    return NextResponse.json({ images: [] });
  }
}
