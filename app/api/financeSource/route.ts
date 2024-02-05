import { db } from "@/utils/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getAuthServerSession } from "@/utils/auth";

export async function GET(request: Request) {
  const session = await getAuthServerSession();

  console.log(session);

  const accounts = await db.financeSource.findMany({
    where: {
      userId: session?.user?.id,
    },
  });

  return NextResponse.json({
    accounts,
  });
}
