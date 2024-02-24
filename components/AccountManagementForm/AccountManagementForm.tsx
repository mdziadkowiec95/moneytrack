'use client'

import { useState } from 'react'
import * as Form from '@radix-ui/react-form'
import { Button, Heading, Select, TextField } from '@radix-ui/themes'

import { addNewAccount } from '@/app/actions'
import { FinanceSourceType } from '@prisma/client'
import { getCurrencyDisplayName } from '@/utils/currency'

const ACCOUNTS = [
  {
    name: 'Cash',
    value: FinanceSourceType.CASH,
  },
  {
    name: 'Bank',
    value: FinanceSourceType.BANK_ACCOUNT,
  },
  {
    name: 'Investment',
    value: FinanceSourceType.INVESTMENT,
  },
]

type AccountManagementFormState = {
  name?: string
  financeSourceType?: FinanceSourceType
}

type InitialData = AccountManagementFormState & {
  id: string
  financeSourceType: FinanceSourceType
}

type AccountManagementFormProps = {
  availableCurrencies: string[]
  baseCurrency: string
  initialData?: InitialData
}

const AccountManagementForm = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initialData,
  availableCurrencies,
  baseCurrency,
}: AccountManagementFormProps) => {
  const [formState, updateFormState] = useState<AccountManagementFormState>(
    () => {
      const initialState: AccountManagementFormState = {
        name: '',
        financeSourceType: ACCOUNTS[0].value,
      }

      return initialState
    }
  )

  const onAccountChange = (financeSourceType: FinanceSourceType) => {
    if (!financeSourceType) return

    updateFormState((state) => ({
      ...state,
      financeSourceType,
    }))
  }

  const onSimpleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormState((state) => ({
      ...state,
      [event.target.name]: event.target.value,
    }))
  }

  const onSubmit = (formData: FormData) => {
    addNewAccount(formData)
  }

  return (
    <div>
      <Heading size="4">Add new Account</Heading>
      <Form.Root className="w-[260px]" action={onSubmit}>
        <Form.Field name="financeSourceId">
          <div className="flex items-baseline justify-between">
            <Form.Label>Choose Account</Form.Label>
          </div>

          <Select.Root
            name="financeSourceType"
            size="3"
            value={formState.financeSourceType}
            onValueChange={onAccountChange}
          >
            <Select.Trigger aria-label="Choose Account" />
            <Select.Content>
              {ACCOUNTS.map((accountType) => (
                <Select.Item key={accountType.value} value={accountType.value}>
                  {accountType.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Form.Field>

        <Form.Field className="grid mb-[10px]" name="name">
          <div className="flex items-baseline justify-between">
            <Form.Label>Name</Form.Label>
          </div>
          <Form.Control asChild>
            <TextField.Input
              size="3"
              required
              onChange={onSimpleFieldChange}
              value={formState.name}
              placeholder="Name"
            />
          </Form.Control>
        </Form.Field>

        <Form.Field name="currency">
          <div className="flex items-baseline justify-between">
            <Form.Label>Currency</Form.Label>
          </div>
          <Select.Root name="currency" defaultValue={baseCurrency} size="3">
            <Select.Trigger />
            <Select.Content>
              {availableCurrencies.map((currency) => (
                <Select.Item key={currency} value={currency}>
                  {getCurrencyDisplayName(currency)}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Form.Field>

        <Form.Submit asChild>
          <Button>Save</Button>
        </Form.Submit>
      </Form.Root>
    </div>
  )
}

export default AccountManagementForm
