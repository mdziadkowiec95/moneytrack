import { BalanceCard } from '@/components/BalanceCard/BalanceCard'
import { Container, Grid } from '@radix-ui/themes'
import React from 'react'

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
