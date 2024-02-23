import { db } from '@/utils/db'
import { User } from '@prisma/client'
import { test } from '@playwright/test'
import { USERS } from '@/e2e/utils/users'

async function setupDefaultAccount() {
  try {
    // Force type (assuming that we have this user in thest always)
    const testUser = (await db.user.findUnique({
      where: {
        email: USERS.STANDARD.email,
      },
    })) as User

    const existingAccount = await db.financeSource.findFirst({
      where: {
        userId: testUser.id,
        name: 'Default Cash Account',
        type: 'CASH',
      },
    })
    if (!existingAccount) {
      await db.financeSource.create({
        data: {
          userId: testUser.id,
          name: 'Default Cash Account',
          currency: 'PLN',
          type: 'CASH',
          balance: 0,
        },
      })
    }
  } catch (error) {
    console.error(error)
  }
}

test('Setup DB', async () => {
  console.log('Setup "Default Cash Account" account...')

  await setupDefaultAccount()

  console.log('Setup "Default Cash Account" account finished!')
})
