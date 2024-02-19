import { getAuthServerSession } from '@/utils/auth'
import { db } from '@/utils/db'

export const dbService = {
  getTransactions: async ({ take = 10 } = {}) => {
    const session = await getAuthServerSession()

    return db.transaction.findMany({
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
