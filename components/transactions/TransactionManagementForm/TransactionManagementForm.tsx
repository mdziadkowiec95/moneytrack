'use client'

import { useEffect, useRef, useState } from 'react'
import * as Form from '@radix-ui/react-form'
import { MinusCircledIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { Button, Heading, Select, TextField } from '@radix-ui/themes'

import Datepicker, { DateValueType } from 'react-tailwindcss-datepicker'
import { addNewTransaction, updateTransaction } from '@/app/actions'
import { FinanceSource, TransactionType } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { apiService } from '@/app/services/apiService'

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
  financeSourceId?: string
}

type InitialData = TransationManagementFormState & {
  id: string
  date: Date
  financeSourceId: string
}

const isIncome = (type: TransactionType) => type === TransactionType.INCOME

const toggleGroupItemClasses =
  'hover:bg-black-200 color-mauve11 flex h-[35px] px-3 items-center justify-center data-[state=on]:bg-white data-[state=on]:text-black text-base leading-4 first:rounded-l last:rounded-r focus:z-10 '

const TransactionManagementForm = ({
  initialData,
}: {
  initialData?: InitialData
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
        amount: undefined,
        title: '',
        financeSourceId: undefined,
      }

      if (initialData) {
        initialState.type = initialData.type

        if (initialData.date) {
          initialState.date = {
            startDate: new Date(initialData.date),
            endDate: new Date(initialData.date),
          }
        }

        if (initialData.time) {
          initialState.time = {
            hours: initialData.time.hours,
            minutes: initialData.time.minutes,
            seconds: initialData.time.seconds,
          }
        }

        initialState.amount = initialData.amount
        initialState.title = initialData.title

        console.log('initialData.accountId', initialData.financeSourceId)

        initialState.financeSourceId = initialData.financeSourceId
      }

      return initialState
    }
  )

  const [accounts, setAccounts] = useState<FinanceSource[]>()
  const [accountsLoading, setAccountsLoading] = useState(false)

  useEffect(() => {
    if (session.status !== 'authenticated') return

    const fetchAccounts = async () => {
      setAccountsLoading(true)

      const accountsData = await apiService.ACCOUNT.getAll()

      console.log('accounts', accounts)
      setAccounts(accountsData.accounts)

      console.log(' accounts.accounts[0].id', accountsData.accounts[0].id)

      updateFormState((state) => ({
        ...state,
        financeSourceId: accountsData.accounts[0].id,
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

  const onAccountChange = (selectedAccountId: string) => {
    if (!selectedAccountId) return

    updateFormState((state) => ({
      ...state,
      financeSourceId: selectedAccountId,
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

    if (!initialData) {
      addNewTransaction(formData)
    } else {
      formData.set('id', initialData.id)

      updateTransaction(formData)
    }
  }

  return (
    <div>
      <Heading size="4">
        Add new {isIncome(formState.type) ? 'Income' : 'Outcome'}
      </Heading>
      <Form.Root className="w-[260px]" action={onSubmit}>
        <ToggleGroup.Root
          className="inline-flex rounded  shadow-gray-500 shadow-[0_1px_2px] "
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
          aria-label="Text alignment"
        >
          <ToggleGroup.Item
            className={toggleGroupItemClasses}
            value={TransactionType.OUTCOME}
            aria-label="Center aligned"
          >
            Outcome
          </ToggleGroup.Item>
          <ToggleGroup.Item
            className={toggleGroupItemClasses}
            value={TransactionType.INCOME}
            aria-label="Left aligned"
          >
            Income
          </ToggleGroup.Item>
        </ToggleGroup.Root>

        <Form.Field className="grid mb-[10px]" name="amount">
          <div className="flex items-baseline justify-between">
            <Form.Label>Amount</Form.Label>
          </div>
          <div className="relative">
            <TextField.Root>
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
                  onChange={onAmountFieldChange}
                  value={formState.amount}
                  min={0}
                  type="text"
                  inputMode="numeric"
                  placeholder="Amount"
                />
              </Form.Control>
            </TextField.Root>
          </div>
        </Form.Field>

        <Form.Field name="financeSourceId">
          <div className="flex items-baseline justify-between">
            <Form.Label>Account</Form.Label>
          </div>

          <Select.Root
            name="financeSourceId"
            // defaultValue={formState.accountId}
            value={formState.financeSourceId}
            onValueChange={onAccountChange}
          >
            <Select.Trigger />
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

        <Form.Field className="grid mb-[10px]" name="title">
          <div className="flex items-baseline justify-between">
            <Form.Label>Title</Form.Label>
            {/* <Form.Message
            className="text-[13px] text-black opacity-[0.8]"
            match="valueMissing"
          >
            Please enter a question
          </Form.Message> */}
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
        <Form.Field className="grid mb-[10px]" name="title">
          <Form.Label>Date</Form.Label>
          {formState.date && (
            <Datepicker
              inputName="date"
              useRange={false}
              asSingle={true}
              value={formState.date}
              onChange={onDateChange}
            />
          )}
        </Form.Field>

        <Form.Field name="time">
          <Form.Control asChild>
            <TextField.Input
              onChange={onTimeChange}
              value={getValueForTimeInput(formState.time)}
              type="time"
              step={2}
              // min="09:00"
              // max="18:00"
            />
          </Form.Control>
        </Form.Field>

        <Form.Submit asChild>
          <Button>Save</Button>
        </Form.Submit>
      </Form.Root>
    </div>
  )
}

export default TransactionManagementForm
