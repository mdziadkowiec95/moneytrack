import { TransactionType } from "@prisma/client";

export const calculateBalance = (
  currentBalance: number,
  amount: number,
  type: TransactionType
) => {
  if (type === TransactionType.INCOME) {
    return currentBalance + amount;
  }

  return currentBalance - amount;
};
