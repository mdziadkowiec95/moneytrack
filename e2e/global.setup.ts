import { db } from '@/utils/db'
import { test } from '@playwright/test'
import { USERS } from '@/e2e/utils/users'

async function setupDefaultDataInDB() {
  try {
    let testUser = await db.user.findUnique({
      where: {
        email: USERS.STANDARD.email,
      },
    })

    if (!testUser) {
      // create user
      testUser = await db.user.create({
        data: {
          email: USERS.STANDARD.email,
          username: USERS.STANDARD.username,
          password: USERS.STANDARD.password,
          firstName: USERS.STANDARD.firstName,
          lastName: USERS.STANDARD.lastName,
        },
      })
    }

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

  await setupDefaultDataInDB()

  console.log('Setup "Default Cash Account" account finished!')
})
