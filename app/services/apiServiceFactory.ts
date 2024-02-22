import { FinanceSource } from '@prisma/client'

export const apiServiceFactory = (getBaseUrl: () => string) => ({
  USER: {
    authenticate: async (email: string, password: string) => {
      const ENDPOINT = `${getBaseUrl()}/api/user/auth/login`

      const response = await fetch(ENDPOINT, {
        method: 'post',
        body: JSON.stringify({
          email,
          password,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      return await response.json()
    },
  },
  BALANCE: {
    getAllForCurrentMonth: async () => {
      const ENDPOINT = `${getBaseUrl()}/api/balance`

      const balanceResponse = await fetch(ENDPOINT)

      return await balanceResponse.json()
    },
  },
  ACCOUNT: {
    getAll: async (): Promise<FinanceSource[]> => {
      const ENDPOINT = `${getBaseUrl()}/api/financeSource`

      const response = await fetch(ENDPOINT)

      return (await response.json()).accounts as FinanceSource[]
    },
  },
})
