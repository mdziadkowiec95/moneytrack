import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

console.log('process.env.DATABASE_URL', '' + process.env.DATABASE_URL)

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  // @ts-expect-error - global is a NodeJS global
  if (!global.prisma) {
    // @ts-expect-error - global is a NodeJS global
    global.prisma = new PrismaClient()
  }
  // @ts-expect-error - global is a NodeJS global
  prisma = global.prisma
}

export const db = prisma
