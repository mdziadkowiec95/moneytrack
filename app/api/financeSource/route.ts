import { db } from '@/utils/db'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '../utils/auth'

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)

  if (!user) {
    return NextResponse.json(
      {
        error: 'User not found',
      },
      {
        status: 404,
      }
    )
  }

  const accounts = await db.financeSource.findMany({
    where: {
      userId: user?.id,
    },
  })

  return NextResponse.json({
    accounts,
  })
}
