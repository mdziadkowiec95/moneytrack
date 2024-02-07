"use server";

import { getAuthServerSession } from "@/utils/auth";
import { db } from "@/utils/db";
import {
  FinanceSource,
  FinanceSourceType,
  TransactionType,
} from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";
import { add, sub } from "date-fns";
import { calculateBalance } from "@/utils/transactions";

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
    financeSourceId: formData.get("financeSourceId") as string,
  };

  addTransactionSchema.parse(transaction); // Validate the transaction data

  const transactions = await db.transaction.findMany({
    where: {
      date: {
        lte: new Date(transaction.date),
      },
    },
    include: {
      financeSourceHistory: true,
    },
    orderBy: [
      {
        date: "desc",
      },
      {
        updatedAt: "desc",
      },
    ],
    take: 1,
  });

  console.log({ transactions });

  const [lastTransaction] = transactions;

  // TODO - Should assume initial balance set when creating account for the default balance
  let balanceDelta =
    transaction.type === TransactionType.INCOME
      ? transaction.amount
      : -transaction.amount;

  let balance = balanceDelta;

  // If there is previous transaction THEN calculate the new balance based on the previous transaction balance
  if (lastTransaction) {
    balance = lastTransaction.financeSourceHistory?.balance + balanceDelta;
  }

  const createNewTransactionQuery = db.transaction.create({
    data: {
      title: transaction.title,
      amount: transaction.amount,
      date: transaction.date,
      type: transaction.type,
      userId: session?.user.id,
      financeSourceId: transaction.financeSourceId,
      financeSourceHistory: {
        create: {
          financeSourceId: transaction.financeSourceId,
          balance,
          userId: session?.user.id,
        },
      },
    },
  });

  const balanceUpdateAction =
    transaction.type === TransactionType.INCOME ? "increment" : "decrement";

  const updateAffectedFinanceSourceHistoryBalancesQuery =
    db.financeSourceHistory.updateMany({
      where: {
        financeSourceId: transaction.financeSourceId,
        transaction: {
          date: {
            gt: new Date(transaction.date),
          },
        },
      },
      data: {
        balance: {
          [balanceUpdateAction]: transaction.amount,
        },
      },
    });

  await db.$transaction([
    createNewTransactionQuery,
    updateAffectedFinanceSourceHistoryBalancesQuery,
  ]);

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
    description: formData.get("description") as string,
    amount: Number(formData.get("amount")),
    date: formData.get("date") as unknown as Date,
    type: formData.get("type") as TransactionType,
    financeSourceId: formData.get("financeSourceId") as string,
  };
  console.log({ transaction });

  editTransactionSchema.parse(transaction); // Validate the transaction data

  // TODO - Update history balance
  if (transaction.id) {
    const transactions = await db.transaction.findMany({
      where: {
        date: {
          lte: new Date(transaction.date),
        },
        id: {
          not: transaction.id,
        },
      },
      include: {
        financeSourceHistory: true,
      },
      orderBy: [
        {
          date: "desc",
        },
        {
          updatedAt: "desc",
        },
      ],
      take: 1,
    });

    const [lastTransaction] = transactions;

    console.log({ lastTransaction });

    // TODO - Should assume initial balance set when creating account for the default balance
    let balanceDelta =
      transaction.type === TransactionType.INCOME
        ? transaction.amount
        : -transaction.amount;

    let balance = balanceDelta;

    // If there is previous transaction THEN calculate the new balance based on the previous transaction balance
    if (lastTransaction) {
      console.log(
        "lastTransaction.financeSourceHistory?.balance",
        lastTransaction.financeSourceHistory?.balance
      );
      console.log("balanceDelta", balanceDelta);
      balance = lastTransaction.financeSourceHistory?.balance + balanceDelta;
    }

    console.log("all", await db.transaction.findMany());
    console.log("all his", await db.financeSourceHistory.findMany());

    const updateExistingTransactionQuery = db.transaction.update({
      where: {
        id: transaction.id,
        userId: session?.user.id,
      },
      data: {
        id: transaction.id,
        title: transaction.title,
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        type: transaction.type,
        financeSourceId: transaction.financeSourceId,
        financeSourceHistory: {
          update: {
            where: {
              transactionId: transaction.id,
            },
            data: {
              balance,
            },
          },
        },
      },
    });

    const balanceUpdateAction =
      transaction.type === TransactionType.INCOME ? "increment" : "decrement";

    const updateAffectedFinanceSourceHistoryBalancesQuery =
      db.financeSourceHistory.updateMany({
        where: {
          financeSourceId: transaction.financeSourceId,
          transaction: {
            date: {
              gte: new Date(transaction.date),
            },
            id: {
              not: transaction.id,
            },
          },
        },
        data: {
          balance: {
            [balanceUpdateAction]: transaction.amount,
          },
        },
      });

    await db.$transaction([
      updateExistingTransactionQuery,
      updateAffectedFinanceSourceHistoryBalancesQuery,
    ]);
  }
  // TODO - should redirect to transaction VIEW page
  redirect(`/app/transactions`);
}

export async function addNewAccount(formData: FormData) {
  const session = await getAuthServerSession();
  // @TODO try to type the user object in auth
  if (!session?.user.id) {
    throw new Error("User not authenticated");
  }

  const account = {
    name: formData.get("name") as string,
    financeSourceType: formData.get("financeSourceType") as FinanceSourceType,
  };

  await db.financeSource.create({
    data: {
      name: account.name,
      currency: "PLN",
      type: account.financeSourceType,
      balance: 0,
      userId: session?.user.id,
      // financeSourceHistories: {
      //   create: {
      //     balance: 0,
      //     userId: session?.user.id,
      //   },
      // },
    },
  });

  redirect("/app/accounts");
}
