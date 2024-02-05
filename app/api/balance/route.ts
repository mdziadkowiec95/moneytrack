import { db } from "@/utils/db";
import { NextResponse } from "next/server";
import { getAuthServerSession } from "@/utils/auth";
import {
  FinanceSource,
  FinanceSourceHistory,
  Transaction,
  TransactionType,
} from "@prisma/client";

export async function GET(request: Request) {
  const session = await getAuthServerSession();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: "User not authenticated",
      },
      { status: 401 }
    );
  }

  // TODO - Get the date range from the request. For now, we'll hardcode it
  // TODO - Support getting most updated balance for each month in the year. (12 months, 6 monts, 3 months, 1 month)

  // Get only the last transaction for each date in the range
  const transactionsInDateRange = (await db.$queryRaw`
    SELECT t.id, t.date
    FROM "Transaction" t
    INNER JOIN (
      SELECT DATE(date) as date, MAX(date) as max_date
      FROM "Transaction"
      WHERE date >= ${new Date("2024-02-01")} AND date < ${new Date(
    "2024-05-01"
  )}
      GROUP BY DATE(date)
    ) subq ON t.date = subq.max_date
    ORDER BY t.date DESC
  `) as Pick<Transaction, "id" | "date">[];

  const transactionIds = transactionsInDateRange.map(
    (transaction) => transaction.id
  );

  console.log({ transactionIds });

  const balances = (await db.financeSourceHistory.findMany({
    where: {
      transactionId: {
        in: transactionIds,
      },
    },
    include: {
      transaction: true,
    },
  })) as FinanceSourceHistory[];

  let precedingBalance = null;

  if (
    !balances.find((balance) => {
      return new Date(balance.transaction.date).getDate() === 1;
    })
  ) {
    // Get the most recent transaction before "2024-02-01" date

    const mostRecentTransactionData = await db.transaction.findMany({
      where: {
        date: {
          lt: new Date("2024-02-01"),
        },
        userId: session.user.id,
      },
      orderBy: {
        date: "desc",
      },
      take: 1,
    });

    const [mostRecentTransaction] = mostRecentTransactionData;

    console.log({
      mostRecentTransaction,
    });

    if (mostRecentTransaction) {
      const mostRecentBalance = await db.financeSourceHistory.findFirst({
        where: {
          transactionId: mostRecentTransaction.id,
        },
      });

      console.log({ mostRecentBalance });
      precedingBalance = mostRecentBalance;
    }
  }

  return NextResponse.json({
    totalBalance: balances[balances.length - 1]?.balance ?? 0,
    balances,
    precedingBalance,
  });
}
