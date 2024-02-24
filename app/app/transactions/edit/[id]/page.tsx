import { deleteTransaction } from '@/app/actions'
import { dbService } from '@/app/services/dbService'
import TransactionManagementForm from '@/components/transactions/TransactionManagementForm/TransactionManagementForm'
import { db } from '@/utils/db'
import { Button, Grid } from '@radix-ui/themes'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Edit Transaction',
}

const EditTransaction = async ({ params }: { params: { id: string } }) => {
  // @TODO Validate user
  const transaction = await db.transaction.findUnique({
    where: { id: params.id },
    include: { category: true },
  })

  const categories = await dbService.getCategories()

  if (!transaction) {
    return notFound()
  }

  return (
    <>
      <Button asChild>
        <Link href="/app/transactions">Cancel</Link>
      </Button>
      <Grid className="py-6">
        <TransactionManagementForm
          initialData={transaction}
          categories={categories}
          onDelete={deleteTransaction}
        />
      </Grid>
    </>
  )
}

export default EditTransaction
