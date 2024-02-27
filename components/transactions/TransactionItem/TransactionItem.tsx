'use client'

import type {
  Category,
  Currency,
  FinanceSource,
  Transaction,
} from '@prisma/client'
import {
  Avatar,
  Box,
  Card,
  Flex,
  Grid,
  IconButton,
  Text,
  Tooltip,
} from '@radix-ui/themes'
import Image from 'next/image'

import homeIcon from '@/assets/icons/home.svg'
import carIcon from '@/assets/icons/car.svg'
import electronicsIcon from '@/assets/icons/electronics.svg'
import financialOutlaysIcon from '@/assets/icons/financial-outlays.svg'
import healthIcon from '@/assets/icons/health.svg'
import incomeIcon from '@/assets/icons/income.svg'
import investmentsIcon from '@/assets/icons/investments.svg'
import restIcon from '@/assets/icons/rest.svg'
import shoppingIcon from '@/assets/icons/shopping.svg'
import transportIcon from '@/assets/icons/transport.svg'
import Link from 'next/link'
import { formatCurrency, formatCurrencyWithConversion } from '@/utils/currency'
import { InfoCircledIcon } from '@radix-ui/react-icons'

type TransactionProps = Pick<
  Transaction,
  'id' | 'title' | 'date' | 'amount'
> & {
  category: Pick<Category, 'id' | 'name' | 'displayName'>
  financeSource: Pick<FinanceSource, 'id' | 'currency'>
  baseCurrency: Currency
  cardSize?: 'small' | 'large'
  currentUrl: string
}

const categoryIconMap = {
  home: homeIcon,
  car: carIcon,
  electronics: electronicsIcon,
  financialOutlays: financialOutlaysIcon,
  health: healthIcon,
  income: incomeIcon,
  investments: investmentsIcon,
  rest: restIcon,
  shopping: shoppingIcon,
  transport: transportIcon,
}

const getCategoryIcon = (name: string) => {
  return categoryIconMap[name as keyof typeof categoryIconMap]
}

const Transaction = ({
  id,
  title,
  date,
  amount,
  category,
  financeSource: { currency },
  baseCurrency,
  cardSize = 'large',
  currentUrl,
}: TransactionProps) => {
  const categoryIcon = getCategoryIcon(category.name) || homeIcon

  const isBaseCurrency = currency === baseCurrency

  const visibleAmount = !isBaseCurrency
    ? formatCurrencyWithConversion(currency, baseCurrency, amount)
    : formatCurrency(currency, amount)

  const conversionMessage =
    !isBaseCurrency && `Converted from ${formatCurrency(currency, amount)}`

  return (
    <Card
      className="my-1"
      variant="ghost"
      asChild
      size={cardSize === 'large' ? '4' : '1'}
    >
      <Link href={`/app/transactions/edit/${id}?redirectFrom=${currentUrl}`}>
        <Flex gap="2" align="center">
          {categoryIcon && (
            <Image
              src={categoryIcon}
              width={40}
              height={40}
              className="rounded-full"
              alt={category?.name}
            />
          )}
          {!categoryIcon && (
            <Avatar
              size="3"
              src="https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?&w=64&h=64&dpr=2&q=70&crop=focalpoint&fp-x=0.67&fp-y=0.5&fp-z=1.4&fit=crop"
              radius="full"
              fallback="T"
            />
          )}
          <Box>
            <Text as="div" size="2" weight="bold">
              {title}
            </Text>
            <Text as="div" size="1" color="gray">
              {date?.toLocaleString()}
            </Text>
          </Box>
          <Grid className="ml-auto self-center" columns="1fr 32px">
            <Text
              as="div"
              size="1"
              weight="bold"
              className="col-start-1 col-span-1"
            >
              {visibleAmount}
            </Text>
            {!isBaseCurrency && (
              <Tooltip content={conversionMessage}>
                <IconButton
                  size="2"
                  variant="ghost"
                  radius="full"
                  className="ml-auto"
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                  }}
                >
                  <InfoCircledIcon height={16} width={16} />
                </IconButton>
              </Tooltip>
            )}
          </Grid>
        </Flex>
      </Link>
    </Card>
  )
}

export default Transaction
