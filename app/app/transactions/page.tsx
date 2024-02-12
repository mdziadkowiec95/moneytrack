import { getAuthServerSession } from '@/utils/auth'
import { db } from '@/utils/db'
import { Transaction, TransactionType } from '@prisma/client'
import { Avatar, Box, Button, Card, Flex, Grid, Text } from '@radix-ui/themes'
import Link from 'next/link'
import { redirect } from 'next/navigation'

const Transactions = async () => {
  const session = await getAuthServerSession()

  if (!session?.user.id) {
    return redirect('/api/auth/signin')
  }

  const transactions = (await db.transaction.findMany({
    where: { userId: session.user.id },
  })) as Transaction[]

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
          <Card key={transaction.id} asChild>
            <Link href={`/app/transactions/edit/${transaction.id}`}>
              <Flex gap="3" align="center">
                <Avatar size="3" radius="full" fallback="T" />
                <Box>
                  <Text as="p" size="2" weight="bold">
                    {transaction.title}
                  </Text>
                  <Text as="p" size="2" color="gray">
                    {transaction.type === TransactionType.INCOME ? '+' : '-'}{' '}
                    {transaction.amount} PLN
                  </Text>
                </Box>
              </Flex>
            </Link>
          </Card>
        ))}
      </Grid>
    </>
  )
}

export default Transactions
