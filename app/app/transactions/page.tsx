import { navigateTransactionsWithSearchParams } from '@/app/actions'
import { apiServiceServer } from '@/app/services/apiServiceServer'
import { dbService } from '@/app/services/dbService'
import TransactionList from '@/components/transactions/TransactionList/TransactionList'
import { getAuthServerSession } from '@/utils/auth'
import { getProfileBaseCurrency } from '@/utils/currency'
import { Button, Grid } from '@radix-ui/themes'
import { NextPage } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const Transactions: NextPage<{
  searchParams: {
    accountId?: string
  }
}> = async ({ searchParams }) => {
  const session = await getAuthServerSession()

  console.log({ searchParams })

  if (!session?.user.id) {
    return redirect('/api/auth/signin')
  }

  const transactions = await dbService.getTransactions({
    financeSourceId: searchParams?.accountId,
  })

  const baseCurrency = await getProfileBaseCurrency()
  const accounts = await apiServiceServer.ACCOUNT.getAll()

  return (
    <>
      <Grid columns="2">
        <Button asChild>
          <Link href="/app/transactions/addNew">Add transaction</Link>
        </Button>
        <Button asChild>
          <Link href="/app/">Dashboard</Link>
        </Button>
      </Grid>

      <Grid className="my-6" gap="2">
        <TransactionList
          initialTransactions={transactions}
          baseCurrency={baseCurrency}
          availableAccounts={accounts}
          onFiltersChange={navigateTransactionsWithSearchParams}
        />
      </Grid>
    </>
  )
}

export default Transactions
