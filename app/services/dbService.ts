import { getAuthServerSession } from '@/utils/auth'
import { db } from '@/utils/db'

export const dbService = {
  getTransactions: async ({
    take = 10,
    financeSourceId,
    searchQuery,
  }: {
    take?: number
    financeSourceId?: string
    searchQuery?: string
  } = {}) => {
    const session = await getAuthServerSession()

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
  },

  getTransactionsWithCount: async ({ take = 10 }) => {
    const session = await getAuthServerSession()

    return db.$transaction([
      db.transaction.count(),
      db.transaction.findMany({
        where: {
          userId: session?.user.id,
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
      }),
    ])
  },

  getCategories: async () => {
    return db.category.findMany()
  },
}
