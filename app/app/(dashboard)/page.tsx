import { BalanceCard } from '@/components/BalanceCard/BalanceCard'
import BalanceChart from '@/components/BalanceChart/BalanceChart'
import { Box, Button, Card, Flex, Grid, Heading, Text } from '@radix-ui/themes'
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
      <Heading className="uppercase">Overview</Heading>
      <Button asChild>
        <Link href="/app/transactions/addNew">Add New</Link>
      </Button>

      <Grid columns="1fr 1fr 1fr" gap="2" className="mt-5">
        <div className="col-start-1">
          <BalanceCard />
        </div>
        <DashboardCard className="col-start-2">Income last month</DashboardCard>
        <DashboardCard className="col-start-3">
          Outcome last month
        </DashboardCard>

        <Card size="5">
          <Heading size="4">Transactions history</Heading>
          <p>Transaction 1</p>
          <p>Transaction 1</p>
          <p>Transaction 1</p>
          <p>Transaction 1</p>
          <p>Transaction 1</p>
          <p>Transaction 1</p>
          <p>Transaction 1s</p>
        </Card>
        <div className="col-span-2">
          <BalanceChart />
        </div>

        <DashboardCard>
          <Link href="https://dribbble.com/shots/18283944-Dashboard-design-concept">
            Statistics widget like in the attached URL
          </Link>
        </DashboardCard>
        <DashboardCard>Frequency of transactons</DashboardCard>
      </Grid>

      {/* <Grid columns="3" className="pt-4" gap="2">
        <Card size="2" asChild>
          <Link href="/app/accounts">
            <Flex gap="3" align="center">
              <Avatar size="3" radius="full" fallback="A" color="indigo" />
              <Box>
                <Text size="2" weight="bold">
                  Accounts
                </Text>
              </Box>
            </Flex>
          </Link>
        </Card>

        <Card size="2" asChild>
          <Link href="/app/transactions">
            {' '}
            <Flex gap="3" align="center">
              <Avatar size="3" radius="full" fallback="T" color="indigo" />
              <Box>
                <Text size="2" weight="bold">
                  Transactions
                </Text>
              </Box>
            </Flex>
          </Link>
        </Card>

        <Card size="2" asChild>
          <Link href="/app/balance">
            <Flex gap="3" align="center">
              <Avatar size="3" radius="full" fallback="B" color="indigo" />
              <Box>
                <Text size="2" weight="bold">
                  Balance
                </Text>
              </Box>
            </Flex>
          </Link>
        </Card>
      </Grid> */}
    </div>
  )
}

export default Dashboard
