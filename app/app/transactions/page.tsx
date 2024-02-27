import { navigateTransactionsWithSearchParams } from '@/app/actions'
import { apiServiceServer } from '@/app/services/apiServiceServer'
import { dbService } from '@/app/services/dbService'
import PageHeader from '@/components/PageHeader/PageHeader'
import TransactionList from '@/components/transactions/TransactionList/TransactionList'
import { getAuthServerSession } from '@/utils/auth'
import { getProfileBaseCurrency } from '@/utils/currency'
import { Grid } from '@radix-ui/themes'
import type { NextPage, Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Transactions',
}

const Transactions: NextPage<{
  searchParams: {
    accountId?: string
    searchQuery?: string
  }
}> = async ({ searchParams }) => {
  const session = await getAuthServerSession()

  if (!session?.user.id) {
    return redirect('/api/auth/signin')
  }

  const [count, transactions] = await dbService.getTransactionsWithCount({
    financeSourceId: searchParams?.accountId,
    searchQuery: searchParams?.searchQuery,
    take: 5,
  })

  const baseCurrency = await getProfileBaseCurrency()
  const accounts = await apiServiceServer.ACCOUNT.getAll()

  return (
    <>
      <PageHeader>Your transactions</PageHeader>

      <Grid className="my-6" gap="2">
        <TransactionList
          initialTransactionsCount={count}
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
