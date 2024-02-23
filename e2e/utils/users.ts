import { User } from '@prisma/client'

export type TestUserE2E = Pick<User, 'email' | 'password'>

export const USERS: {
  [key: string]: TestUserE2E
} = {
  STANDARD: {
    email: 'e2e_standard@mailinator.com',
    password: 'test1234',
  },
}
