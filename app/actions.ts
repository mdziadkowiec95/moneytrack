"use server";

import { db } from "@/utils/db";
import { TransactionType } from "@prisma/client";
import { redirect } from "next/navigation";

export async function addNewTransaction(formData: FormData) {
  // @TODO Add validations
  const title = formData.get("title") as string;
  const amount = Number(formData.get("amount"));
  const date = formData.get("date") as unknown as Date;
  const type = formData.get("type") as TransactionType;

  await db.transaction.create({
    data: {
      title,
      type,
      amount,
      date,
    },
  });

  redirect("/transactions");
}
