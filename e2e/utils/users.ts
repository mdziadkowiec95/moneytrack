import { User } from '@prisma/client'

export type TestUserE2E = Pick<
  User,
  'email' | 'password' | 'firstName' | 'lastName' | 'username'
>

export const USERS: {
  [key: string]: TestUserE2E
} = {
  STANDARD: {
    email: 'e2e_standard@mailinator.com',
    username: 'e2e_standard',
    password: 'test1234',
    firstName: 'End To End',
    lastName: 'Standard User',
  },
}
