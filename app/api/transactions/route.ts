import { db } from '@/utils/db'
import { NextResponse } from 'next/server'
import { getAuthServerSession } from '@/utils/auth'

export async function GET() {
  const session = await getAuthServerSession()

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: 'User not authenticated',
      },
      { status: 401 }
    )
  }

  const transactions = await db.transaction.findMany({
    where: {
      userId: session?.user?.id,
    },
  })

  return NextResponse.json({
    transactions,
  })
}
