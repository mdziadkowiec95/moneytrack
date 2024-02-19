import { dbService } from '@/app/services/dbService'
import Transaction from '@/components/transactions/Transaction/Transaction'
import { getAuthServerSession } from '@/utils/auth'
import { Button, Grid } from '@radix-ui/themes'
import Link from 'next/link'
import { redirect } from 'next/navigation'

const Transactions = async () => {
  const session = await getAuthServerSession()

  if (!session?.user.id) {
    return redirect('/api/auth/signin')
  }

  const transactions = await dbService.getTransactions()

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
        {transactions.map((transaction) => (
          <Transaction key={transaction.id} {...transaction} />
        ))}
      </Grid>
    </>
  )
}

export default Transactions
