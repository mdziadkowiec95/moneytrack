'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as Form from '@radix-ui/react-form'
import {
  MinusCircledIcon,
  PlusCircledIcon,
  SymbolIcon,
} from '@radix-ui/react-icons'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { Button, Grid, Select, Text, TextField } from '@radix-ui/themes'

import Datepicker, { DateValueType } from 'react-tailwindcss-datepicker'
import { addNewTransaction, updateTransaction } from '@/app/actions'
import {
  Category,
  Currency,
  FinanceSource,
  Transaction,
  TransactionType,
} from '@prisma/client'
import { useSession } from 'next-auth/react'
import { apiServiceClient } from '@/app/services/apiServiceClient'
import { formatAmount } from '@/utils/currency'
import dynamic from 'next/dynamic'
import { OpenApiLocation } from '@/components/transactions/LocationChooserModal/LocationChooserModal'

type TimeValueType = {
  hours: number
  minutes: number
  seconds: number
}

type TransationManagementFormState = {
  type: TransactionType
  date: DateValueType
  time: TimeValueType
  amount?: number
  title: string
  categoryId?: Category['id']
  financeSourceId?: string
  currency: Currency
  formattedAmount?: string
  location?: string
  locationCoords?: {
    lat?: number
    lon?: number
  }
}

type InitialData = Transaction & {
  category?: Category
}

const isIncome = (type: TransactionType) => type === TransactionType.INCOME

const toggleGroupItemClasses =
  'hover:bg-black-200 color-mauve11 flex-1 h-[35px] px-3 items-center justify-center data-[state=on]:bg-white data-[state=on]:text-black text-base leading-4 focus:z-10 rounded-full'

