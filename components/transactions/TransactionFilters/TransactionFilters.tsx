'use client'

import AccountChooser from '@/components/AccountChooser/AccountChooser'
import ButtonIcon from '@/components/ButtonIcon/ButtonIcon'
import { TypedFormData, createFormData } from '@/utils/formData'
import { FinanceSource } from '@prisma/client'
import { GearIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Popover,
  Text,
  TextField,
} from '@radix-ui/themes'

import React, { useState } from 'react'

type TransactionFilters = {
  accountId?: string
  searchQuery?: string
}

export type TransactionFilterFormData = TypedFormData<TransactionFilters>

type TransactionFiltersProps = {
  availableAccounts: FinanceSource[]
  onFiltersChange: (filters: TransactionFilterFormData) => void
}

const TransactionFilters = ({
  availableAccounts,
  onFiltersChange,
}: TransactionFiltersProps) => {
  const [selectedAccount, setSelectedAccount] = useState<FinanceSource['id']>()

  const onAccountSelected = (accountId?: FinanceSource['id']) => {
    setSelectedAccount(accountId)

    const formData = createFormData<TransactionFilters>()

    if (accountId) {
      formData.append('accountId', accountId)
    }

    onFiltersChange(formData)
  }

  const onSerach = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const formData = createFormData<TransactionFilters>()

      formData.append('searchQuery', event.currentTarget.value)

      setSelectedAccount(undefined)

      onFiltersChange(formData)

      event.currentTarget.blur()
    }
  }

  return (
    <Flex align="center" justify="end">
      <div className="mr-auto">
        <ButtonIcon
          type="add"
          label="Add new transaction"
          href="/app/transactions/addNew/?redirectFrom=/app/transactions"
        />
      </div>

      <TextField.Root size="3" className="mr-3">
        <TextField.Slot>
          <MagnifyingGlassIcon height="16" width="16" />
        </TextField.Slot>
        <TextField.Input onKeyUp={onSerach} placeholder="Search transactions" />
      </TextField.Root>

      <AccountChooser
        availableAccounts={availableAccounts}
        onAccountSelected={onAccountSelected}
        selectedAccountId={selectedAccount}
      />

      <Popover.Root>
        <Popover.Trigger>
          <Button variant="soft" size="3">
            <GearIcon width={24} height={24} />
            Filter
          </Button>
        </Popover.Trigger>
        <Popover.Content style={{ width: 360 }}>
          <Flex gap="3">
            <Box grow="1">
              <Flex gap="3" mt="3" justify="between">
                <Flex align="center" gap="2" asChild>
                  <Text as="label" size="2">
                    <Checkbox />
                    <Text>Send to group</Text>
                  </Text>
                </Flex>

                <Popover.Close>
                  <Button size="1">Comment</Button>
                </Popover.Close>
              </Flex>
            </Box>
          </Flex>
        </Popover.Content>
      </Popover.Root>
    </Flex>
  )
}

export default TransactionFilters
