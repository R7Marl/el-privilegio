import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { getAdminSession } from '../../../../lib/session';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  const data = await request.formData(); const file = data.get('image');
  if (!(file instanceof File) || !file.type.startsWith('image/') || file.size > 8 * 1024 * 1024) return NextResponse.json({ error: 'Sube una imagen de hasta 8 MB.' }, { status: 400 });
  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'; const filename = `${randomUUID()}.${extension}`; const directory = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(directory, { recursive: true }); await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}
