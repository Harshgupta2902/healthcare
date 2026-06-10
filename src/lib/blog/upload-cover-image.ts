import fs from 'fs/promises'
import path from 'path'
import type { SupabaseClient } from '@supabase/supabase-js'
import sharp from 'sharp'

const BUCKET = 'blog-covers'
const LEGACY_UPLOAD_REL = '/uploads/blogs'
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export async function saveBlogCoverImage(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<string> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error('Cover image must be JPEG, PNG, WebP, or GIF.')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Cover image must be 5 MB or smaller.')
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  let optimizedBuffer: Buffer
  try {
    optimizedBuffer = await sharp(buffer)
      .resize(2400, 2400, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()
  } catch {
    optimizedBuffer = buffer
  }

  const filePath = `${userId}/${Date.now()}.webp`

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, optimizedBuffer, {
    contentType: 'image/webp',
    upsert: false,
  })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(filePath)

  return publicUrl
}

function extractBlogCoverStoragePath(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return null
  return decodeURIComponent(publicUrl.slice(idx + marker.length).split('?')[0] ?? '')
}

export async function deleteBlogCoverImage(
  supabase: SupabaseClient,
  publicUrl: string | null | undefined
): Promise<void> {
  if (!publicUrl) return

  const storagePath = extractBlogCoverStoragePath(publicUrl)
  if (storagePath) {
    await supabase.storage.from(BUCKET).remove([storagePath])
    return
  }

  if (!publicUrl.startsWith(`${LEGACY_UPLOAD_REL}/`)) return

  const filePath = path.join(process.cwd(), 'public', publicUrl.replace(/^\//, ''))
  try {
    await fs.unlink(filePath)
  } catch {
    /* legacy file may already be gone */
  }
}
