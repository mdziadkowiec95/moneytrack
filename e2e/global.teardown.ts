import { test } from '@playwright/test'
import { db } from '@/utils/db'

async function cleanupAccounts() {
  try {
    await db.financeSource.deleteMany()
  } catch (error) {
    console.error(error)
  }
}

test('[Playwright] Global Teardown', async () => {
  console.log('Clearing Accounts in Database')

  await cleanupAccounts()

  console.log('Clearing Accounts in Database finished!')
})
