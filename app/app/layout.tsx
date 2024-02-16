import { BalanceCard } from '@/components/BalanceCard/BalanceCard'
import { Container, Grid } from '@radix-ui/themes'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Dashboard',
}

// @ts-expect-error - connect wit ESLINT
const DashboardLayout = ({ children }) => {
  return (
    <Container>
      <Grid>
        <BalanceCard />
      </Grid>

      <Grid>{children}</Grid>
    </Container>
  )
}

export default DashboardLayout
