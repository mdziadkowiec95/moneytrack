import { getAuthServerSession } from '@/utils/auth'
import { db } from '@/utils/db'
import { Session } from 'next-auth'

function getTransactions({
  session,
  financeSourceId,
  searchQuery,
  take = 10,
}: {
  session: Session | null
  financeSourceId?: string
  searchQuery?: string
  take?: number
}) {
  return db.transaction.findMany({
    where: {
      userId: session?.user.id,
      financeSourceId: financeSourceId,
      title: {
        contains: searchQuery,
        mode: 'insensitive',
      },
    },
    orderBy: {
      date: 'desc',
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          displayName: true,
        },
      },
      financeSource: {
        select: {
          id: true,
          currency: true,
        },
      },
    },
    take,
  })
}

type GetTransactionsOptions = {
  take?: number
  financeSourceId?: string
  searchQuery?: string
}

export const dbService = {
  getTransactions: async ({
    take = 10,
    financeSourceId,
    searchQuery,
  }: GetTransactionsOptions = {}) => {
    const session = await getAuthServerSession()

    return getTransactions({
      session,
      financeSourceId,
      searchQuery,
      take,
    })
  },

  getTransactionsWithCount: async ({
    take = 10,
    financeSourceId,
    searchQuery,
  }: GetTransactionsOptions = {}) => {
    const session = await getAuthServerSession()

    return db.$transaction([
      db.transaction.count({
        where: {
          userId: session?.user.id,
        },
      }),
      getTransactions({
        session,
        financeSourceId,
        searchQuery,
        take,
      }),
    ])
  },

  getCategories: async () => {
    return db.category.findMany()
  },
}
