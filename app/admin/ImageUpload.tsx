'use client';

import { useState } from 'react';
import { ImagePlus } from 'lucide-react';
import styles from './admin.module.css';

export function ImageUpload() {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length || uploading) return;

    setUploading(true);
    let completed = 0;
    let failed = 0;

    for (const [index, file] of files.entries()) {
      setMessage(`Subiendo imagen ${index + 1} de ${files.length}…`);
      const form = new FormData();
      form.append('image', file);

      try {
        const response = await fetch('/api/admin/uploads', { method: 'POST', body: form });
        if (response.ok) completed += 1;
        else failed += 1;
      } catch {
        failed += 1;
      }
    }

    setUploading(false);
    setMessage(failed ? `Se publicaron ${completed} imágenes. ${failed} no se pudieron subir.` : `${completed} ${completed === 1 ? 'imagen publicada' : 'imágenes publicadas'} en la galería.`);
  }

  return <section className={styles.panel}>
    <div className={styles.panelHead}>
      <div><h3>Galería</h3><p>Selecciona una o varias imágenes de eventos para mostrarlas en el sitio público.</p></div>
    </div>
    <label className={styles.uploadButton} aria-disabled={uploading}>
      <ImagePlus size={17} /> {uploading ? 'Subiendo imágenes…' : 'Seleccionar imágenes'}
      <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploading} onChange={upload} />
    </label>
    {message && <p className={styles.uploadMessage} aria-live="polite">{message}</p>}
  </section>;
}
