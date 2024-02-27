'use client'
import SectionHeader from '@/components/SectionHeader/SectionHeader'
import { useRouter } from 'next/navigation'
import React from 'react'

const TransactionWidgetHeader = () => {
  const router = useRouter()

  return (
    <SectionHeader
      onAddButtonClick={() => {
        router.push('/app/transactions/addNew?redirectFrom=/app')
      }}
    >
      Transactions history
    </SectionHeader>
  )
}

export default TransactionWidgetHeader
