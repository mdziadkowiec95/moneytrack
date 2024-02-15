const baseUrl =
  process && process?.env?.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : ''

export const apiService = {
  USER: {
    authenticate: async (email: string, password: string) => {
      const response = await fetch(`${baseUrl}/api/user/auth/login`, {
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
      const balanceResponse = await fetch(`${baseUrl}/api/balance`)

      return await balanceResponse.json()
    },
  },
  ACCOUNT: {
    getAll: async () => {
      const response = await fetch(`${baseUrl}/api/financeSource`)

      return await response.json()
    },
  },
}
