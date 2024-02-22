import { test } from '@playwright/test'
import { db } from '@/utils/db'

async function cleanupAccounts() {
  try {
    await db.financeSource.deleteMany({
      where: {
        user: {
          email: 'e2e_standard@mailinator.com',
        },
      },
    })
  } catch (error) {
    console.error(error)
  }
}

test('[Playwright] Global Teardown', async () => {
  console.log('Clearing Accounts in Database')

  await cleanupAccounts()

  console.log('Clearing Accounts in Database finished!')
})
