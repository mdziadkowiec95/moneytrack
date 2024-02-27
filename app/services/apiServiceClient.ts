import { getSession } from 'next-auth/react'
import { apiServiceFactory } from './apiServiceFactory'

const getBaseUrlOnClientSide = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  throw new Error('Trying to access window object on the server')
}

const getSessionOnClientSide = () => getSession()

export const apiServiceClient = apiServiceFactory(
  getBaseUrlOnClientSide,
  getSessionOnClientSide
)
