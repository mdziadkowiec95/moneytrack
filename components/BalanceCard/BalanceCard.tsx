import { getAuthServerSession } from '@/utils/auth'
import { db } from '@/utils/db'
import { Avatar, Box, Card, Flex, Text } from '@radix-ui/themes'
import { redirect } from 'next/navigation'
import React from 'react'

export const BalanceCard = async () => {
  const session = await getAuthServerSession()

  if (!session?.user.id) {
    return redirect('/api/auth/signin')
  }

  const [mostRecentBalance] = await db.financeSourceHistory.findMany({
    where: {
      financeSource: {
        userId: session.user.id,
      },
    },
    orderBy: [
      {
        transaction: {
          date: 'desc',
        },
      },
      {
        transaction: {
          updatedAt: 'desc',
        },
      },
    ],
    take: 1,
  })

  // TODO - should be the sum of the balances for each account here
  const recentBalance = mostRecentBalance ? mostRecentBalance.balance : 0

  // Localize the currency
  // Pass proper locale to the constructor
  const formattedBalance = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'PLN',
  }).format(recentBalance)

  return (
    <Card size="3" data-testid="balance-card">
      <Flex gap="4" justify="center" align="center">
        <Avatar size="5" radius="full" fallback="$" color="indigo" />
        <Box>
          <Text as="div" size="4" weight="bold">
            Current balance
          </Text>
          <Text as="div" size="4" color="gray">
            {formattedBalance}
          </Text>
        </Box>
      </Flex>
    </Card>
  )
}
