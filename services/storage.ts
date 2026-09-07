import type { TypedSupabaseClient } from './types';

export type StorageBucket = 'avatars' | 'recipes' | 'posts' | 'recipe-videos';

const LIMITS: Record<StorageBucket, { maxBytes: number; mimeTypes: string[] }> = {
  avatars: { maxBytes: 5 * 1024 * 1024, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
  recipes: { maxBytes: 15 * 1024 * 1024, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
  posts: { maxBytes: 15 * 1024 * 1024, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
  'recipe-videos': { maxBytes: 100 * 1024 * 1024, mimeTypes: ['video/mp4', 'video/quicktime', 'video/webm'] },
};

export class StorageValidationError extends Error {}

function assertValidFile(bucket: StorageBucket, file: File) {
  const limit = LIMITS[bucket];
  if (!limit.mimeTypes.includes(file.type)) {
    throw new StorageValidationError(`Tipo de archivo no soportado (${file.type || 'desconocido'}).`);
  }
  if (file.size > limit.maxBytes) {
    throw new StorageValidationError(`El archivo supera el límite de ${Math.round(limit.maxBytes / 1024 / 1024)}MB.`);
  }
}

/** Comprime una imagen en el navegador (resize + recomprimir a webp/jpeg) antes de subir. */
async function compressImage(file: File, maxDimension = 1600, quality = 0.82): Promise<Blob> {
  if (typeof window === 'undefined') return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? file), 'image/webp', quality);
  });
}

export interface UploadResult {
  path: string;
  publicUrl: string;
}

export async function uploadToBucket(
  supabase: TypedSupabaseClient,
  bucket: StorageBucket,
  userId: string,
  file: File,
  options: { folder?: string; compress?: boolean } = {}
): Promise<UploadResult> {
  assertValidFile(bucket, file);

  const isImage = file.type.startsWith('image/');
  const body = isImage && options.compress !== false ? await compressImage(file) : file;
  const extension = isImage && options.compress !== false ? 'webp' : file.name.split('.').pop() || 'bin';

  const folder = options.folder ? `${userId}/${options.folder}` : userId;
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(bucket).upload(path, body, {
    contentType: isImage && options.compress !== false ? 'image/webp' : file.type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export async function removeFromBucket(supabase: TypedSupabaseClient, bucket: StorageBucket, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}
