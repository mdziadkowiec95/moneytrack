import { dbService } from '@/app/services/dbService'
import TransactionManagementForm from '@/components/transactions/TransactionManagementForm/TransactionManagementForm'
import { Button, Grid } from '@radix-ui/themes'
import Link from 'next/link'

const AddNew = async () => {
  const categories = await dbService.getCategories()

  return (
    <>
      <Button asChild>
        <Link href="/app/transactions">Cancel</Link>
      </Button>

      <Grid className="py-6">
        <TransactionManagementForm categories={categories} />
      </Grid>
    </>
  )
}

export default AddNew
