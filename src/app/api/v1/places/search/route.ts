import type { NextRequest } from 'next/server'
import { searchPlaces } from '@/app/book-consultation/actions'
import { apiSuccess } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''
  const results = await searchPlaces(q)
  return apiSuccess({ predictions: results })
}
