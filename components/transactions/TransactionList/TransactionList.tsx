'use client'

import type {
  Category,
  Currency,
  FinanceSource,
  Transaction,
} from '@prisma/client'
import React, { useEffect, useState } from 'react'
import TransactionItem from '@/components/transactions/TransactionItem/TransactionItem'
import TransactionFilters, {
  TransactionFilterFormData,
} from '../TransactionFilters/TransactionFilters'
import { Button } from '@radix-ui/themes'
import { apiServiceClient } from '@/app/services/apiServiceClient'

type TransactionListProps = {
  initialTransactions: (Transaction & {
    category: Pick<Category, 'id' | 'name' | 'displayName'>
    financeSource: Pick<FinanceSource, 'id' | 'currency'>
  })[]
  baseCurrency: Currency
  availableAccounts: FinanceSource[]
  onFiltersChange: (filters: TransactionFilterFormData) => void
}

const TransactionList = ({
  initialTransactions = [],
  baseCurrency,
  availableAccounts,
  onFiltersChange,
}: TransactionListProps) => {
  const [transactions, setTransactions] = useState<
    TransactionListProps['initialTransactions']
  >([])

  const [startFrom, setStartFrom] = useState(0)

  useEffect(() => {
    setTransactions(initialTransactions ?? [])
  }, [initialTransactions])

  useEffect(() => {
    if (startFrom === 0) return

    const fetchMoreTransactions = async () => {
      const newTransactions = await apiServiceClient.TRANSACTIONS.getPaginated({
        skip: startFrom,
      })

      setTransactions((prev) => [...prev, ...newTransactions])
    }

    fetchMoreTransactions()
  }, [startFrom])

  const onLoadMoreClick = () => {
    setStartFrom((prev) => prev + 5)
  }

  return (
    <div>
      <TransactionFilters
        availableAccounts={availableAccounts}
        onFiltersChange={onFiltersChange}
      />
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          {...transaction}
          baseCurrency={baseCurrency}
        />
      ))}

      <Button onClick={onLoadMoreClick}>Load more</Button>
    </div>
  )
}

export default TransactionList
