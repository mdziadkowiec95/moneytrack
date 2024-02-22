import { dbService } from '@/app/services/dbService'
import Transaction from '@/components/transactions/TransactionItem/TransactionItem'
import { getProfileBaseCurrency } from '@/utils/currency'
import { ArrowRightIcon } from '@radix-ui/react-icons'
import { Button, Card, Heading } from '@radix-ui/themes'
import Link from 'next/link'
import React from 'react'

const TransactionsWidget = async () => {
  const [count, lastTransactions] = await dbService.getTransactionsWithCount({
    take: 5,
  })

  const baseCurrency = await getProfileBaseCurrency()

  const showMoreButtonVisible = count > lastTransactions.length

  return (
    <Card size="2">
      <Heading size="4" className="mb-4">
        Transactions history
      </Heading>

      {lastTransactions.map((transaction) => (
        <Transaction
          key={transaction.id}
          {...transaction}
          baseCurrency={baseCurrency}
        />
      ))}

      {showMoreButtonVisible && (
        <Button variant="ghost" asChild className="flex items-center mt-4">
          <Link href="/app/transactions" scroll={false}>
            Show more
            <ArrowRightIcon width="18" height="18" />
          </Link>
        </Button>
      )}
    </Card>
  )
}

export default TransactionsWidget
