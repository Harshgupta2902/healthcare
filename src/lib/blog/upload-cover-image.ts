import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const UPLOAD_REL = '/uploads/blogs'
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'blogs')
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

export async function saveBlogCoverImage(file: File): Promise<string> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error('Cover image must be JPEG, PNG, WebP, or GIF.')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Cover image must be 5 MB or smaller.')
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true })

  const ext = EXT_BY_MIME[file.type] ?? '.jpg'
  const filename = `${randomUUID()}${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer)

  return `${UPLOAD_REL}/${filename}`
}

export async function deleteBlogCoverImage(publicUrl: string | null | undefined): Promise<void> {
  if (!publicUrl?.startsWith(`${UPLOAD_REL}/`)) return
  const filePath = path.join(process.cwd(), 'public', publicUrl.replace(/^\//, ''))
  try {
    await fs.unlink(filePath)
  } catch {
    /* file may already be gone */
  }
}
