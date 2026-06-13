import type { NextRequest } from 'next/server'
import { searchUniversities } from '@/features/professional/actions'
import { apiError, apiSuccess } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''
  const result = await searchUniversities({ query: q })

  if (!result.success) {
    return apiSuccess({ results: result.results, warning: result.error })
  }

  return apiSuccess({ results: result.results })
}
