import { PrismaAdapter } from '@auth/prisma-adapter'
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next'
import type { NextAuthOptions } from 'next-auth'
import { getServerSession } from 'next-auth'

import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from './db'
import { JWT } from 'next-auth/jwt'
import { User } from '@prisma/client'
import { apiService } from '@/app/services/apiService'

export const authOptions: NextAuthOptions = {
  // TODO -> Workaround DB persistance for credential provider auth -> https://nneko.branche.online/next-auth-credentials-provider-with-the-database-session-strategy/
  adapter: PrismaAdapter(db) as any,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        console.log('authorize', credentials)
        if (typeof credentials !== 'undefined') {
          try {
            const { email, password } = credentials

            const data = await apiService.USER.authenticate(email, password)

            if (typeof data !== 'undefined') {
              console.log('in !!!')
              return { ...data.user, apiToken: data.token }
            }

            return null
          } catch (error) {
            console.error('error', error)
          }
        } else {
          return null
        }
      },
    }),
  ],
  jwt: {
    maxAge: 60 * 60, // 1h
  },
  session: { strategy: 'jwt' },
  callbacks: {
    // async signIn() {
    //   // redirect("/app");
    // },
    async session({ session, token }) {
      // console.log("session.token", token);
      // console.log("session.user", user);

      const sanitizedToken = Object.keys(token).reduce((p, c) => {
        // strip unnecessary properties
        if (c !== 'iat' && c !== 'exp' && c !== 'jti' && c !== 'apiToken') {
          return { ...p, [c]: token[c] }
        } else {
          return p
        }
      }, {})

      session.user = token as User

      return { ...session, user: sanitizedToken, apiToken: token.apiToken }
    },
    async jwt(data) {
      const { token, user } = data
      if (typeof user !== 'undefined') {
        // user has just signed in so the user object is populated
        return user as unknown as JWT
      }

      return token
    },
  },
}

// Use it in server contexts
export function getAuthServerSession(
  ...args:
    | [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  const session = getServerSession(...args, authOptions)

  return session
}
