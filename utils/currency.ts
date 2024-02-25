import { getCurrentLocale } from '@/utils/locale'
import { Currency } from '@prisma/client'

const MOCK_CURRENCY_CONVERSION_RATES = {
  PLN: 1,
  EUR: 4.5,
  GBP: 5.2,
  USD: 3.8,
}

const CURRENCIES: Currency[] = ['PLN', 'EUR', 'GBP', 'USD']

export const getAvailableCurrencies = async () => {
  return [...CURRENCIES]
}

export const getAccountDefaultCurrency = async () => {
  return CURRENCIES[0]
}

export const getProfileBaseCurrency = async () => CURRENCIES[0]

export const formatCurrency = (currency: string, amount: number) => {
  return new Intl.NumberFormat(getCurrentLocale(), {
    style: 'currency',
    currency,
  }).format(amount)
}

export const convertToBaseCurrency = (amount: number, currency: Currency) => {
  return amount / MOCK_CURRENCY_CONVERSION_RATES[currency]
}

export const formatCurrencyWithConversion = (
  currency: Currency,
  baseCurrency: Currency,
  amount: number
) => {
  return new Intl.NumberFormat(getCurrentLocale(), {
    style: 'currency',
    currency: baseCurrency,
  }).format(convertToBaseCurrency(amount, currency))
}

export const formatAmount = (amount: number) => {
  return new Intl.NumberFormat(getCurrentLocale()).format(amount)
}

export const getCurrencySymbol = (currency: string) => {
  const exampleNumberWithCurrency = formatCurrency(currency, 0)

  return exampleNumberWithCurrency.replace(/[\s.,0-9]/g, '')
}

export const getCurrencyDisplayName = (currency: string) => {
  return `${currency} (${getCurrencySymbol(currency)})`
}
