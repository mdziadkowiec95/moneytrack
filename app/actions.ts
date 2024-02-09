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
import { addMilliseconds } from "date-fns";

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
      {
        createdAt: "desc",
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

  console.log({ lastTransaction, balanceDelta });

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

  const transactionPreviousState = await db.transaction.findUnique({
    where: {
      id: transaction.id,
    },
  });

  const balanceUpdateAction =
    transaction.type === TransactionType.INCOME ? "increment" : "decrement";

  const balanceUpdateActionReverted =
    transactionPreviousState.type === TransactionType.INCOME
      ? "decrement"
      : "increment";

  console.log({ transactionPreviousState });

  const isMovigToTheFuture =
    new Date(transaction.date) > new Date(transactionPreviousState.date);
  const isMovigToThePast =
    new Date(transaction.date) < new Date(transactionPreviousState.date);
  const isUpdatingWithoutChangingDate =
    new Date(transaction.date).getTime() ===
    new Date(transactionPreviousState.date).getTime();

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

    // SCENARIO 1 - moving to the future
    if (isMovigToTheFuture || isUpdatingWithoutChangingDate) {
      // 2. Update all transactions after the transaction date (revert change)
      const revertPreviousTransactionFromBlances =
        db.financeSourceHistory.updateMany({
          where: {
            financeSourceId: transaction.financeSourceId,
            transaction: {
              OR: [
                {
                  date: {
                    gt: new Date(transactionPreviousState.date),
                  },
                },
                {
                  date: {
                    equals: new Date(transactionPreviousState.date),
                  },
                  AND: {
                    updatedAt: {
                      gt: transactionPreviousState.updatedAt,
                    },
                  },
                },
                {
                  date: {
                    equals: new Date(transactionPreviousState.date),
                  },
                  AND: {
                    updatedAt: {
                      equals: transactionPreviousState.updatedAt,
                    },
                    AND: {
                      createdAt: {
                        gt: transactionPreviousState.createdAt,
                      },
                    },
                  },
                },
              ],
              id: {
                not: transaction.id,
              },
            },
          },
          data: {
            balance: {
              [balanceUpdateActionReverted]: transactionPreviousState.amount,
            },
          },
        });

      // 3. Insert the updated transaction with the new balance (take the last balance before the new transaction date)
      // FIND last balance which will be the one before the new inserted transaction
      const balancesAscending = await db.financeSourceHistory.findMany({
        where: {
          transaction: {
            OR: [
              {
                date: {
                  lt: new Date(transaction.date),
                },
              },
              {
                date: {
                  equals: new Date(transaction.date),
                },
                AND: {
                  updatedAt: {
                    lt: new Date(Date.now()),
                  },
                },
              },
              {
                date: {
                  equals: new Date(transaction.date),
                },
                AND: [
                  {
                    updatedAt: {
                      equals: new Date(Date.now()),
                    },
                  },
                  // Not needed? We take care to make sure the updated transaction has one milisecond more than the last transaction for "updatedAt" field
                  // {
                  //   createdAt: {
                  //     lt: new Date(Date.now()),
                  //   },
                  // },
                ],
              },
            ],
          },
          NOT: {
            id: transactionPreviousState.financeSourceHistoryId,
          },
        },
        orderBy: [
          {
            transaction: {
              date: "asc",
            },
          },
          {
            transaction: {
              updatedAt: "asc",
            },
          },
          {
            transaction: {
              createdAt: "asc",
            },
          },
        ],
      });

      const balancesDescending = balancesAscending.toReversed();

      let balanceDelta =
        transaction.type === TransactionType.INCOME
          ? transaction.amount
          : -transaction.amount;

      const balanceDeltaReverted =
        transactionPreviousState.type === TransactionType.INCOME
          ? -transactionPreviousState.amount
          : transactionPreviousState.amount;

      const [lastBalanceBeforeUpdate] = balancesDescending;

      const updatedBalance =
        lastBalanceBeforeUpdate.balance + balanceDeltaReverted + balanceDelta;

      console.log({
        transactionPreviousState,
        lastBalanceBeforeUpdate,
        balanceDelta,
        balanceDeltaReverted,
        updatedBalance,
      });

      const updateExisitingTransactionQuery = db.transaction.update({
        where: {
          id: transaction.id,
          userId: session?.user.id,
        },
        data: {
          id: transaction.id,
          // A workaround in case there are two transactions with the same date, and updatedAt. Then force the updatedAt to be one milisecond after the last transaction
          updatedAt: addMilliseconds(
            lastBalanceBeforeUpdate?.transaction?.date || new Date(),
            1
          ),
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
                balance: updatedBalance,
              },
            },
          },
        },
      });

      // 4. Update all the transactions after the new transaction date to reflect the new amount difference
      const updateFutureBalancesAfterTheUpdatedTransactionDate =
        db.financeSourceHistory.updateMany({
          where: {
            userId: session?.user.id,
            financeSourceId: transaction.financeSourceId,
            transaction: {
              date: {
                gt: new Date(transaction.date),
              },
              id: {
                not: transaction.id,
              },
            },
          },
          data: {
            balance: {
              increment: balanceDelta,
            },
          },
        });

      const result = await db.$transaction([
        revertPreviousTransactionFromBlances,
        updateFutureBalancesAfterTheUpdatedTransactionDate,
        updateExisitingTransactionQuery,
      ]);

      return result;
    }

    // SCENARIO 3 - moving to the past
    if (isMovigToThePast) {
      // 1. Update all transactions after the transaction date (revert change)

      const revertPreviousTransactionFromBlances =
        db.financeSourceHistory.updateMany({
          where: {
            financeSourceId: transaction.financeSourceId,
            transaction: {
              OR: [
                {
                  date: {
                    gt: new Date(transactionPreviousState.date),
                  },
                },
                {
                  date: {
                    equals: new Date(transactionPreviousState.date),
                  },
                  AND: {
                    updatedAt: {
                      gt: transactionPreviousState.updatedAt,
                    },
                  },
                },
                // {
                //   date: {
                //     equals: new Date(transactionPreviousState.date),
                //   },
                //   AND: {
                //     updatedAt: {
                //       equals: transactionPreviousState.updatedAt,
                //     },
                //   },
                // },
              ],
            },
          },
          data: {
            balance: {
              [balanceUpdateActionReverted]: transactionPreviousState.amount,
            },
          },
        });

      const balancesAscending = await db.financeSourceHistory.findMany({
        where: {
          transaction: {
            OR: [
              {
                date: {
                  lt: new Date(transaction.date),
                },
              },
              {
                date: {
                  equals: new Date(transaction.date),
                },
                AND: {
                  updatedAt: {
                    lt: new Date(Date.now()),
                  },
                },
              },
            ],
          },
          NOT: {
            id: transactionPreviousState.financeSourceHistoryId,
          },
        },
        orderBy: [
          {
            transaction: {
              date: "asc",
            },
          },
          {
            transaction: {
              updatedAt: "asc",
            },
          },
          {
            transaction: {
              createdAt: "asc",
            },
          },
        ],
      });

      const balancesDescending = balancesAscending.toReversed();

      let balanceDelta =
        transaction.type === TransactionType.INCOME
          ? transaction.amount
          : -transaction.amount;

      const lastBalanceBeforeUpdate = balancesDescending?.[0]?.balance ?? 0;
      const updatedBalance = lastBalanceBeforeUpdate + balanceDelta;

      console.log({ lastBalanceBeforeUpdate, balanceDelta, updatedBalance });

      const updateExistingTransactionQuery = db.transaction.update({
        where: {
          id: transaction.id,
          userId: session?.user.id,
        },
        data: {
          id: transaction.id,
          // A workaround in case there are two transactions with the same date, and updatedAt. Then force the updatedAt to be one milisecond after the last transaction
          updatedAt: addMilliseconds(
            lastBalanceBeforeUpdate?.transaction?.date || new Date(),
            1
          ),
          title: transaction.title,
          description: transaction.description,
          amount: transaction.amount,
          date: transaction.date,
          type: transaction.type,
          financeSourceId: transaction.financeSourceId,
          financeSourceHistory: {
            update: {
              balance: updatedBalance,
            },
          },
        },
      });

      const updateAffectedFutureFinanceSourceHistoryBalancesQuery =
        db.financeSourceHistory.updateMany({
          where: {
            financeSourceId: transaction.financeSourceId,
            transaction: {
              OR: [
                {
                  date: {
                    gt: new Date(transaction.date),
                  },
                },
                {
                  date: {
                    equals: new Date(transaction.date),
                  },
                  AND: {
                    updatedAt: {
                      gt: new Date(Date.now()),
                    },
                  },
                },
              ],

              NOT: {
                id: transactionPreviousState.id,
              },
            },
          },
          data: {
            balance: {
              increment: balanceDelta,
            },
          },
        });

      const result = await db.$transaction([
        revertPreviousTransactionFromBlances,
        updateAffectedFutureFinanceSourceHistoryBalancesQuery,
        updateExistingTransactionQuery,
      ]);

      console.log({ result });

      // 2. // Insert updated balance (get context from the last transaction before the new transaction date OR assume 0).

      // 3. Update all the transactions after the new transaction date to reflect the new amount difference
      return;
    }

    // console.log({ transactionResult });
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
