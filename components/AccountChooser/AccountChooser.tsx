import React, { useEffect, useState } from 'react'
import { Button, Dialog, Flex, Select } from '@radix-ui/themes'
import { FinanceSource } from '@prisma/client'

const ALL_ACCOUNTS_VALUE = 'ALL_ACCOUNTS'

type SelectedAccountId = FinanceSource['id']

type AccountChooserProps = {
  availableAccounts: FinanceSource[]
  selectedAccountId?: FinanceSource['id']
  onAccountSelected: (accountId?: SelectedAccountId) => void
}

const AccountChooser = ({
  availableAccounts,
  selectedAccountId,
  onAccountSelected,
}: AccountChooserProps) => {
  const [selectedAccount, setSelectedAccount] = useState<
    SelectedAccountId | undefined
  >()

  useEffect(() => {
    setSelectedAccount(selectedAccountId)
  }, [selectedAccountId])

  const getTriggerText = (accountId?: FinanceSource['id']) => {
    if (accountId) {
      const accountName = availableAccounts.find(
        (account) => account.id === accountId
      )?.name
      return accountName ?? 'Choose account'
    }

    return 'Choose account'
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button size="3">{getTriggerText(selectedAccount)}</Button>
      </Dialog.Trigger>

      <Dialog.Content style={{ maxWidth: 450 }}>
        <Select.Root
          value={selectedAccount}
          onValueChange={(newAccount) => {
            setSelectedAccount(newAccount)
          }}
        >
          <Select.Trigger placeholder="All accounts">
            <Button>Choose account</Button>
          </Select.Trigger>
          <Select.Content>
            <Select.Item value={ALL_ACCOUNTS_VALUE}>All accounts</Select.Item>
            {availableAccounts &&
              availableAccounts.map((account) => (
                <Select.Item key={account.id} value={account.id}>
                  {account.name}
                </Select.Item>
              ))}
          </Select.Content>
        </Select.Root>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button
              onClick={() =>
                onAccountSelected(
                  selectedAccount !== ALL_ACCOUNTS_VALUE
                    ? selectedAccount
                    : undefined
                )
              }
            >
              Apply
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default AccountChooser
