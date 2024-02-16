import { db } from '@/utils/db'

console.log('[Playwright] Global Teardown')

cleanupDb()

async function cleanupDb() {
  try {
    await db.financeSource.deleteMany()
  } catch (error) {
    console.error(error)
  }
}
