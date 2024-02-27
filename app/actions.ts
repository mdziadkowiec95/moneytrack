'use server'

import { getAuthServerSession } from '@/utils/auth'
import { db } from '@/utils/db'
import { Currency, FinanceSourceType, TransactionType } from '@prisma/client'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { addMilliseconds } from 'date-fns'
import { revalidateTag } from 'next/cache'
import { TransactionFilterFormData } from '@/components/transactions/TransactionFilters/TransactionFilters'

const baseTransactionSchema = z.object({
  title: z.string(),
  amount: z.number(),
  date: z.string(),
  type: z.enum([TransactionType.INCOME, TransactionType.OUTCOME]),
})

const addTransactionSchema = baseTransactionSchema

const editTransactionSchema = baseTransactionSchema.merge(
  z.object({
    id: z.string(),
  })
)

export async function addNewTransaction(formData: FormData) {
  const session = await getAuthServerSession()
  // @TODO try to type the user object in auth
  if (!session?.user.id) {
    throw new Error('User not authenticated')
  }

  const categoryId = Number(formData.get('categoryId') as string)

  const transaction = {
    title: formData.get('title') as string,
    amount: Number(formData.get('amount')),
    date: formData.get('date') as unknown as Date,
    type: formData.get('type') as TransactionType,
    categoryId: categoryId,
    financeSourceId: formData.get('financeSourceId') as string,
  }

  addTransactionSchema.parse(transaction) // Validate the transaction data

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
        date: 'desc',
      },
      {
        updatedAt: 'desc',
      },
      {
        createdAt: 'desc',
      },
    ],
    take: 1,
  })

  const [lastTransaction] = transactions

  // TODO - Should assume initial balance set when creating account for the default balance
  const balanceDelta =
    transaction.type === TransactionType.INCOME
      ? transaction.amount
      : -transaction.amount

  let balance = balanceDelta

  // If there is previous transaction THEN calculate the new balance based on the previous transaction balance
  if (lastTransaction && lastTransaction.financeSourceHistory) {
    balance = lastTransaction.financeSourceHistory?.balance + balanceDelta
  }

  const createNewTransactionQuery = db.transaction.create({
    data: {
      title: transaction.title,
      amount: transaction.amount,
      date: transaction.date,
      type: transaction.type,
      userId: session?.user.id,
      categoryId: categoryId,
      financeSourceId: transaction.financeSourceId,
      financeSourceHistory: {
        create: {
          financeSourceId: transaction.financeSourceId,
          balance,
          userId: session?.user.id,
        },
      },
    },
  })

  const balanceUpdateAction =
    transaction.type === TransactionType.INCOME ? 'increment' : 'decrement'

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
    })

  await db.$transaction([
    createNewTransactionQuery,
    updateAffectedFinanceSourceHistoryBalancesQuery,
  ])

  redirect('/app/transactions')
}

