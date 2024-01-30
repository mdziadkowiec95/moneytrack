import { db } from "@/utils/db";
import jwt from "jsonwebtoken";

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // @TODO add validation
  const { email, username, password, firstName, lastName } =
    await request.json();

  const createdUser = await db.user.create({
    data: {
      email,
      firstName,
      lastName,
      password,
      username: username ?? email,
    },
  });

  const token = jwt.sign(
    {
      user: {
        id: createdUser.id,
      },
    },
    "secret-jwt-here"
  );

  return NextResponse.json({
    user: {
      email,
      username: email,
      password,
      firstName,
      lastName,
    },
    token,
  });
}
