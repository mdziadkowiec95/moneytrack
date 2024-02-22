import { getAuthServerSession } from '@/utils/auth'
import { db } from '@/utils/db'

export const dbService = {
  getTransactions: async ({
    take = 10,
    financeSourceId,
  }: {
    take?: number
    financeSourceId?: string
  } = {}) => {
    const session = await getAuthServerSession()

    return db.transaction.findMany({
      where: {
        userId: session?.user.id,
        financeSourceId: financeSourceId,
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
        },
        take,
      }),
    ])
  },

  getCategories: async () => {
    return db.category.findMany()
  },
}
