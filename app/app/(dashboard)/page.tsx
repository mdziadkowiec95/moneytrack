import { BalanceCard } from '@/components/BalanceCard/BalanceCard'
import BalanceChart from '@/components/BalanceChart/BalanceChart'
import PageHeader from '@/components/PageHeader/PageHeader'
import TransactionsWidget from '@/components/dashboard/TransactionsWidget/TransactionsWidget'
import { Box, Card, Flex, Grid, Text } from '@radix-ui/themes'
import Link from 'next/link'

type DashboardCardProps = {
  children: React.ReactNode
  className?: string
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  children,
  className,
}) => {
  return (
    <Card size="2" asChild className={className}>
      <Flex gap="3" align="center">
        <Box>
          <Text size="2" weight="bold">
            {children}
          </Text>
        </Box>
      </Flex>
    </Card>
  )
}

const Dashboard = () => {
  return (
    <div>
      <PageHeader>Overview</PageHeader>

      <Grid columns="1fr 1fr 1fr" gap="2" className="mt-5">
        <div className="col-start-1">
          <BalanceCard />
        </div>
        <DashboardCard className="col-start-2">Income last month</DashboardCard>
        <DashboardCard className="col-start-3">
          Outcome last month
        </DashboardCard>

        <TransactionsWidget />

        <div className="col-span-2 h-full">
          <BalanceChart />
        </div>

        <DashboardCard>
          <Link href="https://dribbble.com/shots/18283944-Dashboard-design-concept">
            Statistics widget like in the attached URL
          </Link>
        </DashboardCard>
        <DashboardCard>Frequency of transactons</DashboardCard>
      </Grid>
    </div>
  )
}

export default Dashboard
