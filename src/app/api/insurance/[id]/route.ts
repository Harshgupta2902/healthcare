import { NextRequest, NextResponse } from 'next/server'
import { deleteInsurance } from '@/features/admin/actions'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Insurance ID is required' },
        { status: 400 }
      )
    }

    const result = await deleteInsurance(id)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(
      { success: true, message: 'Insurance deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete insurance' },
      { status: 500 }
    )
  }
}
