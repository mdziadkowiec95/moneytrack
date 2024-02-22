import { Category, Transaction } from '@prisma/client'

export type TransactionWithCategory = Transaction & {
  category: Category
}
