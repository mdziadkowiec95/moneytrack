import { dbService } from '@/app/services/dbService'
import ButtonIcon from '@/components/ButtonIcon/ButtonIcon'
import PageHeader from '@/components/PageHeader/PageHeader'
import TransactionManagementForm from '@/components/transactions/TransactionManagementForm/TransactionManagementForm'
import { Grid } from '@radix-ui/themes'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Add new transaction',
}

type AddNewPageProps = {
  searchParams: {
    redirectFrom?: string
  }
}

const AddNewPage = async ({ searchParams }: AddNewPageProps) => {
  const categories = await dbService.getCategories()

  const cancelLinkUrl = searchParams.redirectFrom ?? '/app'

  return (
    <>
      <PageHeader>Add new transaction</PageHeader>

      <ButtonIcon type="back" label="Go back" href={cancelLinkUrl} />

      <Grid className="py-6">
        <TransactionManagementForm categories={categories} />
      </Grid>
    </>
  )
}

export default AddNewPage
