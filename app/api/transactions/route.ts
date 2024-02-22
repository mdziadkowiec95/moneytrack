import { db } from '@/utils/db'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthServerSession } from '@/utils/auth'

export async function GET(request: NextRequest) {
  const session = await getAuthServerSession()

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: 'User not authenticated',
      },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get('accountId') ?? undefined
  const skip = Number(searchParams.get('skip')) || 0
  const take = 5

  const transactions = await db.transaction.findMany({
    where: {
      userId: session?.user?.id,
      financeSourceId: accountId,
    },
    skip,
    take,
    include: {
      financeSource: true,
      category: true,
    },
  })

  return NextResponse.json({
    transactions,
  })
}
