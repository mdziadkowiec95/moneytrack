import { getAuthServerSession } from '@/utils/auth'
import { apiServiceFactory } from './apiServiceFactory'
import { headers as nextHeaders } from 'next/headers'

const getBaseUrlOnServerSide = (): string => {
  const headers = nextHeaders()

  if (!headers) {
    throw new Error('Headers are required when running on the server')
  }

  const protocol = headers.get('x-forwarded-proto') || 'http'
  const host = headers.get('x-forwarded-host') || headers.get('host')

  return `${protocol}://${host}`
}

const getSessionOnServerSide = () => getAuthServerSession()

export const apiServiceServer = apiServiceFactory(
  getBaseUrlOnServerSide,
  getSessionOnServerSide
)
