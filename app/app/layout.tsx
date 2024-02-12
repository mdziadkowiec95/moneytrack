import { Container } from '@radix-ui/themes'
import React from 'react'

// @ts-expect-error - connect wit ESLINT
const DashboardLayout = ({ children }) => {
  return <Container>{children}</Container>
}

export default DashboardLayout