const TransactionManagementForm = ({
  initialData,
  categories,
  onDelete,
}: {
  initialData?: InitialData
  categories: Category[]
  onDelete?: (id: InitialData['id']) => void
}) => {
  const session = useSession()
  const [formState, updateFormState] = useState<TransationManagementFormState>(
    () => {
      const currentDate = new Date()
      const hours = currentDate.getHours()
      const minutes = currentDate.getMinutes()
      const seconds = currentDate.getSeconds()

      const initialState: TransationManagementFormState = {
        type: TransactionType.INCOME,
        date: {
          startDate: new Date(new Date()),
          endDate: new Date(new Date()),
        },
        time: {
          hours,
          minutes,
          seconds,
        },
        categoryId: undefined,
        amount: undefined,
        title: '',
        financeSourceId: undefined,
        currency: Currency.PLN,
        location: '',
        locationCoords: undefined,
      }

      if (initialData) {
        initialState.type = initialData.type

        if (initialData.date) {
          initialState.date = {
            startDate: new Date(initialData.date),
            endDate: new Date(initialData.date),
          }

          initialState.time = {
            hours: new Date(initialData.date).getHours(),
            minutes: new Date(initialData.date).getMinutes(),
            seconds: new Date(initialData.date).getSeconds(),
          }
        }

        initialState.amount = initialData.amount
        initialState.formattedAmount = formatAmount(initialData.amount)
        initialState.title = initialData.title
        initialState.categoryId = initialData?.category?.id
        initialState.financeSourceId = initialData.financeSourceId
      }

      return initialState
    }
  )

  const [accounts, setAccounts] = useState<FinanceSource[]>()
  const [accountsLoading, setAccountsLoading] = useState(false)

  const [amountFieldFocused, setAmmountFieldFocused] = useState(false)

  const LocationChooserModal = useMemo(
    () =>
      dynamic(
        () =>
          import(
            '@/components/transactions/LocationChooserModal/LocationChooserModal'
          ),
        {
          loading: () => (
            <SymbolIcon className="mr-3 ease-in-out duration-200 text-blue-500 hover:text-white" />
          ),
          ssr: false,
        }
      ),
    []
  )

  useEffect(() => {
    if (session.status !== 'authenticated') return

    const fetchAccounts = async () => {
      setAccountsLoading(true)

      const accountsData = await apiServiceClient.ACCOUNT.getAll()

      console.log('accounts', accounts)
      setAccounts(accountsData)

      updateFormState((state) => ({
        ...state,
        financeSourceId: accountsData[0]?.id,
        currency: accountsData[0]?.currency,
      }))

      setAccountsLoading(false)
    }

    if (!accounts && !accountsLoading) {
      fetchAccounts()
    }
  }, [session, accounts, accountsLoading])

  const prevAmount = useRef(formState.amount || 0)

  const onDateChange = (newDate: DateValueType) => {
    updateFormState((state) => ({
      ...state,
      date: newDate,
    }))
  }

  const onTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = event.target.value.split(':')

    updateFormState((state) => ({
      ...state,
      time: {
        hours: Number(hours),
        minutes: Number(minutes),
        seconds: 0,
      },
    }))
  }

  const onSelectChange = (fieldName: string, value: string) => {
    if (!value) return

    updateFormState((state) => ({
      ...state,
      [fieldName]: value,
    }))
  }

  const onSimpleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormState((state) => ({
      ...state,
      [event.target.name]: event.target.value,
    }))
  }

  const onAmountFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value

    let newValue = Number(value)

    if (isNaN(Number(value)) || !Number.isSafeInteger(Number(value))) {
      newValue = prevAmount.current
    }

    if (newValue && newValue < 0) {
      newValue = 0
    }

    prevAmount.current = newValue

    updateFormState((state) => ({
      ...state,
      [event.target.name]: newValue,
      formattedAmount: formatAmount(newValue),
    }))
  }

  const onLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormState((state) => ({
      ...state,
      [event.target.name]: event.target.value,
    }))
  }

  const onLocationMapTriggerClick = () => {
    console.log('location map trigger clicked')
  }

  const onLocationMapSelection = (location: OpenApiLocation) => {
    updateFormState((state) => ({
      ...state,
      location: location.display_name,
      locationCoords: {
        lat: location.lat,
        lon: location.lon,
      },
    }))
  }

  const getValueForTimeInput = (time: TimeValueType) => {
    const formattedHours = time.hours.toString().padStart(2, '0')
    const formattedMinutes = time.minutes.toString().padStart(2, '0')
    const formattedSeconds = time.seconds.toString().padStart(2, '0')

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
  }

  const onSubmit = (formData: FormData) => {
    const currentDate = new Date()
    let hours = currentDate.getHours()
    let minutes = currentDate.getMinutes()
    let seconds = currentDate.getSeconds()

    if (formState.time) {
      hours = formState.time.hours
      minutes = formState.time.minutes
      seconds = formState.time.seconds
    }

    const transactionDate = formState.date?.startDate
      ? new Date(formState.date.startDate)
      : new Date()

    transactionDate.setHours(hours)
    transactionDate.setMinutes(minutes)
    transactionDate.setSeconds(seconds)

    formData.set('date', transactionDate.toISOString())
    formData.set('type', formState.type)
    formData.set('amount', formState.amount?.toString() ?? '0')

    if (!initialData) {
      addNewTransaction(formData)
    } else {
      formData.set('id', initialData.id)

      updateTransaction(formData)
    }
  }

  const onDeleteTransaction = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    if (initialData) {
      onDelete?.(initialData?.id)
    }
  }

  return (
    <>
      <Form.Root className="w-3/5" action={onSubmit}>
        <ToggleGroup.Root
          className="flex rounded-full shadow-gray-500 shadow-[0_1px_2px] my-4"
          type="single"
          defaultValue="outcome"
          onValueChange={(selectedType: TransactionType) => {
            // Only allow changing tab when there is a value selected
            if (selectedType) {
              updateFormState({
                ...formState,
                type: selectedType,
              })
            }
          }}
          value={formState.type}
        >
          <ToggleGroup.Item
            className={toggleGroupItemClasses}
            value={TransactionType.OUTCOME}
            aria-label="Select outcome transaction type"
          >
            Outcome
          </ToggleGroup.Item>
          <ToggleGroup.Item
            className={toggleGroupItemClasses}
            value={TransactionType.INCOME}
            aria-label="Select income transaction type"
          >
            Income
          </ToggleGroup.Item>
        </ToggleGroup.Root>

        <Form.Field className="grid mb-4" name="amount">
          <div className="flex items-baseline justify-between">
            <Form.Label className="mb-2">Amount</Form.Label>
          </div>
          <div className="relative">
            <TextField.Root className="px-3">
              <TextField.Slot gap="6">
                {!isIncome(formState.type) ? (
                  <MinusCircledIcon className="text-red-500" />
                ) : (
                  <PlusCircledIcon className="text-green-500" />
                )}
              </TextField.Slot>
              <Form.Control asChild>
                <TextField.Input
                  size="3"
                  className="pl-6"
                  required
                  onFocus={() => {
                    setAmmountFieldFocused(true)
                  }}
                  onBlur={() => {
                    setAmmountFieldFocused(false)
                  }}
                  onChange={onAmountFieldChange}
                  value={
                    amountFieldFocused
                      ? formState.amount
                      : formState.formattedAmount
                  }
                  min={0}
                  type="text"
                  inputMode="numeric"
                  placeholder="Amount"
                />
              </Form.Control>
              <TextField.Slot gap="6">
                <Text>{formState.currency}</Text>
              </TextField.Slot>
            </TextField.Root>
          </div>
        </Form.Field>

        <Form.Field name="financeSourceId" className="mb-4">
          <div className="flex items-baseline justify-between">
            <Form.Label className="mb-2">Account</Form.Label>
          </div>

          <Select.Root
            name="financeSourceId"
            value={formState.financeSourceId}
            size="3"
            onValueChange={(value) => {
              onSelectChange('financeSourceId', value)

              const selectedAccount = accounts?.find(
                (account) => account.id === value
              )

              if (selectedAccount) {
                updateFormState((state) => ({
                  ...state,
                  currency: selectedAccount.currency,
                }))
              }
            }}
          >
            <Select.Trigger aria-label="Choose Account" className="w-full" />
            <Select.Content>
              {accounts &&
                formState.financeSourceId &&
                accounts.map((account) => (
                  <Select.Item key={account.id} value={account.id}>
                    {account.name}
                  </Select.Item>
                ))}
            </Select.Content>
          </Select.Root>
        </Form.Field>

        <Form.Field className="grid  mb-4" name="title">
          <div className="flex items-baseline justify-between">
            <Form.Label className="mb-2">Title</Form.Label>
          </div>
          <Form.Control asChild>
            <TextField.Input
              size="3"
              required
              onChange={onSimpleFieldChange}
              value={formState.title}
              placeholder="Title"
            />
          </Form.Control>
        </Form.Field>

        <Form.Field className="grid  mb-4" name="title">
          <Form.Label className="mb-2">Date</Form.Label>
          <Datepicker
            inputName="date"
            useRange={false}
            inputClassName="w-full px-3 py-2 rounded-full bg-black-500 text-white border border-gray-300 focus:outline-none focus:border-gray-500"
            asSingle={true}
            value={formState.date}
            onChange={onDateChange}
          />
        </Form.Field>

        <Form.Field name="time" className=" mb-4">
          <div className="flex items-baseline justify-between">
            <Form.Label className="mb-2">Time</Form.Label>
          </div>
          <Form.Control asChild>
            <TextField.Input
              onChange={onTimeChange}
              value={getValueForTimeInput(formState.time)}
              type="time"
              step={2}
              size="3"
            />
          </Form.Control>
        </Form.Field>

        <Form.Field name="categoryId" className="mb-4">
          <div className="flex items-baseline justify-between">
            <Form.Label className="mb-2">Category</Form.Label>
          </div>

          <Select.Root
            name="categoryId"
            required
            size="3"
            value={
              formState.categoryId ? String(formState.categoryId) : undefined
            }
            onValueChange={(selectedCategory) =>
              onSelectChange('categoryId', selectedCategory)
            }
          >
            <Select.Trigger
              placeholder="Choose Category"
              aria-label="Choose Category"
              className="w-full"
            />
            <Select.Content>
              {categories &&
                categories.map((category) => (
                  <Select.Item key={category.id} value={String(category.id)}>
                    {category.displayName}
                  </Select.Item>
                ))}
            </Select.Content>
          </Select.Root>
        </Form.Field>

        <Form.Field className="grid mb-4" name="location">
          <div className="flex items-baseline justify-between">
            <Form.Label className="mb-2">Location</Form.Label>
          </div>
          <div className="relative">
            <TextField.Root>
              <Form.Control asChild>
                <TextField.Input
                  size="3"
                  required
                  onChange={onLocationChange}
                  value={formState.location}
                  min={0}
                  type="text"
                  inputMode="numeric"
                  placeholder="Location"
                />
              </Form.Control>
              <TextField.Slot gap="6">
                <LocationChooserModal
                  onLocationChange={onLocationMapSelection}
                  onTriggerClick={onLocationMapTriggerClick}
                />
              </TextField.Slot>
            </TextField.Root>
          </div>
        </Form.Field>

        <Grid columns="1fr 1fr" gap="2" className="mt-8">
          <Form.Submit asChild>
            <Button>Save</Button>
          </Form.Submit>
          {initialData && (
            <Button color="crimson" onClick={onDeleteTransaction}>
              Delete
            </Button>
          )}
        </Grid>
      </Form.Root>
    </>
  )
}

export default TransactionManagementForm
