"use server";

import { getAuthServerSession } from "@/utils/auth";
import { db } from "@/utils/db";
import { TransactionType } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";

const baseTransactionSchema = z.object({
  title: z.string(),
  amount: z.number(),
  date: z.string(),
  type: z.enum([TransactionType.INCOME, TransactionType.OUTCOME]),
});

const addTransactionSchema = baseTransactionSchema;

const editTransactionSchema = baseTransactionSchema.merge(
  z.object({
    id: z.string(),
  })
);

export async function addNewTransaction(formData: FormData) {
  const session = await getAuthServerSession();
  // @TODO try to type the user object in auth
  if (!session?.user.id) {
    throw new Error("User not authenticated");
  }

  const transaction = {
    title: formData.get("title") as string,
    amount: Number(formData.get("amount")),
    date: formData.get("date") as unknown as Date,
    type: formData.get("type") as TransactionType,
  };

  console.log("transaction date", transaction.date);

  addTransactionSchema.parse(transaction); // Validate the transaction data

  await db.transaction.create({
    data: {
      title: transaction.title,
      amount: transaction.amount,
      date: transaction.date,
      type: transaction.type,
      userId: session?.user.id,
    },
  });

  redirect("/app/transactions");
}

export async function updateTransaction(formData: FormData) {
  const session = await getAuthServerSession();

  // @TODO try to type the user object in auth
  if (!session?.user.id) {
    throw new Error("User not authenticated");
  }

  // @TODO Add validations
  const transaction = {
    id: formData.get("id") as string,
    title: formData.get("title") as string,
    amount: Number(formData.get("amount")),
    date: formData.get("date") as unknown as Date,
    type: formData.get("type") as TransactionType,
  };

  editTransactionSchema.parse(transaction); // Validate the transaction data

  if (transaction.id) {
    await db.transaction.update({
      where: {
        id: transaction.id,
        userId: session?.user.id,
      },
      data: {
        id: transaction.id,
        title: transaction.title,
        amount: transaction.amount,
        date: transaction.date,
        type: transaction.type,
      },
    });
  }
  // TODO - should redirect to transaction VIEW page
  redirect(`/app/transactions`);
}
