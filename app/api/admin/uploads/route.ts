import { randomUUID } from 'crypto';
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getAdminSession } from '../../../../lib/session';

export const runtime = 'nodejs';

const imageExtensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const data = await request.formData();
  const file = data.get('image');
  if (!(file instanceof File) || !imageExtensions[file.type] || file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: 'Sube una imagen JPG, PNG o WebP de hasta 8 MB.' }, { status: 400 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'El almacenamiento de imágenes no está configurado.' }, { status: 503 });
  }

  try {
    const blob = await put(`gallery/${randomUUID()}.${imageExtensions[file.type]}`, file, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (error) {
    console.error('No se pudo subir la imagen a Blob.', error);
    return NextResponse.json({ error: 'No se pudo guardar la imagen. Intenta nuevamente.' }, { status: 502 });
  }
}
