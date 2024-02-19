export const formatAmount = (amount: number, currency = 'PLN') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}
