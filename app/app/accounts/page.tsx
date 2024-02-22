import { getAuthServerSession } from '@/utils/auth'
import { db } from '@/utils/db'
import { FinanceSource, FinanceSourceType } from '@prisma/client'
import { Avatar, Button, Card, Flex, Grid, Text, Box } from '@radix-ui/themes'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'

import cashIcon from '@/assets/icons/cash.svg'
import investmentIcon from '@/assets/icons/investments.svg'
import bankIcon from '@/assets/icons/bank.svg'

const ACCOUNT_ICON_MAP = {
  CASH: cashIcon,
  INVESTMENT: investmentIcon,
  BANK_ACCOUNT: bankIcon,
} as const

const ACCOUNT_DISPLAY_NAME_MAP = {
  CASH: 'Cash',
  INVESTMENT: 'Investment',
  BANK_ACCOUNT: 'Bank account',
} as const

const AccountsPage = async () => {
  const session = await getAuthServerSession()

  if (!session?.user.id) {
    return redirect('/api/auth/signin')
  }

  const financeSources = (await db.financeSource.findMany({
    where: {
      userId: session.user.id,
    },
  })) as FinanceSource[]

  const getAccountTypeIcon = (type: FinanceSourceType) => ACCOUNT_ICON_MAP[type]
  const getAccountTypeDisplayName = (type: FinanceSourceType) =>
    ACCOUNT_DISPLAY_NAME_MAP[type]

  return (
    <div>
      <Grid columns="2">
        <Button asChild>
          <Link href="/app/transactions/addNew">Add account</Link>
        </Button>
        <Button asChild>
          <Link href="/app/">Dashboard</Link>
        </Button>
      </Grid>

      <Grid className="my-6" gap="2" columns="3">
        {financeSources.map((financeSource) => (
          <Card key={financeSource.id} asChild>
            <Link href={`/app/accounts/edit/${financeSource.id}`}>
              <Flex gap="3" align="center">
                <Image
                  src={getAccountTypeIcon(financeSource.type)}
                  width={40}
                  height={40}
                  className="rounded-full"
                  alt={financeSource?.name}
                />
                <Box>
                  <Text as="p" size="2" weight="bold">
                    {financeSource.name}
                  </Text>
                  <Text>{financeSource.currency}</Text>
                </Box>
                <Box className="ml-auto">
                  <Text as="p" size="2" color="gray">
                    {getAccountTypeDisplayName(financeSource.type)}
                  </Text>
                </Box>
              </Flex>
            </Link>
          </Card>
        ))}

        <Card key="add-new-account" asChild>
          <Link href={`/app/accounts/addNew`}>
            <Flex gap="3" align="center">
              <Avatar size="3" radius="full" fallback="+" />
              <Box>
                <Text as="p" size="2" weight="bold">
                  + Add new account
                </Text>
              </Box>
            </Flex>
          </Link>
        </Card>
      </Grid>
    </div>
  )
}

export default AccountsPage
