import { db } from '@/utils/db'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  const user = await db.user.findFirst({
    where: {
      email,
      password,
    },
  })

  if (!user) {
    return NextResponse.json(
      {
        error: `User does not exist ${email}`,
      },
      {
        status: 404,
      }
    )
  }

  const token = jwt.sign(
    {
      user: {
        id: user.id,
      },
    },
    'secret-jwt-here'
  )

  console.log(' POST login')

  //   "user": {
  //     "id": 1,
  //     "username": "john.doe@mailinator.com",
  //     "email": "john.doe@mailinator.com",
  //     "fullname": "John Doe",
  //     "role": "SUPER",
  //     "createdAt": "2021-05-30T06:45:19.000Z",
  //     "name": "John Doe"
  // },
  return NextResponse.json({
    user,
    token,
  })
}
