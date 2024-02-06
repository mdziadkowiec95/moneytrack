import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  console.log("process.env.DATABASE_URL", process.env.DATABASE_URL);
  // @ts-expect-error
  if (!global.prisma) {
    // @ts-expect-error
    global.prisma = new PrismaClient();
  }
  // @ts-expect-error
  prisma = global.prisma;
}

export const db = prisma;
