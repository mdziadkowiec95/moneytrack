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

  useEffect(() => {
    setTransactions(initialTransactions ?? [])
  }, [initialTransactions])

  console.log('availableAccounts', availableAccounts)

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
    </div>
  )
}

export default TransactionList
