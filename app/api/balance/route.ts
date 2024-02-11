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
  const balances = await db.financeSourceHistory.findMany({
    where: {
      transaction: {
        date: {
          gte: new Date("2024-01-31"),
          lt: new Date("2024-05-01"),
        },
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
          updatedAt: "desc",
        },
      },
    ],
    include: {
      transaction: true,
    },
  });

  let precedingBalance = null;

  if (
    !balances.find((balance) => {
      return (
        balance?.transaction &&
        new Date(balance.transaction.date).getDate() === 1
      );
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

    if (mostRecentTransaction) {
      const mostRecentBalance = await db.financeSourceHistory.findFirst({
        where: {
          transactionId: mostRecentTransaction.id,
        },
      });

      precedingBalance = mostRecentBalance;
    }
  }

  return NextResponse.json({
    totalBalance: balances[balances.length - 1]?.balance ?? 0,
    balances,
    precedingBalance,
  });
}
