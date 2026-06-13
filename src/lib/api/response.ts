import { NextResponse } from 'next/server'

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data, error: null }, { status })
}

export function apiError(
  message: string,
  status = 400,
  code?: string,
) {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error: { message, ...(code ? { code } : {}) },
    },
    { status },
  )
}