export async function updateTransaction(formData: FormData) {
  const session = await getAuthServerSession()

  // @TODO try to type the user object in auth
  if (!session?.user.id) {
    throw new Error('User not authenticated')
  }

  // @TODO Add validations
  const transaction = {
    id: formData.get('id') as string,
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    amount: Number(formData.get('amount')),
    date: formData.get('date') as unknown as Date,
    type: formData.get('type') as TransactionType,
    categoryId: Number(formData.get('categoryId') as string),
    financeSourceId: formData.get('financeSourceId') as string,
  }

  const transactionPreviousState = await db.transaction.findUnique({
    where: {
      id: transaction.id,
    },
    include: {
      financeSourceHistory: true,
    },
  })

  if (!transactionPreviousState) {
    throw new Error(`Transaction "${transaction.id}" not found`)
  }

  const balanceUpdateActionReverted =
    transactionPreviousState.type === TransactionType.INCOME
      ? 'decrement'
      : 'increment'

  const isMovigToTheFuture =
    new Date(transaction.date) > new Date(transactionPreviousState.date)
  const isMovigToThePast =
    new Date(transaction.date) < new Date(transactionPreviousState.date)
  const isUpdatingWithoutChangingDate =
    new Date(transaction.date).getTime() ===
    new Date(transactionPreviousState.date).getTime()

  editTransactionSchema.parse(transaction) // Validate the transaction data

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
          date: 'desc',
        },
        {
          updatedAt: 'desc',
        },
      ],
      take: 1,
    })

    const [lastTransaction] = transactions

    console.log({ lastTransaction })

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
        })

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
                ],
              },
            ],
          },
        },
        orderBy: [
          {
            transaction: {
              date: 'asc',
            },
          },
          {
            transaction: {
              updatedAt: 'asc',
            },
          },
          {
            transaction: {
              createdAt: 'asc',
            },
          },
        ],
        include: {
          transaction: true,
        },
      })

      const balancesDescending = balancesAscending.toReversed()

      const balanceDelta =
        transaction.type === TransactionType.INCOME
          ? transaction.amount
          : -transaction.amount

      const balanceDeltaReverted =
        transactionPreviousState.type === TransactionType.INCOME
          ? -transactionPreviousState.amount
          : transactionPreviousState.amount

      const [lastBalanceBeforeUpdate] = balancesDescending

      const updatedBalance =
        lastBalanceBeforeUpdate.balance + balanceDeltaReverted + balanceDelta

      const updateExisitingTransactionQuery = db.transaction.update({
        where: {
          id: transaction.id,
          userId: session?.user.id,
        },
        data: {
          id: transaction.id,
          // A workaround in case there are two transactions with the same date, and updatedAt. Then force the updatedAt to be one milisecond after the last transaction
          updatedAt: addMilliseconds(new Date(), 1),
          title: transaction.title,
          description: transaction.description,
          amount: transaction.amount,
          date: transaction.date,
          type: transaction.type,
          categoryId: transaction.categoryId,
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
      })

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
        })

      await db.$transaction([
        revertPreviousTransactionFromBlances,
        updateFutureBalancesAfterTheUpdatedTransactionDate,
        updateExisitingTransactionQuery,
      ])

      redirect(`/app/transactions`)
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
              ],
            },
          },
          data: {
            balance: {
              [balanceUpdateActionReverted]: transactionPreviousState.amount,
            },
          },
        })

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
            id: transactionPreviousState?.financeSourceHistory?.id,
          },
        },
        orderBy: [
          {
            transaction: {
              date: 'asc',
            },
          },
          {
            transaction: {
              updatedAt: 'asc',
            },
          },
          {
            transaction: {
              createdAt: 'asc',
            },
          },
        ],
      })

      const balancesDescending = balancesAscending.toReversed()

      const balanceDelta =
        transaction.type === TransactionType.INCOME
          ? transaction.amount
          : -transaction.amount

      const lastBalanceBeforeUpdate = balancesDescending?.[0]?.balance ?? 0
      const updatedBalance = lastBalanceBeforeUpdate + balanceDelta

      const updateExistingTransactionQuery = db.transaction.update({
        where: {
          id: transaction.id,
          userId: session?.user.id,
          financeSourceId: transaction.financeSourceId,
        },
        data: {
          id: transaction.id,
          // A workaround in case there are two transactions with the same date, and updatedAt. Then force the updatedAt to be one milisecond after the last transaction
          updatedAt: addMilliseconds(new Date(), 1),
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
      })

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
        })

      await db.$transaction([
        revertPreviousTransactionFromBlances,
        updateAffectedFutureFinanceSourceHistoryBalancesQuery,
        updateExistingTransactionQuery,
      ])
    }
  }
  // TODO - should redirect to transaction VIEW page
  redirect(`/app/transactions`)
}

export async function deleteTransaction(transactionId: string) {
  const session = await getAuthServerSession()
  // @TODO try to type the user object in auth
  if (!session?.user.id) {
    throw new Error('User not authenticated')
  }

  const transaction = await db.transaction.findUnique({
    where: {
      id: transactionId,
    },
    include: {
      financeSourceHistory: true,
    },
  })

  if (!transaction) {
    throw new Error(`Transaction "${transactionId}" not found`)
  }

  const balanceUpdateActionReverted =
    transaction.type === TransactionType.INCOME ? 'decrement' : 'increment'

  const revertPreviousTransactionFromBlances =
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
                  gt: transaction.updatedAt,
                },
              },
            },
          ],
        },
      },
      data: {
        balance: {
          [balanceUpdateActionReverted]: transaction.amount,
        },
      },
    })

  console.log({ transactionId })

  const deleteTransactionQuery = db.transaction.delete({
    where: {
      id: transactionId,
    },
    include: {
      financeSourceHistory: true,
    },
  })

  await db.$transaction([
    deleteTransactionQuery,
    revertPreviousTransactionFromBlances,
  ])
  revalidateTag('/app/transactions')
  redirect(`/app/transactions`)
}

export async function addNewAccount(formData: FormData) {
  const session = await getAuthServerSession()
  // @TODO try to type the user object in auth
  if (!session?.user.id) {
    throw new Error('User not authenticated')
  }

  const account = {
    name: formData.get('name') as string,
    financeSourceType: formData.get('financeSourceType') as FinanceSourceType,
    currency: formData.get('currency') as Currency,
  }

  await db.financeSource.create({
    data: {
      name: account.name,
      currency: account.currency,
      type: account.financeSourceType,
      balance: 0,
      userId: session?.user.id,
    },
  })

  redirect('/app/accounts')
}

export async function registerUser(formData: FormData) {
  const user = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
  }

  await db.user.create({
    data: {
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.email,
    },
  })

  redirect('/api/auth/signin')
}

export async function navigateTransactionsWithSearchParams(
  formData: TransactionFilterFormData
) {
  const params = new URLSearchParams()
  const accountId = formData.get('accountId')
  const searchQuery = formData.get('searchQuery')

  if (accountId) {
    params.set('accountId', accountId)
  }

  if (searchQuery) {
    params.set('searchQuery', searchQuery)
    params.delete('accountId')
  }

  redirect(`/app/transactions?${params.toString()}`)
}

export async function redirectTo() {
  redirect('/app/transactions/addNew')
}
