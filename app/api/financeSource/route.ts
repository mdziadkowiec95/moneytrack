import { db } from '@/utils/db'
import { NextResponse } from 'next/server'
import { getAuthServerSession } from '@/utils/auth'

export async function GET() {
  const session = await getAuthServerSession()

  console.log(session)

  const accounts = await db.financeSource.findMany({
    where: {
      userId: session?.user?.id,
    },
  })

  return NextResponse.json({
    accounts,
  })
}
