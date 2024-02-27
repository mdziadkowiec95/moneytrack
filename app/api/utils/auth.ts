import { db } from '@/utils/db'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const secret = 'secret-jwt-here'

type UserPayload = {
  user: { id: string }
}

export function signToken(payload: UserPayload) {
  return jwt.sign(payload, secret)
}

export function verifyToken(token: string) {
  return jwt.verify(token, secret) as UserPayload | null
}

export async function getAuthUser(request: NextRequest) {
  const authToken = request.headers.get('x-auth-token')

  const decodedUser = authToken ? verifyToken(authToken) : null

  if (!decodedUser) {
    return null
  }

  return await db.user.findUnique({
    where: {
      id: decodedUser.user.id,
    },
  })
}
