import { test } from '@playwright/test'
import { db } from '@/utils/db'
import { FinanceSource } from '@prisma/client'
import { USERS } from '@/e2e/utils/users'

async function cleanupAccounts() {
  try {
    const defaultAccount = (await db.financeSource.findFirst({
      where: {
        user: {
          email: USERS.STANDARD.email,
        },
      },
    })) as FinanceSource

    await db.financeSource.deleteMany({
      where: {
        user: {
          email: USERS.STANDARD.email,
        },
        id: {
          // Leave the default account
          not: defaultAccount.id,
        },
      },
    })

    await db.transaction.deleteMany()
  } catch (error) {
    console.error(error)
  }
}

test('[Playwright] Global Teardown', async () => {
  console.log('Clearing Accounts in Database')

  await cleanupAccounts()

  console.log('Clearing Accounts in Database finished!')
})
