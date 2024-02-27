import { deleteTransaction } from '@/app/actions'
import { dbService } from '@/app/services/dbService'
import ButtonIcon from '@/components/ButtonIcon/ButtonIcon'
import PageHeader from '@/components/PageHeader/PageHeader'
import TransactionManagementForm from '@/components/transactions/TransactionManagementForm/TransactionManagementForm'
import { db } from '@/utils/db'
import { Grid } from '@radix-ui/themes'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Edit Transaction',
}

type EditTransactionPageProps = {
  params: { id: string }
  searchParams: { redirectFrom?: string }
}

const EditTransactionPage = async ({
  params,
  searchParams,
}: EditTransactionPageProps) => {
  // @TODO Validate user
  const transaction = await db.transaction.findUnique({
    where: { id: params.id },
    include: { category: true },
  })

  const categories = await dbService.getCategories()

  if (!transaction) {
    return notFound()
  }

  const cancelLinkUrl = searchParams.redirectFrom ?? '/app'

  return (
    <>
      <PageHeader>Edit transaction</PageHeader>

      <ButtonIcon type="back" label="Go back" href={cancelLinkUrl} />

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

export default EditTransactionPage
