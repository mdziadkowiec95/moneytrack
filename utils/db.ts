import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

require('dotenv').config()

console.log('process.env.DATABASE_URL', '' + process.env.DATABASE_URL)

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  // @ts-expect-error
  if (!global.prisma) {
    // @ts-expect-error
    global.prisma = new PrismaClient()
  }
  // @ts-expect-error
  prisma = global.prisma
}

export const db = prisma
